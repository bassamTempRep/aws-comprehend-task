// src/App.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import * as AppModule from "./App";
import App from "./App";

// Destructure exported functions for convenience
const { analyzeSentiment, saveHistory } = AppModule;

describe("App Component Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(AppModule, "fetchHistory").mockResolvedValue([]);
  });

  test("handles input change", () => {
    render(<App />);
    const inputElement = screen.getByPlaceholderText(
      "Enter text for sentiment analysis"
    ) as HTMLInputElement;

    // Simulate user typing into the input field
    fireEvent.change(inputElement, { target: { value: "Test input" } });

    // Verify that the input value updates correctly
    expect(inputElement).toHaveValue("Test input");
  });

  test("calls analyzeSentiment on form submission and updates history", async () => {
    const mockResult = {
      text: "Test input",
      sentiment: "POSITIVE",
      date: "2025-01-22",
      scores: { Positive: 0.9, Negative: 0.1, Neutral: 0, Mixed: 0 },
    };

    const analyzeSpy = jest
      .spyOn(AppModule, "analyzeSentiment")
      .mockResolvedValue(mockResult);
    const saveSpy = jest.spyOn(AppModule, "saveHistory").mockResolvedValue();

    render(<App />);
    const inputElement = screen.getByPlaceholderText(
      "Enter text for sentiment analysis"
    );
    const submitButton = screen.getByText("Submit");

    // Simulate user input and form submission
    fireEvent.change(inputElement, { target: { value: "Test input" } });
    fireEvent.click(submitButton);

    // Wait for asynchronous UI updates
    await waitFor(() => {
      expect(analyzeSpy).toHaveBeenCalledWith("Test input");
      // Check that the result is rendered on the screen
      expect(screen.getByText("POSITIVE")).toBeInTheDocument();
      expect(screen.getByText("Test input")).toBeInTheDocument();
    });

    analyzeSpy.mockRestore();
    saveSpy.mockRestore();
  });

  test("displays error when analyzeSentiment fails", async () => {
    const errorMessage = "API Error";

    // Spy on analyzeSentiment to simulate a rejection
    const analyzeSpy = jest
      .spyOn(AppModule, "analyzeSentiment")
      .mockRejectedValue(new Error(errorMessage));

    render(<App />);
    const inputElement = screen.getByPlaceholderText(
      "Enter text for sentiment analysis"
    );
    const submitButton = screen.getByText("Submit");

    // Simulate user input and form submission
    fireEvent.change(inputElement, { target: { value: "Test input" } });
    fireEvent.click(submitButton);

    // Wait for the error message to appear on the screen
    await waitFor(() => {
      expect(screen.getByText(/API Error/i)).toBeInTheDocument();
    });

    analyzeSpy.mockRestore();
  });
});
