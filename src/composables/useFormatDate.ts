/**
 * Composable for formatting dates and times in various formats.
 * Provides utility functions for consistent date display across the application.
 * @returns Date and time formatting functions
 */
export default function useFormatDate() {
  /**
   * Formats a date string into MM/DD/YYYY format
   * @param date - Date string to format
   * @returns Formatted date string or original string if parsing fails
   */
  const formatDate = (date: string) => {
    const parsedDate = new Date(date)
    if (isNaN(parsedDate.getTime())) {
      return date // Return the original string if parsing fails
    }
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0')
    const day = String(parsedDate.getDate()).padStart(2, '0')
    const year = parsedDate.getFullYear()
    return `${month}/${day}/${year}`
  }

  /**
   * Formats a time string (HH:MM) into a 12-hour format with AM/PM
   * @param time - Time string in 24-hour format (HH:MM)
   * @returns Formatted time string in 12-hour format with AM/PM
   */
  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':')
    const date = new Date()
    date.setHours(parseInt(hour), parseInt(minute))
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
  }

  /**
   * Formats a timestamp into a localized date and time string
   * @param timestamp - Timestamp string to format
   * @returns Formatted date and time string or original string if parsing fails
   */
  const formatDateTime = (timestamp: string) => {
    const parsedDate = new Date(timestamp)
    if (isNaN(parsedDate.getTime())) {
      return timestamp // Return the original string if parsing fails
    }
    return parsedDate.toLocaleString([], {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return {
    formatDate,
    formatTime,
    formatDateTime,
  }
}
