import { ref, nextTick, watch } from 'vue'
import type { Ref } from 'vue'
import axios from 'axios'
import type { User } from './useUsers'
import useApiUrl from './useApiUrl'

export interface Message {
  id: number
  sender_id: number
  receiver_id: number
  message: string
  timestamp: string
}

export default function useMessages(currentUser: Ref<User | null>, selectedUser: Ref<User | null>) {
  const { getBaseUrl } = useApiUrl()
  const apiBaseUrl = getBaseUrl()
  const messages = ref<Message[]>([])
  const newMessage = ref('')
  const messagesContainer = ref<HTMLElement | null>(null)
  const pollingInterval = ref<number | null>(null)
  const POLLING_FREQUENCY = 3000 // Check for new messages every 3 seconds

  // Scroll to the bottom of the messages container
  const scrollToBottom = () => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  }

  // Start polling for new messages
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
            `${apiBaseUrl}/messages/${currentUser.value?.id}/${selectedUser.value?.id}`,
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

  // Select a user to chat with and fetch messages
  const selectUser = async (user: User) => {
    if (user.id !== currentUser.value?.id) {
      selectedUser.value = user
      try {
        const response = await axios.get(
          `${apiBaseUrl}/messages/${currentUser.value?.id}/${user.id}`,
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

  // Send a new message
  const sendMessage = async (fetchUsers: () => Promise<void>) => {
    if (newMessage.value.trim() && selectedUser.value && currentUser.value) {
      try {
        const response = await axios.post(`${apiBaseUrl}/messages`, {
          sender_id: currentUser.value.id,
          receiver_id: selectedUser.value.id,
          message: newMessage.value,
        })
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

  // Cleanup function to clear polling interval
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
