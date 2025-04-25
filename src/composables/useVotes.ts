import { ref } from 'vue'
import type { Ref } from 'vue'
import axios from 'axios'
import type { User } from './useUsers'
import useApiUrl from './useApiUrl'

/**
 * Composable for managing votes and reports on questions.
 * Provides functionality for upvoting, downvoting, and reporting questions.
 *
 * @param currentUser - Reference to the current user object
 * @returns Vote management methods and reactive state variables
 */
export default function useVotes(currentUser: Ref<User | null>) {
  const { getBaseUrl } = useApiUrl()
  const apiBaseUrl = getBaseUrl()

  const upvoteCount = ref(0)
  const downvoteCount = ref(0)
  const reportCount = ref(0)
  const voteMessage = ref('')
  const isLoading = ref(false)

  /**
   * Fetches vote counts for a specific question
   * @param questionId - ID of the question to fetch votes for
   * @returns Object containing upvotes, downvotes, and reports counts
   */
  const fetchVoteCounts = async (questionId: string | number) => {
    isLoading.value = true
    try {
      const token = sessionStorage.getItem('token')
      const countsResponse = await axios.get(`${apiBaseUrl}/questions/${questionId}/counts`, {
        headers: { Authorization: `Bearer ${token}` },
      })
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

  /**
   * Handles voting (upvote, downvote, or report) on a question
   * @param questionId - ID of the question to vote on
   * @param type - Type of vote (upvote, downvote, report)
   * @returns Boolean indicating success or failure
   */
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
      const token = sessionStorage.getItem('token')
      await axios.post(
        `${apiBaseUrl}/questions/${questionId}/${type}`,
        {
          user_id: currentUser.value.id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
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
