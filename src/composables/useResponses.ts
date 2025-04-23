import { ref } from 'vue'
import type { Ref } from 'vue'
import axios from 'axios'
import type { User } from './useUsers'
import useApiUrl from './useApiUrl'

export interface Response {
  id: number
  response: string
  timestamp: string
  user_email: string
  question_id?: number | string
  isEditing?: boolean
  editText?: string
}

export default function useResponses(
  currentUser: Ref<User | null>,
  responseList: Ref<Response[]> = ref([]),
) {
  const { getBaseUrl, getSecretKey } = useApiUrl()
  const apiBaseUrl = getBaseUrl()
  const apiKey = getSecretKey()

  // Create request headers with API key
  const authHeaders = {
    'X-API-Key': apiKey,
  }

  const newResponseText = ref('')
  const responseMessage = ref('')
  const isLoading = ref(false)

  // Fetch responses for a question
  const fetchResponses = async (questionId: string | number) => {
    isLoading.value = true
    try {
      const response = await axios.get<Response[]>(
        `${apiBaseUrl}/questions/${questionId}/responses`,
        { headers: authHeaders },
      )
      responseList.value = response.data.map((item) => ({
        ...item,
        isEditing: false,
        editText: item.response,
      }))
      return responseList.value
    } catch (error) {
      console.error('Error fetching responses:', error)
      responseMessage.value = 'Error fetching responses.'
      return []
    } finally {
      isLoading.value = false
    }
  }

  // Post a new response
  const postResponse = async (questionId: string | number) => {
    if (!newResponseText.value.trim() || newResponseText.value.length > 500) {
      responseMessage.value = 'Response must be between 1 and 500 characters.'
      return false
    }

    isLoading.value = true
    try {
      if (!currentUser.value) throw new Error('User not logged in.')

      const response = await axios.post(
        `${apiBaseUrl}/responses`,
        {
          question_id: questionId,
          user_id: currentUser.value.id,
          response: newResponseText.value,
        },
        { headers: authHeaders },
      )

      responseList.value.unshift({
        id: response.data.id,
        response: newResponseText.value,
        timestamp: new Date().toISOString(),
        user_email: currentUser.value.email,
        question_id: questionId,
        isEditing: false,
        editText: newResponseText.value,
      })

      newResponseText.value = ''
      responseMessage.value = 'Response posted successfully!'
      return true
    } catch (error) {
      console.error('Error posting response:', error)
      responseMessage.value = 'Error posting response.'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Edit a response
  const editResponse = async (response: Response) => {
    if (response.isEditing) {
      if (response.editText && response.editText.length > 500) {
        responseMessage.value = 'Response text exceeds the character limit of 500.'
        return false
      }

      isLoading.value = true
      try {
        await axios.put(
          `${apiBaseUrl}/responses/${response.id}`,
          {
            response: response.editText,
          },
          { headers: authHeaders },
        )

        response.response = response.editText || response.response
        response.isEditing = false
        responseMessage.value = 'Response updated successfully!'
        return true
      } catch (error) {
        console.error('Error updating response:', error)
        responseMessage.value = 'Error updating response.'
        return false
      } finally {
        isLoading.value = false
      }
    } else {
      response.isEditing = true
      return true
    }
  }

  // Delete a response
  const deleteResponse = async (responseId: number) => {
    isLoading.value = true
    try {
      await axios.delete(`${apiBaseUrl}/responses/${responseId}`, { headers: authHeaders })
      responseList.value = responseList.value.filter((response) => response.id !== responseId)
      responseMessage.value = 'Response deleted successfully!'
      return true
    } catch (error) {
      console.error('Error deleting response:', error)
      responseMessage.value = 'Error deleting response.'
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    responseList,
    newResponseText,
    responseMessage,
    isLoading,
    fetchResponses,
    postResponse,
    editResponse,
    deleteResponse,
  }
}
