<template>
  <!-- Chat Button -->
  <button class="button button-primary chat-toggle" @click="toggleChat">
    <i class="chat-button-icon"></i>
  </button>

  <!-- Chat Popup -->
  <div v-if="isOpen" class="chat-popup container">
    <div class="chat-header">
      <span><i class="chat-icon"></i> AI Assistant</span>
      <button @click="toggleChat" class="close-button">✖</button>
    </div>

    <!-- Chat History -->
    <div class="chat-box">
      <div v-for="(msg, index) in chatHistory" :key="index">
        <div v-if="msg.sender === 'user'" class="user">{{ msg.text }}</div>
        <div v-else class="bot">
          <p>{{ msg.text }}</p>
          <div v-if="msg.suggestions" class="suggestion-buttons">
            <button
              v-for="suggestion in msg.suggestions"
              :key="suggestion"
              @click="sendMessage(suggestion)"
              class="suggestion-button"
            >
              {{ suggestion }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Chat Input -->
    <div class="chat-input">
      <input
        v-model="userMessage"
        @keyup.enter="sendMessage(userMessage)"
        placeholder="Ask me something..."
        class="input"
      />
      <button @click="sendMessage(userMessage)" class="button button-primary send-button">Send</button>
    </div>

    <!-- Feedback Box -->
    <div v-if="feedbackMessage" class="feedback-box">
      <p>{{ feedbackMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'

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
        suggestions: response.data.suggestions,
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
  border-radius: 50%;
  width: 60px; /* Slightly larger button */
  height: 60px; /* Slightly larger button */
  font-size: 24px;
  z-index: 900;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* New larger icon specifically for the chat button */
.chat-button-icon {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z'/%3E%3C/svg%3E") no-repeat center;
  width: 28px; 
  height: 28px;
  display: inline-block;
}

/* Regular chat icon (used in header) */
.chat-icon {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z'/%3E%3C/svg%3E") no-repeat center;
  width: 20px;
  height: 20px;
  margin-right: 8px;
  display: inline-block;
}

/* Chat Popup */
.chat-popup {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 320px;
  background: white;
  border: 1px solid #ddd;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.25);
  border-radius: 12px;
  overflow: hidden;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  max-height: 60vh;
}

/* Chat Header */
.chat-header {
  background: linear-gradient(90deg, #2196f3, #1976d2);
  color: white;
  padding: 12px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.chat-header span {
  display: flex;
  align-items: center;
}

.close-button {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.close-button:hover {
  transform: scale(1.2);
}

/* Chat Box */
.chat-box {
  max-height: 300px;
  overflow-y: auto;
  padding: 15px;
  flex-grow: 1;
}

/* Messages */
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

/* Suggestion Buttons */
.suggestion-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 5px;
}

.suggestion-button {
  background: linear-gradient(90deg, #2196f3, #1976d2);
  color: white;
  border: none;
  border-radius: 15px;
  padding: 5px 10px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: transform 0.2s;
}

.suggestion-button:hover {
  transform: scale(1.05);
  background: linear-gradient(90deg, #1976d2, #1565c0);
}

/* Chat Input */
.chat-input {
  display: flex;
  padding: 12px;
  border-top: 1px solid #ddd;
  background: #f9f9f9;
}

.chat-input input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 20px;
  margin-right: 8px;
}

.send-button {
  border-radius: 20px;
  padding: 8px 15px;
  min-width: 60px;
}

/* Feedback Box */
.feedback-box {
  padding: 10px;
  margin: 0 12px 12px;
  border-radius: 8px;
  background-color: #e8f5e9;
  color: #2e7d32;
  font-size: 0.9rem;
  text-align: center;
}

.feedback-box p {
  margin: 0;
}
</style>
