import { ref } from 'vue'
import type { Ref } from 'vue'
import axios from 'axios'
import type { User } from './useUsers'
import useApiUrl from './useApiUrl'

export default function useVotes(currentUser: Ref<User | null>) {
  const { getBaseUrl, getSecretKey } = useApiUrl()
  const apiBaseUrl = getBaseUrl()
  const apiKey = getSecretKey()

  // Create request headers with API key
  const authHeaders = {
    'X-API-Key': apiKey
  }

  const upvoteCount = ref(0)
  const downvoteCount = ref(0)
  const reportCount = ref(0)
  const voteMessage = ref('')
  const isLoading = ref(false)

  // Fetch vote counts for a question
  const fetchVoteCounts = async (questionId: string | number) => {
    isLoading.value = true
    try {
      const countsResponse = await axios.get(
        `${apiBaseUrl}/questions/${questionId}/counts`,
        { headers: authHeaders }
      )
      upvoteCount.value = countsResponse.data.upvotes
      downvoteCount.value = countsResponse.data.downvotes
      reportCount.value = countsResponse.data.reports
      return {
        upvotes: upvoteCount.value,
        downvotes: downvoteCount.value,
        reports: reportCount.value,
      }
    } catch (error) {
      console.error('Error fetching vote counts:', error)
      voteMessage.value = 'Error fetching vote counts.'
      return { upvotes: 0, downvotes: 0, reports: 0 }
    } finally {
      isLoading.value = false
    }
  }

  // Handle voting (upvote, downvote, report)
  const handleVote = async (
    questionId: string | number,
    type: 'upvote' | 'downvote' | 'report',
  ) => {
    if (!currentUser.value) {
      voteMessage.value = 'You must be logged in to vote.'
      return false
    }

    isLoading.value = true
    try {
      await axios.post(`${apiBaseUrl}/questions/${questionId}/${type}`,
        {
          user_id: currentUser.value.id,
        },
        { headers: authHeaders }
      )

      // Refresh vote counts after voting
      await fetchVoteCounts(questionId)

      voteMessage.value = `Question ${type}d successfully!`
      return true
    } catch (error) {
      console.error(`Error handling ${type}:`, error)
      voteMessage.value = `Error handling ${type}.`
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    upvoteCount,
    downvoteCount,
    reportCount,
    voteMessage,
    isLoading,
    fetchVoteCounts,
    handleVote,
  }
}
