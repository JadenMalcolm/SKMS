<template>
  <div>
    <h1>Reset Password</h1>
    <p>Email: {{ email }}</p>
    <p>Security Question: {{ securityQuestion }}</p>
    <input v-model="answer" placeholder="Enter your answer" />
    <button @click="checkAnswer">Submit</button>
    <p v-if="errorMessage">{{ errorMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const email = ref<string>(sessionStorage.getItem('recoverEmail') || '')
const securityQuestion = ref<string>('')
const answer = ref<string>('')
const errorMessage = ref<string>('')
const router = useRouter()

const fetchSecurityQuestion = async () => {
  try {
    const response = await axios.post('http://localhost:5000/recover', {
      email: email.value,
    })
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

const checkAnswer = async () => {
  try {
    const response = await axios.post('http://localhost:5000/verify_answer', {
      email: email.value,
      securityQuestionAnswer: answer.value,
    })
    if (response.data.message === 'Answer is correct') {
      alert('Answer is correct. You can reset your password.')
      router.push('/PasswordReset') // Redirect to password reset page
    }
  } catch (error) {
    errorMessage.value = 'Incorrect answer. Please try again.'
  }
}

onMounted(fetchSecurityQuestion)
</script>

<style scoped>
/* Add your styles here */
</style>
