<template>
  <div class="main-container">
    <div class="dashboard-container">
      <h1>Welcome, {{ user?.email }}!</h1>
      <h2>You are logged in as: {{ user?.role }}</h2>
      <p>You have successfully logged in.</p>
      <button @click="logout" class="logout-button">Logout</button>
    </div>

    <div class="ask-container">
      <h2>Ask a Question</h2>
      <input
        type="text"
        v-model="askQuery"
        placeholder="Type your question here..."
        class="ask-input"
      />
      <button @click="submitQuestion" class="ask-button">Submit Question</button>

      <!-- Scrollable Questions Box -->
      <div class="questions-box">
        <h3>Questions Asked</h3>
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
            <small> Asked by: {{ q.user_email }}</small>
            <!-- Display user email -->
          </li>
        </ul>
        <h3>My Questions</h3>
        <ul>
          <li v-for="(q, index) in myQuestions" :key="index">
            <div v-if="!q.isEditing">
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
              <button @click="editQuestion(q)">Edit</button>
            </div>
            <div v-else>
              <input v-model="q.editText" />
              <button @click="saveQuestion(q)">Save</button>
            </div>
          </li>
        </ul>
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
}
interface User {
  id: number
  email: string
  role: string
}
const router = useRouter()
const askQuery = ref('')
const questions = ref<Question[]>([]) // Holds the list of questions
const myQuestions = ref<Question[]>([]) // Holds the list of questions asked by the logged-in user
const subscribedQuestions = ref<Question[]>([]) // Holds the list of subscribed questions
const user = ref<User | null>(null)

const filteredQuestions = computed(() => {
  return questions.value.filter((q) => q.user_email !== user.value?.email)
})

onMounted(async () => {
  const storedUser = sessionStorage.getItem('user')
  if (storedUser) {
    user.value = JSON.parse(storedUser)
    if (user.value) {
      try {
        // Fetch all questions
        const response = await axios.get(`http://localhost:5000/questions`)
        questions.value = response.data

        // Filter questions asked by the logged-in user
        myQuestions.value = questions.value
          .filter((q) => q.user_email === user.value?.email)
          .map((q) => ({ ...q, isEditing: false, editText: q.question }))

        // Fetch subscribed questions
        const subscribedResponse = await axios.get(
          `http://localhost:5000/users/${user.value.id}/subscriptions`,
        )
        subscribedQuestions.value = subscribedResponse.data
      } catch (error) {
        console.error('Error fetching questions:', error)
      }
    }
  } else {
    alert('Session expired. Please log in again.')
    router.push('/') // Redirect to login if no user is found
  }
})

const logout = () => {
  sessionStorage.removeItem('user') // Clear user data on logout
  alert('Logging out...')
  router.push('/') // Navigate back to the Login page
}

const submitQuestion = async () => {
  if (askQuery.value.trim()) {
    try {
      if (!user.value) throw new Error('User not logged in.')

      // Save the question
      const response = await axios.post('http://localhost:5000/questions', {
        userId: user.value.id,
        question: askQuery.value,
      })

      // Add the question locally
      const newQuestion = {
        id: response.data.id,
        question: askQuery.value,
        timestamp: new Date().toISOString(),
        user_email: user.value.email, // Use the current user's email
        isEditing: false,
        editText: askQuery.value,
      }
      questions.value.unshift(newQuestion)
      myQuestions.value.unshift(newQuestion)

      alert(`Your question was saved: ${askQuery.value}`)
      askQuery.value = '' // Clear the input field after saving
    } catch (error) {
      console.error('Error submitting question:', error)
      alert('Failed to save the question.')
    }
  } else {
    alert('Please enter a question to ask.')
  }
}

const editQuestion = (question: Question) => {
  question.isEditing = true
}

const saveQuestion = async (question: Question) => {
  try {
    await axios.put(`http://localhost:5000/questions/${question.id}`, {
      question: question.editText,
    })
    if (question.editText !== undefined) {
      question.question = question.editText
    }
    question.isEditing = false
    alert('Question updated successfully!')
  } catch (error) {
    console.error('Error updating question:', error)
  }
}
</script>

<style scoped>
.main-container {
  display: flex;
  justify-content: space-between;
  padding: 20px;
}
.dashboard-container {
  width: 30%;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
.dashboard-container h1 {
  font-size: 1.5rem;
}
.dashboard-container p {
  font-size: 1rem;
}
.logout-button {
  padding: 10px 15px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.ask-container {
  width: 65%;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
.ask-container h2 {
  font-size: 1.5rem;
}
.ask-input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
.ask-button {
  padding: 10px 15px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.questions-box {
  max-height: 600px;
  overflow-y: auto;
  margin-top: 20px;
}
.questions-box h3 {
  font-size: 1.2rem;
}
.questions-box ul {
  list-style: none;
  padding: 0;
}
.questions-box li {
  margin-bottom: 10px;
}
.questions-box li small {
  display: block;
  font-size: 0.8rem;
  color: #666;
}
.questions-box li a {
  text-decoration: none;
  color: #333;
}
.questions-box li a:hover {
  text-decoration: underline;
}
</style>
