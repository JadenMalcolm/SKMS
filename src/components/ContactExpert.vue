<template>
  <!-- Main component wrapper -->
  <div>
    <!-- Popup modal that displays when showPopup prop is true -->
    <div v-if="showPopup" class="popup-container">
      <div class="popup container">
        <!-- Header section for the popup -->
        <div class="section-header">
          <h2>Contact an Expert</h2>
        </div>
        <!-- Category selection dropdown -->
        <div class="form-group">
          <label for="category">Select Category:</label>
          <select v-model="selectedCategory" id="category" class="input">
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>
        <!-- Action buttons for form submission or cancellation -->
        <div class="popup-actions">
          <button @click="setupFeed" class="button button-success">Submit</button>
          <button @click="emit('close')" class="button button-danger">Cancel</button>
        </div>
        <!-- Feedback message display for user information -->
        <p v-if="feedbackMessage" class="feedback-message">{{ feedbackMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

// Define component props - showPopup controls visibility of the modal
const props = defineProps({
  showPopup: Boolean,
})

// Define events that this component can emit
const emit = defineEmits(['close'])
const router = useRouter() // Initialize Vue Router for navigation

// Reactive state variables
const selectedCategory = ref('') // Stores the currently selected expert category
const feedbackMessage = ref('') // Stores feedback/error messages to display to the user

// Available expert categories that users can select from
const categories = [
  'Asset',
  'Threat',
  'Security Goal',
  'Countermeasure',
  'Defense Strategy',
  'Vulnerability',
]

/**
 * Sets up a direct message connection with an expert in the selected category
 * 1. Navigates to direct messages page
 * 2. Fetches an appropriate expert based on the selected category
 * 3. Triggers a chat window to open with that expert
 */
const setupFeed = async () => {
  if (selectedCategory.value) {
    try {
      // Navigate to the direct messages page first
      await router.push('direct-messages')

      // Small delay to ensure the page has loaded before proceeding
      await new Promise(resolve => setTimeout(resolve, 750))

      // API call to fetch an expert matching the selected category
      const response = await axios.get(
        `http://localhost:5000/experts/${selectedCategory.value.replace(/\s+/g, '').toLowerCase()}`,
      )
      const expert = response.data

      if (expert && expert.id) {
        // If expert exists, dispatch a custom event to open the chat interface
        const event = new CustomEvent('open-chat', { detail: expert })
        window.dispatchEvent(event)

        emit('close') // Close the popup once chat is initiated
      } else {
        // Handle case where no expert is available
        feedbackMessage.value = 'No expert available for the selected category.'
      }
    } catch (error) {
      // Error handling for API failure or other issues
      console.error('Error setting up feed:', error)
      feedbackMessage.value = 'Failed to set up feed. Please try again later.'
    }
  } else {
    // Validation feedback if no category is selected
    feedbackMessage.value = 'Please select a category.'
  }
}
</script>

<style scoped>
/* Full-screen overlay for the popup */
.popup-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); /* Semi-transparent background */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* Ensure popup appears above other content */
}

/* Main popup box styling */
.popup {
  width: 400px;
  padding: 25px;
}

/* Form input group styling */
.form-group {
  margin: 1rem 0 1.5rem;
}

/* Form label styling */
.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #444;
  text-align: left;
}

/* Button container styling */
.popup-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

/* Feedback message styling */
.feedback-message {
  margin-top: 15px;
  padding: 10px;
  border-radius: 8px;
  color: #1976d2;
  background-color: rgba(25, 118, 210, 0.1);
  text-align: center;
}
</style>
