<template>
  <div class="dashboard-container">
    <header class="dashboard-header">
      <h1>Security Knowledge Management System</h1>
      <p>Welcome, {{ currentUser?.email }}! You are logged in as an {{ currentUser?.role }}</p>
    </header>

    <div class="dashboard-content">
      <section class="dashboard-card container">
        <h2>Categories</h2>
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
          <h2>Search Questions</h2>
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
            <h3>Search Results</h3>
            <ul>
              <li v-for="(q, index) in searchResults" :key="index">
                <router-link :to="`/question/${q.id}`">{{ q.question }}</router-link>
                <small>{{
                  new Date(q.timestamp).toLocaleString([], {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                }}</small>
                <small>Category: {{ q.category }}</small>
                <small>Asked by: {{ q.user_email }}</small>
              </li>
            </ul>
          </div>
        </section>

        <section class="dashboard-card container">
          <h2>My Questions</h2>
          <ul>
            <li v-for="(q, index) in userQuestions" :key="index">
              <router-link :to="`/question/${q.id}`">{{ q.question }}</router-link>
              <small>{{
                new Date(q.timestamp).toLocaleString([], {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              }}</small>
              <small>Category: {{ q.category }}</small>
            </li>
          </ul>
        </section>

        <section class="dashboard-card container">
          <h2>Subscribed Questions</h2>
          <ul>
            <li v-for="(q, index) in subscribedQuestions" :key="index">
              <router-link :to="`/question/${q.id}`">{{ q.question }}</router-link>
              <small>{{
                new Date(q.timestamp).toLocaleString([], {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              }}</small>
              <small>Category: {{ q.category }}</small>
              <small>Asked by: {{ q.user_email }}</small>
            </li>
          </ul>
        </section>

        <section class="dashboard-card container">
          <h2>My Meetings</h2>
          <ul>
            <li v-for="(meeting, index) in myMeetings" :key="index" class="meeting-item">
              <p>
                <strong>Date:</strong> {{ formatDate(meeting.date) }} | <strong>Time:</strong>
                {{ formatTime(meeting.time) }} | <strong>Type:</strong> {{ meeting.meeting_type }} |
                <strong>Email:</strong> {{ meeting.target_user_email || meeting.user_email }} |
                <strong>Status:</strong> {{ meeting.status }}
              </p>
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
// imports
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

// interfaces for Question and User
interface Question {
  id: number
  question: string
  category: string
  timestamp: string
  user_email: string
  isEditing?: boolean
  editText?: string
  report_count?: number
}

interface User {
  id: number
  email: string
  role: string
}

// Variables
const router = useRouter()
const searchQuery = ref('')
const allQuestions = ref<Question[]>([])
const searchResults = ref<Question[]>([])
const userQuestions = ref<Question[]>([])
const subscribedQuestions = ref<Question[]>([])
const currentUser = ref<User | null>(null)
interface Meeting {
  category: string
  date: string
  time: string
  meeting_type: string
  target_user_email?: string
  user_email?: string
  status: string
}

const myMeetings = ref<Meeting[]>([])

// function to get subscribed questions
const fetchSubscribedQuestions = async () => {
  if (currentUser.value) {
    try {
      const subscribedResponse = await axios.get(
        `http://localhost:5000/users/${currentUser.value.id}/subscriptions`,
      )
      subscribedQuestions.value = subscribedResponse.data
    } catch (error) {
      console.error('Error fetching subscribed questions:', error)
    }
  }
}
// function to handle question search
const searchQuestions = async () => {
  console.log(formatTime('14:30'))
  try {
    const response = await axios.post(`http://localhost:5000/questions/search`, {
      query: searchQuery.value,
    })
    searchResults.value = response.data
  } catch (error) {
    console.error('Error searching questions:', error)
  }
}

const fetchMeetings = async () => {
  if (currentUser.value) {
    try {
      const endpoint = currentUser.value.role.startsWith('expert')
        ? `http://localhost:5000/accepted-meetings/${currentUser.value.id}`
        : `http://localhost:5000/meetings/${currentUser.value.id}`
      const response = await axios.get(endpoint)
      myMeetings.value = response.data
    } catch (error) {
      console.error('Error fetching meetings:', error)
    }
  }
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

onMounted(async () => {
  // Check if user session exists
  const storedUser = sessionStorage.getItem('user')
  if (storedUser) {
    // Parse the stored user data
    currentUser.value = JSON.parse(storedUser)
    if (currentUser.value) {
      // Fetch all questions and filter them
      // based on the current user's email
      try {
        const response = await axios.get(`http://localhost:5000/questions`)
        allQuestions.value = response.data

        userQuestions.value = allQuestions.value
          .filter((q) => q.user_email === currentUser.value?.email)
          .map((q) => ({ ...q, isEditing: false, editText: q.question }))

        await fetchSubscribedQuestions()
        await fetchMeetings()
      } catch (error) {
        console.error('Error fetching questions:', error)
      }
    }
  } else {
    router.push('/')
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
  font-family: Arial, sans-serif;
  padding: 20px;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 20px;
}

.dashboard-header h1 {
  font-size: 2rem;
  color: #333;
}

.dashboard-header p {
  font-size: 1rem;
  color: #555;
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
  background: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
}

.dashboard-card h2 {
  margin-bottom: 15px;
  color: #333;
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
}

.results-box li,
.dashboard-card li,
.meeting-item {
  margin-bottom: 10px;
  padding: 10px;
  background-color: #f0f8ff; /* Blue background color */
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.results-box li small,
.dashboard-card li small,
.meeting-item p {
  display: block;
  font-size: 0.85rem;
  color: #555;
}

.results-box li a,
.dashboard-card li a {
  text-decoration: none;
  color: #007bff;
}

.results-box li a:hover,
.dashboard-card li a:hover {
  text-decoration: underline;
}

.meeting-item p strong {
  color: #007bff; /* Blue color for strong text */
}

.button-danger {
  background: linear-gradient(90deg, #f44336, #d32f2f); /* Gradient background */
}

.button-danger:hover {
  background: linear-gradient(90deg, #d32f2f, #b71c1c); /* Darker gradient on hover */
  transform: scale(1.05); /* Slight zoom effect */
}

.button-success {
  background: linear-gradient(90deg, #4caf50, #388e3c); /* Gradient background */
}

.button-success:hover {
  background: linear-gradient(90deg, #388e3c, #2e7d32); /* Darker gradient on hover */
  transform: scale(1.05); /* Slight zoom effect */
}
</style>
