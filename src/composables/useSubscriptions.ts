import { ref } from 'vue'
import type { Ref } from 'vue'
import axios from 'axios'
import type { User } from './useUsers'
import type { Question } from './useQuestions'
import useApiUrl from './useApiUrl'

export default function useSubscriptions(currentUser: Ref<User | null>) {
  const { getBaseUrl, getSecretKey } = useApiUrl()
  const apiBaseUrl = getBaseUrl()
  const apiKey = getSecretKey()

  // Create request headers with API key
  const authHeaders = {
    'X-API-Key': apiKey,
  }

  const subscribedQuestions = ref<Question[]>([])
  const isSubscribed = ref(false)
  const subscriptionMessage = ref('')

  const fetchSubscribedQuestions = async () => {
    if (!currentUser.value) return

    try {
      const subscribedResponse = await axios.get(
        `${apiBaseUrl}/users/${currentUser.value.id}/subscriptions`,
        { headers: authHeaders }
      )
      subscribedQuestions.value = subscribedResponse.data
    } catch (error) {
      console.error('Error fetching subscribed questions:', error)
    }
  }

  const checkSubscriptionStatus = async (questionId: number | string) => {
    if (!currentUser.value) return false

    try {
      const response = await axios.get<boolean>(
        `${apiBaseUrl}/subscriptions/${currentUser.value.id}/${questionId}`,
        { headers: authHeaders }
      )
      isSubscribed.value = response.data
      return response.data
    } catch (error) {
      console.error('Error checking subscription status:', error)
      return false
    }
  }

  const subscribeToQuestion = async (questionId: number | string) => {
    try {
      if (!currentUser.value) throw new Error('User not logged in.')

      await axios.post(
        `${apiBaseUrl}/subscriptions`,
        {
          user_id: currentUser.value.id,
          question_id: questionId,
        },
        { headers: authHeaders }
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

  const unsubscribeFromQuestion = async (questionId: number | string) => {
    try {
      if (!currentUser.value) throw new Error('User not logged in.')

      await axios.delete(`${apiBaseUrl}/subscriptions`, {
        headers: authHeaders,
        data: {
          user_id: currentUser.value.id,
          question_id: questionId,
        },
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
