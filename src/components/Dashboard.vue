<template>
  <div class="main-container">
    <div class="header">Security Knowledge Management System</div>
    <div class="categories-container">
      <button @click="navigateToAsset" class="category-button">Asset</button>
      <button @click="navigateToThreat" class="category-button">Threat</button>
      <button @click="navigateToSecurityGoal" class="category-button">Security Goal</button>
      <button @click="navigateToCountermeasure" class="category-button">Countermeasure</button>
      <button @click="navigateToDefenseStrategy" class="category-button">Defense Strategy</button>
      <button @click="navigateToVulnerability" class="category-button">Vulnerability</button>
    </div>
    <div class="content-container">
      <div class="dashboardSearch-container">
        <h1>Welcome, {{ currentUser?.email }}!</h1>

        <p>You are logged in as an {{ currentUser?.role }}</p>
        <button @click="logout" class="logout-button">Logout</button>

        <div class="search-container">
          <h2>Search Questions</h2>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search questions..."
            class="search-input"
          />
          <button @click="searchQuestions" class="search-button">Search</button>

          <div class="questions-box">
            <h3>Search Results</h3>
            <ul>
              <li v-for="(q, index) in searchResults" :key="index">
                <router-link :to="'/question/${q.id}'">{{ q.question }}</router-link>
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
      </div>

      <!-- Message Box -->
    </div>
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
  try {
    const response = await axios.post(`http://localhost:5000/questions/search`, {
      query: searchQuery.value,
    })
    searchResults.value = response.data
  } catch (error) {
    console.error('Error searching questions:', error)
  }
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
.category-button {
  padding: 10px 15px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}
.category-button:hover {
  background-color: #1976d2;
}
.content-container {
  display: flex;
  justify-content: space-between;
  background-color: #f0f0f0;
}
.dashboardSearch-container {
  width: 40%;
  padding: 15px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  text-align: center;
  margin-right: 10px;
}

.dashboardSearch-container h1 {
  font-size: 1.5rem;
  color: #333;
}

.dashboardSearch-container h2 {
  font-size: 1rem;
  color: #666;
}

.dashboardSearch-container p {
  font-size: 0.9rem;
  color: #555;
}

.logout-button {
  padding: 8px 12px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.logout-button:hover {
  background-color: #d32f2f;
}

.browse-container {
  width: 65%;
  padding: 15px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding-right: 20px;
}

.browse-container h2 {
  font-size: 1rem;
  color: #333;
}

.ask-input,
.search-input {
  width: 98%;
  padding: 8px;
  margin-bottom: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.ask-button,
.search-button {
  padding: 8px 12px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}
.search-button:hover {
  background-color: #45a049;
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

.edit-input {
  width: 80%;
  padding: 8px;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.delete-button {
  margin-top: 5px;
  padding: 5px 10px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.delete-button:hover {
  background-color: #d32f2f;
}

/* Message Box */
.message-box {
  margin-top: 20px;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 5px;
  text-align: center;
  font-weight: bold;
}
</style>
