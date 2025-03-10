<template>
  <div v-if="isVisible">
    <!-- Chat Button -->
    <button class="chat-toggle" @click="toggleChat">💬</button>

    <!-- Chat Popup -->
    <div v-if="isOpen" class="chat-popup">
      <div class="chat-header">
        <span>Chatbot</span>
        <button @click="toggleChat">✖</button>
      </div>

      <!-- Chat History -->
      <div class="chat-box">
        <div v-for="(msg, index) in chatHistory" :key="index">
          <div v-if="msg.sender === 'user'" class="user">{{ msg.text }}</div>
          <div v-else class="bot">
            <p>{{ msg.text }}</p>
            <div v-if="msg.suggestions">
              <button v-for="suggestion in msg.suggestions" :key="suggestion" @click="sendMessage(suggestion)">
                {{ suggestion }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Input -->
      <div class="chat-input">
        <input v-model="userMessage" @keyup.enter="sendMessage(userMessage)" placeholder="Ask me something..." />
        <button @click="sendMessage(userMessage)">Send</button>
      </div>

      <!-- Feedback Box -->
      <div v-if="feedbackMessage" class="feedback-box">
        <p>{{ feedbackMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps } from 'vue'
import axios from 'axios'

const props = defineProps<{ isVisible: boolean }>()
const isOpen = ref(false)
const userMessage = ref('')
const chatHistory = ref<{ sender: string; text: string; suggestions?: string[] }[]>([])
const feedbackMessage = ref('') // Variable to hold feedback messages

// Toggle the chat window
const toggleChat = () => {
  isOpen.value = !isOpen.value
}

// Send a message to the backend
const sendMessage = async (message: string) => {
  if (!message.trim()) return

  chatHistory.value.push({ sender: 'user', text: message })

  try {
    // Send the message to the backend
    const response = await axios.post('http://localhost:5000/chat', { message })

    // Update the chat with the bot's response
    chatHistory.value.push({ sender: 'bot', text: response.data.response })

    // If there are suggestions, add them to the chat history
    if (response.data.suggestions.length > 0) {
      chatHistory.value.push({
        sender: 'bot',
        text: 'Did you mean:',
        suggestions: response.data.suggestions
      })
    }

    feedbackMessage.value = 'Message sent successfully!' // Success feedback
  } catch (error) {
    console.error('Error sending message:', error)
    feedbackMessage.value = 'Error sending message.' // Error feedback
  }

  // Clear the input field
  userMessage.value = ''
}
</script>

<style scoped>
/* Chat Toggle Button */
.chat-toggle {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.3);
}

/* Chat Popup */
.chat-popup {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 300px;
  background: white;
  border: 1px solid #ddd;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  overflow: hidden;
}

/* Chat Header */
.chat-header {
  background: #007bff;
  color: white;
  padding: 10px;
  display: flex;
  justify-content: space-between;
}

/* Chat Box */
.chat-box {
  max-height: 300px;
  overflow-y: auto;
  padding: 10px;
}

/* Messages */
.user {
  text-align: right;
  background: lightblue;
  padding: 5px;
  margin: 5px;
  border-radius: 5px;
}

.bot {
  text-align: left;
  background: lightgray;
  padding: 5px;
  margin: 5px;
  border-radius: 5px;
}

/* Chat Input */
.chat-input {
  display: flex;
  padding: 10px;
  border-top: 1px solid #ddd;
}

.chat-input input {
  flex: 1;
  padding: 5px;
}

.chat-input button {
  padding: 5px;
  background: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}

/* Feedback Box */
.feedback-box {
  margin-top: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f4f4f4;
  color: #333;
}

.feedback-box p {
  margin: 0;
  font-size: 14px;
}

button {
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
}

button:focus {
  outline: none;
}
</style>

