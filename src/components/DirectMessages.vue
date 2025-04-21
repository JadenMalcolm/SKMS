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
            <small class="timestamp">{{
              new Date(message.timestamp).toLocaleString([], {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })
            }}</small>
          </div>
          <div v-else class="bot">
            <p>{{ message.message }}</p>
            <small class="timestamp">{{
              new Date(message.timestamp).toLocaleString([], {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })
            }}</small>
          </div>
        </div>
      </div>
      <div class="chat-input">
        <textarea
          v-model="newMessage"
          placeholder="Type your message..."
          class="textarea"
        ></textarea>
        <button @click="sendMessage" class="button button-success">Send</button>
      </div>
    </div>
    <SidebarMenu />
    <floating-chat />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

// Define interfaces for User and Message
interface User {
  id: number
  email: string
}

interface Message {
  id: number
  sender_id: number
  receiver_id: number
  message: string
  timestamp: string
}

// Initialize router and reactive variables
const router = useRouter()
const currentUser = ref<User | null>(null)
const users = ref<User[]>([])
const allUsers = ref<User[]>([])
const selectedUser = ref<User | null>(null)
const messages = ref<Message[]>([])
const newMessage = ref('')
const searchQuery = ref('')
const newChatSearchQuery = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

// Fetch users who have messaged the current user
const fetchUsers = async () => {
  if (currentUser.value) {
    try {
      const response = await axios.get(`http://localhost:5000/users/${currentUser.value.id}`)
      users.value = response.data
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }
}

// Fetch all users
const fetchAllUsers = async () => {
  try {
    const response = await axios.get('http://localhost:5000/all-users')
    allUsers.value = response.data
  } catch (error) {
    console.error('Error fetching all users:', error)
  }
}

// Scroll to the bottom of the messages container
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// On component mount, fetch user data and scroll to bottom
onMounted(async () => {
  // store user data in session storage
  const storedUser = sessionStorage.getItem('user')
  if (storedUser) {
    currentUser.value = JSON.parse(storedUser)
  } else {
    router.push('/')
  }
  // Fetch users and all users
  // scroll to bottom
  await fetchUsers()
  await fetchAllUsers()
  nextTick(scrollToBottom)

  // Listen for the open-chat event to start a chat with a specific user
  window.addEventListener('open-chat', async (event: Event) => {
    const user = (event as CustomEvent).detail
    if (user) {
      await selectUser(user)
    }
  })
})

// Computed property to filter users based on search query
const filteredUsers = computed(() => {
  return users.value.filter(
    (user) =>
      user.id !== currentUser.value?.id &&
      user.email.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

// Computed property to filter all users based on new chat search query
const newChatFilteredUsers = computed(() => {
  return allUsers.value.filter(
    (user) =>
      user.id !== currentUser.value?.id &&
      user.email.toLowerCase().includes(newChatSearchQuery.value.toLowerCase()),
  )
})

// Select a user to chat with and fetch messages
const selectUser = async (user: User) => {
  if (user.id !== currentUser.value?.id) {
    selectedUser.value = user
    try {
      const response = await axios.get(
        `http://localhost:5000/messages/${currentUser.value?.id}/${user.id}`,
      )
      messages.value = response.data
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
    nextTick(scrollToBottom)
  }
}

// Send a new message and fetch updated user list
const sendMessage = async () => {
  if (newMessage.value.trim() && selectedUser.value) {
    try {
      const response = await axios.post('http://localhost:5000/messages', {
        sender_id: currentUser.value?.id,
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
