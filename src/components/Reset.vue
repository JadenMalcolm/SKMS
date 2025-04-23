<template>
  <header class="page-header"><h1>Reset Password</h1></header>
  <div class="reset-container">
    <div class="reset-box container">
      <div class="info-box">
        <p><strong>Email:</strong> {{ email }}</p>
        <p><strong>Security Question:</strong> {{ securityQuestion }}</p>
      </div>
      <input v-model="answer" placeholder="Enter your answer" class="input mb-20" />
      <button class="button button-success full-width" @click="checkAnswer">Submit</button>
      <p v-if="errorMessage || successMessage"
         :class="errorMessage ? 'error-message' : 'success-message'">
        {{ errorMessage || successMessage }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import usePasswordReset from '../composables/usePasswordReset'

const { email, securityQuestion, answer, errorMessage, successMessage,
        fetchSecurityQuestion, checkAnswer, checkAuth } = usePasswordReset()

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

.info-box {
  margin-bottom: 20px;
  text-align: left;
  padding: 10px;
  background-color: #f9fbff;
  border-radius: 8px;
  border-left: 3px solid #4c95e8;
}

.mb-20 {
  margin-bottom: 20px;
}

.full-width {
  width: 100%;
}
</style>
