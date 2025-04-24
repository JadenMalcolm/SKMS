<template>
  <!-- Main dashboard container -->
  <div class="dashboard-container">
    <!-- Header section displaying system title and user information -->
    <header class="page-header">
      <h1>Security Knowledge Management System</h1>
      <p>Welcome, {{ currentUser?.email }}! You are logged in as an {{ currentUser?.role }}</p>
    </header>

    <!-- Main content area containing all dashboard cards -->
    <div class="dashboard-content">
      <!-- Category navigation section - primary navigation for the system -->
      <section class="dashboard-card container">
        <div class="section-header"><h2>Categories</h2></div>
        <div class="categories-grid">
          <button
            v-for="category in categories"
            :key="category.route"
            @click="navigateTo(category.route)"
            class="button button-primary"
          >
            {{ category.label }}
          </button>
        </div>
      </section>

      <!-- Grid layout for dashboard cards -->
      <div class="dashboard-grid">
        <!-- Search functionality card -->
        <section class="dashboard-card container">
          <div class="section-header"><h2>Search Questions</h2></div>
          <div class="search-box">
            <input type="text" v-model="searchQuery" placeholder="Search questions..." class="input" />
            <button @click="searchQuestions()" class="button button-success">Search</button>
          </div>
          <!-- Search results display area -->
          <div class="results-box">
            <h3 class="subsection-header">Search Results</h3>
            <ul>
              <li v-for="(q, index) in searchResults" :key="index" class="question-item">
                <!-- Link to individual question details -->
                <router-link :to="`/question/${q.id}`">{{ q.question }}</router-link>
                <!-- Question metadata display -->
                <small>{{ formatDate(q.timestamp) }}</small>
                <small>Category: {{ q.category }}</small>
                <small>Asked by: {{ q.user_email }}</small>
              </li>
            </ul>
          </div>
        </section>

        <!-- User's own questions display card -->
        <section class="dashboard-card container">
          <div class="section-header"><h2>My Questions</h2></div>
          <ul>
            <li v-for="(q, index) in userQuestions" :key="index" class="question-item">
              <router-link :to="`/question/${q.id}`">{{ q.question }}</router-link>
              <small>{{ formatDate(q.timestamp) }}</small>
              <small>Category: {{ q.category }}</small>
            </li>
          </ul>
        </section>

        <!-- Subscribed questions display card - questions the user is following -->
        <section class="dashboard-card container">
          <div class="section-header"><h2>Subscribed Questions</h2></div>
          <ul>
            <li v-for="(q, index) in subscribedQuestions" :key="index" class="question-item">
              <router-link :to="`/question/${q.id}`">{{ q.question }}</router-link>
              <small>{{ formatDate(q.timestamp) }}</small>
              <small>Category: {{ q.category }}</small>
              <small>Asked by: {{ q.user_email }}</small>
            </li>
          </ul>
        </section>

        <!-- User's scheduled meetings card -->
        <section class="dashboard-card container">
          <div class="section-header"><h2>My Meetings</h2></div>
          <ul>
            <li v-for="(meeting, index) in myMeetings" :key="index" class="meeting-item">
              <div class="meeting-header">
                <span class="meeting-type">{{ meeting.meeting_type }}</span>
                <span :class="['meeting-status', `status-${meeting.status.toLowerCase()}`]">
                  {{ meeting.status }}
                </span>
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
                <div class="meeting-detail" v-if="meeting.category">
                  <i class="meeting-icon-category"></i>
                  <span>{{ meeting.category }}</span>
                </div>
              </div>
            </li>
          </ul>
        </section>
      </div>
    </div>
    <!-- Global navigation components -->
    <floating-chat />
    <sidebar-menu />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter, type RouteLocationAsPathGeneric, type RouteLocationAsRelativeGeneric } from 'vue-router'
// Import custom composables for various functionalities
import useCurrentUser from '../composables/useCurrentUser'  // User authentication and profile
import useQuestions from '../composables/useQuestions'      // Question management
import useSubscriptions from '../composables/useSubscriptions' // Subscription management
import useMeetings from '../composables/useMeetings'        // Meeting management
import useFormatDate from '../composables/useFormatDate'    // Date formatting utilities

// Initialize Vue Router for navigation
const router = useRouter()

// Set up composables with necessary dependencies
const { currentUser, loadCurrentUser } = useCurrentUser()
const { searchQuery, searchResults, userQuestions, fetchAllQuestions, searchQuestions } = useQuestions(currentUser)
const { subscribedQuestions, fetchSubscribedQuestions } = useSubscriptions(currentUser)
const { myMeetings, fetchMeetings } = useMeetings(currentUser)
const { formatDate, formatTime } = useFormatDate()

// Define categories for the security knowledge management system
// Each category has a display label and a route for navigation
const categories = [
  { label: 'Asset', route: '/asset' },
  { label: 'Threat', route: '/threat' },
  { label: 'Security Goal', route: '/security-goal' },
  { label: 'Countermeasure', route: '/countermeasure' },
  { label: 'Defense Strategy', route: '/defense-strategy' },
  { label: 'Vulnerability', route: '/vulnerability' }
]

// Unified navigation function to handle routing to different sections
const navigateTo = (route: import('vue-router').RouteLocationRaw) => router.push(route)

// On component mount, load user data and fetch all relevant information
onMounted(async () => {
  // First load user details to determine permissions
  await loadCurrentUser()

  // If user is successfully authenticated, load personalized data
  if (currentUser.value) {
    // Load all data in parallel for better performance
    await Promise.all([
      fetchAllQuestions(),      // Fetch questions for search and user's questions
      fetchSubscribedQuestions(), // Fetch questions the user is subscribed to
      fetchMeetings()           // Fetch the user's scheduled meetings
    ])
  }
})
</script>

<style scoped>
/* Main container styling for the dashboard */
.dashboard-container {
  padding: 20px;
}

/* Layout for the dashboard content area */
.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Grid layout for dashboard cards to create responsive columns */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

/* Grid layout for category buttons */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

/* Individual card styling */
.dashboard-card {
  margin-top: 20px;
}

/* Search input and button container */
.search-box {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

/* Reset list styling for question and result lists */
.results-box ul,
.dashboard-card ul {
  list-style: none;
  padding: 0;
  margin-top: 10px;
}

/* Custom styling for welcome message in header */
.page-header p {
  font-size: 1rem;
  color: #555;
  margin-top: 5px;
}
</style>
