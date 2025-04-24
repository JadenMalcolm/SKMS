<template>
  <!-- Page title header -->
  <div class="page-header"><h1>Direct Messages</h1></div>

  <!-- Main container for all messaging components -->
  <div class="message-container">
    <!-- Start new chat section - allows initiating conversations with users you haven't messaged before -->
    <div class="container">
      <div class="section-header"><h2>Start New Chat</h2></div>
      <input type="text" v-model="newChatSearchQuery" placeholder="Search users..." class="input" />
      <ul class="user-list">
        <li v-for="user in newChatFilteredUsers" :key="user.id" @click="selectUser(user)">
          {{ user.email }}
        </li>
      </ul>
    </div>

    <!-- My Messages section - displays users with existing conversation history -->
    <div class="container">
      <div class="section-header"><h2>My Messages</h2></div>
      <input type="text" v-model="searchQuery" placeholder="Search users..." class="input" />
      <ul class="user-list">
        <li v-for="user in filteredUsers" :key="user.id" @click="selectUser(user)">
          {{ user.email }}
        </li>
      </ul>
    </div>

    <!-- Chat box - displays the conversation with the selected user -->
    <div class="container-chat chat-box" v-if="selectedUser && selectedUser.id !== currentUser?.id">
      <div class="section-header">
        <h2>Chat with {{ selectedUser.email }}</h2>
      </div>
      <!-- Message history area with scroll container -->
      <div class="messages" ref="messagesContainer">
        <div v-for="message in messages" :key="message.id"
             :class="message.sender_id === currentUser?.id ? 'user' : 'bot'">
          <p>{{ message.message }}</p>
          <small class="timestamp">{{ formatDate(message.timestamp) }}</small>
        </div>
      </div>
      <!-- Message input area -->
      <div class="chat-input">
        <textarea v-model="newMessage" placeholder="Type your message..." class="textarea"></textarea>
        <button @click="handleSendMessage" class="button button-success">Send</button>
      </div>
    </div>
    <!-- Global navigation components -->
    <SidebarMenu />
    <floating-chat />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import useUsers from '../composables/useUsers'           // Composable for user management
import useMessages from '../composables/useMessages'     // Composable for message handling
import useFormatDate from '../composables/useFormatDate' // Composable for date formatting
import type { User } from '../composables/useUsers'      // Type definition for user objects

const router = useRouter()
// Store the currently logged in user
const currentUser = ref<User | null>(null)
const { formatDate } = useFormatDate()

// Initialize users composable - manages user lists and search functionality
const {
  selectedUser, searchQuery, newChatSearchQuery, filteredUsers,
  newChatFilteredUsers, fetchMessagedUsers, fetchAllUsers
} = useUsers(currentUser)

// Initialize messages composable - handles message display, sending, and related UI
const {
  messages, newMessage, messagesContainer, selectUser,
  sendMessage, scrollToBottom, cleanup
} = useMessages(currentUser, selectedUser)

// Wrapper function to send messages and update the UI afterward
const handleSendMessage = () => sendMessage(fetchMessagedUsers)

onMounted(async () => {
  // Authentication check: redirect to login if no user is in session
  const storedUser = sessionStorage.getItem('user')
  if (!storedUser) {
    router.push('/')
    return
  }

  try {
    // Parse and set the current user from session storage
    currentUser.value = JSON.parse(storedUser) as User

    // Load both messaged users and all available users in parallel for efficiency
    await Promise.all([fetchMessagedUsers(), fetchAllUsers()])
    nextTick(scrollToBottom) // Ensure messages scroll to bottom after DOM update

    // Set up event listener for opening chats from other components
    // This enables features like "Contact Expert" to open chat directly
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
    // Handle initialization errors by redirecting to home
    console.error('Error initializing direct messages:', e)
    router.push('/')
  }
})

// Clean up event listeners when component is destroyed
onUnmounted(cleanup)
</script>

<style scoped>
/* Layout for the main messaging interface with flex container */
.message-container {
  display: flex;
  gap: 20px;
  padding: 20px;
}

/* Styling for the user list containers */
.container {
  flex: 1;
  max-height: 750px;
  overflow-y: auto;
  padding: 20px;
}

/* Styling for the chat box with enhanced visual treatment */
.container-chat {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  flex: 2; /* Chat takes more space than the user lists */
  max-height: 750px;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Prevents content from breaking layout */
}

/* Scrollable area for messages with flex growth */
.messages {
  flex-grow: 1;
  overflow-y: auto;
  padding: 15px;
}

/* Layout for the message input area with flex alignment */
.chat-input {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

/* Timestamp styling for message metadata */
.timestamp {
  display: block;
  font-size: 0.75rem;
  color: #666;
  margin-top: 5px;
  text-align: right;
}

/* Base styling for message bubbles (both sent and received) */
.user, .bot {
  padding: 10px;
  margin: 8px 0;
  border-radius: 12px;
  color: #333;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  word-break: break-word; /* Prevents long messages from breaking layout */
}

/* Styling for messages sent by the current user */
.user {
  text-align: right;
  background: linear-gradient(90deg, #e3f2fd, #bbdefb); /* Blue gradient for user messages */
  border-radius: 12px 12px 0 12px; /* Special shape for user messages */
}

/* Styling for messages received from other users */
.bot {
  text-align: left;
  background: linear-gradient(90deg, #f5f5f5, #e0e0e0); /* Gray gradient for received messages */
  border-radius: 12px 12px 12px 0; /* Special shape for received messages */
}

/* Remove default paragraph margins within messages */
.bot p, .user p {
  margin: 0 0 8px 0;
}
</style>
