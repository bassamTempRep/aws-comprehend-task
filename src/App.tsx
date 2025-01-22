import { useState, useEffect, useTransition } from "react";
import { Search, ChevronDown, ChevronUp, Trash } from "lucide-react";
import "./App.css";
import {
  ComprehendClient,
  DetectSentimentCommand,
  DetectSentimentCommandOutput,
} from "@aws-sdk/client-comprehend";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import React from "react";

// AWS Configuration
const REGION = "us-east-1";

// When Checking The Client/UI or running the dev server use line 21 to 25 and running
// const AWS_CREDENTIALS = {
//   accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || "",
//   secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || "",
// };
// const BUCKET_NAME = import.meta.env.VITE_AWS_BUCKET_NAME || "";

// when checking the jest test cases uncomment the following
const AWS_CREDENTIALS = {
  accessKeyId: process.env.VITE_AWS_ACCESS_KEY_ID || "",
  secretAccessKey: process.env.VITE_AWS_SECRET_ACCESS_KEY || "",
};
const BUCKET_NAME = process.env.VITE_AWS_BUCKET_NAME || "";

const HISTORY_KEY = "sentiment-history.json";

const s3Client = new S3Client({
  region: REGION,
  credentials: AWS_CREDENTIALS,
});

// Type Definitions
type SentimentResult = {
  text: string;
  sentiment: string;
  date: string;
  scores: {
    Positive: number;
    Negative: number;
    Neutral: number;
    Mixed: number;
  };
};

// Utility Functions

/**
 * Analyze sentiment using AWS Comprehend
 * @param text - Text to analyze
 * @returns SentimentResult
 */
const analyzeSentiment = async (text: string): Promise<SentimentResult> => {
  const client = new ComprehendClient({
    region: REGION,
    credentials: AWS_CREDENTIALS,
  });
  const command = new DetectSentimentCommand({
    Text: text,
    LanguageCode: "en",
  });

  const response: DetectSentimentCommandOutput = await client.send(command);
  return {
    text,
    sentiment: response.Sentiment || "Unknown",
    date: new Date().toLocaleString(),
    scores: {
      Positive: response.SentimentScore?.Positive || 0,
      Negative: response.SentimentScore?.Negative || 0,
      Neutral: response.SentimentScore?.Neutral || 0,
      Mixed: response.SentimentScore?.Mixed || 0,
    },
  };
};

/**
 * Fetch history from S3
 * @returns Array of SentimentResult
 */
const fetchHistory = async (): Promise<SentimentResult[]> => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: HISTORY_KEY,
    });
    const response = await s3Client.send(command);
    const data = await response.Body?.transformToString();
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error fetching history:", error);
    return [];
  }
};

/**
 * Save history to S3
 * @param history - Array of SentimentResult
 */
const saveHistory = async (history: SentimentResult[]) => {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: HISTORY_KEY,
      Body: JSON.stringify(history),
      ContentType: "application/json",
    });
    await s3Client.send(command);
  } catch (error) {
    console.error("Error saving history:", error);
  }
};

// Main Component
const App = () => {
  // State Variables
  const [inputText, setInputText] = useState<string>("");
  const [history, setHistory] = useState<SentimentResult[]>([]);
  const [sortedHistory, setSortedHistory] = useState<SentimentResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Load history on mount
  useEffect(() => {
    const loadHistory = async () => {
      const loadedHistory = await fetchHistory();
      setHistory(loadedHistory);
      setSortedHistory(loadedHistory);
    };
    loadHistory();
  }, []);

  // Handlers
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputText.trim()) {
      setError("Please enter valid text for analysis.");
      return;
    }

    try {
      const result = await analyzeSentiment(inputText.trim());
      startTransition(() => {
        const updatedHistory = [result, ...history];
        setHistory(updatedHistory);
        setSortedHistory(updatedHistory);
      });
      await saveHistory([result, ...history]);
      setInputText("");
      setError(null); // Clear any previous errors on successful submission
    } catch (err) {
      console.error("Analysis error:", err);
      setError(
        err instanceof Error
          ? `Analysis failed: ${err.message}`
          : "Unexpected error occurred."
      );
    }
  };

  const handleDelete = async (index: number) => {
    const updatedHistory = history.filter((_, i) => i !== index);
    setHistory(updatedHistory);
    setSortedHistory(updatedHistory);
    await saveHistory(updatedHistory);
  };

  const handleClearAll = async () => {
    setHistory([]);
    setSortedHistory([]);
    await saveHistory([]);
  };

  // Sorting Functions
  const sortByBadToGood = () => {
    const sorted = [...history].sort(
      (a, b) =>
        b.scores.Negative - a.scores.Negative ||
        b.scores.Neutral - a.scores.Neutral ||
        a.scores.Positive - b.scores.Positive
    );
    setSortedHistory(sorted);
    setIsDropdownOpen(false);
  };

  const sortByGoodToBad = () => {
    const sorted = [...history].sort(
      (a, b) =>
        b.scores.Positive - a.scores.Positive ||
        b.scores.Neutral - a.scores.Neutral ||
        a.scores.Negative - b.scores.Negative
    );
    setSortedHistory(sorted);
    setIsDropdownOpen(false);
  };

  const sortByDateAsc = () => {
    const sorted = [...history].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    setSortedHistory(sorted);
    setIsDropdownOpen(false);
  };

  const sortByDateDesc = () => {
    const sorted = [...history].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setSortedHistory(sorted);
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "POSITIVE":
        return "text-green-700 font-bold";
      case "NEGATIVE":
        return "text-red-700 font-bold";
      case "NEUTRAL":
        return "text-gray-700 font-medium";
      case "MIXED":
        return "text-yellow-700 font-bold";
      default:
        return "text-black";
    }
  };

  return (
    <main className="min-h-screen flex items-center bg-gray-300">
      <form
        onSubmit={handleSubmit}
        className="shadow max-w-screen-md mx-auto py-4 w-full px-4 rounded bg-white"
      >
        <h1 className="text-2xl font-bold mb-4">Sentiment Analysis Tool</h1>
        <div className="flex items-center gap-12 mb-6">
          <div className="flex-grow bg-white border px-4 py-2 flex items-center gap-2">
            <Search />
            <input
              name="text"
              className="w-full outline-none"
              placeholder="Enter text for sentiment analysis"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className={`bg-green-600 px-4 py-2 text-white rounded hover:bg-green-700 ${
              isPending ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isPending}
          >
            {isPending ? "Analyzing..." : "Submit"}
          </button>
        </div>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        <div className="shadow-lg rounded w-full pt-4 p-4 bg-gray-100">
          <div className="flex items-center justify-between mb-4">
            <p className="text-lg font-medium">Analysis History:</p>
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  className="flex items-center px-4 py-2 border rounded bg-white hover:bg-gray-100"
                  onClick={toggleDropdown}
                >
                  Sort By{" "}
                  {isDropdownOpen ? (
                    <ChevronUp className="ml-2" size={16} />
                  ) : (
                    <ChevronDown className="ml-2" size={16} />
                  )}
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border rounded shadow-lg">
                    <button
                      className="block px-4 py-2 text-left hover:bg-gray-100 w-full"
                      onClick={sortByBadToGood}
                    >
                      Bad to Good
                    </button>
                    <button
                      className="block px-4 py-2 text-left hover:bg-gray-100 w-full"
                      onClick={sortByGoodToBad}
                    >
                      Good to Bad
                    </button>
                    <button
                      className="block px-4 py-2 text-left hover:bg-gray-100 w-full"
                      onClick={sortByDateAsc}
                    >
                      Date Asc
                    </button>
                    <button
                      className="block px-4 py-2 text-left hover:bg-gray-100 w-full"
                      onClick={sortByDateDesc}
                    >
                      Date Desc
                    </button>
                  </div>
                )}
              </div>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={handleClearAll}
              >
                Clear All
              </button>
            </div>
          </div>
          <div className="max-h-[32rem] overflow-auto">
            {sortedHistory.map((entry, index) => (
              <div
                className="flex justify-between items-center hover:bg-gray-300 transition pr-4"
                key={index}
              >
                <div className="mb-4 border-b pb-2 border-gray-300 last:border-b-0">
                  <p className="text-sm text-gray-500">{entry.date}</p>
                  <p className="text-md">{entry.text}</p>
                  <p
                    className={`text-lg ${getSentimentColor(entry.sentiment)}`}
                  >
                    {entry.sentiment}
                  </p>
                </div>
                <Trash
                  className="text-red-600 stroke-1 w-6 hover:cursor-pointer"
                  onClick={() => handleDelete(index)}
                />
              </div>
            ))}
          </div>
        </div>
      </form>
    </main>
  );
};

export default App;
export { analyzeSentiment, fetchHistory, saveHistory };
