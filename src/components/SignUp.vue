<template>
  <div class="page-header">
    <h1>Create Account</h1>
  </div>
  <div class="login-container">
    <div class="container">
      <form @submit.prevent="handleSignUp">
        <div class="form-group">
          <input
            type="email"
            id="email"
            v-model="email"
            placeholder="Enter your email"
            class="input"
            required
          />
        </div>
        <div class="form-group">
          <div class="password-wrapper">
            <input
              :type="peakPassword ? 'text' : 'password'"
              id="password"
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
              id="password2"
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
        <div class="form-group">
          <select id="securityQuestion" v-model="securityChoice" class="input" required>
            <option value="" disabled>Select a Security Question</option>
            <option value="What was the name of your childhood pet?">
              What was the name of your childhood pet?
            </option>
            <option value="What is your mother's maiden name?">
              What is your mother's maiden name?
            </option>
            <option value="What was the name of your first school?">
              What was the name of your first school?
            </option>
            <option value="What is your favorite book?">What is your favorite book?</option>
            <option value="What is your favorite movie?">What is your favorite movie?</option>
            <option value="What is your favorite food?">What is your favorite food?</option>
            <option value="What city were you born in?">What city were you born in?</option>
            <option value="What is your father's middle name?">
              What is your father's middle name?
            </option>
            <option value="What was the make and model of your first car?">
              What was the make and model of your first car?
            </option>
            <option value="What was the name of your first employer?">
              What was the name of your first employer?
            </option>
            <option value="What is your favorite color?">What is your favorite color?</option>
            <option value="What is your favorite sport?">What is your favorite sport?</option>
            <option value="What is your favorite hobby?">What is your favorite hobby?</option>
            <option value="What is your favorite vacation destination?">
              What is your favorite vacation destination?
            </option>
            <option value="What is your favorite animal?">What is your favorite animal?</option>
          </select>
        </div>
        <div class="form-group" v-if="securityChoice">
          <input
            type="text"
            id="securityAnswer"
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

// Use the auth composable
const {
  email,
  password,
  confirmPassword,
  securityChoice,
  securityQuestionAnswer,
  signupMessage,
  peakPassword,
  peakConfirmPassword,
  togglePeakPassword,
  togglePeakConfirmPassword,
  handleSignUp,
} = useAuth()
</script>

<style scoped>
.container {
  padding: 40px;
}
.page-header {
  text-align: center;
  margin-bottom: 20px;
}

.login-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 50px;
}

.full-width {
  width: 100%;
}

.form-group {
  margin-bottom: 15px; /* Add spacing between input boxes */
}
</style>
