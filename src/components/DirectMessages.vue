<template>
  <div class="header" >
    <h1>Direct Messages</h1>
  </div>
  <div class="message-container">
    <div class="user-list">
      <h2>Users</h2>
      <input type="text" v-model="searchQuery" placeholder="Search users..." class="search-input" />
      <ul>
        <li v-for="user in filteredUsers" :key="user.id" @click="selectUser(user)">
          {{ user.email }}
        </li>
      </ul>
    </div>
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
          <small>{{ new Date(message.timestamp).toLocaleString([], {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}}</small>
        </div>
      </div>
      <textarea v-model="newMessage" placeholder="Type your message..."></textarea>
      <button @click="sendMessage">Send</button>
    </div>
  </div>
  <FloatingChat :isVisible="true" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import axios from 'axios'
import FloatingChat from './FloatingChat.vue'

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
const messagesContainer = ref<HTMLElement | null>(null)

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

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
  nextTick(scrollToBottom)
})

const filteredUsers = computed(() => {
  return users.value.filter((user) =>
    user.id !== currentUser.value?.id &&
    user.email.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

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

.user-list{
  width: 30%;
  border-right: 1px solid #ccc;
  padding-right: 30px;
  padding-left: 10px;
  background-color: #fff;
  border-radius: 10px;
  margin-right: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
.user-list h2 {
  text-align: center;
  margin-bottom: 10px;
}

.user-list ul {
  list-style: none;
  padding: 0;
}

.user-list li {
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}

.user-list li:hover {
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
  width: 98%;
  height: 100px;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

button {
  padding: 10px 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 10px;
}

button:hover {
  background-color: #45a049;
}
</style>
