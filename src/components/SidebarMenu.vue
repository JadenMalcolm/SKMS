<template>
  <div class="sidebar-overlay" v-if="isVisible" @click="toggleVisibility"></div>
  <div class="sidebar-menu" v-if="isVisible">
    <!-- Add sidebar header with close button -->
    <div class="sidebar-header">
      <h2>Menu</h2>
      <button @click="toggleVisibility" class="sidebar-close-x">
        <span>&times;</span>
      </button>
    </div>

    <div class="menu-items">
      <button @click="navigateToProfile" class="menu-button"><i class="menu-icon-user"></i> View Profile</button>
      <button @click="navigateToDashboard" class="menu-button"><i class="menu-icon-dashboard"></i> Dashboard</button>
      <button @click="navigateToMeetings" class="menu-button"><i class="menu-icon-calendar"></i> Meetings</button>
      <button @click="navigateToDirectMessages" class="menu-button"><i class="menu-icon-messages"></i> Direct Messages</button>
      <button
        @click="isContactExpertVisible = true"
        class="menu-button"
        v-if="currentUser && currentUser.role.startsWith('employee')"
      >
        <i class="menu-icon-expert"></i> Contact Expert
      </button>
    </div>

    <!-- Push logout to bottom with spacer -->
    <div class="menu-spacer"></div>

    <!-- Logout button at bottom -->
    <button @click="logout" class="menu-button menu-logout-button">
      <i class="menu-icon-logout"></i> Logout
    </button>

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

const navigateToProfile = () => {
  router.push('/profile')
}
const logout = () => {
  sessionStorage.removeItem('user')
  router.push('/')
}


</script>

<style scoped>
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 900;
}

.sidebar-menu {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 280px;
  background: #f9f9f9;
  border-right: 1px solid #ddd;
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.25);
  padding: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* New sidebar header styles */
.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 15px;
  margin-bottom: 15px;
  border-bottom: 1px solid #ddd;
}

.sidebar-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.sidebar-close-x {
  background: transparent;
  border: none;
  font-size: 24px;
  line-height: 1;
  color: #555;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.sidebar-close-x:hover {
  background: rgba(0, 0, 0, 0.1);
  transform: scale(1.1);
  color: #d32f2f;
}

/* Create structure for menu with spacer */
.menu-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.menu-spacer {
  flex-grow: 1;
  min-height: 20px;
}

.menu-button {
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 12px;
  padding: 12px;
  background: linear-gradient(90deg, #2196f3, #1976d2);
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
  text-align: left;
}

.menu-button i {
  margin-right: 10px;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Icon styles using CSS backgrounds */
.menu-icon-user {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E") no-repeat center;
  width: 24px;
  height: 24px;
  display: inline-block;
}

.menu-icon-dashboard {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z'/%3E%3C/svg%3E") no-repeat center;
  width: 24px;
  height: 24px;
  display: inline-block;
}

.menu-icon-calendar {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z'/%3E%3C/svg%3E") no-repeat center;
  width: 24px;
  height: 24px;
  display: inline-block;
}

.menu-icon-messages {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z'/%3E%3C/svg%3E") no-repeat center;
  width: 24px;
  height: 24px;
  display: inline-block;
}

.menu-icon-expert {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z'/%3E%3C/svg%3E") no-repeat center;
  width: 24px;
  height: 24px;
  display: inline-block;
}

.menu-icon-logout {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z'/%3E%3C/svg%3E") no-repeat center;
  width: 24px;
  height: 24px;
  display: inline-block;
}

.menu-button:hover {
  background: linear-gradient(90deg, #1976d2, #1565c0);
  transform: scale(1.02);
}

.menu-open-button {
  position: fixed;
  top: 20px;
  left: 20px;
  padding: 10px 16px;
  background: linear-gradient(90deg, #007bff, #0056b3);
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
  z-index: 900;
}

.menu-open-button:hover {
  background: linear-gradient(90deg, #0056b3, #003f7f);
  transform: scale(1.05);
}

.menu-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.menu-line {
  width: 20px;
  height: 2px;
  background-color: white;
  border-radius: 1px;
}

.menu-logout-button {
  background: linear-gradient(90deg, #f44336, #d32f2f);
  margin-top: 10px; /* Add some space above logout */
}

.menu-logout-button:hover {
  background: linear-gradient(90deg, #d32f2f, #b71c1c);
  transform: scale(1.02);
}
</style>
