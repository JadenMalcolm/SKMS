<template>
  <div class="message-container">
    <h1>Direct Messages</h1>
    <div class="user-list">
      <h2>Users</h2>
      <input type="text" v-model="searchQuery" placeholder="Search users..." class="search-input" />
      <ul>
        <li v-for="user in filteredUsers" :key="user.id" @click="selectUser(user)">
          {{ user.email }}
        </li>
      </ul>
    </div>
    <div class="chat-box" v-if="selectedUser">
      <h2>Chat with {{ selectedUser.email }}</h2>
      <div class="messages">
        <div
          v-for="message in messages"
          :key="message.id"
          :class="{
            sent: message.sender_id === currentUser?.id,
            received: message.sender_id !== currentUser?.id,
          }"
        >
          <p>{{ message.message }}</p>
          <small>{{ new Date(message.timestamp).toLocaleString() }}</small>
        </div>
      </div>
      <textarea v-model="newMessage" placeholder="Type your message..."></textarea>
      <button @click="sendMessage">Send</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

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

const currentUser = ref<User | null>(null)
const users = ref<User[]>([])
const selectedUser = ref<User | null>(null)
const messages = ref<Message[]>([])
const newMessage = ref('')
const searchQuery = ref('')

onMounted(async () => {
  const storedUser = sessionStorage.getItem('user')
  if (storedUser) {
    currentUser.value = JSON.parse(storedUser)
  }

  try {
    const response = await axios.get('http://localhost:5000/users')
    users.value = response.data
  } catch (error) {
    console.error('Error fetching users:', error)
  }
})

const filteredUsers = computed(() => {
  return users.value.filter((user) =>
    user.email.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

const selectUser = async (user: User) => {
  selectedUser.value = user
  try {
    const response = await axios.get(
      `http://localhost:5000/messages/${currentUser.value?.id}/${user.id}`,
    )
    messages.value = response.data
  } catch (error) {
    console.error('Error fetching messages:', error)
  }
}

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
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }
}
</script>

<style scoped>
.message-container {
  display: flex;
  padding: 20px;
}

.user-list {
  width: 30%;
  border-right: 1px solid #ccc;
  padding-right: 20px;
}

.user-list ul {
  list-style: none;
  padding: 0;
}

.user-list li {
  padding: 10px;
  cursor: pointer;
}

.user-list li:hover {
  background-color: #f0f0f0;
}

.search-input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.chat-box {
  width: 70%;
  padding-left: 20px;
}

.messages {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.messages .sent {
  text-align: right;
}

.messages .received {
  text-align: left;
}

textarea {
  width: 100%;
  height: 100px;
  padding: 10px;
  margin-bottom: 10px;
}

button {
  padding: 10px 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>
