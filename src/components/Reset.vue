<template>
  <div class="header">Reset Password</div>
  <div class="reset-container">
    <div class="reset-box">
      <p>Email: {{ email }}</p>
      <p>Security Question: {{ securityQuestion }}</p>
      <div class="form-group">
        <input v-model="answer" placeholder="Enter your answer" />
      </div>
      <button class="reset-button" @click="checkAnswer">Submit</button>
      <p v-if="errorMessage">{{ errorMessage }}</p>
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
      alert('Answer is correct. You can reset your password.')
      sessionStorage.setItem('user', JSON.stringify({ email: email.value })) // Store user session
      router.replace('/passwordreset') // Redirect to password reset page
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
  alert('Session expired. Please log in again.')
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
.header {
  font-size: 2rem;
  text-align: center;
  margin-top: 30px;
  color: #333;
  background-color: #f0f0f0;
}
.reset-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  height: 100vh;
  padding-top: 30px;
  background-color: #f0f0f0;
}
.reset-box {
  width: 350px;
  padding: 30px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  text-align: center;
}
.form-group {
  margin-bottom: 20px;
  text-align: left;
}
.form-group input {
  width: 95%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
.reset-button {
  width: 100%;
  padding: 12px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}
.reset-button:hover {
  background-color: #45a049;
}
</style>
