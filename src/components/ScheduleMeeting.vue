<template>
  <div>
    <button 
      v-if="currentUser && currentUser.role === 'employee'" 
      @click="showPopup = true" 
      class="schedule-meeting-button">
      Schedule a Meeting
    </button>
    <div v-if="showPopup" class="popup-container">
      <div class="popup">
        <h2>Schedule a Meeting</h2>
        <label for="category">Select Category:</label>
        <select v-model="selectedCategory" id="category">
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
        <label for="date">Select Date:</label>
        <input type="date" v-model="selectedDate" id="date" />
        <label for="time">Select Time:</label>
        <input type="time" v-model="selectedTime" id="time" step="1800" />
        <label for="meeting-type">Meeting Type:</label>
        <select v-model="selectedMeetingType" id="meeting-type">
          <option value="in-person">In-Person</option>
          <option value="online">Online</option>
        </select>
        <button @click="scheduleMeeting">Submit</button>
        <button @click="cancelPopup">Cancel</button>
        <p v-if="feedbackMessage" class="feedback-message">{{ feedbackMessage }}</p>
      </div>
    </div>
    <AcceptMeeting />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import AcceptMeeting from './AcceptMeeting.vue'

const showPopup = ref(false)
const selectedCategory = ref('')
const selectedDate = ref('')
const selectedTime = ref('')
const selectedMeetingType = ref('in-person') // Default to in-person
const feedbackMessage = ref('')
const categories = [
  'Asset',
  'Threat',
  'Security Goal',
  'Countermeasure',
  'Defense Strategy',
  'Vulnerability',
]

// Fetch the current user from session storage
const currentUser = JSON.parse(sessionStorage.getItem('user') || 'null')

const scheduleMeeting = async () => {
  feedbackMessage.value = '' // Clear any previous feedback message
  if (
    selectedCategory.value &&
    selectedDate.value &&
    selectedTime.value &&
    selectedMeetingType.value
  ) {
    if (!currentUser || !currentUser.id) {
      feedbackMessage.value = 'User not logged in.'
      return
    }

    try {
      const response = await axios.post('http://localhost:5000/schedule-meeting', {
        user_id: currentUser.id, // Include the user ID
        category: selectedCategory.value,
        date: selectedDate.value,
        time: selectedTime.value,
        meeting_type: selectedMeetingType.value, // Include the meeting type
      })
      feedbackMessage.value = response.data.message
      showPopup.value = false
    } catch (error) {
      console.error('Error scheduling meeting:', error)
      feedbackMessage.value =
        (error as any).response?.data?.error ||
        'Failed to schedule meeting. Please try again later.'
    }
  } else {
    feedbackMessage.value = 'Please fill out all fields.'
  }
}

const cancelPopup = () => {
  feedbackMessage.value = '' // Clear feedback message
  showPopup.value = false // Close the popup
}
</script>

<style scoped>
.schedule-meeting-button {
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: #4caf50;
  color: white;
  border: 0;
  border-radius: 24px;
  padding: 10px 16px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color .3s ease;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.3);
}

.schedule-meeting-button:hover {
  background-color: #45a049;
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

.popup input,
.popup select {
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.popup button {
  padding: 10px 16px;
  border: 0;
  border-radius: 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
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
