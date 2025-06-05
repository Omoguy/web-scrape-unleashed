export interface ScrapingRequest {
  website_url: string;
  search_term: string;
  extract_fields: string[];
  max_results: number;
  api_key: string;
}

export interface ScrapingResponse {
  success: boolean;
  data?: any[];
  error?: string;
}

export class ScraperService {
  private baseUrl: string;

  constructor(baseUrl: string = "http://localhost:5001") {
    this.baseUrl = baseUrl;
  }

  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.ok;
    } catch (error) {
      console.error("Connection check failed:", error);
      return false;
    }
  }

  async scrapeProducts(request: ScrapingRequest): Promise<ScrapingResponse> {
    try {
      console.log("Checking backend connection...");
      const isConnected = await this.checkConnection();

      if (!isConnected) {
        return {
          success: false,
          error:
            "Cannot connect to Flask backend at localhost:5001. Please make sure the backend server is running.",
        };
      }

      console.log("Backend connection OK, sending scraping request...");

      const response = await fetch(`${this.baseUrl}/api/scrape`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Scraping API error:", error);

      if (error instanceof TypeError && error.message === "Failed to fetch") {
        return {
          success: false,
          error:
            "Cannot connect to the Flask backend server. Please ensure it is running on localhost:5001",
        };
      }

      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}

export const scraperService = new ScraperService();
