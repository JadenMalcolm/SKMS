<template>
  <!-- Page header -->
  <header class="page-header"><h1>Recover Password</h1></header>

  <!-- Main container for password recovery form -->
  <div class="recover-container">
    <div class="recover-box container">
      <!-- Email submission form -->
      <form @submit.prevent="handleRecover(email)">
        <input
          type="email"
          v-model="email"
          placeholder="Enter your email"
          required
          class="input mb-20"
        />
        <button type="submit" class="button button-success full-width">Submit</button>
      </form>

      <!-- Status message display (error or success) -->
      <p v-if="message" :class="isError ? 'error-message' : 'success-message'">
        {{ message }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import usePasswordReset from '../composables/usePasswordReset' // Import password reset composable

// Local state for email input
const email = ref('')

// Extract required methods and state from password reset composable
const { handleRecover, message, isError } = usePasswordReset()
</script>

<style scoped>
/* Main container with centered layout */
.recover-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 70vh;
  padding-top: 30px;
  background-color: #f0f0f0;
}

/* Form container styling */
.recover-box {
  width: 400px;
  padding: 30px;
  text-align: center;
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
