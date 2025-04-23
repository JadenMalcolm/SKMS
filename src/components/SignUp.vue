<template>
  <header class="page-header">
    <h1>Create Account</h1>
  </header>
  <div class="login-container">
    <div class="container">
      <form @submit.prevent="handleSignUp">
        <!-- Email field -->
        <div class="form-group">
          <input type="email" v-model="email" placeholder="Enter your email" class="input" required />
        </div>

        <!-- Password fields -->
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

        <!-- Security question selection -->
        <div class="form-group">
          <select v-model="securityChoice" class="input" required>
            <option value="" disabled>Select a Security Question</option>
            <option v-for="question in securityQuestions" :key="question" :value="question">
              {{ question }}
            </option>
          </select>
        </div>

        <!-- Security answer field -->
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
      <div v-if="signupMessage" class="error-message">{{ signupMessage }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import useAuth from '../composables/useAuth'

const {
  email, password, confirmPassword, securityChoice, securityQuestionAnswer, signupMessage,
  peakPassword, peakConfirmPassword, togglePeakPassword, togglePeakConfirmPassword, handleSignUp
} = useAuth()

// Define security questions as a constant
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
.container {
  padding: 40px;
}

.login-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 30px;
}

.full-width {
  width: 100%;
  margin-top: 15px;
}

.form-group {
  margin-bottom: 15px;
}
</style>
