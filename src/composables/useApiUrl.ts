/**
 * Composable for centralized API URL configuration.
 * Uses environment variables to determine the API base URL and API key.
 * Centralizes API configuration to make it easy to change across the application.
 *
 * @returns Methods to get API URL and security key
 */
export default function useApiUrl() {
  /**
   * Gets the API base URL from environment variables
   * Falls back to a default value if not defined
   * @returns The API base URL
   */
  const getBaseUrl = (): string => {
    return "http://localhost:5000/api"
  }



  return {
    getBaseUrl,
  }
}
