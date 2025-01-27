<template>
  <div class="question-details-container">
    <h1>Question Details</h1>
    <div v-if="question">
      <p>{{ question.question }}</p>
      <small>Asked on: {{ new Date(question.timestamp).toLocaleString() }}</small>
      <small>Asked by: {{ question.user_email }}</small> <!-- Display user email -->
      <button v-if="user && !isSubscribed" @click="subscribeToQuestion">Subscribe</button>
      <button v-if="user && isSubscribed" @click="unsubscribeFromQuestion">Unsubscribe</button>
      <div class="response-section">
        <textarea v-model="responseText" placeholder="Type your response here..."></textarea>
        <button @click="postResponse">Post Response</button>
      </div>
      <div class="responses" v-if="responses.length">
        <h2>Responses</h2>
        <div v-for="response in responses" :key="response.id" class="response">
          <p v-if="!response.isEditing">{{ response.response }}</p>
          <textarea v-else v-model="response.editText"></textarea>
          <small>Responded on: {{ new Date(response.timestamp).toLocaleString() }}</small>
          <small>Responded by: {{ response.user_email }}</small> <!-- Display user email -->
          <button v-if="response.user_email === user?.email" @click="editResponse(response)">
            {{ response.isEditing ? 'Save' : 'Edit' }}
          </button>
        </div>
      </div>
    </div>
    <div v-else>
      <p class="loading">Loading...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

interface Question {
      question: string;
      timestamp: string;
      user_email: string;
    }

    interface Response {
      id: number;
      response: string;
      timestamp: string;
      user_email: string;
      isEditing?: boolean;
      editText?: string;
    }

    interface User {
      id: number;
      email: string;
    }
const route = useRoute()
const question = ref<{ question: string; timestamp: string; user_email: string } | null>(null)
const responseText = ref('')
const responses = ref<{ id: number; response: string; timestamp: string; user_email: string; isEditing?: boolean; editText?: string }[]>([])
const user = ref<{ id: number; email: string } | null>(null)
const isSubscribed = ref(false)


onMounted(async () => {
  const storedUser = sessionStorage.getItem('user')
  if (storedUser) {
    user.value = JSON.parse(storedUser)
  }

  const questionId = route.params.id
  try {
    const questionResponse = await axios.get<Question>(`http://localhost:5000/questions/${questionId}`)
    question.value = questionResponse.data

    const responsesResponse = await axios.get<Response[]>(`http://localhost:5000/questions/${questionId}/responses`)
    responses.value = responsesResponse.data.map(response => ({ ...response, isEditing: false, editText: response.response }))

    if (user.value) {
      const subscriptionResponse = await axios.get<boolean>(`http://localhost:5000/subscriptions/${user.value.id}/${questionId}`)
      isSubscribed.value = subscriptionResponse.data
    }
  } catch (error) {
    console.error('Error fetching question details or responses:', error)
  }
})


const postResponse = async () => {
  if (!responseText.value.trim()) return
  try {
    if (!user.value) throw new Error('User not logged in.')

    const response = await axios.post(`http://localhost:5000/responses`, {
      question_id: route.params.id,
      user_id: user.value.id,
      response: responseText.value
    })
    responses.value.unshift({
      id: response.data.id,
      response: responseText.value,
      timestamp: new Date().toISOString(),
      user_email: user.value.email, // Use the current user's email
      isEditing: false,
      editText: responseText.value
    }) // Add the new response to the top of the list
    responseText.value = ''
    alert('Response posted successfully!')
  } catch (error) {
    console.error('Error posting response:', error)
  }
}

const editResponse = async (response: { id: number; response: string; timestamp: string; user_email: string; isEditing?: boolean; editText?: string }) => {
  if (response.isEditing) {
    try {
      await axios.put(`http://localhost:5000/responses/${response.id}`, {
        response: response.editText
      })
      response.response = response.editText || response.response
      response.isEditing = false
      alert('Response updated successfully!')
    } catch (error) {
      console.error('Error updating response:', error)
    }
  } else {
    response.isEditing = true
  }
}

const subscribeToQuestion = async () => {
  try {
    if (!user.value) throw new Error('User not logged in.')

    await axios.post(`http://localhost:5000/subscriptions`, {
      user_id: user.value.id,
      question_id: route.params.id
    })

    isSubscribed.value = true
    alert('Subscribed to question successfully!')
  } catch (error) {
    console.error('Error subscribing to question:', error)
  }
}

const unsubscribeFromQuestion = async () => {
  try {
    if (!user.value) throw new Error('User not logged in.')

    await axios.delete(`http://localhost:5000/subscriptions`, {
      data: {
        user_id: user.value.id,
        question_id: route.params.id
      }
    })

    isSubscribed.value = false
    alert('Unsubscribed from question successfully!')
  } catch (error) {
    console.error('Error unsubscribing from question:', error)
  }
}
</script>

<style scoped>
.question-details-container {
  padding: 20px;
  max-width: 800px;
  margin: auto;
}
.response-section {
  margin-top: 20px;
}
.response {
  border: 1px solid #ccc;
  padding: 10px;
  margin-top: 10px;
}
.loading {
  text-align: center;
  font-size: 1.5rem;
}
</style>
