import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import axios from 'axios'
import type { User } from './useUsers'
import useApiUrl from './useApiUrl'

/**
 * Interface representing a question in the knowledge management system
 */
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

/**
 * Composable for managing questions in the knowledge management system.
 * Provides functionality to create, read, update, delete, and search questions.
 *
 * @param currentUser - Reference to the current user object
 * @returns Question management methods and reactive state variables
 */
export default function useQuestions(currentUser: Ref<User | null>) {
  const { getBaseUrl } = useApiUrl()
  const apiBaseUrl = getBaseUrl()





  const searchQuery = ref('')
  const allQuestions = ref<Question[]>([])
  const searchResults = ref<Question[]>([])
  const userQuestions = ref<Question[]>([])
  const newQuestionText = ref('')
  const feedbackMessage = ref('')

  // For question details
  const questionDetails = ref<Question | null>(null)
  const isEditing = ref(false)
  const editText = ref('')

  /**
   * Returns a computed property with questions filtered by category
   * @param category - Category to filter by
   * @returns Computed array of questions in the specified category
   */
  const getCategoryQuestions = (category: string) => {
    return computed(() => {
      return allQuestions.value.filter((q) => q.category === category)
    })
  }

  /**
   * Fetches all questions from the server
   * Also populates the userQuestions array with questions created by the current user
   */
  const fetchAllQuestions = async () => {
    if (!currentUser.value) return

    try {
      const response = await axios.get(`${apiBaseUrl}/questions`
      )
      allQuestions.value = response.data

      userQuestions.value = allQuestions.value
        .filter((q) => q.user_email === currentUser.value?.email)
        .map((q) => ({ ...q, isEditing: false, editText: q.question }))
    } catch (error) {
      console.error('Error fetching questions:', error)
      feedbackMessage.value = 'Error fetching questions.'
    }
  }

  /**
   * Fetches details for a specific question
   * @param questionId - ID of the question to fetch
   * @returns The question details or null if not found
   */
  const fetchQuestionDetails = async (questionId: string | number) => {
    try {
      const response = await axios.get<Question>(
        `${apiBaseUrl}/questions/${questionId}`
      )
      questionDetails.value = response.data
      editText.value = questionDetails.value.question
      return questionDetails.value
    } catch (error) {
      console.error('Error fetching question details:', error)
      feedbackMessage.value = 'Error fetching question details.'
      return null
    }
  }

  /**
   * Searches for questions based on the search query
   * Optionally filters results by category
   * @param category - Optional category to filter search results
   */
  const searchQuestions = async (category?: string) => {
    try {
      const response = await axios.post(`${apiBaseUrl}/questions/search`,
        {
          query: searchQuery.value,
        }
      )

      if (category) {
        searchResults.value = response.data.filter((q: Question) => q.category === category)
      } else {
        searchResults.value = response.data
      }
    } catch (error) {
      console.error('Error searching questions:', error)
      feedbackMessage.value = 'Error searching questions.'
    }
  }

  /**
   * Submits a new question
   * @param category - Category for the new question
   */
  const submitQuestion = async (category: string) => {
    if (newQuestionText.value.trim()) {
      try {
        if (!currentUser.value) {
          feedbackMessage.value = 'User not logged in.'
          return
        }

        const response = await axios.post(`${apiBaseUrl}/questions`,
          {
            userId: currentUser.value.id,
            question: newQuestionText.value,
            category: category,
          }
        )

        const newQuestion = {
          id: response.data.id,
          question: newQuestionText.value,
          category: category,
          timestamp: new Date().toLocaleString(),
          user_email: currentUser.value.email,
          isEditing: false,
          editText: newQuestionText.value,
        }

        allQuestions.value.unshift(newQuestion)
        feedbackMessage.value = `Your question was saved: ${newQuestionText.value}`
        newQuestionText.value = ''
      } catch (error) {
        console.error('Error submitting question:', error)
        feedbackMessage.value = 'Failed to save the question.'
      }
    } else {
      feedbackMessage.value = 'Please enter a question to ask.'
    }
  }

  /**
   * Deletes a question
   * @param questionId - ID of the question to delete
   * @returns Boolean indicating success or failure
   */
  const deleteQuestion = async (questionId: string | number) => {
    try {
      await axios.delete(`${apiBaseUrl}/questions/${questionId}`
      )
      feedbackMessage.value = 'Question deleted successfully!'
      return true
    } catch (error) {
      console.error('Error deleting question:', error)
      feedbackMessage.value = 'Error deleting question.'
      return false
    }
  }

  /**
   * Toggles edit mode for a question or saves the edited question
   * @param questionId - Optional ID of the question to edit (uses questionDetails.id if not provided)
   * @returns Boolean indicating success or failure
   */
  const toggleEdit = async (questionId?: string | number) => {
    if (isEditing.value) {
      if (!questionDetails.value || !currentUser.value) {
        feedbackMessage.value = 'Missing question details or user information.'
        return false
      }

      if (editText.value.length > 500) {
        feedbackMessage.value = 'Question text exceeds the character limit of 500.'
        return false
      }

      try {
        // Use the provided questionId or fall back to the value in questionDetails
        const id = questionId || questionDetails.value.id

        await axios.put(`${apiBaseUrl}/questions/${id}`,
          {
            question: editText.value,
            category: questionDetails.value.category,
            user_id: currentUser.value.id,
          }
        )

        questionDetails.value.question = editText.value
        feedbackMessage.value = 'Question updated successfully!'
        isEditing.value = false
        return true
      } catch (error) {
        console.error('Error updating question:', error)
        feedbackMessage.value = 'Error updating question.'
        return false
      }
    }

    isEditing.value = !isEditing.value
    return true
  }

  return {
    searchQuery,
    allQuestions,
    searchResults,
    userQuestions,
    newQuestionText,
    feedbackMessage,
    questionDetails,
    isEditing,
    editText,
    fetchAllQuestions,
    fetchQuestionDetails,
    searchQuestions,
    submitQuestion,
    deleteQuestion,
    toggleEdit,
    getCategoryQuestions,
  }
}
