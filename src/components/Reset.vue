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
import { onMounted } from 'vue'
import usePasswordReset from '../composables/usePasswordReset'

// Use the composable
const {
  email,
  securityQuestion,
  answer,
  errorMessage,
  successMessage,
  fetchSecurityQuestion,
  checkAnswer,
  logout,
  checkAuth,
} = usePasswordReset()

onMounted(() => {
  checkAuth()
  fetchSecurityQuestion()
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
