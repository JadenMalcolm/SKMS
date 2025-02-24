<template>
  <div class="header">Create Account</div>
  <div class="login-container">
    <div class="login-box">
      <form @submit.prevent="handleSignUp">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="emailInput"
            placeholder="Enter your email"
            required
          />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            v-model="passwordInput"
            placeholder="Enter your password"
            required
          />
        </div>
        <div class="form-group">
          <label for="password2">Confirm Password</label>
          <input
            type="password"
            id="password2"
            v-model="confirmPasswordInput"
            placeholder="Re-enter your password"
            required
          />
        </div>
        <div class="form-group">
          <label for="securityQuestion">Select a Security Question</label>
          <select id="securityQuestion" v-model="securityChoice" required>
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
          <label for="securityAnswer">Answer</label>
          <input
            type="text"
            id="securityAnswer"
            v-model="securityQuestionAnswer"
            placeholder="Enter your answer"
            required
          />
        </div>
        <button type="submit" class="login-button">Create Account</button>
      </form>
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

// function to handle sign up
const handleSignUp = async () => {
  if (passwordInput.value !== confirmPasswordInput.value) {
    alert('Passwords do not match!')
    return
  }
  try {
    await axios.post('http://localhost:5000/signup', {
      email: emailInput.value,
      password: passwordInput.value,
      securityQuestion: securityChoice.value,
      securityQuestionAnswer: securityQuestionAnswer.value,
    })

    alert('New Account Created!')
    router.push('/')
  } catch (error) {
    // Handle error response from the backend
    if (
      (error as any).response &&
      (error as any).response.data &&
      (error as any).response.data.error
    ) {
      alert((error as any).response.data.error)
    } else {
      alert('Signup failed')
    }
  }
}
</script>

<style scoped>
.header {
  font-size: 2rem;
  text-align: center;
  margin-top: 30px;
  color: #333;
  background-color: #f0f0f0;
}
.login-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  height: 100vh;
  padding-top: 30px;
  background-color: #f0f0f0;
}
.login-box {
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
.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #555;
}
.form-group input {
  width: 95%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-bottom: 20px;
}
.login-button {
  width: 100%;
  padding: 12px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}
.login-button:hover {
  background-color: #45a049;
}
.signup-link {
  text-align: center;
  margin-top: 10px;
  color: #555;
}
.signup-link a {
  color: #007bff;
  text-decoration: none;
}
.signup-link a:hover {
  text-decoration: underline;
}
</style>
