import { ref } from 'vue'
import type { Ref } from 'vue'
import axios from 'axios'
import type { User } from './useUsers'
import useApiUrl from './useApiUrl'

/**
 * Interface representing a response to a question
 */
export interface Response {
  id: number
  response: string
  timestamp: string
  user_email: string
  question_id?: number | string
  isEditing?: boolean
  editText?: string
}

/**
 * Composable for managing responses to questions.
 * Provides functionality to create, read, update, and delete responses.
 *
 * @param currentUser - Reference to the current user object
 * @param responseList - Optional reference to store response list
 * @returns Response management methods and reactive state variables
 */
export default function useResponses(
  currentUser: Ref<User | null>,
  responseList: Ref<Response[]> = ref([]),
) {
  const { getBaseUrl } = useApiUrl()
  const apiBaseUrl = getBaseUrl()

  const newResponseText = ref('')
  const responseMessage = ref('')
  const isLoading = ref(false)

  /**
   * Fetches all responses for a given question
   * @param questionId - ID of the question to fetch responses for
   * @returns Array of response objects
   */
  const fetchResponses = async (questionId: string | number) => {
    isLoading.value = true
    try {
      const token = sessionStorage.getItem('token')
      const response = await axios.get<Response[]>(
        `${apiBaseUrl}/questions/${questionId}/responses`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
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

  /**
   * Posts a new response to a question
   * @param questionId - ID of the question to respond to
   * @returns Boolean indicating success or failure
   */
  const postResponse = async (questionId: string | number) => {
    if (!newResponseText.value.trim() || newResponseText.value.length > 500) {
      responseMessage.value = 'Response must be between 1 and 500 characters.'
      return false
    }

    isLoading.value = true
    try {
      if (!currentUser.value) throw new Error('User not logged in.')

      const token = sessionStorage.getItem('token')
      const response = await axios.post(
        `${apiBaseUrl}/responses`,
        {
          question_id: questionId,
          user_id: currentUser.value.id,
          response: newResponseText.value,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
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

  /**
   * Edits an existing response or toggles edit mode
   * @param response - Response object to edit
   * @returns Boolean indicating success or failure
   */
  const editResponse = async (response: Response) => {
    if (response.isEditing) {
      if (response.editText && response.editText.length > 500) {
        responseMessage.value = 'Response text exceeds the character limit of 500.'
        return false
      }

      isLoading.value = true
      try {
        const token = sessionStorage.getItem('token')
        await axios.put(
          `${apiBaseUrl}/responses/${response.id}`,
          {
            response: response.editText,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
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

  /**
   * Deletes a response
   * @param responseId - ID of the response to delete
   * @returns Boolean indicating success or failure
   */
  const deleteResponse = async (responseId: number) => {
    isLoading.value = true
    try {
      const token = sessionStorage.getItem('token')
      await axios.delete(`${apiBaseUrl}/responses/${responseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
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
