import "@testing-library/jest-dom";

// Mock import.meta.env for tests
Object.defineProperty(globalThis, "importMeta", {
  value: {
    env: {
      VITE_AWS_ACCESS_KEY_ID: "AKIAT4GVR67T4HHZ2V4K",
      VITE_AWS_SECRET_ACCESS_KEY: "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",
      VITE_AWS_BUCKET_NAME: "my-sentiment-history-bucket-production",
    },
  },
  writable: true,
});
