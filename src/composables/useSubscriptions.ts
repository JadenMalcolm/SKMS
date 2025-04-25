import { ref } from 'vue'
import type { Ref } from 'vue'
import axios from 'axios'
import type { User } from './useUsers'
import type { Question } from './useQuestions'
import useApiUrl from './useApiUrl'

/**
 * Composable for managing question subscriptions.
 * Allows users to subscribe to questions they are interested in
 * to receive updates.
 *
 * @param currentUser - Reference to the current user object
 * @returns Subscription management methods and reactive state variables
 */
export default function useSubscriptions(currentUser: Ref<User | null>) {
  const { getBaseUrl } = useApiUrl()
  const apiBaseUrl = getBaseUrl()

  const subscribedQuestions = ref<Question[]>([])
  const isSubscribed = ref(false)
  const subscriptionMessage = ref('')

  /**
   * Fetches all questions the current user has subscribed to
   */
  const fetchSubscribedQuestions = async () => {
    if (!currentUser.value) return

    try {
      const token = sessionStorage.getItem('token')

      if (!token) {
        return
      }

      const subscribedResponse = await axios.get(
        `${apiBaseUrl}/users/${currentUser.value.id}/subscriptions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      subscribedQuestions.value = subscribedResponse.data
    } catch (error) {
      console.error('Error fetching subscribed questions:', error)
    }
  }

  /**
   * Checks if the current user is subscribed to a specific question
   * @param questionId - ID of the question to check
   * @returns Boolean indicating subscription status
   */
  const checkSubscriptionStatus = async (questionId: number | string) => {
    if (!currentUser.value) return false

    try {
      const token = sessionStorage.getItem('token')
      console.log('Token being sent:', token)
      const response = await axios.get<boolean>(
        `${apiBaseUrl}/subscriptions/${currentUser.value.id}/${questionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      isSubscribed.value = response.data
      return response.data
    } catch (error) {
      console.error('Error checking subscription status:', error)
      return false
    }
  }

  /**
   * Subscribes the current user to a question
   * @param questionId - ID of the question to subscribe to
   * @returns Boolean indicating success or failure
   */
  const subscribeToQuestion = async (questionId: number | string) => {
    try {
      if (!currentUser.value) throw new Error('User not logged in.')

      const token = sessionStorage.getItem('token')
      await axios.post(
        `${apiBaseUrl}/subscriptions`,
        {
          user_id: currentUser.value.id,
          question_id: questionId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      isSubscribed.value = true
      subscriptionMessage.value = 'Subscribed to question successfully!'

      // Refresh the subscribed questions list
      await fetchSubscribedQuestions()

      return true
    } catch (error) {
      console.error('Error subscribing to question:', error)
      subscriptionMessage.value = 'Error subscribing to question.'
      return false
    }
  }

  /**
   * Unsubscribes the current user from a question
   * @param questionId - ID of the question to unsubscribe from
   * @returns Boolean indicating success or failure
   */
  const unsubscribeFromQuestion = async (questionId: number | string) => {
    try {
      if (!currentUser.value) throw new Error('User not logged in.')

      const token = sessionStorage.getItem('token')
      await axios.delete(`${apiBaseUrl}/subscriptions`, {
        data: {
          user_id: currentUser.value.id,
          question_id: questionId,
        },
        headers: { Authorization: `Bearer ${token}` },
      })

      isSubscribed.value = false
      subscriptionMessage.value = 'Unsubscribed from question successfully!'

      // Refresh the subscribed questions list
      await fetchSubscribedQuestions()

      return true
    } catch (error) {
      console.error('Error unsubscribing from question:', error)
      subscriptionMessage.value = 'Error unsubscribing from question.'
      return false
    }
  }

  return {
    subscribedQuestions,
    isSubscribed,
    subscriptionMessage,
    fetchSubscribedQuestions,
    checkSubscriptionStatus,
    subscribeToQuestion,
    unsubscribeFromQuestion,
  }
}
