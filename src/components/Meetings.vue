<template>
  <div class="header">
    <h1>Meetings</h1>
  </div>

  <div class="meetings-container">
    <!-- Start Meeting Section -->
    <div class="start-meeting">
      <h2>Schedule a Meeting</h2>
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search users..."
        class="search-input"
        @input="filterUsers"
      />
      <ul>
        <li v-for="user in filteredUsers" :key="user.id" @click="selectUser(user)">
          {{ user.email }}
        </li>
      </ul>
    </div>

    <!-- Meeting Details Section -->
    <div v-if="selectedUser" class="meeting-details">
      <h2>Meeting with {{ selectedUser.email }}</h2>
      <input type="date" v-model="selectedDate" class="input-field" />
      <input type="time" v-model="selectedTime" step="1800" class="input-field" />
      <select v-model="selectedMeetingType" class="input-field">
        <option value="in-person">In-Person</option>
        <option value="online">Online</option>
      </select>
      <button @click="scheduleMeeting" class="button button-success">Schedule</button>
    </div>

    <!-- Meeting Requests Section -->
    <div class="meeting-requests">
      <h2>Meeting Requests</h2>
      <ul>
        <li v-for="request in meetingRequests" :key="request.id">
          <p>
            {{ request.user_email }} requested a meeting on {{ request.date }} at {{ request.time }}
          </p>
          <button @click="acceptMeeting(request.id)" class="button button-success">Accept</button>
          <button @click="rejectMeeting(request.id)" class="button button-danger">Reject</button>
          <button @click="rescheduleMeeting(request)" class="button button-warning">
            Reschedule
          </button>
        </li>
      </ul>
    </div>
    <div class="meetings">
      <h2>Meetings</h2>
      <ul v-if="myMeetings.length > 0">
        <li v-for="(meeting, index) in myMeetings" :key="index" class="meeting-item">
          <p>
            <strong>Date:</strong> {{ formatDate(meeting.date) }} | <strong>Time:</strong>
            {{ formatTime(meeting.time) }} | <strong>Type:</strong> {{ meeting.meeting_type }} |
            <strong>Email:</strong> {{ meeting.target_user_email || meeting.user_email }} |
            <strong>Status:</strong> {{ meeting.status }}
          </p>
          <button
            @click="handleMeetingAction(meeting.id)"
            class="button button-danger button-small"
          >
            {{ meeting.status === 'rejected' ? 'Delete' : 'Cancel' }}
          </button>
        </li>
      </ul>
      <p v-else>No meetings available.</p>
    </div>
  </div>

  <div v-if="feedbackMessage" class="feedback-box">
    <p>{{ feedbackMessage }}</p>
  </div>

  <SidebarMenu />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

interface MeetingRequest {
  id: number
  user_email: string
  user_id: number
  date: string
  time: string
}

interface User {
  id: number
  email: string
}

interface Meeting {
  id: number
  user_id: number
  target_user_id: number
  date: string
  time: string
  meeting_type: string
  status: string
  user_email: string
  target_user_email: string
}
const formatTime = (time: string) => {
  const [hour, minute] = time.split(':')
  const date = new Date()
  date.setHours(parseInt(hour), parseInt(minute))
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
}

const formatDate = (date: string) => {
  const parsedDate = new Date(date)
  if (isNaN(parsedDate.getTime())) {
    return date // Return the original string if parsing fails
  }
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0')
  const day = String(parsedDate.getDate()).padStart(2, '0')
  const year = parsedDate.getFullYear()
  return `${month}/${day}/${year}`
}
const selectedUser = ref<User | null>(null)
const meetingRequests = ref<MeetingRequest[]>([])
const selectedDate = ref('')
const selectedTime = ref('')
const selectedMeetingType = ref('in-person')
const feedbackMessage = ref('')
const searchQuery = ref('')
const allUsers = ref<User[]>([])
const filteredUsers = ref<User[]>([])
const currentUser = JSON.parse(sessionStorage.getItem('user') || '{}')
const myMeetings = ref<Meeting[]>([])

const fetchAllUsers = async () => {
  try {
    const response = await axios.get('http://localhost:5000/all-users')
    allUsers.value = response.data
    filteredUsers.value = allUsers.value
  } catch (error) {
    console.error('Error fetching all users:', error)
  }
}

const fetchMeetings = async () => {
  try {
    const endpoint = currentUser.role.startsWith('expert')
      ? `http://localhost:5000/accepted-meetings/${currentUser.id}`
      : `http://localhost:5000/meetings/${currentUser.id}`
    const response = await axios.get(endpoint)
    myMeetings.value = response.data
  } catch (error) {
    console.error('Error fetching meetings:', error)
    feedbackMessage.value = 'Failed to load meetings. Please try again later.'
  }
}

const fetchMeetingRequests = async () => {
  try {
    const response = await axios.get(`http://localhost:5000/meeting-requests/${currentUser.id}`)
    meetingRequests.value = response.data
  } catch (error) {
    console.error('Error fetching meeting requests:', error)
  }
}

const filterUsers = () => {
  filteredUsers.value = allUsers.value.filter((user) =>
    user.email.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
}

const selectUser = (user: User) => {
  selectedUser.value = user
}

const scheduleMeeting = async () => {
  if (selectedUser.value && selectedDate.value && selectedTime.value && selectedMeetingType.value) {
    try {
      const response = await axios.post('http://localhost:5000/schedule-meeting', {
        user_id: currentUser.id,
        target_user_id: selectedUser.value.id,
        date: selectedDate.value,
        time: selectedTime.value,
        meeting_type: selectedMeetingType.value,
      })
      feedbackMessage.value = response.data.message
      await fetchMeetingRequests()
    } catch (error) {
      feedbackMessage.value = 'Failed to schedule meeting. Please try again.'
    }
  } else {
    feedbackMessage.value = 'Please fill out all fields.'
  }
}

const acceptMeeting = async (meetingId: number) => {
  try {
    const response = await axios.post('http://localhost:5000/accept-meeting', {
      meeting_id: meetingId,
    })
    feedbackMessage.value = response.data.message
    await fetchMeetingRequests()
  } catch (error) {
    feedbackMessage.value = 'Failed to accept meeting. Please try again.'
  }
}

const rejectMeeting = async (meetingId: number) => {
  try {
    const response = await axios.post('http://localhost:5000/reject-meeting', {
      meeting_id: meetingId,
    })
    feedbackMessage.value = response.data.message
    await fetchMeetingRequests()
  } catch (error) {
    feedbackMessage.value = 'Failed to reject meeting. Please try again.'
  }
}

const rescheduleMeeting = async (request: MeetingRequest) => {
  try {
    // Delete the original meeting request
    await axios.post('http://localhost:5000/delete-meeting', { meeting_id: request.id })

    selectedUser.value = null

    feedbackMessage.value = `Please select ${request.user_email} to reschedule the meeting and set a new date and time.`
    await fetchMeetingRequests()
  } catch (error) {
    feedbackMessage.value = 'Failed to reschedule meeting. Please try again.'
  }
}

const handleMeetingAction = async (meetingId: number) => {
  try {
    const response = await axios.post('http://localhost:5000/delete-meeting', {
      meeting_id: meetingId,
    })
    feedbackMessage.value = response.data.message
    await fetchMeetings()
  } catch (error) {
    feedbackMessage.value = 'Failed to process meeting action. Please try again.'
  }
}

onMounted(async () => {
  if (currentUser) {
    await fetchAllUsers()
    await fetchMeetingRequests()
    await fetchMeetings()
  } else {
    feedbackMessage.value = 'User not logged in. Redirecting to login page.'
    setTimeout(() => {
      window.location.href = '/'
    }, 2000)
  }
})
</script>

<style scoped>
.header {
  text-align: center;
  margin-bottom: 20px;
}

.button {
  margin: 3px;
}

.meetings-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 30px;
  border-radius: 10px;
  max-height: 50%;
}

.start-meeting,
.meeting-requests,
.meeting-details,
.meetings {
  width: 24%;
  border: 1px solid #ccc;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-height: 1024px;
  overflow-y: auto;
}

.meeting-item {
  margin-bottom: 10px;
  padding: 10px;
  background-color: #f0f8ff; /* Blue background color */
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  list-style: none; /* Remove bullet points */
}

.meeting-item p strong {
  color: #007bff; /* Blue color for strong text */
}

.start-meeting ul,
.meeting-requests ul,
.meetings ul {
  list-style: none; /* Remove bullet points */
  padding: 0;
}

.start-meeting h2,
.meeting-requests h2,
.meeting-details h2,
.meetings h2 {
  text-align: center; /* Ensure consistent alignment */
  margin-bottom: 10px;
}

.start-meeting li,
.meeting-requests li {
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}

.start-meeting li:hover,
.meeting-requests li:hover {
  background-color: #f0f0f0;
}

.search-input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.input-field {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.feedback-box {
  width: 80%;
  margin: 10px auto;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #ffffff;
  color: #333;
}

.feedback-box p {
  margin: 0;
  font-size: 14px;
}

.button-small {
  padding: 5px 10px;
  font-size: 0.75rem;
  border-radius: 12px;
  box-shadow: none;
}
</style>
