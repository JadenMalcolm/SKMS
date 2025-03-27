<template>
  <div class="main-container">
    <div class="ask-container">
      <h2>Ask a Question</h2>
      <input
        type="text"
        v-model="newQuestionText"
        placeholder="Type your question here..."
        class="ask-input"
      />
      <button @click="submitQuestion" class="ask-button">Submit Question</button>
      <div class="search-container">
        <h2>Search {{ category }} Questions</h2>
        <input
          type="text"
          v-model="searchQuery"
          :placeholder="searchPlaceholder"
          class="search-input"
        />
        <button @click="searchQuestions" class="search-button">Search</button>
      </div>
      <div class="search-results">
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
          </li>
        </ul>
      </div>
    </div>
    <div class="questions-box">
      <h3>{{ category }} Questions</h3>
      <ul>
        <li v-for="(q, index) in categoryQuestions" :key="index">
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
        </li>
      </ul>
    </div>
    <!-- Feedback message box -->
  </div>
  <div v-if="feedbackMessage" class="feedback-box">
    <p>{{ feedbackMessage }}</p>
  </div>
  <FloatingChat />
</template>

<script setup lang="ts">
import { ref, onMounted, computed, defineProps } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

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

const props = defineProps<{ category: string }>()
const router = useRouter()
const newQuestionText = ref('')
const searchQuery = ref('')
const allQuestions = ref<Question[]>([])
const categoryQuestions = ref<Question[]>([])
const searchResults = ref<Question[]>([])
const currentUser = ref<User | null>(null)
const searchPlaceholder = computed(() => `Search ${props.category.toLowerCase()} questions...`)
const feedbackMessage = ref('')

onMounted(async () => {
  const storedUser = sessionStorage.getItem('user')
  if (storedUser) {
    currentUser.value = JSON.parse(storedUser)
  } else {
    feedbackMessage.value = 'Session expired. Please log in again.'
    router.push('/')
  }

  try {
    const response = await axios.get('http://localhost:5000/questions')
    allQuestions.value = response.data
    categoryQuestions.value = allQuestions.value.filter((q) => q.category === props.category)
  } catch (error) {
    console.error('Error fetching questions:', error)
    feedbackMessage.value = 'Error fetching questions.'
  }
})

const submitQuestion = async () => {
  if (newQuestionText.value.trim()) {
    try {
      if (!currentUser.value) throw new Error('User not logged in.')

      const response = await axios.post('http://localhost:5000/questions', {
        userId: currentUser.value.id,
        question: newQuestionText.value,
        category: props.category,
      })

      const newQuestion = {
        id: response.data.id,
        question: newQuestionText.value,
        category: props.category,
        timestamp: new Date().toLocaleString(),
        user_email: currentUser.value.email,
        isEditing: false,
        editText: newQuestionText.value,
      }
      allQuestions.value.unshift(newQuestion)
      categoryQuestions.value.unshift(newQuestion)

      feedbackMessage.value = `Your question was saved: ${newQuestionText.value}`
      newQuestionText.value = ''
    } catch (error) {
      console.error('Error submitting question:', error)
      feedbackMessage.value = 'Failed to save the question.'
    }
  } else {
    feedbackMessage.value = 'Please enter a question to ask.'
  }
}

const searchQuestions = async () => {
  try {
    const response = await axios.post('http://localhost:5000/questions/search', {
      query: searchQuery.value,
    })
    searchResults.value = response.data.filter(
      (q: { category: string }) => q.category === props.category,
    )
  } catch (error) {
    console.error('Error searching questions:', error)
    feedbackMessage.value = 'Error searching questions.'
  }
}
</script>

<style scoped>
.main-container {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background-color: #f0f0f0;
}
.ask-container {
  width: 40%;
  padding: 15px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  text-align: center;
  margin-right: 10px;
}
.ask-container h2 {
  font-size: 1.2rem;
  color: #333;
  padding: 5px
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
  border: 0;
  border-radius: 24px;
  padding: 10px 16px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color .3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}
.ask-button:hover,
.search-button:hover {
  background-color: #45a049;
}
.questions-box {
  width: 65%;
  padding: 15px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding-right: 20px;
}
.questions-box h3 {
  font-size: 1.2rem;
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
.search-results h3 {
  font-size: 1.2rem;
  color: #333;
  padding: 5px;
}
.search-results ul {
  list-style: none;
  padding: 0;
}
.search-results li {
  margin-bottom: 8px;
  padding: 8px;
  background-color: #f9f9f9;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
.search-results li small {
  display: block;
  font-size: 0.7rem;
  color: #666;
}
.search-results li a {
  text-decoration: none;
  color: #007bff;
}
.search-results li a:hover {
  text-decoration: underline;
}
.feedback-box {
  margin-top: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f4f4f4;
  color: #333;
}
.feedback-box p {
  margin: 0;
  font-size: 14px;
}
</style>
