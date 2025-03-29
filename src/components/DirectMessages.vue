<template>
  <!-- Header section -->
  <div class="header">
    <h1>Direct Messages</h1>
  </div>

  <!-- Main container for messages and chat -->
  <div class="message-container">
    <!-- Start new chat section -->
    <div class="start-chat">
      <h2>Start New Chat</h2>
      <input
        type="text"
        v-model="newChatSearchQuery"
        placeholder="Search users..."
        class="search-input"
      />
      <ul>
        <li v-for="user in newChatFilteredUsers" :key="user.id" @click="selectUser(user)">
          {{ user.email }}
        </li>
      </ul>
    </div>

    <!-- My Messages section -->
    <div class="messages-list">
      <h2>My Messages</h2>
      <input type="text" v-model="searchQuery" placeholder="Search users..." class="search-input" />
      <ul>
        <li v-for="user in filteredUsers" :key="user.id" @click="selectUser(user)">
          {{ user.email }}
        </li>
      </ul>
    </div>

    <!-- Chat box section -->
    <div class="chat-box" v-if="selectedUser && selectedUser.id !== currentUser?.id">
      <h2>Chat with {{ selectedUser.email }}</h2>
      <div class="messages" ref="messagesContainer">
        <div
          v-for="message in messages"
          :key="message.id"
          :class="{
            sent: message.sender_id === currentUser?.id,
            received: message.sender_id !== currentUser?.id,
          }"
        >
          <p>{{ message.message }}</p>
          <small>{{
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
      <textarea v-model="newMessage" placeholder="Type your message..."></textarea>
      <button @click="sendMessage">Send</button>
    </div>
    <SidebarMenu />
  </div>

  <!-- Additional components -->
  <ContactExpert />
  <FloatingChat />
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
.header {
  text-align: center;
  margin-bottom: 20px;
}
.message-container {
  display: flex;
  padding: 30px;
  border-radius: 10px;
}

.messages-list {
  width: 30%;
  border-right: 1px solid #ccc;
  padding-right: 30px;
  padding-left: 10px;
  background-color: #fff;
  border-radius: 10px;
  margin-right: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
.messages-list h2 {
  text-align: center;
  margin-bottom: 10px;
}

.messages-list ul {
  list-style: none;
  padding: 0;
}

.messages-list li {
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}

.messages-list li:hover {
  background-color: #f0f0f0;
}

.search-input {
  width: 98%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.chat-box {
  width: 70%;
  padding-left: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding-left: 20px;
}

.messages {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 10px;
  padding: 5px;
  border-radius: 10px;
  max-width: 99%;
}

.messages .sent {
  text-align: right;
  background-color: #dcf8c6;
  padding: 3px;
  border-radius: 5px;
  margin-bottom: 10px;
}

.messages .received {
  text-align: left;
  background-color: #fff;
  padding: 3px;
  border-radius: 5px;
  margin-bottom: 10px;
}

textarea {
  width: 99%;
  padding: 12px 16px;
  border-radius: 8px;
  resize: none;
  height: 96px;
  border: 1px solid #414141;
  background-color: transparent;
  font-family: inherit;
}

button {
  padding: 8px 12px;
  background-color: #4caf50;
  color: white;
  border: 0;
  border-radius: 24px;
  padding: 10px 16px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color .3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

button:hover {
  background-color: #45a049;
}

.start-chat {
  width: 30%;
  border-right: 1px solid #ccc;
  padding-right: 30px;
  padding-left: 10px;
  background-color: #fff;
  border-radius: 10px;
  margin-right: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.start-chat h2 {
  text-align: center;
  margin-bottom: 10px;
}

.start-chat ul {
  list-style: none;
  padding: 0;
}

.start-chat li {
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}

.start-chat li:hover {
  background-color: #f0f0f0;
}
</style>
