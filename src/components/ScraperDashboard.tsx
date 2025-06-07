
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Globe, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FieldManager } from "@/components/FieldManager";
import { ResultsTable } from "@/components/ResultsTable";
import { ScrapingBeeApiKeyInput } from "@/components/ScrapingBeeApiKeyInput";
import { SearchConfiguration } from "@/components/SearchConfiguration";
import { ActionPanel } from "@/components/ActionPanel";
import { ExportPanel } from "@/components/ExportPanel";
import { scrapingBeeService } from "@/services/scrapingBeeService";

export const ScraperDashboard = () => {
  const [selectedWebsite, setSelectedWebsite] = useState(
    "https://www.ebay.com"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [maxResults, setMaxResults] = useState("5");
  const [extractFields, setExtractFields] = useState(["Product Name", "Price"]);
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]);
  const [apiUsage, setApiUsage] = useState<{ used: number; remaining: number } | null>(null);
  const { toast } = useToast();

  const handleStartScraping = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Error",
        description: "Please enter a search term",
        variant: "destructive",
      });
      return;
    }

    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter your ScrapingBee API key",
        variant: "destructive",
      });
      return;
    }

    if (extractFields.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one field to extract",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setProgress(0);

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      console.log("Starting ScrapingBee scraping with config:", {
        website_url: selectedWebsite,
        search_term: searchTerm,
        extract_fields: extractFields,
        max_results: parseInt(maxResults),
      });

      const result = await scrapingBeeService.scrapeProducts({
        website_url: selectedWebsite,
        search_term: searchTerm,
        extract_fields: extractFields,
        max_results: parseInt(maxResults),
        api_key: apiKey,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (result.success && result.data) {
        console.log("ScrapingBee scraping successful:", result.data);
        setResults(result.data);
        
        if (result.usage) {
          setApiUsage(result.usage);
        }

        toast({
          title: "Success!",
          description: `Scraped ${result.data.length} products using ScrapingBee API`,
        });
      } else {
        console.error("ScrapingBee scraping failed:", result.error);
        toast({
          title: "Scraping Failed",
          description: result.error || "Failed to scrape products",
          variant: "destructive",
        });
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error("ScrapingBee error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Scraping failed",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 500);
    }
  };

  const exportResults = (format: "json" | "csv") => {
    if (results.length === 0) return;

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === "json") {
      content = JSON.stringify(results, null, 2);
      filename = `scraping_results_${
        new Date().toISOString().split("T")[0]
      }.json`;
      mimeType = "application/json";
    } else {
      const headers = Object.keys(results[0]);
      const csvContent = [
        headers.join(","),
        ...results.map((row) =>
          headers.map((header) => `"${row[header] || ""}"`).join(",")
        ),
      ].join("\n");
      content = csvContent;
      filename = `scraping_results_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      mimeType = "text/csv";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
            <Search className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dynamic Pricing Engine
          </h1>
        </div>
        <p className="text-lg text-gray-600 mb-2">
          Production-ready competitor price monitoring powered by ScrapingBee
        </p>
        <div className="flex items-center justify-center gap-2">
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            <Globe className="w-4 h-4 mr-1" />
            ScrapingBee API
          </Badge>
          {apiUsage && (
            <Badge variant="outline" className="text-blue-700">
              Credits: {apiUsage.remaining} remaining
            </Badge>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                Search Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-700">
                  🚀 <strong>Production Ready:</strong> Using ScrapingBee API for reliable, scalable web scraping with JavaScript rendering, IP rotation, and CAPTCHA solving.
                </p>
              </div>

              <SearchConfiguration
                selectedWebsite={selectedWebsite}
                onWebsiteChange={setSelectedWebsite}
                searchTerm={searchTerm}
                onSearchTermChange={setSearchTerm}
                maxResults={maxResults}
                onMaxResultsChange={setMaxResults}
              />
            </CardContent>
          </Card>

          <FieldManager
            fields={extractFields}
            onFieldsChange={setExtractFields}
          />
        </div>

        {/* Action Panel */}
        <div className="space-y-6">
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">API Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrapingBeeApiKeyInput
                apiKey={apiKey}
                onApiKeyChange={setApiKey}
              />
            </CardContent>
          </Card>

          <ActionPanel
            isLoading={isLoading}
            progress={progress}
            onStartScraping={handleStartScraping}
          />

          <ExportPanel results={results} onExport={exportResults} />
        </div>
      </div>

      {/* Results Section */}
      {results.length > 0 && (
        <div className="mt-8">
          <ResultsTable results={results} />
        </div>
      )}
    </div>
  );
};
