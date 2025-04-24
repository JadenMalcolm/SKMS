<template>
  <!-- Semi-transparent overlay that appears behind the sidebar -->
  <div class="sidebar-overlay" v-if="isVisible" @click="toggleVisibility"></div>

  <!-- Main sidebar container - only visible when isVisible is true -->
  <div class="sidebar-menu" v-if="isVisible">
    <!-- Sidebar header with title and close button -->
    <div class="sidebar-header">
      <h2>Menu</h2>
      <button @click="toggleVisibility" class="sidebar-close-x">
        <span>&times;</span>
      </button>
    </div>

    <!-- Menu navigation items -->
    <div class="menu-items">
      <!-- User profile link -->
      <button @click="navigateToProfile" class="menu-button">
        <i class="menu-icon-user"></i> View Profile
      </button>

      <!-- Dashboard link -->
      <button @click="navigateToDashboard" class="menu-button">
        <i class="menu-icon-dashboard"></i> Dashboard
      </button>

      <!-- Meetings link -->
      <button @click="navigateToMeetings" class="menu-button">
        <i class="menu-icon-calendar"></i> Meetings
      </button>

      <!-- Direct messages link -->
      <button @click="navigateToDirectMessages" class="menu-button">
        <i class="menu-icon-messages"></i> Direct Messages
      </button>

      <!-- Learning resources link -->
      <button @click="navigateToLearn" class="menu-button">
        <i class="menu-icon-learn"></i> Learn
      </button>

      <!-- Security policies link -->
      <button @click="navigateToPolicies" class="menu-button">
        <i class="menu-icon-policies"></i> Security Policies
      </button>

      <!-- Contact expert button - only for employees -->
      <button
        @click="isContactExpertVisible = true"
        class="menu-button"
        v-if="currentUser && currentUser.role.startsWith('employee')"
      >
        <i class="menu-icon-expert"></i> Contact Expert
      </button>

      <!-- Give feedback button - for all users except admins -->
      <button
        @click="isFeedbackVisible = true"
        class="menu-button"
        v-if="currentUser && currentUser.role !== 'admin'"
      >
        <i class="menu-icon-feedback"></i> Give Feedback
      </button>

      <!-- Admin panel link - only for administrators -->
      <button
        @click="navigateToAdminPanel"
        class="menu-button"
        v-if="currentUser && currentUser.role === 'admin'"
      >
        <i class="menu-icon-admin"></i> Admin Panel
      </button>

      <!-- Staff directory link -->
      <button @click="navigateToStaff" class="menu-button">
        <i class="menu-icon-staff"></i> Staff
      </button>
    </div>

    <!-- Flexible spacer to push logout button to bottom -->
    <div class="menu-spacer"></div>

    <!-- Logout button -->
    <button @click="logout" class="menu-button menu-logout-button">
      <i class="menu-icon-logout"></i> Logout
    </button>

    <!-- Modal components -->
    <ContactExpert :showPopup="isContactExpertVisible" @close="isContactExpertVisible = false" />
    <Feedback :showPopup="isFeedbackVisible" @close="isFeedbackVisible = false" />
  </div>

  <!-- Hamburger menu button - shown when sidebar is closed -->
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

// Control sidebar visibility state
const isVisible = ref(false)
const router = useRouter()

// Control visibility of modal popups
const isContactExpertVisible = ref(false)
const isFeedbackVisible = ref(false)

// Get current user from session storage
const currentUser = JSON.parse(sessionStorage.getItem('user') || 'null')

// Toggle sidebar visibility
const toggleVisibility = () => {
  isVisible.value = !isVisible.value
}

// Navigation functions
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

const navigateToFeedback = () => {
  router.push('/feedback')
}

const navigateToLearn = () => {
  router.push('/learn')
}

const navigateToAdminPanel = () => {
  router.push('/admin-panel')
}

const navigateToStaff = () => {
  router.push('/staff')
}

const navigateToPolicies = () => {
  router.push('/policies')
}

// Logout function - clear session and redirect to login
const logout = () => {
  sessionStorage.removeItem('user')
  router.push('/')
}
</script>

<style scoped>
/* Semi-transparent overlay behind sidebar */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 900;
}

/* Main sidebar container styling */
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

/* Sidebar header with title and close button */
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

/* Close button styling with hover effects */
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

/* Menu items container */
.menu-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Flexible spacer to push logout to bottom */
.menu-spacer {
  flex-grow: 1;
  min-height: 20px;
}

/* Standard menu button styling */
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

/* Icon container styling within buttons */
.menu-button i {
  margin-right: 10px;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* SVG icon definitions using data URIs */
.menu-icon-user {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E")
    no-repeat center;
  width: 24px;
  height: 24px;
  display: inline-block;
}

.menu-icon-dashboard {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z'/%3E%3C/svg%3E")
    no-repeat center;
  width: 24px;
  height: 24px;
  display: inline-block;
}

.menu-icon-calendar {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z'/%3E%3C/svg%3E")
    no-repeat center;
  width: 24px;
  height: 24px;
  display: inline-block;
}

.menu-icon-messages {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z'/%3E%3C/svg%3E")
    no-repeat center;
  width: 24px;
  height: 24px;
  display: inline-block;
}

.menu-icon-expert {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z'/%3E%3C/svg%3E")
    no-repeat center;
  width: 24px;
  height: 24px;
  display: inline-block;
}

.menu-icon-feedback {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z'/%3E%3C/svg%3E")
    no-repeat center;
  width: 24px;
  height: 24px;
  display: inline-block;
}
.menu-icon-admin {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.06-.94l2.03-1.58c.18-.14.23-.39.12-.59l-1.92-3.32c-.11-.2-.35-.28-.56-.22l-2.39.96c-.5-.38-1.05-.7-1.65-.94l-.36-2.54A.485.485 0 0014.25 3h-4.5c-.24 0-.44.17-.48.41l-.36 2.54c-.6.24-1.15.56-1.65.94l-2.39-.96a.485.485 0 00-.56.22l-1.92 3.32c-.11.2-.06.45.12.59l2.03 1.58c-.04.3-.06.61-.06.94s.02.64.06.94l-2.03 1.58c-.18.14-.23.39-.12.59l1.92 3.32c.11.2.35.28.56.22l2.39-.96c.5.38 1.05.7 1.65.94l.36 2.54c.04.24.24.41.48.41h4.5c.24 0 .44-.17.48-.41l.36-2.54c.6-.24 1.15-.56 1.65-.94l2.39.96c.21.06.45-.02.56-.22l1.92-3.32c.11-.2.06-.45-.12-.59l-2.03-1.58zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z'/%3E%3C/svg%3E")
    no-repeat center;
  width: 24px;
  height: 24px;
  display: inline-block;
}

.menu-icon-learn {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M12 3L1 9l11 6l9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z'/%3E%3C/svg%3E")
    no-repeat center;
  width: 24px;
  height: 24px;
  display: inline-block;
}

.menu-icon-logout {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z'/%3E%3C/svg%3E")
    no-repeat center;
  width: 24px;
  height: 24px;
  display: inline-block;
}

.menu-icon-staff {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z'/%3E%3C/svg%3E")
    no-repeat center;
  width: 24px;
  height: 24px;
  display: inline-block;
}

.menu-icon-policies {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z'/%3E%3C/svg%3E")
    no-repeat center;
  width: 24px;
  height: 24px;
  display: inline-block;
}

/* Button hover effect */
.menu-button:hover {
  background: linear-gradient(90deg, #1976d2, #1565c0);
  transform: scale(1.02);
}

/* Hamburger menu button when sidebar is closed */
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

/* Hamburger button hover effect */
.menu-open-button:hover {
  background: linear-gradient(90deg, #0056b3, #003f7f);
  transform: scale(1.05);
}

/* Hamburger icon styling */
.menu-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

/* Individual line in hamburger icon */
.menu-line {
  width: 20px;
  height: 2px;
  background-color: white;
  border-radius: 1px;
}

/* Special styling for logout button */
.menu-logout-button {
  background: linear-gradient(90deg, #f44336, #d32f2f);
  margin-top: 10px; /* Add space above logout button */
}

.menu-logout-button:hover {
  background: linear-gradient(90deg, #d32f2f, #b71c1c);
  transform: scale(1.02);
}
</style>
