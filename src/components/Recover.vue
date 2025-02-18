<template>
  <div class="header">Recover Password</div>
  <div class="recover-container">
    <div class="recover-box">
      <form @submit.prevent="handleRecover">
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="email" placeholder="Enter your email" required />
        </div>
        <div class="form-group">
          <label for="recoveryQuestion">Where did you grow up</label>
          <input
            type="securityAnswer"
            id="securityAnswer"
            v-model="securityQuestionAnswer"
            placeholder="Enter your Answer"
            required
          />
        </div>
        <button type="submit" class="recover-button">Submit</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const email = ref('')
const securityQuestionAnswer = ref('')
const router = useRouter()

const handleRecover = async () => {
  try {
    const response = await axios.post('http://localhost:5000/recover', {
      email: email.value,
      securityQuestionAnswer: securityQuestionAnswer.value,
    })

    const user = response.data.user
    sessionStorage.setItem('user', JSON.stringify(user))
    alert('Authentication successful!')
    router.push('/Reset')
  } catch (error) {
    alert('Recovery failed')
  }
}
</script>
