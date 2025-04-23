<template>
  <div class="dashboard-container">
    <div class="page-header">
      <h1>Security Knowledge Management System</h1>
      <p>Welcome, {{ currentUser?.email }}! You are logged in as an {{ currentUser?.role }}</p>
    </div>

    <div class="dashboard-content">
      <section class="dashboard-card container">
        <div class="section-header">
          <h2>Categories</h2>
        </div>
        <div class="categories-grid">
          <button @click="navigateToAsset" class="button button-primary">Asset</button>
          <button @click="navigateToThreat" class="button button-primary">Threat</button>
          <button @click="navigateToSecurityGoal" class="button button-primary">
            Security Goal
          </button>
          <button @click="navigateToCountermeasure" class="button button-primary">
            Countermeasure
          </button>
          <button @click="navigateToDefenseStrategy" class="button button-primary">
            Defense Strategy
          </button>
          <button @click="navigateToVulnerability" class="button button-primary">
            Vulnerability
          </button>
        </div>
      </section>

      <div class="dashboard-grid">
        <section class="dashboard-card container">
          <div class="section-header">
            <h2>Search Questions</h2>
          </div>
          <div class="search-box">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search questions..."
              class="input"
            />
            <button @click="searchQuestions" class="button button-success">Search</button>
          </div>
          <div class="results-box">
            <h3 class="subsection-header">Search Results</h3>
            <ul>
              <li v-for="(q, index) in searchResults" :key="index" class="question-item">
                <router-link :to="`/question/${q.id}`">{{ q.question }}</router-link>
                <small>{{ formatDate(q.timestamp) }}</small>
                <small>Category: {{ q.category }}</small>
                <small>Asked by: {{ q.user_email }}</small>
              </li>
            </ul>
          </div>
        </section>

        <section class="dashboard-card container">
          <div class="section-header">
            <h2>My Questions</h2>
          </div>
          <ul>
            <li v-for="(q, index) in userQuestions" :key="index" class="question-item">
              <router-link :to="`/question/${q.id}`">{{ q.question }}</router-link>
              <small>{{ formatDate(q.timestamp) }}</small>
              <small>Category: {{ q.category }}</small>
            </li>
          </ul>
        </section>

        <section class="dashboard-card container">
          <div class="section-header">
            <h2>Subscribed Questions</h2>
          </div>
          <ul>
            <li v-for="(q, index) in subscribedQuestions" :key="index" class="question-item">
              <router-link :to="`/question/${q.id}`">{{ q.question }}</router-link>
              <small>{{ formatDate(q.timestamp) }}</small>
              <small>Category: {{ q.category }}</small>
              <small>Asked by: {{ q.user_email }}</small>
            </li>
          </ul>
        </section>

        <section class="dashboard-card container">
          <div class="section-header">
            <h2>My Meetings</h2>
          </div>
          <ul>
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
    <floating-chat />
    <sidebar-menu />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import useCurrentUser from '../composables/useCurrentUser'
import useQuestions from '../composables/useQuestions'
import useSubscriptions from '../composables/useSubscriptions'
import useMeetings from '../composables/useMeetings'
import useFormatDate from '../composables/useFormatDate'

// Initialize router
const router = useRouter()

// Initialize user composable
const { currentUser, loadCurrentUser } = useCurrentUser()

// Initialize other composables with the current user ref
const { searchQuery, searchResults, userQuestions, fetchAllQuestions, searchQuestions: originalSearchQuestions } =
  useQuestions(currentUser)

// Wrap searchQuestions to handle @click event
const searchQuestions = () => originalSearchQuestions()
const { subscribedQuestions, fetchSubscribedQuestions } = useSubscriptions(currentUser)
const { myMeetings, fetchMeetings } = useMeetings(currentUser)
const { formatDate, formatTime } = useFormatDate()

// Load data on component mount
onMounted(async () => {
  await loadCurrentUser()
  if (currentUser.value) {
    await fetchAllQuestions()
    await fetchSubscribedQuestions()
    await fetchMeetings()
  }
})

// navigate to different pages
const navigateToAsset = () => {
  router.push('/asset')
}
const navigateToThreat = () => {
  router.push('/threat')
}

const navigateToSecurityGoal = () => {
  router.push('/security-goal')
}

const navigateToCountermeasure = () => {
  router.push('/countermeasure')
}

const navigateToDefenseStrategy = () => {
  router.push('/defense-strategy')
}

const navigateToVulnerability = () => {
  router.push('/vulnerability')
}
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.dashboard-card {
  margin-top: 20px;
}

.search-box {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.results-box ul,
.dashboard-card ul {
  list-style: none;
  padding: 0;
  margin-top: 10px;
}

/* Override/adjust the page-header spacing specifically for dashboard */
.page-header p {
  font-size: 1rem;
  color: #555;
  margin-top: 5px;
}
</style>
