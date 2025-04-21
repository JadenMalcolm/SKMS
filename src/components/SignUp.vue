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
            v-model="emailInput"
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
              v-model="passwordInput"
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
              v-model="confirmPasswordInput"
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
      <div v-if="message" class="error-message">{{ message }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
// imports
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

// variables
const emailInput = ref('')
const passwordInput = ref('')
const confirmPasswordInput = ref('')
const router = useRouter()
const securityChoice = ref('')
const securityQuestionAnswer = ref('')
const message = ref('')
const peakPassword = ref(false)
const peakConfirmPassword = ref(false)

// function to toggle password visibility
const togglePeakPassword = () => {
  peakPassword.value = !peakPassword.value
}

// function to toggle confirm password visibility
const togglePeakConfirmPassword = () => {
  peakConfirmPassword.value = !peakConfirmPassword.value
}

// function to handle sign up
const handleSignUp = async () => {
  if (passwordInput.value !== confirmPasswordInput.value) {
    message.value = 'Passwords do not match!'
    return
  }
  try {
    await axios.post('http://localhost:5000/signup', {
      email: emailInput.value.toLowerCase(), // Convert email to lowercase
      password: passwordInput.value,
      securityQuestion: securityChoice.value,
      securityQuestionAnswer: securityQuestionAnswer.value,
    })

    message.value = 'New Account Created!'
    router.push('/')
  } catch (error) {
    // Handle error response from the backend
    if (
      (error as any).response &&
      (error as any).response.data &&
      (error as any).response.data.error
    ) {
      message.value = (error as any).response.data.error // Display backend error message
    } else {
      message.value = 'Signup failed'
    }
  }
}
</script>

<style scoped>
.container{
  padding: 40px
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
