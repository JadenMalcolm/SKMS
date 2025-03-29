<template>
  <div class="main-container">
    <div class="header">Security Knowledge Management System</div>
    <div class="categories-container">
      <button @click="navigateToAsset" class="category-button button button-primary">Asset</button>
      <button @click="navigateToThreat" class="category-button button button-primary">Threat</button>
      <button @click="navigateToSecurityGoal" class="category-button button button-primary">Security Goal</button>
      <button @click="navigateToCountermeasure" class="category-button button button-primary">Countermeasure</button>
      <button @click="navigateToDefenseStrategy" class="category-button button button-primary">Defense Strategy</button>
      <button @click="navigateToVulnerability" class="category-button button button-primary">Vulnerability</button>
    </div>
    <div class="content-container">
      <div class="dashboardSearch-container">
        <h1>Welcome, {{ currentUser?.email }}!</h1>

        <p>You are logged in as an {{ currentUser?.role }}</p>
        <button @click="logout" class="logout-button button button-danger">Logout</button>

        <div class="search-container">
          <h2>Search Questions</h2>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search questions..."
            class="search-input input"
          />
          <button @click="searchQuestions" class="search-button button button-success">Search</button>

          <div class="questions-box">
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
                <!-- Display user email -->
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="browse-container">
        <div class="questions-container">
          <div class="questions-box">
            <h3>My Questions</h3>
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
          </div>

          <div class="questions-box">
            <h3>Subscribed Questions</h3>
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
          </div>
        </div>

        <div class="questions-box">
          <h2>Browse All Questions</h2>
          <ul>
            <li v-for="(q, index) in filteredQuestions" :key="index">
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

        <div class="questions-box">
          <h2>My Meetings</h2>
          <ul>
            <li v-for="(meeting, index) in myMeetings" :key="index" class="meeting-item compact-meeting">
              <p>
                <strong>Category:</strong> {{ meeting.category }} |
                <strong>Date:</strong> {{ formatDate(meeting.date) }} |
                <strong>Time:</strong> {{ formatTime(meeting.time) }} |
                <strong>Type:</strong> {{ meeting.meeting_type }} |
                <strong>Email:</strong> {{ meeting.expert_email || meeting.user_email }} |
                <strong>Status:</strong> {{ meeting.status }}
              </p>
            </li>
          </ul>
        </div>
      </div>

      <!-- Message Box -->
    </div>
  </div>
  <FloatingChat />
  <SidebarMenu />
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
  expert_email?: string
  user_email?: string
  status: string
}

const myMeetings = ref<Meeting[]>([])

// filter function to get questions not asked by the current user
const filteredQuestions = computed(() => {
  return allQuestions.value.filter((q) => q.user_email !== currentUser.value?.email)
})

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
  console.log(formatTime("14:30"));
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
      const endpoint =
        currentUser.value.role.startsWith('expert')
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
  const [hour, minute] = time.split(':');
  const date = new Date();
  date.setHours(parseInt(hour), parseInt(minute));
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
};

const formatDate = (date: string) => {
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return date; // Return the original string if parsing fails
  }
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
  const day = String(parsedDate.getDate()).padStart(2, '0');
  const year = parsedDate.getFullYear();
  return `${month}/${day}/${year}`;
};

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

// function to handle logout
const logout = () => {
  sessionStorage.removeItem('user')
  router.push('/')
}

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
.main-container {
  display: flex;
  flex-direction: column;
  padding: 10px;
  background-color: #f0f0f0;
}
.header {
  font-size: 2rem;
  text-align: center;
  margin-top: 20px;
  color: #333;
  background-color: #f0f0f0;
  padding-bottom: 20px;
}
.categories-container {
  display: flex;
  justify-content: space-around;
  padding: 10px;
  background-color: #fff;
  margin-bottom: 10px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}
.button {
  padding: 10px 16px;
  color: white;
  border: 0;
  border-radius: 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}
.button-primary {
  background-color: #2196f3;
}
.button-primary:hover {
  background-color: #1976d2;
}
.button-danger {
  background-color: #f44336;
}
.button-danger:hover {
  background-color: #d32f2f;
}
.button-success {
  background-color: #4caf50;
}
.button-success:hover {
  background-color: #45a049;
}
.button-fixed {
  position: fixed;
  top: 20px;
  left: 20px;
  background: #007bff;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.3);
}
.button-fixed:hover {
  background-color: #0056b3;
}
.category-button {
  width: 200px;
}
.content-container {
  display: flex;
  justify-content: space-between;
  background-color: #f0f0f0;
}
.dashboardSearch-container,
.browse-container {
  padding: 15px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}
.dashboardSearch-container {
  width: 40%;
  text-align: center;
  margin-right: 10px;
}
.browse-container {
  width: 65%;
  padding-right: 20px;
}
.dashboardSearch-container h1,
.dashboardSearch-container h2,
.browse-container h2 {
  color: #333;
}
.dashboardSearch-container h1 {
  font-size: 1.5rem;
}
.dashboardSearch-container h2,
.browse-container h2 {
  font-size: 1rem;
}
.dashboardSearch-container p {
  font-size: 0.9rem;
  color: #555;
}
.input {
  width: 98%;
  padding: 8px;
  margin-bottom: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
.questions-box {
  max-height: 500px;
  overflow-y: auto;
  margin-top: 15px;
}
.questions-box h3 {
  font-size: 1rem;
  color: #333;
}
.questions-box ul {
  list-style: none;
  padding: 0;
}
.questions-box li {
  margin-bottom: 8px;
  padding: 8px;
  background-color: #f9f9f9;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
.questions-box li small {
  display: block;
  font-size: 0.7rem;
  color: #666;
}
.questions-box li a {
  text-decoration: none;
  color: #007bff;
}
.questions-box li a:hover {
  text-decoration: underline;
}
.meeting-item {
  margin-bottom: 8px;
  padding: 10px;
  background-color: #f0f8ff;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
.meeting-item p {
  margin: 5px 0;
  font-size: 0.9rem;
  color: #333;
}
.meeting-item strong {
  color: #007bff;
}
.message-box {
  margin-top: 20px;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 5px;
  text-align: center;
  font-weight: bold;
}
.compact-meeting p {
  margin: 5px 0;
  font-size: 0.85rem;
  color: #333;
  line-height: 1.4;
}
.compact-meeting strong {
  color: #007bff;
}
</style>
