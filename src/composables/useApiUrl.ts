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
    return import.meta.env.VITE_API_URL
  }

  /**
   * Gets the API security key from environment variables
   * Used for authentication with the backend
   * @returns The API security key
   */
  const getSecretKey = (): string => {
    return import.meta.env.VITE_SECRET_KEY
  }

  return {
    getBaseUrl,
    getSecretKey
  }
}
