import { ref, computed } from 'vue'
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

export default function useQuestions(currentUser: Ref<User | null>) {
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

  // Get questions filtered by category
  const getCategoryQuestions = (category: string) => {
    return computed(() => {
      return allQuestions.value.filter((q) => q.category === category)
    })
  }

  const fetchAllQuestions = async () => {
    if (!currentUser.value) return

    try {
      const response = await axios.get(`http://localhost:5000/questions`)
      allQuestions.value = response.data

      userQuestions.value = allQuestions.value
        .filter((q) => q.user_email === currentUser.value?.email)
        .map((q) => ({ ...q, isEditing: false, editText: q.question }))
    } catch (error) {
      console.error('Error fetching questions:', error)
      feedbackMessage.value = 'Error fetching questions.'
    }
  }

  // Fetch details for a specific question
  const fetchQuestionDetails = async (questionId: string | number) => {
    try {
      const response = await axios.get<Question>(`http://localhost:5000/questions/${questionId}`)
      questionDetails.value = response.data
      editText.value = questionDetails.value.question
      return questionDetails.value
    } catch (error) {
      console.error('Error fetching question details:', error)
      feedbackMessage.value = 'Error fetching question details.'
      return null
    }
  }

  const searchQuestions = async (category?: string) => {
    try {
      const response = await axios.post(`http://localhost:5000/questions/search`, {
        query: searchQuery.value,
      })

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

  const submitQuestion = async (category: string) => {
    if (newQuestionText.value.trim()) {
      try {
        if (!currentUser.value) {
          feedbackMessage.value = 'User not logged in.'
          return
        }

        const response = await axios.post('http://localhost:5000/questions', {
          userId: currentUser.value.id,
          question: newQuestionText.value,
          category: category,
        })

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

  // Function to delete a question
  const deleteQuestion = async (questionId: string | number) => {
    try {
      await axios.delete(`http://localhost:5000/questions/${questionId}`)
      feedbackMessage.value = 'Question deleted successfully!'
      return true
    } catch (error) {
      console.error('Error deleting question:', error)
      feedbackMessage.value = 'Error deleting question.'
      return false
    }
  }

  // Function to toggle edit mode for the question
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

        await axios.put(`http://localhost:5000/questions/${id}`, {
          question: editText.value,
          category: questionDetails.value.category,
          user_id: currentUser.value.id,
        })

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
