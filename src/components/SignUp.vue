<template>
  <!-- Page header -->
  <header class="page-header">
    <h1>Create Account</h1>
  </header>

  <!-- Main signup container -->
  <div class="login-container">
    <div class="container">
      <!-- Signup form with email, password, and security questions -->
      <form @submit.prevent="handleSignUp">
        <!-- Email input field -->
        <div class="form-group">
          <input type="email" v-model="email" placeholder="Enter your email" class="input" required />
        </div>

        <!-- Password input with visibility toggle -->
        <div class="form-group">
          <div class="password-wrapper">
            <input
              :type="peakPassword ? 'text' : 'password'"
              v-model="password"
              placeholder="Enter your password"
              class="input"
              required
            />
            <span class="toggle-password" @click="togglePeakPassword">
              <img v-if="!peakPassword" src="../assets/eye.svg" alt="Show password" />
              <img v-else src="../assets/eye-off.svg" alt="Hide password" />
            </span>
          </div>
        </div>

        <!-- Password confirmation with visibility toggle -->
        <div class="form-group">
          <div class="password-wrapper">
            <input
              :type="peakConfirmPassword ? 'text' : 'password'"
              v-model="confirmPassword"
              placeholder="Re-enter your password"
              class="input"
              required
            />
            <span class="toggle-password" @click="togglePeakConfirmPassword">
              <img v-if="!peakConfirmPassword" src="../assets/eye.svg" alt="Show password" />
              <img v-else src="../assets/eye-off.svg" alt="Hide password" />
            </span>
          </div>
        </div>

        <!-- Security question dropdown selector -->
        <div class="form-group">
          <select v-model="securityChoice" class="input" required>
            <option value="" disabled>Select a Security Question</option>
            <option v-for="question in securityQuestions" :key="question" :value="question">
              {{ question }}
            </option>
          </select>
        </div>

        <!-- Security question answer field - only visible when question is selected -->
        <div class="form-group" v-if="securityChoice">
          <input
            type="text"
            v-model="securityQuestionAnswer"
            placeholder="Enter your answer"
            class="input"
            required
          />
        </div>
        <button type="submit" class="button button-success full-width">Create Account</button>
      </form>

      <!-- Error message display -->
      <div v-if="signupMessage" class="error-message">{{ signupMessage }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import useAuth from '../composables/useAuth' // Import authentication composable

// Extract required methods and state from auth composable
const {
  email, password, confirmPassword, securityChoice, securityQuestionAnswer, signupMessage,
  peakPassword, peakConfirmPassword, togglePeakPassword, togglePeakConfirmPassword, handleSignUp
} = useAuth()

// Define security questions list for account recovery
const securityQuestions = [
  'What was the name of your childhood pet?',
  'What is your mother\'s maiden name?',
  'What was the name of your first school?',
  'What is your favorite book?',
  'What is your favorite movie?',
  'What is your favorite food?',
  'What city were you born in?',
  'What is your father\'s middle name?',
  'What was the make and model of your first car?',
  'What was the name of your first employer?',
  'What is your favorite color?',
  'What is your favorite sport?',
  'What is your favorite hobby?',
  'What is your favorite vacation destination?',
  'What is your favorite animal?'
]
</script>

<style scoped>
/* Form container styling */
.container {
  padding: 40px;
}

/* Layout container for centering the form */
.login-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 30px;
}

/* Full width button styling with top margin */
.full-width {
  width: 100%;
  margin-top: 15px;
}

/* Form field group spacing */
.form-group {
  margin-bottom: 15px;
}
</style>
