from flask import Flask, request, jsonify
from flask_cors import CORS
import asyncio
import json
import re
import logging
from dataclasses import dataclass, asdict
from typing import Optional, Dict, List, Any
from urllib.parse import urljoin, urlparse, quote
import random
import time
import os
from dotenv import load_dotenv

from playwright.async_api import async_playwright, Page, Browser
from bs4 import BeautifulSoup, Comment
from openai import OpenAI

# Load environment variables
load_dotenv()
DEFAULT_API_KEY = os.getenv('OPENAI_API_KEY')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins=["*"])  # Enable CORS for all origins

@dataclass
class SearchConfig:
    website_url: str
    search_term: str
    extract_fields: List[str]
    max_results: int = 5

@dataclass
class ProductData:
    product_name: Optional[str] = None
    price: Optional[str] = None
    condition: Optional[str] = None
    country: Optional[str] = None
    seller: Optional[str] = None
    part_number: Optional[str] = None
    manufacturer: Optional[str] = None
    availability: Optional[str] = None
    specifications: Optional[Dict[str, str]] = None
    price_breaks: Optional[List[Dict[str, str]]] = None
    datasheet_url: Optional[str] = None
    confidence_score: Optional[float] = None

class ContentCleaner:
    def __init__(self):
        self.noise_patterns = [
            r'cookie\s+policy', r'privacy\s+policy', r'terms\s+of\s+service',
            r'newsletter\s+signup', r'follow\s+us', r'social\s+media',
            r'customer\s+reviews\s+powered\s+by', r'advertisement', r'sponsored\s+content'
        ]
        self.unwanted_selectors = [
            'script', 'style', 'nav', 'footer', 'header',
            '.advertisement', '.ads', '.cookie-banner',
            '.newsletter', '.social-media', '.breadcrumb'
        ]

    def extract_clean_text(self, html_content: str, url: str) -> str:
        try:
            soup = BeautifulSoup(html_content, 'html.parser')
            for selector in self.unwanted_selectors:
                for element in soup.select(selector):
                    element.decompose()
            for comment in soup.find_all(string=lambda text: isinstance(text, Comment)):
                comment.extract()
            main_content = self._extract_main_content(soup, url)
            clean_text = self._clean_text(main_content)
            return clean_text
        except Exception as e:
            logger.error(f"Error cleaning content: {e}")
            return ""

    def _extract_main_content(self, soup: BeautifulSoup, url: str) -> str:
        product_selectors = [
            '[data-testid*="product"]', '.product-details', '.product-info',
            '.item-details', '#product-description', '.part-details', '.component-info'
        ]
        content_parts = []
        for selector in product_selectors:
            elements = soup.select(selector)
            if elements:
                for element in elements:
                    content_parts.append(element.get_text(separator=' ', strip=True))
        if not content_parts:
            main_selectors = ['main', '.main-content', '#main', '.content']
            for selector in main_selectors:
                elements = soup.select(selector)
                if elements:
                    content_parts.append(elements[0].get_text(separator=' ', strip=True))
                    break
        if not content_parts:
            body = soup.find('body')
            if body:
                content_parts.append(body.get_text(separator=' ', strip=True))
        return ' '.join(content_parts)

    def _clean_text(self, text: str) -> str:
        if not text:
            return ""
        for pattern in self.noise_patterns:
            text = re.sub(pattern, '', text, flags=re.IGNORECASE)
        text = re.sub(r'\s+', ' ', text)
        text = self._remove_repetitive_content(text)
        words = text.split()
        if len(words) > 1000:
            text = ' '.join(words[:1000])
        return text.strip()

    def _remove_repetitive_content(self, text: str) -> str:
        sentences = text.split('.')
        seen = set()
        unique_sentences = []
        for sentence in sentences:
            sentence = sentence.strip()
            if sentence and sentence not in seen and len(sentence) > 10:
                seen.add(sentence)
                unique_sentences.append(sentence)
        return '. '.join(unique_sentences)

class LLMExtractor:
    def __init__(self, api_key: str):
        self.api_key = api_key
        
    def extract_product_data(self, clean_text: str, url: str) -> ProductData:
        try:
            site_context = self._get_site_context(url)
            prompt = self._build_extraction_prompt(clean_text, site_context)
            client = OpenAI()
            client.api_key = self.api_key
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1
            )
            result = json.loads(response.choices[0].message.content)
            product_data = ProductData(**result)
            return product_data
        except Exception as e:
            logger.error(f"Error extracting product data: {e}")
            return ProductData()
            
    def _get_site_context(self, url: str) -> str:
        domain = urlparse(url).netloc.lower()
        if 'ebay' in domain:
            return "eBay marketplace - focus on auction/buy-it-now prices, seller ratings, condition"
        elif 'radwell' in domain:
            return "Industrial automation parts - focus on part numbers, condition codes, warranty"
        elif 'rs-online' in domain or 'rs.com' in domain:
            return "RS Components - electronic components with technical specs and quantity pricing"
        elif 'digikey' in domain:
            return "DigiKey electronics distributor - part numbers, specifications, quantity breaks"
        elif 'mouser' in domain:
            return "Mouser electronics - components with detailed specifications and pricing tiers"
        elif 'farnell' in domain:
            return "Farnell electronics distributor - industrial components with technical data"
        else:
            return "General e-commerce site"
            
    def _build_extraction_prompt(self, text: str, site_context: str) -> str:
        return f"""
Extract structured product information from the following e-commerce page content.

CONTEXT: {site_context}

CONTENT TO ANALYZE:
{text}

Please extract the following information and return it as a valid JSON object:

{{
    "product_name": "Full product name or title",
    "price": "Main price (include currency symbol)",
    "condition": "New/Used/Refurbished/etc",
    "country": "Country of origin or shipping",
    "seller": "Seller or supplier name",
    "part_number": "Manufacturer part number or model",
    "manufacturer": "Brand or manufacturer name",
    "availability": "In stock/Out of stock/Lead time info",
    "specifications": {{"key": "value pairs of technical specs"}},
    "price_breaks": [{{"quantity": "1", "price": "$X.XX"}}, {{"quantity": "10", "price": "$Y.YY"}}],
    "datasheet_url": "URL to technical datasheet if available",
    "confidence_score": 0.95
}}

EXTRACTION RULES:
1. If information is not found, use null (not empty string)
2. For prices, preserve currency symbols and formatting
3. Extract all quantity-based pricing if available
4. Focus on the main product, ignore related/suggested items
5. Confidence score should reflect how certain you are about the extraction (0.0-1.0)
6. For specifications, extract key technical parameters
7. Normalize condition values to standard terms

Return only the JSON object, no additional text.
"""

class UniversalScraper:
    def __init__(self, api_key: str):
        self.content_cleaner = ContentCleaner()
        self.llm_extractor = LLMExtractor(api_key)
        self.browser: Optional[Browser] = None
        
    async def __aenter__(self):
        self.playwright = await async_playwright().start()
        self.browser = await self.playwright.chromium.launch(
            headless=True,
            args=[
                '--no-sandbox',
                '--disable-blink-features=AutomationControlled',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
                '--hide-scrollbars',
                '--mute-audio',
                f'--window-size={1920 + random.randint(-100, 100)},{1080 + random.randint(-50, 50)}'
            ]
        )
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        try:
            if self.browser:
                contexts = self.browser.contexts
                for context in contexts:
                    pages = context.pages
                    for page in pages:
                        try:
                            await page.close()
                        except:
                            pass
                    await context.close()
                await self.browser.close()
            await self.playwright.stop()
        except Exception as e:
            logger.error(f"Error during cleanup: {e}")
            # Attempt force close
            try:
                await self.playwright.stop()
            except:
                pass
        
    async def search_and_scrape(self, config: SearchConfig) -> List[ProductData]:
        """Search for products and scrape the results"""
        try:
            search_urls = await self._perform_search(config)
            if not search_urls:
                logger.warning(f"No search results found for: {config.search_term}")
                return []
                
            results = []
            for url in search_urls[:config.max_results]:
                try:
                    product_data = await self.scrape_product(url)
                    results.append(product_data)
                    await asyncio.sleep(1)  # Rate limiting
                except Exception as e:
                    logger.error(f"Error scraping {url}: {e}")
                    results.append(ProductData())
                    
            return results
        except Exception as e:
            logger.error(f"Error in search_and_scrape: {e}")
            return []
    
    async def _perform_search(self, config: SearchConfig) -> List[str]:
        """Perform search on the website and return product URLs"""
        try:
            # Create a new context for each search with more realistic browser settings
            context = await self.browser.new_context(
                viewport={'width': 1920, 'height': 1080},
                user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
                device_scale_factor=2,
                java_script_enabled=True,
                has_touch=False,
                locale='en-US',
                timezone_id='America/New_York'
            )
            
            # Enable JavaScript and cookies
            await context.add_init_script("""
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined
                });
            """)
            
            page = await context.new_page()
            
            # Add headers to appear more like a real browser
            await page.set_extra_http_headers({
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'max-age=0',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1'
            })
            
            search_url = self._build_search_url(config.website_url, config.search_term)
            logger.info(f"Searching: {search_url}")
            
            # Navigate with better error handling and wait conditions
            try:
                response = await page.goto(search_url, 
                    wait_until='networkidle',
                    timeout=30000
                )
                
                if not response.ok:
                    logger.error(f"HTTP {response.status} when loading {search_url}")
                    return []
                
                # Wait for key elements to be visible
                await page.wait_for_load_state('domcontentloaded')
                await page.wait_for_load_state('networkidle')
                
                # Random wait between 2-5 seconds to mimic human behavior
                await asyncio.sleep(2 + 3 * random.random())
                
                # Extract product URLs from search results
                product_urls = await self._extract_product_urls(page, config.website_url)
                await page.close()
                
                return product_urls
            except Exception as e:
                logger.error(f"Error navigating to search page: {e}")
                return []
            product_urls = await self._extract_product_urls(page, config.website_url)
            await page.close()
            
            return product_urls
        except Exception as e:
            logger.error(f"Error performing search: {e}")
            return []
    
    def _build_search_url(self, website_url: str, search_term: str) -> str:
        """Build search URL for different websites"""
        domain = urlparse(website_url).netloc.lower()
        encoded_term = quote(search_term)
        
        if 'ebay.com' in domain:
            return f"https://www.ebay.com/sch/i.html?_nkw={encoded_term}"
        elif 'ebay.de' in domain:
            return f"https://www.ebay.de/sch/i.html?_nkw={encoded_term}"
        elif 'digikey.com' in domain:
            return f"https://www.digikey.com/en/products/filter?keywords={encoded_term}"
        elif 'digikey.de' in domain:
            return f"https://www.digikey.de/de/products/filter?keywords={encoded_term}"
        elif 'rs-online.com' in domain:
            return f"https://uk.rs-online.com/web/c/?searchTerm={encoded_term}"
        elif 'mouser.com' in domain:
            return f"https://www.mouser.com/c/?q={encoded_term}"
        elif 'radwell.com' in domain:
            return f"https://www.radwell.com/shop?q={encoded_term}"
        else:
            # Generic search - try common patterns
            return f"{website_url}/search?q={encoded_term}"
    
    async def _extract_product_urls(self, page: Page, base_url: str) -> List[str]:
        """Extract product URLs from search results page"""
        try:
            domain = urlparse(base_url).netloc.lower()
            
            if 'ebay' in domain:
                selectors = [
                    'a[href*="/itm/"]',
                    '.s-item__link',
                    '.x-item-title-label'
                ]
            elif 'digikey' in domain:
                selectors = [
                    'a[href*="/product-detail/"]',
                    '.product-details-link'
                ]
            elif 'rs-online' in domain:
                selectors = [
                    'a[href*="/product/"]',
                    '.product-result-link'
                ]
            else:
                # Generic selectors
                selectors = [
                    'a[href*="/product"]',
                    'a[href*="/item"]',
                    'a[href*="/p/"]',
                    '.product-link',
                    '.item-link'
                ]
            
            urls = set()
            for selector in selectors:
                try:
                    elements = await page.query_selector_all(selector)
                    for element in elements:
                        href = await element.get_attribute('href')
                        if href:
                            if href.startswith('/'):
                                href = urljoin(base_url, href)
                            elif not href.startswith('http'):
                                continue
                            urls.add(href)
                except:
                    continue
            
            return list(urls)[:10]  # Limit to 10 URLs
        except Exception as e:
            logger.error(f"Error extracting product URLs: {e}")
            return []
    
    async def scrape_product(self, url: str) -> ProductData:
        """Scrape individual product page"""
        try:
            # Create a new context for each product with different fingerprint
            context = await self.browser.new_context(
                viewport={'width': 1920, 'height': 1080},
                user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
                device_scale_factor=2,
                java_script_enabled=True,
                has_touch=False,
                locale='en-US',
                timezone_id='America/New_York'
            )
            
            # Randomize viewport slightly
            width = 1920 + random.randint(-100, 100)
            height = 1080 + random.randint(-50, 50)
            await context.set_viewport_size({"width": width, "height": height})
            
            page = await context.new_page()
            
            # Set realistic headers
            await page.set_extra_http_headers({
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'max-age=0',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1'
            })
            
            # Add mousemove event handler to simulate human-like behavior
            await page.evaluate("""
                window.addEventListener('mousemove', function(e) {
                    window._lastMouseMove = Date.now();
                });
            """)
            
            response = await page.goto(url, wait_until='networkidle', timeout=45000)
            if not response.ok:
                logger.error(f"HTTP {response.status} when loading {url}")
                return ProductData()
            
            # Wait for key states and do some random scrolling
            await page.wait_for_load_state('domcontentloaded')
            await page.wait_for_load_state('networkidle')
            
            # Scroll the page randomly to trigger lazy loading
            for _ in range(3):
                await page.evaluate(f"window.scrollTo(0, {random.randint(100, 700)})")
                await asyncio.sleep(0.5 + random.random())
            
            # Wait between 2-4 seconds
            await asyncio.sleep(2 + 2 * random.random())
            
            html_content = await page.content()
            clean_text = self.content_cleaner.extract_clean_text(html_content, url)
            
            if not clean_text:
                logger.warning(f"No clean text extracted from {url}")
                return ProductData()
            
            product_data = self.llm_extractor.extract_product_data(clean_text, url)
            await page.close()
            
            logger.info(f"Successfully scraped {url}")
            return product_data
        except Exception as e:
            logger.error(f"Error scraping {url}: {e}")
            return ProductData()

@app.route('/api/scrape', methods=['POST'])
def scrape_api():
    """API endpoint for scraping that matches React frontend expectations"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'No JSON data received'
            }), 400
            
        logger.info(f"Received scraping request for website: {data.get('website_url', 'unknown')} and search term: {data.get('search_term', 'unknown')}")
        
        # Validate required fields
        required_fields = ['website_url', 'search_term', 'extract_fields', 'max_results', 'api_key']
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return jsonify({
                'success': False,
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
            
        # Validate field types and values
        if not isinstance(data['extract_fields'], list):
            return jsonify({
                'success': False,
                'error': 'extract_fields must be an array'
            }), 400
            
        try:
            max_results = int(data['max_results'])
            if max_results < 1 or max_results > 50:
                return jsonify({
                    'success': False,
                    'error': 'max_results must be between 1 and 50'
                }), 400
        except (ValueError, TypeError):
            return jsonify({
                'success': False,
                'error': 'max_results must be a valid number'
            }), 400
        
        # Create search configuration
        config = SearchConfig(
            website_url=data['website_url'],
            search_term=data['search_term'],
            extract_fields=data['extract_fields'],
            max_results=data['max_results']
        )
        
        api_key = data['api_key']
        
        # Run scraper with timeout
        async def run_scraper_with_timeout():
            try:
                async with asyncio.timeout(300):  # 5-minute timeout
                    async with UniversalScraper(api_key) as scraper:
                        return await scraper.search_and_scrape(config)
            except asyncio.TimeoutError:
                logger.error("Scraping operation timed out after 5 minutes")
                return []
            except Exception as e:
                logger.error(f"Scraping operation failed: {e}")
                return []
        
        # Run async scraping in sync context with proper cleanup
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            results = loop.run_until_complete(run_scraper_with_timeout())
        except Exception as e:
            logger.error(f"Error in event loop: {e}")
            raise
        finally:
            try:
                loop.close()
            except:
                pass  # Ignore cleanup errors
        
        # Convert results to dict format expected by frontend
        results_data = [asdict(result) for result in results]
        
        logger.info(f"Scraping completed successfully. Found {len(results_data)} results")
        
        return jsonify({
            'success': True,
            'data': results_data
        })
        
    except Exception as e:
        logger.error(f"Scraping error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Scraper API is running'})

if __name__ == '__main__':
    print("🚀 Starting Flask Scraper API")
    print("=" * 50)
    print("🌐 Server starting on: http://localhost:5001")
    print("🔧 API endpoint: /api/scrape")
    print("⚠️  Press Ctrl+C to stop the server")
    print()
    
    app.run(debug=True, host='0.0.0.0', port=5001)
