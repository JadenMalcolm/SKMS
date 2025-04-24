<template>
  <!-- Page title header -->
  <div class="page-header">
    <h1>Meetings</h1>
  </div>

  <!-- Main container for meetings management panels -->
  <div class="meetings-container">
    <!-- Schedule Meeting Panel - User search and selection -->
    <div class="meetings-panel">
      <div class="section-header">
        <h2>Schedule a Meeting</h2>
      </div>
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search users..."
        class="search-input"
      />
      <!-- List of users available for meeting scheduling -->
      <ul class="user-list">
        <li v-for="user in filteredAllUsers" :key="user.id" @click="selectUser(user)">
          {{ user.email }}
        </li>
      </ul>
    </div>

    <!-- Meeting Details Panel - Shows when user is selected -->
    <div v-if="selectedUser" class="meetings-panel">
      <div class="section-header">
        <h2>Meeting with {{ selectedUser.email }}</h2>
      </div>
      <!-- Meeting scheduling form -->
      <div class="meeting-form">
        <!-- Date selection field -->
        <div class="form-group">
          <label for="meeting-date">Date</label>
          <input type="date" id="meeting-date" v-model="selectedDate" class="input-field" />
        </div>
        <!-- Time selection field (step=1800 sets 30-minute intervals) -->
        <div class="form-group">
          <label for="meeting-time">Time</label>
          <input type="time" id="meeting-time" v-model="selectedTime" step="1800" class="input-field" />
        </div>
        <!-- Meeting type selection -->
        <div class="form-group">
          <label for="meeting-type">Meeting Type</label>
          <select id="meeting-type" v-model="selectedMeetingType" class="input-field select-field">
            <option value="in-person">In-Person</option>
            <option value="online">Online</option>
          </select>
        </div>
        <!-- Submit button - Only active when a user is selected -->
        <button
          @click="selectedUser && scheduleMeeting(selectedUser.id)"
          class="button button-success"
        >
          Schedule Meeting
        </button>
      </div>
    </div>

    <!-- Meeting Requests Panel - Shows incoming meeting requests that need response -->
    <div class="meetings-panel meeting-requests">
      <div class="section-header">
        <h2>Meeting Requests</h2>
      </div>
      <!-- Conditional rendering for meeting requests list -->
      <ul class="request-list" v-if="meetingRequests && meetingRequests.length > 0">
        <li v-for="request in meetingRequests" :key="request.id" class="request-item">
          <p>
            {{ request.user_email }} requested to meet {{ request.meeting_type }} on
            {{ formatDate(request.date) }} at {{ formatTime(request.time) }}
          </p>
          <!-- Action buttons for responding to meeting requests -->
          <div class="request-actions">
            <button @click="acceptMeeting(request.id)" class="button button-success">Accept</button>
            <button @click="rejectMeeting(request.id)" class="button button-danger">Reject</button>
            <button
              @click="async () => { if(await rescheduleMeeting(request)) selectUser(null) }"
              class="button button-warning"
            >
              Reschedule
            </button>
          </div>
        </li>
      </ul>
      <!-- Empty state for no meeting requests -->
      <div v-else class="no-meetings">
        <p>No meeting requests at this time.</p>
      </div>
    </div>

    <!-- Meetings List Panel - Shows all user's meetings -->
    <div class="meetings-panel meetings-list">
      <div class="section-header">
        <h2>Meetings</h2>
      </div>
      <!-- List of all meetings for current user -->
      <ul v-if="myMeetings.length > 0">
        <li v-for="(meeting, index) in myMeetings" :key="index" class="meeting-item">
          <!-- Meeting header with type and status -->
          <div class="meeting-header">
            <span class="meeting-type">{{ meeting.meeting_type }}</span>
            <!-- Dynamic class binding for status styling -->
            <span :class="['meeting-status', `status-${meeting.status.toLowerCase()}`]">
              {{ meeting.status }}
            </span>
          </div>
          <!-- Meeting details section -->
          <div class="meeting-details">
            <!-- Date information -->
            <div class="meeting-detail">
              <i class="meeting-icon-calendar"></i>
              <span>{{ formatDate(meeting.date) }}</span>
            </div>
            <!-- Time information -->
            <div class="meeting-detail">
              <i class="meeting-icon-time"></i>
              <span>{{ formatTime(meeting.time) }}</span>
            </div>
            <!-- Participant information -->
            <div class="meeting-detail">
              <i class="meeting-icon-user"></i>
              <span>{{ meeting.target_user_email || meeting.user_email }}</span>
            </div>
          </div>
          <!-- Meeting actions (cancel/delete) -->
          <div class="meeting-actions">
            <button
              v-if="meeting.id !== undefined"
              @click="deleteMeeting(meeting.id)"
              class="button button-danger button-small"
            >
              <!-- Dynamic button text based on meeting status -->
              {{ meeting.status === 'rejected' ? 'Delete' : 'Cancel' }}
            </button>
          </div>
        </li>
      </ul>
      <!-- Empty state for no meetings -->
      <div v-else class="no-meetings">
        <p>No meetings available. Schedule one to get started!</p>
      </div>
    </div>
  </div>

  <!-- Feedback/notification message box -->
  <div v-if="feedbackMessage" class="feedback-box">
    <p>{{ feedbackMessage }}</p>
  </div>

  <!-- Global navigation components -->
  <SidebarMenu />
  <floating-chat />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { User } from '../composables/useUsers'
import useUsers from '../composables/useUsers'         // Composable for user management
import useMeetings from '../composables/useMeetings'   // Composable for meeting operations
import useFormatDate from '../composables/useFormatDate' // Composable for date formatting

// Store the currently logged in user
const currentUser = ref<User | null>(null)

// Initialize user management functionality
const { searchQuery, filteredAllUsers, fetchAllUsers, selectedUser, selectUser } = useUsers(currentUser)

// Initialize meetings management functionality
const {
  myMeetings,          // All meetings associated with the current user
  meetingRequests,     // Incoming meeting requests pending response
  selectedDate,        // Selected date for new meeting
  selectedTime,        // Selected time for new meeting
  selectedMeetingType, // Selected type for new meeting
  feedbackMessage,     // System feedback message
  fetchMeetings,       // Load all user's meetings
  fetchMeetingRequests, // Load pending meeting requests
  scheduleMeeting,     // Create a new meeting
  acceptMeeting,       // Accept a meeting request
  rejectMeeting,       // Reject a meeting request
  rescheduleMeeting,   // Propose new time for a meeting
  deleteMeeting        // Delete/cancel a meeting
} = useMeetings(currentUser)

// Date and time formatting utilities
const { formatDate, formatTime } = useFormatDate()

// Component initialization when mounted
onMounted(async () => {
  // Check for authenticated user
  const storedUser = sessionStorage.getItem('user')
  if (storedUser) {
    try {
      // Parse and set current user
      currentUser.value = JSON.parse(storedUser)

      // Load users first to ensure we have data for meetings
      await fetchAllUsers()

      // Load meeting data in parallel for efficiency
      try {
        const results = await Promise.all([
          fetchMeetingRequests(), // Load pending meeting requests
          fetchMeetings()         // Load user's meetings
        ])
        console.log('Meeting requests loaded:', meetingRequests.value.length)
      } catch (fetchError) {
        // Handle errors in fetching meeting data
        console.error('Error fetching meeting data:', fetchError)
        feedbackMessage.value = 'Failed to load meeting data. Please try refreshing.'
      }
    } catch (error) {
      // Handle errors in parsing user data
      console.error('Error parsing stored user:', error)
      feedbackMessage.value = 'User not logged in. Redirecting to login page.'
      setTimeout(() => window.location.href = '/', 2000)
    }
  } else {
    // Redirect if no user is logged in
    feedbackMessage.value = 'User not logged in. Redirecting to login page.'
    setTimeout(() => window.location.href = '/', 2000)
  }
})
</script>

<style scoped>
/* Responsive grid layout for meetings panels */
.meetings-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
}

/* Styling for individual meeting panels */
.meetings-panel {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: auto;
  max-height: 750px;
  overflow-y: auto; /* Scrollable content */
}

/* Meetings list specific styling */
.meetings-list ul {
  max-height: none;
  overflow: visible;
  padding: 0;
  margin: 0;
  width: 100%;
}

/* Meeting action buttons container */
.meeting-actions { padding: 8px 16px 16px; text-align: right; }

/* Meeting form styling */
.meeting-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 10px 5px;
}

/* Form field grouping */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Form label styling */
.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #555;
  margin-left: 2px;
}

/* Input fields styling */
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

/* Input focus state */
.input-field:focus {
  border-color: #4c95e8;
  box-shadow: 0 0 0 2px rgba(76, 149, 232, 0.2);
  outline: none;
  background-color: #fff;
}

/* Select dropdown styling with custom arrow */
.select-field {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23555' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
  padding-right: 40px;
  cursor: pointer;
}

/* Request items list styling */
.request-list { list-style: none; padding: 0; }

/* Individual request item styling with hover effects */
.request-item {
  background-color: #f9fbff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  border-left: 3px solid #4c95e8;
  transition: all 0.2s ease-in-out;
}

/* Request item hover state */
.request-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #f0f6ff;
  transform: translateY(-2px);
}

/* Request item text formatting */
.request-item p { margin-bottom: 10px; color: #333; }

/* Request action buttons container */
.request-actions { display: flex; flex-wrap: wrap; gap: 5px; }

/* Feedback message box styling */
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

/* Small button variant */
.button-small {
  padding: 5px 10px;
  font-size: 0.75rem;
  border-radius: 12px;
  box-shadow: none;
}

/* Empty state styling */
.no-meetings {
  text-align: center;
  padding: 20px;
  color: #666;
  font-style: italic;
  background-color: #f9fbff;
  border-radius: 8px;
  border: 1px dashed #ccc;
  margin: 10px 0;
  width: 100%;
  box-sizing: border-box;
}

/* Responsive styles for smaller screens */
@media (max-width: 1200px) {
  .meeting-details { grid-template-columns: 1fr; }
}
</style>
