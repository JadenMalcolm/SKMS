<template>
  <div class="sidebar-menu" v-if="isVisible">
    <button class="menu-button">View Profile</button>
    <button @click="navigateToDashboard" class="menu-button">Dashboard</button>
    <button @click="navigateToMeetings" class="menu-button">Meetings</button>
    <button @click="navigateToDirectMessages" class="menu-button">Direct Messages</button>
    <button
      @click="isContactExpertVisible = true"
      class="menu-button"
      v-if="currentUser && currentUser.role.startsWith('employee')"
    >
      Contact Expert
    </button>
    <button @click="logout" class="menu-button menu-logout-button">Logout</button>
    <button @click="toggleVisibility" class="menu-close-button">Close</button>
    <ContactExpert :showPopup="isContactExpertVisible" @close="isContactExpertVisible = false" />
  </div>
  <button v-else @click="toggleVisibility" class="menu-open-button">
    <span class="menu-icon">
      <span class="menu-line"></span>
      <span class="menu-line"></span>
      <span class="menu-line"></span>
    </span>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const isVisible = ref(false)
const showContactExpert = ref(false)
const router = useRouter()
const isContactExpertVisible = ref(false)

const currentUser = JSON.parse(sessionStorage.getItem('user') || 'null')

const toggleVisibility = () => {
  isVisible.value = !isVisible.value
}

const navigateToDashboard = () => {
  router.push('/dashboard')
}

const navigateToMeetings = () => {
  router.push('/meetings')
}

const navigateToDirectMessages = () => {
  router.push('/direct-messages')
}

const openContactExpert = () => {
  showContactExpert.value = true
}

const logout = () => {
  sessionStorage.removeItem('user')
  router.push('/')
}
</script>

<style scoped>
.sidebar-menu {
  position: fixed;
  top: 20px;
  left: 20px;
  width: 240px; /* Slightly wider for better spacing */
  background: #f9f9f9; /* Softer background color */
  border: 1px solid #ddd;
  border-radius: 12px; /* More rounded corners */
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25); /* Enhanced shadow */
  padding: 15px; /* Increased padding for better spacing */
  z-index: 1000;
}

.menu-button {
  display: block;
  width: 100%;
  margin-bottom: 12px; /* Slightly larger spacing */
  padding: 12px;
  background: linear-gradient(90deg, #2196f3, #1976d2); /* Gradient background */
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background-color 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.menu-button:hover {
  background: linear-gradient(90deg, #1976d2, #1565c0); /* Darker gradient on hover */
  transform: scale(1.05); /* Slight zoom effect */
}

.menu-close-button {
  display: block;
  width: 100%;
  padding: 12px; /* Match padding with other buttons */
  background: linear-gradient(90deg, #f44336, #d32f2f); /* Gradient background */
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background-color 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.menu-close-button:hover {
  background: linear-gradient(90deg, #d32f2f, #b71c1c); /* Darker gradient on hover */
  transform: scale(1.05); /* Slight zoom effect */
}

.menu-open-button {
  position: fixed;
  top: 20px;
  left: 20px;
  padding: 10px 16px;
  background: linear-gradient(90deg, #007bff, #0056b3); /* Gradient background */
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.menu-open-button:hover {
  background: linear-gradient(90deg, #0056b3, #003f7f); /* Darker gradient on hover */
  transform: scale(1.05); /* Slight zoom effect */
}

.menu-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px; /* Spacing between lines */
}

.menu-line {
  width: 20px;
  height: 2px;
  background-color: white;
  border-radius: 1px;
}

.menu-logout-button {
  background: linear-gradient(90deg, #f44336, #d32f2f); /* Gradient background */
}

.menu-logout-button:hover {
  background: linear-gradient(90deg, #d32f2f, #b71c1c); /* Darker gradient on hover */
  transform: scale(1.05); /* Slight zoom effect */
}
</style>
