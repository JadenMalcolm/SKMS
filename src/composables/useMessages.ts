import { ref, nextTick, watch } from 'vue'
import type { Ref } from 'vue'
import axios from 'axios'
import type { User } from './useUsers'
import useApiUrl from './useApiUrl'

/**
 * Interface representing a message between users
 */
export interface Message {
  id: number
  sender_id: number
  receiver_id: number
  message: string
  timestamp: string
}

/**
 * Composable for managing direct messages between users.
 * Provides functionality to send messages, fetch conversation history,
 * and real-time polling for new messages.
 *
 * @param currentUser - Reference to the current user object
 * @param selectedUser - Reference to the selected conversation partner
 * @returns Message management methods and reactive state variables
 */
export default function useMessages(currentUser: Ref<User | null>, selectedUser: Ref<User | null>) {
  const { getBaseUrl } = useApiUrl()
  const apiBaseUrl = getBaseUrl()




  const messages = ref<Message[]>([])
  const newMessage = ref('')
  const messagesContainer = ref<HTMLElement | null>(null)
  const pollingInterval = ref<number | null>(null)
  const POLLING_FREQUENCY = 3000 // Check for new messages every 3 seconds

  /**
   * Scrolls the messages container to the bottom to show the latest messages
   */
  const scrollToBottom = () => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  }

  /**
   * Starts polling for new messages in the current conversation
   * Clears any existing polling interval before starting a new one
   */
  const startPolling = () => {
    // Clear any existing polling
    if (pollingInterval.value !== null) {
      clearInterval(pollingInterval.value)
    }

    // Set new polling interval
    if (currentUser.value && selectedUser.value) {
      pollingInterval.value = window.setInterval(async () => {
        try {
          const response = await axios.get(
            `${apiBaseUrl}/messages/${currentUser.value?.id}/${selectedUser.value?.id}`
          )

          // Only update if there are new messages
          if (response.data.length > messages.value.length) {
            messages.value = response.data
            nextTick(scrollToBottom)
          }
        } catch (error) {
          console.error('Error polling messages:', error)
        }
      }, POLLING_FREQUENCY)
    }
  }

  /**
   * Selects a user to chat with and fetches the conversation history
   * @param user - User to select for conversation
   */
  const selectUser = async (user: User) => {
    if (user.id !== currentUser.value?.id) {
      selectedUser.value = user
      try {
        const response = await axios.get(
          `${apiBaseUrl}/messages/${currentUser.value?.id}/${user.id}`
        )
        messages.value = response.data

        // Start polling for new messages with this user
        startPolling()
      } catch (error) {
        console.error('Error fetching messages:', error)
      }
      nextTick(scrollToBottom)
    }
  }

  /**
   * Sends a new message to the selected user
   * @param fetchUsers - Function to refresh the users list after sending
   */
  const sendMessage = async (fetchUsers: () => Promise<void>) => {
    if (newMessage.value.trim() && selectedUser.value && currentUser.value) {
      try {
        const response = await axios.post(
          `${apiBaseUrl}/messages`,
          {
            sender_id: currentUser.value.id,
            receiver_id: selectedUser.value.id,
            message: newMessage.value,
          }
        )
        messages.value.push(response.data)
        newMessage.value = ''

        await fetchUsers()
      } catch (error) {
        console.error('Error sending message:', error)
      }
      nextTick(scrollToBottom)
    }
  }

  // Watch for changes to selectedUser and restart polling if needed
  watch(selectedUser, (newUser) => {
    if (newUser) {
      startPolling()
    } else if (pollingInterval.value !== null) {
      clearInterval(pollingInterval.value)
    }
  })

  /**
   * Cleans up the polling interval when component is unmounted
   */
  const cleanup = () => {
    if (pollingInterval.value !== null) {
      clearInterval(pollingInterval.value)
    }
  }

  return {
    messages,
    newMessage,
    messagesContainer,
    selectUser,
    sendMessage,
    scrollToBottom,
    cleanup,
  }
}
