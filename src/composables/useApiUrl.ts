/**
 * Composable for centralized API URL configuration
 * Uses environment variables to determine the API base URL
 */
export default function useApiUrl() {
  // Get the API base URL from environment variables
  // Falls back to localhost:5000 if not defined
  const getBaseUrl = (): string => {
    return 'http://localhost:5000'
  }

  return {
    getBaseUrl,
  }
}
