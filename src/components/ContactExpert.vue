<template>
  <div>
    <button @click="showPopup = true" class="message-feed-button">Contact an Expert</button>
    <div v-if="showPopup" class="popup-container">
      <div class="popup">
        <h2>Contact an Expert</h2>
        <label for="category">Select Category:</label>
        <select v-model="selectedCategory" id="category">
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
        <button @click="setupFeed">Submit</button>
        <button @click="showPopup = false">Cancel</button>
        <p v-if="feedbackMessage" class="feedback-message">{{ feedbackMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'

interface User {
  id: number
  email: string
}

const showPopup = ref(false)
const selectedCategory = ref('')
const feedbackMessage = ref('')
const categories = [
  'Asset',
  'Threat',
  'Security Goal',
  'Countermeasure',
  'Defense Strategy',
  'Vulnerability',
]
const allUsers = ref<User[]>([])

const fetchAllUsers = async () => {
  try {
    const response = await axios.get('http://localhost:5000/all-users')
    allUsers.value = response.data
  } catch (error) {
    console.error('Error fetching all users:', error)
  }
}

const setupFeed = async () => {
  if (selectedCategory.value) {
    try {
      // Fetch the specific expert for the selected category
      const response = await axios.get(
        `http://localhost:5000/experts/${selectedCategory.value.replace(/\s+/g, '').toLowerCase()}`,
      )
      const expert = response.data

      if (expert && expert.id) {
        // Emit an event to open the chatbox with the selected expert
        const event = new CustomEvent('open-chat', { detail: expert })
        window.dispatchEvent(event)

        showPopup.value = false
      } else {
        feedbackMessage.value = 'No expert available for the selected category.'
      }
    } catch (error) {
      console.error('Error setting up feed:', error)
      feedbackMessage.value = 'Failed to set up feed. Please try again later.'
    }
  } else {
    feedbackMessage.value = 'Please select a category.'
  }
}
</script>

<style scoped>
.message-feed-button {
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 50%;
  width: 150px;
  height: 50px;
  font-size: 18px;
  cursor: pointer;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.3);
}

.popup-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.popup {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.popup h2 {
  margin-bottom: 20px;
}

.popup label {
  display: block;
  margin-bottom: 10px;
}

.popup select {
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.popup button {
  padding: 10px 20px;
  margin: 5px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.popup button:first-of-type {
  background: #4caf50;
  color: white;
}

.popup button:last-of-type {
  background: #f44336;
  color: white;
}

.feedback-message {
  margin-top: 10px;
  color: #007bff;
  font-weight: bold;
}
</style>
