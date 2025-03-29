<template>
  <div class="sidebar-menu" v-if="isVisible">
    <button class="menu-button">View Profile</button>
    <button @click="navigateToDashboard" class="menu-button">Dashboard</button>
    <button @click="navigateToDirectMessages" class="menu-button">Direct Messages</button>
    <button
      v-if="currentUser && currentUser.role.startsWith('employee')"
      @click="isScheduleMeetingVisible = true"
      class="menu-button"
    >
      Schedule Meeting
    </button>
    <button
      v-if="currentUser && currentUser.role.startsWith('expert')"
      @click="isAcceptMeetingVisible = true"
      class="menu-button"
    >
      View Meeting Requests
    </button>
    <button
      @click="isContactExpertVisible = true"
      class="menu-button"
      v-if="currentUser && currentUser.role.startsWith('employee')"
    >
      Contact Expert
    </button>
    <button @click="toggleVisibility" class="menu-close-button">Close</button>
  </div>
  <button v-else @click="toggleVisibility" class="menu-open-button">Menu</button>
  <ScheduleMeeting
    v-if="currentUser && currentUser.role.startsWith('employee')"
    :showPopup="isScheduleMeetingVisible"
    @close="isScheduleMeetingVisible = false"
  />
  <AcceptMeeting
    v-if="currentUser && currentUser.role.startsWith('expert')"
    :showPopup="isAcceptMeetingVisible"
    @close="isAcceptMeetingVisible = false"
  />
  <ContactExpert :showPopup="isContactExpertVisible" @close="isContactExpertVisible = false" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const isVisible = ref(false)
const isScheduleMeetingVisible = ref(false)
const isAcceptMeetingVisible = ref(false)
const isContactExpertVisible = ref(false) // State for ContactExpert popup
const router = useRouter()

// Fetch the current user from session storage
const currentUser = JSON.parse(sessionStorage.getItem('user') || 'null')

const toggleVisibility = () => {
  isVisible.value = !isVisible.value
}

const navigateToDirectMessages = () => {
  router.push('/direct-messages')
}

const navigateToDashboard = () => {
  router.push('/dashboard')
}
</script>

<style scoped>
.sidebar-menu {
  position: fixed;
  top: 20px;
  left: 20px; /* Updated to move the menu to the top-left */
  width: 220px;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  padding: 10px;
  z-index: 1000;
}

.menu-button {
  display: block;
  width: 100%;
  margin-bottom: 10px;
  padding: 10px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.menu-button:hover {
  background: #0056b3;
}

.menu-close-button {
  display: block;
  width: 100%;
  padding: 10px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.menu-close-button:hover {
  background: #d32f2f;
}

.menu-open-button {
  position: fixed;
  top: 20px;
  left: 20px; /* Updated to move the button to the top-left */
  padding: 10px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.menu-open-button:hover {
  background: #0056b3;
}
</style>
