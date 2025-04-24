<template>
  <!-- Floating chat button - fixed position in bottom right -->
  <button class="button button-primary chat-toggle" @click="toggleChat">
    <i class="chat-button-icon"></i>
  </button>

  <!-- Chat popup container - only visible when isOpen is true -->
  <div v-if="isOpen" class="chat-popup container">
    <!-- Chat header with title and close button -->
    <div class="chat-header">
      <span><i class="chat-icon"></i> AI Assistant</span>
      <button @click="toggleChat" class="close-button">✖</button>
    </div>

    <!-- Chat message history display area -->
    <div class="chat-box">
      <template v-for="(msg, index) in chatHistory" :key="index">
        <!-- Individual message bubble with conditional styling based on sender -->
        <div :class="msg.sender">
          <p>{{ msg.text }}</p>
          <!-- Optional suggestion buttons for AI responses -->
          <div v-if="msg.suggestions" class="suggestion-buttons">
            <button v-for="s in msg.suggestions" :key="s" @click="sendMessage(s)"
                   class="suggestion-button">{{ s }}</button>
          </div>
        </div>
      </template>
    </div>

    <!-- Message input area with text field and send button -->
    <div class="chat-input">
      <input v-model="userMessage" @keyup.enter="sendMessage(userMessage)"
             placeholder="Ask me something..." class="input" />
      <button @click="sendMessage(userMessage)" class="button button-primary send-button">Send</button>
    </div>

    <!-- Feedback message display (success/error notifications) -->
    <div v-if="feedbackMessage" class="feedback-box">{{ feedbackMessage }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'

// Reactive state variables
const isOpen = ref(false)                // Controls chat popup visibility
const userMessage = ref('')              // Stores current user input
const chatHistory = ref<{ sender: string; text: string; suggestions?: string[] }[]>([]) // Message history
const feedbackMessage = ref('')          // Status/feedback messages

// Toggle chat window visibility
const toggleChat = () => isOpen.value = !isOpen.value

/**
 * Sends user message to the AI assistant API and processes the response
 * @param message - The message text to send
 */
const sendMessage = async (message: string) => {
  // Skip empty messages
  if (!message.trim()) return

  // Add user message to chat history
  chatHistory.value.push({ sender: 'user', text: message })
  userMessage.value = '' // Clear input field

  try {
    // Send message to backend API
    const { data } = await axios.post('http://localhost:5000/chat', { message })

    // Add AI response to chat history
    chatHistory.value.push({ sender: 'bot', text: data.response })

    // If API returns suggested questions/responses, add them as interactive buttons
    if (data.suggestions?.length) {
      chatHistory.value.push({
        sender: 'bot',
        text: 'Did you mean:',
        suggestions: data.suggestions
      })
    }

    // Show success feedback
    feedbackMessage.value = 'Message sent successfully!'
  } catch (error) {
    // Handle and log errors
    console.error('Error sending message:', error)
    feedbackMessage.value = 'Error sending message.'
  }
}
</script>

<style scoped>
/* Floating action button styling */
.chat-toggle {
  position: fixed;
  bottom: 20px;
  right: 20px;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  z-index: 900;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Chat button icon using SVG data URL for portability */
.chat-button-icon {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z'/%3E%3C/svg%3E") no-repeat center;
  width: 28px;
  height: 28px;
  display: inline-block;
}

/* Chat header icon - smaller version of button icon */
.chat-icon {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z'/%3E%3C/svg%3E") no-repeat center;
  width: 20px;
  height: 20px;
  margin-right: 8px;
  display: inline-block;
}

/* Chat window popup container */
.chat-popup {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 320px;
  max-height: 60vh;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.25);
  border-radius: 12px;
  overflow: hidden;
}

/* Chat header with gradient background */
.chat-header {
  background: linear-gradient(90deg, #2196f3, #1976d2);
  color: white;
  padding: 12px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

/* Align header icon and text */
.chat-header span { display: flex; align-items: center; }

/* Close button styling */
.close-button {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  transition: transform 0.2s ease;
}

/* Hover effect for close button */
.close-button:hover { transform: scale(1.2); }

/* Message history container with scrolling */
.chat-box {
  max-height: 300px;
  overflow-y: auto;
  padding: 15px;
  flex-grow: 1;
}

/* Base styling for message bubbles (both user and bot) */
.user, .bot {
  padding: 10px;
  margin: 8px 0;
  color: #333;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  word-break: break-word;
  border-radius: 12px;
}

/* User message styling - right-aligned with blue gradient */
.user {
  text-align: right;
  background: linear-gradient(90deg, #e3f2fd, #bbdefb);
  border-radius: 12px 12px 0 12px;
}

/* Bot message styling - left-aligned with gray gradient */
.bot {
  text-align: left;
  background: linear-gradient(90deg, #f5f5f5, #e0e0e0);
  border-radius: 12px 12px 12px 0;
}

/* Remove default paragraph margins within messages */
.user p, .bot p { margin: 0 0 8px 0; }

/* Suggestion buttons container */
.suggestion-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 5px;
}

/* Individual suggestion button styling */
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

/* Hover effect for suggestion buttons */
.suggestion-button:hover {
  transform: scale(1.05);
  background: linear-gradient(90deg, #1976d2, #1565c0);
}

/* Input area container at bottom of chat */
.chat-input {
  display: flex;
  padding: 12px;
  border-top: 1px solid #ddd;
  background: #f9f9f9;
}

/* Text input styling */
.chat-input input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 20px;
  margin-right: 8px;
}

/* Send button styling */
.send-button {
  border-radius: 20px;
  padding: 8px 15px;
  min-width: 60px;
}

/* Feedback message styling */
.feedback-box {
  padding: 10px;
  margin: 0 12px 12px;
  border-radius: 8px;
  background-color: #e8f5e9;
  color: #2e7d32;
  font-size: 0.9rem;
  text-align: center;
}
</style>
