import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import axios from 'axios'
import type { User } from './useUsers'
import type { Question } from './useSubscriptions'

export default function useQuestions(currentUser: Ref<User | null>) {
  const searchQuery = ref('')
  const allQuestions = ref<Question[]>([])
  const searchResults = ref<Question[]>([])
  const userQuestions = ref<Question[]>([])
  const newQuestionText = ref('')
  const feedbackMessage = ref('')

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

  return {
    searchQuery,
    allQuestions,
    searchResults,
    userQuestions,
    newQuestionText,
    feedbackMessage,
    fetchAllQuestions,
    searchQuestions,
    submitQuestion,
    getCategoryQuestions,
  }
}
