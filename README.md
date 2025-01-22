
---

# Sentiment Analysis Tool

A React-based sentiment analysis tool that uses AWS Comprehend for analyzing text and AWS S3 for storing analysis history. This project was developed with Vite and TypeScript, and includes testing using Jest and React Testing Library.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
  - [Running Tests](#running-tests)
- [Project Structure](#project-structure)
- [Development and Testing Environment Toggle](#development-and-testing-environment-toggle)
- [Next Phases](#next-phases)
- [License](#license)

## Features

- Analyze text sentiment using AWS Comprehend.
- Store and retrieve sentiment analysis history from AWS S3.
- Sort analysis history by various criteria such as sentiment and date.
- Real-time UI updates with React hooks.
- Error handling for AWS service failures.

## Technologies Used

- **React** with **TypeScript**: For building a robust, strongly typed frontend.
- **Vite**: Fast build tool and development server.
- **AWS SDK**: To interact with AWS Comprehend and S3 services.
- **Jest** and **React Testing Library**: For testing components and logic.
- **Tailwind CSS** (assumed): For styling the UI.
- **Lucide Icons**: For iconography in the UI.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/download/) (version 14 or later)
- [npm](https://www.npmjs.com/get-npm) (comes with Node.js) or [Yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository:**
   ```bash
[   git clone <repository_url>
](https://github.com/bassamfouad/sent-task.git) 
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   or
   ```bash
   yarn
   ```

### Environment Variables

Create a `.env` file in the root directory of the project and add the following variables:
```env
VITE_AWS_ACCESS_KEY_ID=your-access-key-id
VITE_AWS_SECRET_ACCESS_KEY=your-secret-access-key
VITE_AWS_BUCKET_NAME=your-bucket-name
```
These environment variables are used for AWS authentication and accessing the S3 bucket.

### Running the Application

To start the development server:
```bash
npm run dev
```
or
```bash
yarn dev
```
Open  http://localhost:5173  in your browser to view the application.

### Running Tests

To run the test suite:
```bash
npm test
```
or
```bash
yarn test
```
This will run the Jest tests defined in the project, which cover input handling, API calls, error handling, and sorting.

## Project Structure

```
├── src
│   ├── App.tsx            # Main React component and utility functions
│   ├── App.test.tsx       # Test cases for the App component
│   ├── ...                # Other components, styles, etc.
├── public                 # Public assets
├── .env                   # Environment variables (not committed)
├── package.json
├── tsconfig.app.json
├── tsconfig.node.json
├── tsconfig.json
├── tsconfig.jest.json     # Jest-specific TypeScript configuration
├── jest.config.ts
├── jest.setup.ts
└── README.md
```

## Development and Testing Environment Toggle

In `App.tsx`, you can toggle between development and testing environments by commenting/uncommenting blocks of code for AWS credentials and bucket name. This allows the application to switch between using `import.meta.env` for development/UI and `process.env` for Jest test cases.

```tsx
// For development or running the UI
// const AWS_CREDENTIALS = {
//   accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || "",
//   secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || "",
// };
// const BUCKET_NAME = import.meta.env.VITE_AWS_BUCKET_NAME || "";

// For Jest test cases, uncomment the following:
const AWS_CREDENTIALS = {
  accessKeyId: process.env.VITE_AWS_ACCESS_KEY_ID || "",
  secretAccessKey: process.env.VITE_AWS_SECRET_ACCESS_KEY || "",
};
const BUCKET_NAME = process.env.VITE_AWS_BUCKET_NAME || "";
```

- **For Development/UI:** Uncomment the first block to use Vite environment variables.
- **For Testing:** Uncomment the second block to use Node's `process.env`. This prevents errors related to `import.meta.env` in Jest tests.

## Next Phases

The following enhancements are planned for future development:

1. **Add Filters for the List**  
   Implement additional filtering options for the analysis history list. Users will be able to filter results based on criteria such as sentiment type, date range, or other metrics.

2. **Pagination or Infinite Scrolling**  
   Depending on traffic and user experience feedback, implement either:
   - **Pagination**: Break the analysis history into pages for easier navigation.
   - **Infinite Scrolling**: Dynamically load more entries as the user scrolls, providing a smoother browsing experience.

   The choice between pagination and infinite scrolling will depend on traffic patterns and user preferences.

3. **Enhanced Error Handling**  
   Improve error handling throughout the application to cover more edge cases and pass additional test cases. This may include:
   - More descriptive error messages for different failure scenarios (e.g., network issues, AWS service errors).
   - Retry mechanisms or fallback UI in case of temporary failures.
   - Logging errors to a monitoring service for proactive issue resolution.
Testing Storage Features

Ensure AWS S3 integration is fully functional for storing and retrieving analysis history.
Validate proper handling of credentials and seamless switching between environments (development and Jest testing).
Implement Filters for Analysis History

Add sentiment type and date range filters for improved usability.
Ensure the filters are integrated with both AWS Comprehend and S3 data retrieval.
Choose and Implement Pagination or Infinite Scrolling

Evaluate user feedback and traffic to decide between pagination or infinite scrolling.
Optimize data loading performance for a smooth user experience.
Improve Error Handling

Add descriptive error messages for all edge cases.
Implement retry mechanisms for AWS service failures.
Integrate error logging with a monitoring service to streamline debugging and issue tracking.
---

## License

This project is licensed under the Crypto Banter hiring program 

---

