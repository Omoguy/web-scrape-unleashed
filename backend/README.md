
# Flask Scraper Backend

This is the backend service for the Universal E-commerce Scraper that connects to your React frontend.

## Setup

1. **Install Python dependencies:**
   ```bash
   cd backend
   python setup.py
   ```
   
   Or manually:
   ```bash
   pip install -r requirements.txt
   python -m playwright install chromium
   ```

2. **Start the server:**
   ```bash
   python app.py
   ```

The server will start on `http://localhost:5000` and automatically enable CORS for your React frontend.

## API Endpoints

- `POST /api/scrape` - Main scraping endpoint
- `GET /health` - Health check

## How it works

1. **Receives requests** from your React frontend with:
   - Website URL to search
   - Search term
   - Fields to extract
   - Max results
   - OpenAI API key

2. **Performs real web scraping:**
   - Uses Playwright to navigate to the website
   - Searches for the specified product
   - Extracts product URLs from search results
   - Scrapes individual product pages

3. **Uses AI extraction:**
   - Cleans the HTML content
   - Uses OpenAI GPT to extract structured data
   - Returns formatted results to the frontend

## Requirements

- Python 3.8+
- OpenAI API key (provided through the React UI)
- Internet connection for web scraping

## Supported Websites

- eBay (US & DE)
- DigiKey (US & DE) 
- RS Online (UK & DE)
- Mouser
- Radwell
- Custom websites (basic support)
