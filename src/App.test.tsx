// // src/App.test.tsx
// import { render, screen, fireEvent, waitFor } from "@testing-library/react";
// import "@testing-library/jest-dom";
// import * as AppModule from "./App";
// import App from "./App";

// // Destructure exported functions for convenience
// const { analyzeSentiment, saveHistory } = AppModule;

// describe("App Component Tests", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//     jest.spyOn(AppModule, "fetchHistory").mockResolvedValue([]);
//   });

//   test("handles input change", () => {
//     render(<App />);
//     const inputElement = screen.getByPlaceholderText(
//       "Enter text for sentiment analysis"
//     ) as HTMLInputElement;

//     // Simulate user typing into the input field
//     fireEvent.change(inputElement, { target: { value: "Test input" } });

//     // Verify that the input value updates correctly
//     expect(inputElement).toHaveValue("Test input");
//   });

//   test("calls analyzeSentiment on form submission and updates history", async () => {
//     const mockResult = {
//       text: "Test input",
//       sentiment: "POSITIVE",
//       date: "2025-01-22",
//       scores: { Positive: 0.9, Negative: 0.1, Neutral: 0, Mixed: 0 },
//     };

//     const analyzeSpy = jest
//       .spyOn(AppModule, "analyzeSentiment")
//       .mockResolvedValue(mockResult);
//     const saveSpy = jest.spyOn(AppModule, "saveHistory").mockResolvedValue();

//     render(<App />);
//     const inputElement = screen.getByPlaceholderText(
//       "Enter text for sentiment analysis"
//     );
//     const submitButton = screen.getByText("Submit");

//     // Simulate user input and form submission
//     fireEvent.change(inputElement, { target: { value: "Test input" } });
//     fireEvent.click(submitButton);

//     // Wait for asynchronous UI updates
//     await waitFor(() => {
//       expect(analyzeSpy).toHaveBeenCalledWith("Test input");
//       // Check that the result is rendered on the screen
//       expect(screen.getByText("POSITIVE")).toBeInTheDocument();
//       expect(screen.getByText("Test input")).toBeInTheDocument();
//     });

//     analyzeSpy.mockRestore();
//     saveSpy.mockRestore();
//   });

//   test("displays error when analyzeSentiment fails", async () => {
//     const errorMessage = "API Error";

//     // Spy on analyzeSentiment to simulate a rejection
//     const analyzeSpy = jest
//       .spyOn(AppModule, "analyzeSentiment")
//       .mockRejectedValue(new Error(errorMessage));

//     render(<App />);
//     const inputElement = screen.getByPlaceholderText(
//       "Enter text for sentiment analysis"
//     );
//     const submitButton = screen.getByText("Submit");

//     // Simulate user input and form submission
//     fireEvent.change(inputElement, { target: { value: "Test input" } });
//     fireEvent.click(submitButton);

//     // Wait for the error message to appear on the screen
//     await waitFor(() => {
//       expect(screen.getByText(/API Error/i)).toBeInTheDocument();
//     });

//     analyzeSpy.mockRestore();
//   });
// });
// src/App.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import * as AppModule from "./App";
import App from "./App";

// Mock AWS SDK Clients
jest.mock("@aws-sdk/client-comprehend", () => ({
  ComprehendClient: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
  DetectSentimentCommand: jest.fn(),
}));

jest.mock("@aws-sdk/client-s3", () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
  PutObjectCommand: jest.fn(),
  GetObjectCommand: jest.fn(),
}));

// Automatically restore all mocks after each test
afterEach(() => {
  jest.restoreAllMocks();
});

describe("App Component Tests", () => {
  // Existing Tests

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

    // Mock analyzeSentiment to resolve with mockResult
    const analyzeSpy = jest
      .spyOn(AppModule, "analyzeSentiment")
      .mockResolvedValue(mockResult);

    // Mock saveHistory to resolve
    const saveSpy = jest.spyOn(AppModule, "saveHistory").mockResolvedValue();

    // Mock fetchHistory to return empty history initially
    jest.spyOn(AppModule, "fetchHistory").mockResolvedValue([]);

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
      // Assert that saveHistory was called with the updated history
      expect(saveSpy).toHaveBeenCalledWith([mockResult]);
    });
  });

  test("displays error when analyzeSentiment fails", async () => {
    const errorMessage = "API Error";

    // Spy on analyzeSentiment to simulate a rejection
    const analyzeSpy = jest
      .spyOn(AppModule, "analyzeSentiment")
      .mockRejectedValue(new Error(errorMessage));

    // Mock fetchHistory to return empty history
    jest.spyOn(AppModule, "fetchHistory").mockResolvedValue([]);

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
      expect(
        screen.getByText(/Analysis failed: API Error/i)
      ).toBeInTheDocument();
    });
  });

  // Additional Tests

  test("sorts history by good to bad", async () => {
    const mockHistory = [
      {
        text: "Bad input",
        sentiment: "NEGATIVE",
        date: "2025-01-21",
        scores: { Positive: 0.1, Negative: 0.9, Neutral: 0, Mixed: 0 },
      },
      {
        text: "Good input",
        sentiment: "POSITIVE",
        date: "2025-01-22",
        scores: { Positive: 0.9, Negative: 0.1, Neutral: 0, Mixed: 0 },
      },
    ];

    // Mock fetchHistory to return mockHistory
    jest.spyOn(AppModule, "fetchHistory").mockResolvedValue(mockHistory);

    render(<App />);

    // Wait for history to load
    await waitFor(() => {
      expect(screen.getByText("POSITIVE")).toBeInTheDocument();
      expect(screen.getByText("NEGATIVE")).toBeInTheDocument();
    });

    const sortButton = screen.getByText("Sort By");
    fireEvent.click(sortButton);

    const goodToBadOption = screen.getByText("Good to Bad");
    fireEvent.click(goodToBadOption);

    // After sorting, POSITIVE should come before NEGATIVE
    const sentimentElements = screen.getAllByText(/POSITIVE|NEGATIVE/);
    expect(sentimentElements[0]).toHaveTextContent("POSITIVE");
    expect(sentimentElements[1]).toHaveTextContent("NEGATIVE");
  });

  test("sorts history by bad to good", async () => {
    const mockHistory = [
      {
        text: "Good input",
        sentiment: "POSITIVE",
        date: "2025-01-22",
        scores: { Positive: 0.9, Negative: 0.1, Neutral: 0, Mixed: 0 },
      },
      {
        text: "Bad input",
        sentiment: "NEGATIVE",
        date: "2025-01-21",
        scores: { Positive: 0.1, Negative: 0.9, Neutral: 0, Mixed: 0 },
      },
    ];

    // Mock fetchHistory to return mockHistory
    jest.spyOn(AppModule, "fetchHistory").mockResolvedValue(mockHistory);

    render(<App />);

    // Wait for history to load
    await waitFor(() => {
      expect(screen.getByText("POSITIVE")).toBeInTheDocument();
      expect(screen.getByText("NEGATIVE")).toBeInTheDocument();
    });

    const sortButton = screen.getByText("Sort By");
    fireEvent.click(sortButton);

    const badToGoodOption = screen.getByText("Bad to Good");
    fireEvent.click(badToGoodOption);

    // After sorting, NEGATIVE should come before POSITIVE
    const sentimentElements = screen.getAllByText(/POSITIVE|NEGATIVE/);
    expect(sentimentElements[0]).toHaveTextContent("NEGATIVE");
    expect(sentimentElements[1]).toHaveTextContent("POSITIVE");
  });

  test("sorts history by date ascending", async () => {
    const mockHistory = [
      {
        text: "Second input",
        sentiment: "NEGATIVE",
        date: "2025-01-22",
        scores: { Positive: 0.2, Negative: 0.8, Neutral: 0, Mixed: 0 },
      },
      {
        text: "First input",
        sentiment: "POSITIVE",
        date: "2025-01-21",
        scores: { Positive: 0.8, Negative: 0.2, Neutral: 0, Mixed: 0 },
      },
    ];

    // Mock fetchHistory to return mockHistory
    jest.spyOn(AppModule, "fetchHistory").mockResolvedValue(mockHistory);

    render(<App />);

    // Wait for history to load
    await waitFor(() => {
      expect(screen.getByText("POSITIVE")).toBeInTheDocument();
      expect(screen.getByText("NEGATIVE")).toBeInTheDocument();
    });

    const sortButton = screen.getByText("Sort By");
    fireEvent.click(sortButton);

    const dateAscOption = screen.getByText("Date Asc");
    fireEvent.click(dateAscOption);

    // After sorting, "First input" should come before "Second input"
    const textElements = screen.getAllByText(/First input|Second input/);
    expect(textElements[0]).toHaveTextContent("First input");
    expect(textElements[1]).toHaveTextContent("Second input");
  });

  test("sorts history by date descending", async () => {
    const mockHistory = [
      {
        text: "First input",
        sentiment: "POSITIVE",
        date: "2025-01-21",
        scores: { Positive: 0.8, Negative: 0.2, Neutral: 0, Mixed: 0 },
      },
      {
        text: "Second input",
        sentiment: "NEGATIVE",
        date: "2025-01-22",
        scores: { Positive: 0.2, Negative: 0.8, Neutral: 0, Mixed: 0 },
      },
    ];

    // Mock fetchHistory to return mockHistory
    jest.spyOn(AppModule, "fetchHistory").mockResolvedValue(mockHistory);

    render(<App />);

    // Wait for history to load
    await waitFor(() => {
      expect(screen.getByText("POSITIVE")).toBeInTheDocument();
      expect(screen.getByText("NEGATIVE")).toBeInTheDocument();
    });

    const sortButton = screen.getByText("Sort By");
    fireEvent.click(sortButton);

    const dateDescOption = screen.getByText("Date Desc");
    fireEvent.click(dateDescOption);

    // After sorting, "Second input" should come before "First input"
    const textElements = screen.getAllByText(/First input|Second input/);
    expect(textElements[0]).toHaveTextContent("Second input");
    expect(textElements[1]).toHaveTextContent("First input");
  });

  test("deletes a history entry", async () => {
    const mockHistory = [
      {
        text: "First input",
        sentiment: "POSITIVE",
        date: "2025-01-21",
        scores: { Positive: 0.8, Negative: 0.2, Neutral: 0, Mixed: 0 },
      },
      {
        text: "Second input",
        sentiment: "NEGATIVE",
        date: "2025-01-22",
        scores: { Positive: 0.2, Negative: 0.8, Neutral: 0, Mixed: 0 },
      },
    ];

    // Mock fetchHistory to return mockHistory
    jest.spyOn(AppModule, "fetchHistory").mockResolvedValue(mockHistory);

    // Mock saveHistory to resolve
    const saveSpy = jest.spyOn(AppModule, "saveHistory").mockResolvedValue();

    render(<App />);

    // Wait for history to load
    await waitFor(() => {
      expect(screen.getByText("First input")).toBeInTheDocument();
      expect(screen.getByText("Second input")).toBeInTheDocument();
    });

    // Get all delete buttons (Trash icons)
    const deleteButtons = screen.getAllByRole("button", { name: /trash/i });
    expect(deleteButtons.length).toBe(2);

    // Delete the first entry ("First input")
    fireEvent.click(deleteButtons[0]);

    // Verify the first entry is removed
    await waitFor(() => {
      expect(screen.queryByText("First input")).not.toBeInTheDocument();
      expect(screen.getByText("Second input")).toBeInTheDocument();
      // Assert that saveHistory was called with the updated history
      expect(saveSpy).toHaveBeenCalledWith([mockHistory[1]]);
    });
  });

  test("clears all history entries", async () => {
    const mockHistory = [
      {
        text: "First input",
        sentiment: "POSITIVE",
        date: "2025-01-21",
        scores: { Positive: 0.8, Negative: 0.2, Neutral: 0, Mixed: 0 },
      },
      {
        text: "Second input",
        sentiment: "NEGATIVE",
        date: "2025-01-22",
        scores: { Positive: 0.2, Negative: 0.8, Neutral: 0, Mixed: 0 },
      },
    ];

    // Mock fetchHistory to return mockHistory
    jest.spyOn(AppModule, "fetchHistory").mockResolvedValue(mockHistory);

    // Mock saveHistory to resolve
    const saveSpy = jest.spyOn(AppModule, "saveHistory").mockResolvedValue();

    render(<App />);

    // Wait for history to load
    await waitFor(() => {
      expect(screen.getByText("First input")).toBeInTheDocument();
      expect(screen.getByText("Second input")).toBeInTheDocument();
    });

    const clearAllButton = screen.getByText("Clear All");
    fireEvent.click(clearAllButton);

    // Verify all entries are removed
    await waitFor(() => {
      expect(screen.queryByText("First input")).not.toBeInTheDocument();
      expect(screen.queryByText("Second input")).not.toBeInTheDocument();
      // Assert that saveHistory was called with an empty array
      expect(saveSpy).toHaveBeenCalledWith([]);
    });
  });

  test("disables submit button and shows loading state during analysis", async () => {
    const mockResult = {
      text: "Loading input",
      sentiment: "NEUTRAL",
      date: "2025-01-23",
      scores: { Positive: 0.5, Negative: 0.3, Neutral: 0.2, Mixed: 0 },
    };

    // Mock analyzeSentiment to resolve after a delay
    const analyzeSpy = jest
      .spyOn(AppModule, "analyzeSentiment")
      .mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockResult), 100);
          })
      );

    // Mock saveHistory to resolve
    const saveSpy = jest.spyOn(AppModule, "saveHistory").mockResolvedValue();

    // Mock fetchHistory to return empty history
    jest.spyOn(AppModule, "fetchHistory").mockResolvedValue([]);

    render(<App />);
    const inputElement = screen.getByPlaceholderText(
      "Enter text for sentiment analysis"
    );
    const submitButton = screen.getByText("Submit");

    // Simulate user input and form submission
    fireEvent.change(inputElement, { target: { value: "Loading input" } });
    fireEvent.click(submitButton);

    // Check that the button is disabled and shows "Analyzing..."
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent("Analyzing...");

    // Wait for the analysis to complete
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
      expect(submitButton).toHaveTextContent("Submit");
      expect(screen.getByText("NEUTRAL")).toBeInTheDocument();
      // Assert that saveHistory was called with the updated history
      expect(saveSpy).toHaveBeenCalledWith([mockResult]);
    });
  });

  test("handles error when fetching history fails", async () => {
    // Mock fetchHistory to reject
    jest
      .spyOn(AppModule, "fetchHistory")
      .mockRejectedValue(new Error("Fetch Error"));

    render(<App />);

    // Depending on how your App handles fetch errors,
    // adjust the expectations below.

    // Example: If the App initializes with empty history and logs the error,
    // there might be no visible change. Alternatively, if it shows an error message:

    // await waitFor(() => {
    //   expect(screen.getByText("Error fetching history")).toBeInTheDocument();
    // });

    // For this example, we'll assume it initializes with empty history without crashing
    await waitFor(() => {
      // Check that no history items are rendered
      expect(
        screen.queryByText(/POSITIVE|NEGATIVE|NEUTRAL|MIXED/)
      ).not.toBeInTheDocument();
    });
  });
});
