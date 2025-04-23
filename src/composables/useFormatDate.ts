export default function useFormatDate() {
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

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':')
    const date = new Date()
    date.setHours(parseInt(hour), parseInt(minute))
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
  }

  return {
    formatDate,
    formatTime,
  }
}
