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
        <li v-for="user in filteredAllUsers" :key="user.id" @click="selectUser(user)">
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
        <button @click="handleScheduleMeeting" class="button button-success">
          Schedule Meeting
        </button>
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
            {{ request.user_email }} requested to meet {{ request.meeting_type }} on
            {{ formatDate(request.date) }} at
            {{ formatTime(request.time) }}
          </p>
          <div class="request-actions">
            <button @click="acceptMeeting(request.id)" class="button button-success">Accept</button>
            <button @click="rejectMeeting(request.id)" class="button button-danger">Reject</button>
            <button @click="handleRescheduleMeeting(request)" class="button button-warning">
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
              v-if="meeting.id !== undefined"
              @click="deleteMeeting(meeting.id)"
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
import type { User } from '../composables/useUsers'
import useUsers from '../composables/useUsers'
import useMeetings from '../composables/useMeetings'
import useFormatDate from '../composables/useFormatDate'

// Current user setup
const currentUser = ref<User | null>(null)

// Load the user composable for user-related functionality
const {
  allUsers,
  searchQuery,
  filteredAllUsers, // Use filteredAllUsers instead of filteredUsers
  fetchAllUsers,
  selectedUser,
  selectUser: selectUserOriginal,
} = useUsers(currentUser)

// Load the meetings composable for meeting-related functionality
const {
  myMeetings,
  meetingRequests,
  selectedDate,
  selectedTime,
  selectedMeetingType,
  feedbackMessage,
  fetchMeetings,
  fetchMeetingRequests,
  scheduleMeeting,
  acceptMeeting,
  rejectMeeting,
  rescheduleMeeting,
  deleteMeeting,
} = useMeetings(currentUser)

// Load the date formatting composable
const { formatDate, formatTime } = useFormatDate()

// Filter users based on search query (overrides the default one if needed)
const filterUsers = () => {
  // This is managed by the useUsers composable's computed property
}

// Wrapper function to select a user
const selectUser = (user: User) => {
  selectUserOriginal(user)
}

// Meeting scheduling handler
const handleScheduleMeeting = () => {
  if (selectedUser.value) {
    scheduleMeeting(selectedUser.value.id)
  } else {
    feedbackMessage.value = 'Please select a user first.'
  }
}

// Rescheduling handler
const handleRescheduleMeeting = async (request: any) => {
  const success = await rescheduleMeeting(request)
  if (success) {
    // Clear selected user to prompt re-selection
    selectUserOriginal(null)
  }
}

// Component initialization
onMounted(async () => {
  const storedUser = sessionStorage.getItem('user')
  if (storedUser) {
    try {
      currentUser.value = JSON.parse(storedUser)
      await fetchAllUsers()
      await fetchMeetingRequests()
      await fetchMeetings()
    } catch (error) {
      console.error('Error parsing stored user:', error)
      feedbackMessage.value = 'User not logged in. Redirecting to login page.'
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)
    }
  } else {
    feedbackMessage.value = 'User not logged in. Redirecting to login page.'
    setTimeout(() => {
      window.location.href = '/'
    }, 2000)
  }
})
</script>

<style scoped>
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

/* Meeting actions alignment */
.meeting-actions {
  padding: 8px 16px 16px;
  text-align: right;
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
