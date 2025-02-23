<template>
  <div class="ask-container">
    <h2>Ask a Question</h2>
    <input
      type="text"
      v-model="newQuestionText"
      placeholder="Type your question here..."
      class="ask-input"
    />
    <button @click="submitQuestion" class="ask-button">Submit Question</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
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

const router = useRouter()
const newQuestionText = ref('')
const allQuestions = ref<Question[]>([])
const userQuestions = ref<Question[]>([])
const currentUser = ref<User | null>(null)

onMounted(async () => {
  const storedUser = sessionStorage.getItem('user')
  if (storedUser) {
    currentUser.value = JSON.parse(storedUser)
  } else {
    alert('Session expired. Please log in again.')
    router.push('/')
  }
})

const submitQuestion = async () => {
  if (newQuestionText.value.trim()) {
    try {
      if (!currentUser.value) throw new Error('User not logged in.')

      const response = await axios.post('http://localhost:5000/questions', {
        userId: currentUser.value.id,
        question: newQuestionText.value,
        category: 'Defense Strategy',
      })

      const newQuestion = {
        id: response.data.id,
        question: newQuestionText.value,
        category: 'Defense Strategy',
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
.ask-container {
  padding: 15px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  text-align: center;
}
.ask-input {
  width: 98%;
  padding: 8px;
  margin-bottom: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
.ask-button {
  padding: 8px 12px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}
.ask-button:hover {
  background-color: #45a049;
}
</style>
