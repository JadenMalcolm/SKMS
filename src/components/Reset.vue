<template>
  <!-- Page header -->
  <header class="page-header"><h1>Reset Password</h1></header>

  <!-- Main container for security question verification -->
  <div class="reset-container">
    <div class="reset-box container">
      <!-- Display user info and security question -->
      <div class="info-box">
        <p><strong>Email:</strong> {{ email }}</p>
        <p><strong>Security Question:</strong> {{ securityQuestion }}</p>
      </div>

      <!-- Security answer input -->
      <input v-model="answer" placeholder="Enter your answer" class="input mb-20" />
      <button class="button button-success full-width" @click="checkAnswer">Submit</button>

      <!-- Status message display (error or success) -->
      <p v-if="errorMessage || successMessage"
         :class="errorMessage ? 'error-message' : 'success-message'">
        {{ errorMessage || successMessage }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import usePasswordReset from '../composables/usePasswordReset' // Import password reset composable

// Extract required methods and state from password reset composable
const { email, securityQuestion, answer, errorMessage, successMessage,
        fetchSecurityQuestion, checkAnswer, checkAuth } = usePasswordReset()

// On component mount, verify the reset token and load the security question
onMounted(() => {
  checkAuth()           // Verify token validity
  fetchSecurityQuestion() // Load user's security question
})
</script>

<style scoped>
/* Main container with centered layout */
.reset-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 70vh;
  padding-top: 30px;
  background-color: #f0f0f0;
}

/* Form container styling */
.reset-box {
  width: 400px;
  padding: 30px;
}

/* User information display box with accent border */
.info-box {
  margin-bottom: 20px;
  text-align: left;
  padding: 10px;
  background-color: #f9fbff;
  border-radius: 8px;
  border-left: 3px solid #4c95e8;
}

/* Utility class for bottom margin */
.mb-20 {
  margin-bottom: 20px;
}

/* Utility class for full width elements */
.full-width {
  width: 100%;
}
</style>
