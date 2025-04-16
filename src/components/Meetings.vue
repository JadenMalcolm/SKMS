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

const fetchAllUsers = async () => {
  try {
    const response = await axios.get('http://localhost:5000/all-users')
    allUsers.value = response.data
    filteredUsers.value = allUsers.value
  } catch (error) {
    console.error('Error fetching all users:', error)
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

onMounted(async () => {
  if (currentUser) {
    await fetchAllUsers()
    await fetchMeetingRequests()
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
}

.start-meeting,
.meeting-requests,
.meeting-details {
  width: 30%;
  border: 1px solid #ccc;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.start-meeting h2,
.meeting-requests h2,
.meeting-details h2 {
  text-align: center;
  margin-bottom: 10px;
}

.start-meeting ul,
.meeting-requests ul {
  list-style: none;
  padding: 0;
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
</style>
