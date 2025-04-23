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

  return {
    subscribedQuestions,
    fetchSubscribedQuestions,
  }
}
