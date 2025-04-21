<template>
  <div class="page-header">
    <h1>Reset Password</h1>
  </div>
  <div class="reset-container">
    <div class="reset-box container">
      <div class="question-info">
        <p><strong>Email:</strong> {{ email }}</p>
        <p><strong>Security Question:</strong> {{ securityQuestion }}</p>
      </div>
      <div class="form-group">
        <input v-model="answer" placeholder="Enter your answer" class="input" />
      </div>
      <button class="button button-success full-width" @click="checkAnswer">Submit</button>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// imports
import axios from 'axios'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// variables
const email = ref<string>(sessionStorage.getItem('recoverEmail') || '')
const securityQuestion = ref<string>('')
const answer = ref<string>('')
const errorMessage = ref<string>('')
const successMessage = ref<string>('')
const router = useRouter()

// function to fetch security question
const fetchSecurityQuestion = async () => {
  try {
    const response = await axios.post('http://localhost:5000/recover', {
      email: email.value,
    })
    // Check if the response contains a security question
    securityQuestion.value = response.data.securityQuestion
  } catch (error) {
    if (
      (error as any).response &&
      (error as any).response.data &&
      (error as any).response.data.error
    ) {
      errorMessage.value = (error as any).response.data.error
    } else {
      errorMessage.value = 'Failed to fetch security question.'
    }
  }
}

// function to check answer of security question
const checkAnswer = async () => {
  try {
    // Check if the answer is correct
    const response = await axios.post('http://localhost:5000/verify_answer', {
      email: email.value,
      securityQuestionAnswer: answer.value,
    })
    // Push user to password reset if answer is correct
    if (response.data.message === 'Answer is correct') {
      successMessage.value = 'Answer is correct. You can reset your password.'
      sessionStorage.setItem('user', JSON.stringify({ email: email.value })) // Store user session
      router.replace('/password-reset') // Redirect to password reset page
    } else {
      errorMessage.value = 'Incorrect answer. Please try again.'
    }
  } catch (error) {
    errorMessage.value = 'Failed to verify answer.'
  }
}

// function to log out user
const logout = () => {
  sessionStorage.removeItem('user')
  successMessage.value = 'Session expired. Please log in again.'
  router.replace('/')
}

onMounted(() => {
  const storedUser = sessionStorage.getItem('user')
  if (!storedUser) {
    logout()
  } else {
    fetchSecurityQuestion()
  }
})
</script>

<style scoped>
.reset-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 70vh;
  padding-top: 30px;
  background-color: #f0f0f0;
}

.reset-box {
  width: 400px;
  padding: 30px;
}

.question-info {
  margin-bottom: 20px;
  text-align: left;
  padding: 10px;
  background-color: #f9fbff;
  border-radius: 8px;
  border-left: 3px solid #4c95e8;
}
.form-group {
  margin: 1rem 0 1.5rem;
}

.success-message,
.error-message {
  margin-top: 15px;
  padding: 10px;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
}

.success-message {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
}
.full-width {
  width: 100%;
}
</style>
