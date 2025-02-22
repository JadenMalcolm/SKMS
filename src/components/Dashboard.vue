<template>
  <div class="main-container">
    <div class="categories-container">
      <button class="category-button">Asset</button>
      <button class="category-button">Threat</button>
      <button class="category-button">Security Goal</button>
      <button class="category-button">Countermeasure</button>
      <button class="category-button">Defense Strategy</button>
      <button class="category-button">Vulnerability</button>
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
                <small>Asked by: {{ q.user_email }}</small>
                <!-- Display user email -->
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="browse-container">
        <div class="ask-container">
          <h2>Ask a Question</h2>
          <input
            type="text"
            v-model="newQuestionText"
            placeholder="Type your question here..."
            class="ask-input"
          />
          <button @click="submitQuestion" class="ask-button">Submit Question</button>

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
                <small>Asked by: {{ q.user_email }}</small>
                <!-- Display user email -->
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
              <small>Asked by: {{ q.user_email }}</small>
              <!-- Display user email -->
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

interface Question {
  id: number
  question: string
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

const router = useRouter()
const newQuestionText = ref('')
const searchQuery = ref('')
const allQuestions = ref<Question[]>([])
const searchResults = ref<Question[]>([])
const userQuestions = ref<Question[]>([])
const subscribedQuestions = ref<Question[]>([])
const currentUser = ref<User | null>(null)

const filteredQuestions = computed(() => {
  return allQuestions.value.filter((q) => q.user_email !== currentUser.value?.email)
})

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
  const storedUser = sessionStorage.getItem('user')
  if (storedUser) {
    currentUser.value = JSON.parse(storedUser)
    if (currentUser.value) {
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
    alert('Session expired. Please log in again.')
    router.push('/')
  }
})

const logout = () => {
  sessionStorage.removeItem('user')
  alert('Logging out...')
  router.push('/')
}

const submitQuestion = async () => {
  if (newQuestionText.value.trim()) {
    try {
      if (!currentUser.value) throw new Error('User not logged in.')

      const response = await axios.post('http://localhost:5000/questions', {
        userId: currentUser.value.id,
        question: newQuestionText.value,
      })

      const newQuestion = {
        id: response.data.id,
        question: newQuestionText.value,
        timestamp: new Date().toLocaleString(),
        user_email: currentUser.value.email,
        isEditing: false,
        editText: newQuestionText.value,
      }
      allQuestions.value.unshift(newQuestion)
      userQuestions.value.unshift(newQuestion)

      alert(`Your question was saved: ${newQuestionText.value}`)
      newQuestionText.value = ''
    } catch (error) {
      console.error('Error submitting question:', error)
      alert('Failed to save the question.')
    }
  } else {
    alert('Please enter a question to ask.')
  }
}
</script>

<style scoped>
.main-container {
  display: flex;
  flex-direction: column;
  padding: 10px;
  background-color: #f0f0f0;
}
.categories-container {
  display: flex;
  justify-content: space-around;
  padding: 10px;
  background-color: #fff;
  margin-bottom: 10px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1)
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
.ask-button:hover,
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
</style>
