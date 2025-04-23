<template>
  <div class="page-header"><h1>Direct Messages</h1></div>

  <div class="message-container">
    <!-- Start new chat section -->
    <div class="container">
      <div class="section-header"><h2>Start New Chat</h2></div>
      <input type="text" v-model="newChatSearchQuery" placeholder="Search users..." class="input" />
      <ul class="user-list">
        <li v-for="user in newChatFilteredUsers" :key="user.id" @click="selectUser(user)">
          {{ user.email }}
        </li>
      </ul>
    </div>

    <!-- My Messages section -->
    <div class="container">
      <div class="section-header"><h2>My Messages</h2></div>
      <input type="text" v-model="searchQuery" placeholder="Search users..." class="input" />
      <ul class="user-list">
        <li v-for="user in filteredUsers" :key="user.id" @click="selectUser(user)">
          {{ user.email }}
        </li>
      </ul>
    </div>

    <!-- Chat box -->
    <div class="container-chat chat-box" v-if="selectedUser && selectedUser.id !== currentUser?.id">
      <div class="section-header">
        <h2>Chat with {{ selectedUser.email }}</h2>
      </div>
      <div class="messages" ref="messagesContainer">
        <div v-for="message in messages" :key="message.id"
             :class="message.sender_id === currentUser?.id ? 'user' : 'bot'">
          <p>{{ message.message }}</p>
          <small class="timestamp">{{ formatDate(message.timestamp) }}</small>
        </div>
      </div>
      <div class="chat-input">
        <textarea v-model="newMessage" placeholder="Type your message..." class="textarea"></textarea>
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
import useMessages from '../composables/useMessages'
import useFormatDate from '../composables/useFormatDate'
import type { User } from '../composables/useUsers'

const router = useRouter()
const currentUser = ref<User | null>(null)
const { formatDate } = useFormatDate()

// Initialize user composable
const {
  selectedUser, searchQuery, newChatSearchQuery, filteredUsers,
  newChatFilteredUsers, fetchMessagedUsers, fetchAllUsers
} = useUsers(currentUser)

// Initialize messages composable
const {
  messages, newMessage, messagesContainer, selectUser,
  sendMessage, scrollToBottom, cleanup
} = useMessages(currentUser, selectedUser)

// Helper function to handle sending messages
const handleSendMessage = () => sendMessage(fetchMessagedUsers)

onMounted(async () => {
  // Get user from session and validate
  const storedUser = sessionStorage.getItem('user')
  if (!storedUser) {
    router.push('/')
    return
  }

  try {
    currentUser.value = JSON.parse(storedUser) as User

    // Initialize data
    await Promise.all([fetchMessagedUsers(), fetchAllUsers()])
    nextTick(scrollToBottom)

    // Listen for chat open events
    window.addEventListener('open-chat', (event: Event) => {
      const customEvent = event as CustomEvent<{id: number, email?: string}>
      if (customEvent.detail?.id) {
        selectUser({
          id: customEvent.detail.id,
          email: customEvent.detail.email || 'Unknown User'
        })
      }
    })
  } catch (e) {
    console.error('Error initializing direct messages:', e)
    router.push('/')
  }
})

onUnmounted(cleanup)
</script>

<style scoped>
.message-container {
  display: flex;
  gap: 20px;
  padding: 20px;
}

.container {
  flex: 1;
  max-height: 750px;
  overflow-y: auto;
  padding: 20px;
}

.container-chat {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  flex: 2;
  max-height: 750px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.messages {
  flex-grow: 1;
  overflow-y: auto;
  padding: 15px;
}

.chat-input {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

/* Message styling */
.timestamp {
  display: block;
  font-size: 0.75rem;
  color: #666;
  margin-top: 5px;
  text-align: right;
}

.user, .bot {
  padding: 10px;
  margin: 8px 0;
  border-radius: 12px;
  color: #333;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  word-break: break-word;
}

.user {
  text-align: right;
  background: linear-gradient(90deg, #e3f2fd, #bbdefb);
  border-radius: 12px 12px 0 12px;
}

.bot {
  text-align: left;
  background: linear-gradient(90deg, #f5f5f5, #e0e0e0);
  border-radius: 12px 12px 12px 0;
}

.bot p, .user p {
  margin: 0 0 8px 0;
}
</style>
