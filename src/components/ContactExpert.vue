<template>
  <div>
    <div v-if="showPopup" class="popup-container">
      <div class="popup container">
        <div class="section-header">
          <h2>Contact an Expert</h2>
        </div>
        <div class="form-group">
          <label for="category">Select Category:</label>
          <select v-model="selectedCategory" id="category" class="input">
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>
        <div class="popup-actions">
          <button @click="setupFeed" class="button button-success">Submit</button>
          <button @click="emit('close')" class="button button-danger">Cancel</button>
        </div>
        <p v-if="feedbackMessage" class="feedback-message">{{ feedbackMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const props = defineProps({
  showPopup: Boolean,
})

const emit = defineEmits(['close'])
const router = useRouter() // Use Vue Router for navigation
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

const setupFeed = async () => {
  if (selectedCategory.value) {
    try {
      await router.push('direct-messages') // Navigate to the direct messages page
      await new Promise(resolve => setTimeout(resolve, 750)) // Add a delay of 750ms
      const response = await axios.get(
        `http://localhost:5000/experts/${selectedCategory.value.replace(/\s+/g, '').toLowerCase()}`,
      )
      const expert = response.data

      if (expert && expert.id) {
        // Dispatch a custom event to open the chat box with the expert
        const event = new CustomEvent('open-chat', { detail: expert })
        window.dispatchEvent(event)

        emit('close') // Close the popup
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
  z-index: 1000;
}

.popup {
  width: 400px;
  padding: 25px;
}

.form-group {
  margin: 1rem 0 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #444;
  text-align: left;
}

.popup-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

.feedback-message {
  margin-top: 15px;
  padding: 10px;
  border-radius: 8px;
  color: #1976d2;
  background-color: rgba(25, 118, 210, 0.1);
  text-align: center;
}
</style>
