import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import useApiUrl from './useApiUrl'

/**
 * Interface representing a feedback item
 */
export interface FeedbackItem {
  id: number
  user_email?: string // Optional for anonymous feedback
  feedback_text: string
  timestamp: string
  user_id?: number // For directing messages
}

/**
 * Interface for categorized feedback items
 */
export interface CategorizedFeedback {
  identifiedVoice: FeedbackItem[]
  anonymousVoice: FeedbackItem[]
  identifiedReport: FeedbackItem[]
  anonymousReport: FeedbackItem[]
}

/**
 * Composable for managing user feedback.
 * Provides functionality for submitting feedback and administrator management.
 *
 * @param closePopup - Optional function to close the feedback popup after submission
 * @returns Feedback management methods and reactive state variables
 */
export default function useFeedback(closePopup?: () => void) {
  const { getBaseUrl } = useApiUrl()
  const apiBaseUrl = getBaseUrl()

  // Create request headers with API key
  // User feedback submission state
  const feedbackType = ref('voice')
  const feedbackText = ref('')
  const isAnonymous = ref(false)
  const feedbackMessage = ref('')

  // Admin feedback management state
  const loading = ref(true)
  const categorizedFeedback = ref<CategorizedFeedback>({
    identifiedVoice: [],
    anonymousVoice: [],
    identifiedReport: [],
    anonymousReport: [],
  })
  const router = useRouter()

  /**
   * User function: Submit new feedback
   * Validates input and sends feedback to the server
   */
  const submitFeedback = async () => {
    if (!feedbackText.value) {
      feedbackMessage.value = 'Please enter your feedback before submitting.'
      return
    }

    try {
      const currentUser = JSON.parse(sessionStorage.getItem('user') || 'null')
      const userId = currentUser?.id || null
      const token = sessionStorage.getItem('token')

      await axios.post(
        `${apiBaseUrl}/feedback`,
        {
          type: feedbackType.value,
          text: feedbackText.value,
          anonymous: isAnonymous.value,
          userId: isAnonymous.value ? null : userId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      feedbackMessage.value = 'Thank you for your feedback!'

      // Reset form after successful submission
      setTimeout(() => {
        feedbackText.value = ''
        feedbackType.value = 'voice'
        isAnonymous.value = false
        feedbackMessage.value = ''
        if (closePopup) closePopup()
      }, 1500)
    } catch (error) {
      console.error('Error submitting feedback:', error)
      feedbackMessage.value = 'Failed to submit feedback. Please try again later.'
    }
  }

  /**
   * Admin function: Fetch all feedback data categorized by type
   */
  const fetchFeedbackData = async () => {
    try {
      loading.value = true
      const token = sessionStorage.getItem('token')
      const response = await axios.get(`${apiBaseUrl}/feedback/categorized`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      categorizedFeedback.value = response.data
    } catch (error) {
      console.error('Error fetching feedback data:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * Admin function: Reply to identified feedback by opening a direct message
   * @param feedbackItem - Feedback item to reply to
   */
  const replyToFeedback = async (feedbackItem: FeedbackItem) => {
    if (!feedbackItem.user_id) {
      console.error('No user ID available for this feedback')
      return
    }
    try {
      await router.push('direct-messages')
      await new Promise((resolve) => setTimeout(resolve, 750))

      // Dispatch a custom event to select the user
      const event = new CustomEvent('open-chat', {
        detail: { id: feedbackItem.user_id, email: feedbackItem.user_email },
      })
      window.dispatchEvent(event)
    } catch (error) {
      console.error('Error setting up reply:', error)
    }
  }

  /**
   * Admin function: Delete a feedback item
   * @param item - Feedback item to delete
   */
  const deleteFeedback = async (item: FeedbackItem) => {
    try {
      const token = sessionStorage.getItem('token')
      await axios.delete(`${apiBaseUrl}/feedback/${item.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Remove the deleted feedback from the list
      const categories = [
        'identifiedVoice',
        'anonymousVoice',
        'identifiedReport',
        'anonymousReport',
      ] as const

      categories.forEach((category) => {
        const key = category as keyof typeof categorizedFeedback.value
        categorizedFeedback.value[key] = categorizedFeedback.value[key].filter(
          (feedbackItem) => feedbackItem.id !== item.id,
        )
      })
    } catch (error) {
      console.error('Error deleting feedback:', error)
    }
  }

  return {
    // User feedback submission
    feedbackType,
    feedbackText,
    isAnonymous,
    feedbackMessage,
    submitFeedback,

    // Admin feedback management
    loading,
    categorizedFeedback,
    fetchFeedbackData,
    replyToFeedback,
    deleteFeedback,
  }
}
