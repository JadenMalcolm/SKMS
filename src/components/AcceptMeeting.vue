<template>
  <div>
    <div v-if="showPopup" class="popup-container">
      <div class="popup">
        <h2>Meeting Requests</h2>
        <ul v-if="meetings.length > 0">
          <li v-for="meeting in meetings" :key="meeting.id">
            <p><strong>Category:</strong> {{ meeting.category }}</p>
            <p><strong>Date:</strong> {{ meeting.date }}</p>
            <p><strong>Time:</strong> {{ meeting.time }}</p>
            <!-- Time is now in 12-hour format -->
            <p><strong>Requested By:</strong> {{ meeting.user_email }}</p>
            <button @click="acceptMeeting(meeting.id)">Accept</button>
            <button @click="rejectMeeting(meeting.id)">Reject</button>
          </li>
        </ul>
        <p v-else>No meeting requests available.</p>
        <button @click="emit('close')">Close</button>
        <p v-if="feedbackMessage" class="feedback-message">{{ feedbackMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from 'vue'
import axios from 'axios'

const props = defineProps({
  showPopup: Boolean,
})

const emit = defineEmits(['close'])
interface Meeting {
  id: number
  category: string
  date: string
  time: string
  user_email: string
  meeting_type: string
}

const meetings = ref<Meeting[]>([])
const feedbackMessage = ref('')

// Fetch the current user from session storage
const currentUser = JSON.parse(sessionStorage.getItem('user') || 'null')

const fetchMeetings = async () => {
  if (!currentUser || !currentUser.role.startsWith('expert')) {
    feedbackMessage.value = 'Access denied. Only experts can view meeting requests.'
    return
  }

  try {
    const response = await axios.get(`http://localhost:5000/meeting-requests/${currentUser.id}`)
    meetings.value = response.data
  } catch (error) {
    console.error('Error fetching meeting requests:', error)
    feedbackMessage.value = 'Failed to fetch meeting requests. Please try again later.'
  }
}

// Watch for when the popup is opened and fetch meeting requests
watch(
  () => props.showPopup,
  (newVal) => {
    if (newVal) {
      fetchMeetings()
    }
  },
)

const acceptMeeting = async (meetingId: number) => {
  try {
    const response = await axios.post(`http://localhost:5000/accept-meeting`, {
      meeting_id: meetingId,
    })
    feedbackMessage.value = response.data.message
    meetings.value = meetings.value.filter((meeting) => meeting.id !== meetingId) // Remove accepted meeting
    if (meetings.value.length === 0) emit('close') // Close popup if no more meetings
  } catch (error) {
    console.error('Error accepting meeting:', error)
    feedbackMessage.value = 'Failed to accept meeting. Please try again later.'
  }
}

const rejectMeeting = async (meetingId: number) => {
  try {
    const response = await axios.post(`http://localhost:5000/reject-meeting`, {
      meeting_id: meetingId,
    })
    feedbackMessage.value = response.data.message
    meetings.value = meetings.value.filter((meeting) => meeting.id !== meetingId) // Remove rejected meeting
    if (meetings.value.length === 0) emit('close') // Close popup if no more meetings
  } catch (error) {
    console.error('Error rejecting meeting:', error)
    feedbackMessage.value = 'Failed to reject meeting. Please try again later.'
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

.popup ul {
  list-style: none;
  padding: 0;
}

.popup li {
  margin-bottom: 20px;
  border-bottom: 1px solid #ccc;
  padding-bottom: 10px;
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
