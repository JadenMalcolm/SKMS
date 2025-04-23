/**
 * Composable for centralized API URL configuration
 * Uses environment variables to determine the API base URL
 * NOTE: Do not log this URL to avoid exposing it in the console
 */
export default function useApiUrl() {
  // Get the API base URL from environment variables
  // Falls back to localhost:5000 if not defined
  const getBaseUrl = (): string => {
    return import.meta.env.VITE_API_URL
  }

  // Get the API key from environment variables
  const getSecretKey = (): string => {
    return import.meta.env.VITE_SECRET_KEY
  }

  return {
    getBaseUrl,
    getSecretKey
  }
}
