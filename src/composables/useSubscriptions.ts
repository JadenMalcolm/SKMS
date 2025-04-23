import { ref } from 'vue'
import type { Ref } from 'vue'
import axios from 'axios'
import type { User } from './useUsers'

export interface Question {
  id: number
  question: string
  category: string
  timestamp: string
  user_email: string
  isEditing?: boolean
  editText?: string
  report_count?: number
}

export default function useSubscriptions(currentUser: Ref<User | null>) {
  const subscribedQuestions = ref<Question[]>([])
  const isSubscribed = ref(false)
  const subscriptionMessage = ref('')

  const fetchSubscribedQuestions = async () => {
    if (!currentUser.value) return

    try {
      const subscribedResponse = await axios.get(
        `http://localhost:5000/users/${currentUser.value.id}/subscriptions`,
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
        `http://localhost:5000/subscriptions/${currentUser.value.id}/${questionId}`,
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

      await axios.post(`http://localhost:5000/subscriptions`, {
        user_id: currentUser.value.id,
        question_id: questionId,
      })

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

      await axios.delete(`http://localhost:5000/subscriptions`, {
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
