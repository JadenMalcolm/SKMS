<template>
  <div>
    <div v-if="showPopup" class="popup-container">
      <div class="popup">
        <h2>Contact an Expert</h2>
        <label for="category">Select Category:</label>
        <select v-model="selectedCategory" id="category">
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
        <button @click="setupFeed" class="button button-success">Submit</button>
        <button @click="emit('close')" class="button button-danger">Cancel</button>
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
 .button-success{
  margin-right:5px;
 }

.feedback-message {
  margin-top: 10px;
  color: #007bff;
  font-weight: bold;
}
</style>
