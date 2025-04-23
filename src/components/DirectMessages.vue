<template>
  <!-- Header section -->
  <div class="page-header">
    <h1>Direct Messages</h1>
  </div>

  <!-- Main container for messages and chat -->
  <div class="message-container">
    <!-- Start new chat section -->
    <div class="container">
      <div class="section-header">
        <h2>Start New Chat</h2>
      </div>
      <input type="text" v-model="newChatSearchQuery" placeholder="Search users..." class="input" />
      <ul class="user-list">
        <li v-for="user in newChatFilteredUsers" :key="user.id" @click="selectUser(user)">
          {{ user.email }}
        </li>
      </ul>
    </div>

    <!-- My Messages section -->
    <div class="container">
      <div class="section-header">
        <h2>My Messages</h2>
      </div>
      <input type="text" v-model="searchQuery" placeholder="Search users..." class="input" />
      <ul class="user-list">
        <li v-for="user in filteredUsers" :key="user.id" @click="selectUser(user)">
          {{ user.email }}
        </li>
      </ul>
    </div>

    <!-- Chat box section -->
    <div class="container-chat chat-box" v-if="selectedUser && selectedUser.id !== currentUser?.id">
      <div class="section-header">
        <h2>Chat with {{ selectedUser.email }}</h2>
      </div>
      <div class="messages" ref="messagesContainer">
        <div v-for="message in messages" :key="message.id">
          <div v-if="message.sender_id === currentUser?.id" class="user">
            <p>{{ message.message }}</p>
            <small class="timestamp">{{ formatDate(message.timestamp) }}</small>
          </div>
          <div v-else class="bot">
            <p>{{ message.message }}</p>
            <small class="timestamp">{{ formatDate(message.timestamp) }}</small>
          </div>
        </div>
      </div>
      <div class="chat-input">
        <textarea
          v-model="newMessage"
          placeholder="Type your message..."
          class="textarea"
        ></textarea>
        <button @click="handleSendMessage" class="button button-success">Send</button>
      </div>
    </div>
    <SidebarMenu />
    <floating-chat />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import useUsers from '../composables/useUsers'
import type { User } from '../composables/useUsers'
import useMessages from '../composables/useMessages'
import useFormatDate from '../composables/useFormatDate'

// Initialize router
const router = useRouter()

// Initialize with proper type to avoid TypeScript errors
const currentUser = ref<User | null>(null)

// Load the user composable
const {
  selectedUser,
  searchQuery,
  newChatSearchQuery,
  filteredUsers,
  newChatFilteredUsers,
  fetchMessagedUsers,
  fetchAllUsers,
} = useUsers(currentUser)

// Load the messages composable
const {
  messages,
  newMessage,
  messagesContainer,
  selectUser,
  sendMessage,
  scrollToBottom,
  cleanup,
} = useMessages(currentUser, selectedUser)

// Load date formatting composable
const { formatDate } = useFormatDate()

// Helper function to handle sending messages that calls the composable function
const handleSendMessage = () => sendMessage(fetchMessagedUsers)

// Define a type for our custom event
interface OpenChatEventDetail {
  id: number
  email: string
}

// On component mount, fetch user data and scroll to bottom
onMounted(async () => {
  // store user data in session storage
  const storedUser = sessionStorage.getItem('user')
  if (storedUser) {
    try {
      currentUser.value = JSON.parse(storedUser) as User
    } catch (e) {
      console.error('Error parsing user from sessionStorage:', e)
      router.push('/')
      return
    }
  } else {
    router.push('/')
    return
  }

  // Fetch users and all users
  await fetchMessagedUsers()
  await fetchAllUsers()
  nextTick(scrollToBottom)

  // Listen for the open-chat event to start a chat with a specific user
  window.addEventListener('open-chat', async (event: Event) => {
    const customEvent = event as CustomEvent<OpenChatEventDetail>
    if (customEvent.detail && customEvent.detail.id) {
      const user: User = {
        id: customEvent.detail.id,
        email: customEvent.detail.email || 'Unknown User',
      }
      await selectUser(user)
    }
  })
})

// Clean up polling interval when component unmounts
onUnmounted(() => {
  cleanup()
})
</script>

<style scoped>
.message-container {
  display: flex;
  gap: 20px;
  padding: 20px;
}

/* Extend container styles from base.css with specific sizing for this component */
.container {
  flex: 1;
  max-height: 750px;
  overflow-y: auto;
  padding: 20px; /* Override padding from base.css to match original design */
}

/* Special container for chat that needs specific styling */
.container-chat {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  flex: 2;
  max-height: 750px;
  overflow-y: auto;
}

.chat-box {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.messages {
  flex-grow: 1;
  overflow-y: auto;
  padding: 15px;
}

.timestamp {
  display: block;
  font-size: 0.75rem;
  color: #666;
  margin-top: 5px;
  text-align: right;
}

.user {
  text-align: right;
  background: linear-gradient(90deg, #e3f2fd, #bbdefb);
  padding: 10px;
  margin: 8px 0;
  border-radius: 12px 12px 0 12px;
  color: #333;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  word-break: break-word;
}

.bot {
  text-align: left;
  background: linear-gradient(90deg, #f5f5f5, #e0e0e0);
  padding: 10px;
  margin: 8px 0;
  border-radius: 12px 12px 12px 0;
  color: #333;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  word-break: break-word;
}

.bot p {
  margin: 0 0 8px 0;
}

.chat-input {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}
</style>
