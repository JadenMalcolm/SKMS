<template>
  <div class="page-header">
    <h1>Meetings</h1>
  </div>

  <div class="meetings-container">
    <!-- Start Meeting Section -->
    <div class="meetings-panel">
      <div class="section-header">
        <h2>Schedule a Meeting</h2>
      </div>
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search users..."
        class="search-input"
        @input="filterUsers"
      />
      <ul class="user-list">
        <li v-for="user in filteredUsers" :key="user.id" @click="selectUser(user)">
          {{ user.email }}
        </li>
      </ul>
    </div>

    <!-- Meeting Details Section -->
    <div v-if="selectedUser" class="meetings-panel">
      <div class="section-header">
        <h2>Meeting with {{ selectedUser.email }}</h2>
      </div>
      <div class="meeting-form">
        <div class="form-group">
          <label for="meeting-date">Date</label>
          <input type="date" id="meeting-date" v-model="selectedDate" class="input-field" />
        </div>
        <div class="form-group">
          <label for="meeting-time">Time</label>
          <input
            type="time"
            id="meeting-time"
            v-model="selectedTime"
            step="1800"
            class="input-field"
          />
        </div>
        <div class="form-group">
          <label for="meeting-type">Meeting Type</label>
          <select id="meeting-type" v-model="selectedMeetingType" class="input-field select-field">
            <option value="in-person">In-Person</option>
            <option value="online">Online</option>
          </select>
        </div>
        <button @click="scheduleMeeting" class="button button-success">Schedule Meeting</button>
      </div>
    </div>

    <!-- Meeting Requests Section -->
    <div class="meetings-panel meeting-requests">
      <div class="section-header">
        <h2>Meeting Requests</h2>
      </div>
      <ul class="request-list">
        <li v-for="request in meetingRequests" :key="request.id" class="request-item">
          <p>
            {{ request.user_email }} requested a meeting on {{ formatDate(request.date) }} at
            {{ formatTime(request.time) }}
          </p>
          <div class="request-actions">
            <button @click="acceptMeeting(request.id)" class="button button-success">Accept</button>
            <button @click="rejectMeeting(request.id)" class="button button-danger">Reject</button>
            <button @click="rescheduleMeeting(request)" class="button button-warning">
              Reschedule
            </button>
          </div>
        </li>
      </ul>
    </div>

    <!-- Meetings Section -->
    <div class="meetings-panel meetings-list">
      <div class="section-header">
        <h2>Meetings</h2>
      </div>
      <ul v-if="myMeetings.length > 0">
        <li v-for="(meeting, index) in myMeetings" :key="index" class="meeting-item">
          <div class="meeting-header">
            <span class="meeting-type">{{ meeting.meeting_type }}</span>
            <span :class="['meeting-status', `status-${meeting.status.toLowerCase()}`]">{{
              meeting.status
            }}</span>
          </div>
          <div class="meeting-details">
            <div class="meeting-detail">
              <i class="meeting-icon-calendar"></i>
              <span>{{ formatDate(meeting.date) }}</span>
            </div>
            <div class="meeting-detail">
              <i class="meeting-icon-time"></i>
              <span>{{ formatTime(meeting.time) }}</span>
            </div>
            <div class="meeting-detail">
              <i class="meeting-icon-user"></i>
              <span>{{ meeting.target_user_email || meeting.user_email }}</span>
            </div>
          </div>
          <div class="meeting-actions">
            <button
              @click="handleMeetingAction(meeting.id)"
              class="button button-danger button-small"
            >
              {{ meeting.status === 'rejected' ? 'Delete' : 'Cancel' }}
            </button>
          </div>
        </li>
      </ul>

      <div v-else class="no-meetings">
        <p>No meetings available. Schedule one to get started!</p>
      </div>
    </div>
  </div>

  <div v-if="feedbackMessage" class="feedback-box">
    <p>{{ feedbackMessage }}</p>
  </div>

  <SidebarMenu />
  <floating-chat />
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
    const endpoint = `http://localhost:5000/meetings/${currentUser.id}`
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
.page-header {
  text-align: center;
  margin-bottom: 20px;
}

.meetings-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
}

.meetings-panel {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: auto;
  max-height: 750px;
  overflow-y: auto;
}

/* Ensure meetings list has proper padding for items */
.meetings-list ul {
  max-height: none;
  overflow: visible;
  padding: 0;
  margin: 0;
  width: 100%;
}

/* Fix meeting item alignment */
.meeting-item {
  max-width: 100%;
  width: 100%;
  margin-left: 0;
  margin-right: 0;
  box-sizing: border-box;
}

/* Meeting actions alignment */
.meeting-actions {
  padding: 8px 16px 16px;
  text-align: right;
}

.section-header {
  text-align: center;
  margin-bottom: 15px;
  color: #333;
  font-weight: 600;
  font-size: 1.25rem;
}

/* User search and list */
.search-input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

/* Meeting details form */
.meeting-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 10px 5px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #555;
  margin-left: 2px;
}

.input-field {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  background-color: #f9f9f9;
  color: #333;
}

.input-field:focus {
  border-color: #4c95e8;
  box-shadow: 0 0 0 2px rgba(76, 149, 232, 0.2);
  outline: none;
  background-color: #fff;
}

.select-field {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23555' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
  padding-right: 40px;
  cursor: pointer;
}

/* Request items */
.request-list {
  list-style: none;
  padding: 0;
}

.request-item {
  background-color: #f9fbff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  border-left: 3px solid #4c95e8;
  transition: all 0.2s ease-in-out;
  position: relative;
  overflow: hidden;
}

.request-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #f0f6ff;
  transform: translateY(-2px);
}

.request-item p {
  margin-bottom: 10px;
  color: #333;
}

.request-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

/* Feedback message */
.feedback-box {
  width: 80%;
  margin: 10px auto;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #ffffff;
  color: #333;
  text-align: center;
}

.button-small {
  padding: 5px 10px;
  font-size: 0.75rem;
  border-radius: 12px;
  box-shadow: none;
}

/* Ensure meetings list takes full height but scrolls */
.meetings-list ul {
  max-height: none;
  overflow: visible;
}

/* Ensure meeting items don't exceed their container */
.meeting-item {
  max-width: 95%;
}

/* No meetings message styling */
.no-meetings {
  text-align: center;
  padding: 20px;
  color: #666;
  font-style: italic;
  background-color: #f9fbff;
  border-radius: 8px;
  border: 1px dashed #ccc;
}

/* Make sure grid items in meeting details don't overflow at small widths */
@media (max-width: 1200px) {
  .meeting-details {
    grid-template-columns: 1fr;
  }
}
</style>
