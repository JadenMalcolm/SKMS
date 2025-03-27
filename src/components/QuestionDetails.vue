<template>
  <div class="question-details-container">
    <h1>Question Details</h1>
    <div v-if="questionDetails">
      <p v-if="!isEditing">{{ questionDetails.question }}</p>
      <textarea v-else v-model="editText" class="edit-input" maxlength="500"></textarea>
      <small>
        Asked on:
        {{
          new Date(questionDetails.timestamp).toLocaleString([], {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })
        }}
      </small>
      <small>Asked by: {{ questionDetails.user_email }}</small>

      <!-- Display buttons and actions -->
      <button
        v-if="currentUser && !isSubscribedToQuestion"
        @click="subscribeToQuestion"
        class="subscribe-button"
      >
        Subscribe
      </button>
      <button
        v-if="currentUser && isSubscribedToQuestion"
        @click="unsubscribeFromQuestion"
        class="unsubscribe-button"
      >
        Unsubscribe
      </button>
      <button
        v-if="currentUser?.role === 'admin' || currentUser?.email === questionDetails.user_email || currentUser?.role === `expert-${questionDetails.category.trim().toLowerCase()}`"
        @click="deleteQuestion"
        class="delete-button"
      >
        Delete Question
      </button>
      <button
        v-if="currentUser?.email === questionDetails.user_email"
        @click="toggleEdit"
        class="edit-button"
      >
        {{ isEditing ? 'Save' : 'Edit' }}
      </button>
      <button @click="upvoteQuestion" class="upvote-button">Upvote ({{ upvoteCount }})</button>
      <button @click="downvoteQuestion" class="downvote-button">
        Downvote ({{ downvoteCount }})
      </button>
      <button @click="reportQuestion" class="report-button">Report ({{ reportCount }})</button>

      <!-- Response Section -->
      <div class="response-section">
        <textarea
          v-model="newResponseText"
          placeholder="Type your response here..."
          class="response-input"
        ></textarea>
        <button @click="postResponse" class="post-button">Post Response</button>
      </div>

      <!-- Responses List -->
      <div class="responses" v-if="responseList.length">
        <h2>Responses</h2>
        <div v-for="response in responseList" :key="response.id" class="response">
          <p v-if="!response.isEditing">{{ response.response }}</p>
          <textarea
            v-else
            v-model="response.editText"
            class="edit-input"
            maxlength="500"
          ></textarea>
          <small>
            Responded on:
            {{
              new Date(response.timestamp).toLocaleString([], {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })
            }}
          </small>
          <small>Responded by: {{ response.user_email }}</small>
          <button v-if="response.user_email === currentUser?.email" @click="editResponse(response)">
            {{ response.isEditing ? 'Save' : 'Edit' }}
          </button>
          <button v-if="currentUser?.role === 'admin'" @click="deleteResponse(response.id)">
            Delete
          </button>
        </div>
      </div>

      <!-- Feedback message box -->
      <div v-if="feedbackMessage" class="feedback-box">
        <p>{{ feedbackMessage }}</p>
      </div>
    </div>
    <div v-else>
      <p class="loading">Loading...</p>
    </div>
  </div>
  <FloatingChat/>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

// Define interfaces for Question, Response, and User
interface Question {
  id: number
  question: string
  category: string
  timestamp: string
  user_email: string
}

interface Response {
  id: number
  response: string
  timestamp: string
  user_email: string
  isEditing?: boolean
  editText?: string
}

interface User {
  id: number
  email: string
  role: string
}


const route = useRoute()
const router = useRouter()
const questionDetails = ref<Question | null>(null)
const newResponseText = ref('')
const responseList = ref<Response[]>([])
const currentUser = ref<User | null>(null)
const isSubscribedToQuestion = ref(false)
const isEditing = ref(false)
const editText = ref('')
const upvoteCount = ref(0)
const downvoteCount = ref(0)
const reportCount = ref(0)
const feedbackMessage = ref('') // Variable to hold feedback messages

onMounted(async () => {
  // Fetch the current user from session storage
  const storedUser = sessionStorage.getItem('user')
  if (storedUser) {
    currentUser.value = JSON.parse(storedUser)
  }

  // Fetch question details and responses by the question id using vue router
  const questionId = route.params.id
  try {
    const questionResponse = await axios.get<Question>(
      `http://localhost:5000/questions/${questionId}`,
    )
    questionDetails.value = questionResponse.data
    editText.value = questionDetails.value.question

    const responsesResponse = await axios.get<Response[]>(
      `http://localhost:5000/questions/${questionId}/responses`,
    )
    // Map the responses to include editing state
    responseList.value = responsesResponse.data.map((response) => ({
      ...response,
      isEditing: false,
      editText: response.response,
    }))
    // Fetch upvote, downvote, and report counts in a single call
    const countsResponse = await axios.get(`http://localhost:5000/questions/${questionId}/counts`)
    upvoteCount.value = countsResponse.data.upvotes
    downvoteCount.value = countsResponse.data.downvotes
    reportCount.value = countsResponse.data.reports

    // Check if the current user is subscribed to the question
    if (currentUser.value) {
      const subscriptionResponse = await axios.get<boolean>(
        `http://localhost:5000/subscriptions/${currentUser.value.id}/${questionId}`,
      )
      isSubscribedToQuestion.value = subscriptionResponse.data
    }
  } catch (error) {
    console.error('Error fetching question details or responses:', error)
  }
})

// Functions that now use feedbackMessage instead of alert
const postResponse = async () => {
  // ensures there is no leading or trailing whitespace
  if (!newResponseText.value.trim() || newResponseText.value.length > 500) return
  try {
    // Check if the user is logged in
    if (!currentUser.value) throw new Error('User not logged in.')
    // Post the new response to the server
    const response = await axios.post(`http://localhost:5000/responses`, {
      question_id: route.params.id,
      user_id: currentUser.value.id,
      response: newResponseText.value,
    })
    // Add the new response to the response list
    responseList.value.unshift({
      id: response.data.id,
      response: newResponseText.value,
      timestamp: new Date().toISOString(),
      user_email: currentUser.value.email,
      isEditing: false,
      editText: newResponseText.value,
    })
    newResponseText.value = ''
    feedbackMessage.value = 'Response posted successfully!'
  } catch (error) {
    console.error('Error posting response:', error)
    feedbackMessage.value = 'Error posting response.'
  }
}
// Function to edit a response
const editResponse = async (response: Response) => {
  // Check if the response is currently being edited
  if (response.isEditing) {
    if (response.editText && response.editText.length > 500) {
      feedbackMessage.value = 'Response text exceeds the character limit of 500.'
      return
    }
    try {
      await axios.put(`http://localhost:5000/responses/${response.id}`, {
        response: response.editText,
      })
      // Update the response text with the edited text or keep the original if editText is empty
      response.response = response.editText || response.response
      // Reset the editing state
      response.isEditing = false
      feedbackMessage.value = 'Response updated successfully!'
    } catch (error) {
      console.error('Error updating response:', error)
      feedbackMessage.value = 'Error updating response.'
    }
  } else {
    response.isEditing = true
  }
}
// Function to delete a response
const deleteResponse = async (responseId: number) => {
  try {
    await axios.delete(`http://localhost:5000/responses/${responseId}`)
    responseList.value = responseList.value.filter((response) => response.id !== responseId)
    feedbackMessage.value = 'Response deleted successfully!'
  } catch (error) {
    console.error('Error deleting response:', error)
    feedbackMessage.value = 'Error deleting response.'
  }
}
// Function to delete a question
const deleteQuestion = async () => {
  try {
    await axios.delete(`http://localhost:5000/questions/${route.params.id}`)
    feedbackMessage.value = 'Question deleted successfully!'
    router.push('/dashboard')
  } catch (error) {
    console.error('Error deleting question:', error)
    feedbackMessage.value = 'Error deleting question.'
  }
}
// Function to toggle edit mode for the question
const toggleEdit = async () => {
  // Check if question is being edited
  if (isEditing.value) {
    if (editText.value.length > 500) {
      feedbackMessage.value = 'Question text exceeds the character limit of 500.'
      return
    }
    try {
      await axios.put(`http://localhost:5000/questions/${route.params.id}`, {
        question: editText.value,
        category: questionDetails.value!.category,
        user_id: currentUser.value!.id,
      })
      questionDetails.value!.question = editText.value
      feedbackMessage.value = 'Question updated successfully!'
    } catch (error) {
      console.error('Error updating question:', error)
      feedbackMessage.value = 'Error updating question.'
    }
  }
  isEditing.value = !isEditing.value
}

// Function to subscribe to a question
const subscribeToQuestion = async () => {
  try {
    // Check if the user is logged in
    if (!currentUser.value) throw new Error('User not logged in.')
    // Post the subscription to the server
    await axios.post(`http://localhost:5000/subscriptions`, {
      user_id: currentUser.value.id,
      question_id: route.params.id,
    })

    isSubscribedToQuestion.value = true
    feedbackMessage.value = 'Subscribed to question successfully!'
  } catch (error) {
    console.error('Error subscribing to question:', error)
    feedbackMessage.value = 'Error subscribing to question.'
  }
}

// Function to unsubscribe from a question
const unsubscribeFromQuestion = async () => {
  try {
    if (!currentUser.value) throw new Error('User not logged in.')
    // Delete the subscription from the server
    await axios.delete(`http://localhost:5000/subscriptions`, {
      data: {
        user_id: currentUser.value.id,
        question_id: route.params.id,
      },
    })

    isSubscribedToQuestion.value = false
    feedbackMessage.value = 'Unsubscribed from question successfully!'
  } catch (error) {
    console.error('Error unsubscribing from question:', error)
    feedbackMessage.value = 'Error unsubscribing from question.'
  }
}
// Function to upvote a question
const upvoteQuestion = async () => {
  try {
    // Check if the user is logged in
    if (!currentUser.value) throw new Error('User not logged in.')
    // Post the upvote to the server
    await axios.post(`http://localhost:5000/questions/${route.params.id}/upvote`, {
      user_id: currentUser.value.id,
    })

    const countsResponse = await axios.get(`http://localhost:5000/questions/${route.params.id}/counts`)
    upvoteCount.value = countsResponse.data.upvotes
    downvoteCount.value = countsResponse.data.downvotes
    reportCount.value = countsResponse.data.reports

    feedbackMessage.value = 'Question upvoted successfully!'
  } catch (error) {
    console.error('Error upvoting question:', error)
    feedbackMessage.value = 'Error upvoting question.'
  }
}

const downvoteQuestion = async () => {
  try {
    if (!currentUser.value) throw new Error('User not logged in.')
    // Post the downvote to the server
    await axios.post(`http://localhost:5000/questions/${route.params.id}/downvote`, {
      user_id: currentUser.value.id,
    })

    const countsResponse = await axios.get(`http://localhost:5000/questions/${route.params.id}/counts`)
    upvoteCount.value = countsResponse.data.upvotes
    downvoteCount.value = countsResponse.data.downvotes
    reportCount.value = countsResponse.data.reports

    feedbackMessage.value = 'Question downvoted successfully!'
  } catch (error) {
    console.error('Error downvoting question:', error)
    feedbackMessage.value = 'Error downvoting question.'
  }
}

const reportQuestion = async () => {
  try {
    if (!currentUser.value) throw new Error('User not logged in.')
    // Post the report to the server
    await axios.post(`http://localhost:5000/questions/${route.params.id}/report`, {
      user_id: currentUser.value.id,
    })

    const countsResponse = await axios.get(`http://localhost:5000/questions/${route.params.id}/counts`)
    upvoteCount.value = countsResponse.data.upvotes
    downvoteCount.value = countsResponse.data.downvotes
    reportCount.value = countsResponse.data.reports

    feedbackMessage.value = 'Question reported successfully!'
  } catch (error) {
    console.error('Error reporting question:', error)
    feedbackMessage.value = 'Error reporting question.'
  }
}
</script>

<style scoped>
.feedback-box {
  margin-top: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f4f4f4;
  color: #333;
}

.feedback-box p {
  margin: 0;
  font-size: 14px;
}

.question-details-container {
  padding: 20px;
  max-width: 800px;
  margin: auto;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 2rem;
  margin-bottom: 20px;
  color: #333;
}

small {
  display: block;
  margin-top: 5px;
  color: #666;
}

button {
  border: 0;
  border-radius: 24px;
  padding: 10px 16px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color .3s ease;
  margin-top: 5px;
  margin-right: 3px;
  margin-left: 3px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.subscribe-button {
  background-color: #4caf50;
  color: white;
}

.unsubscribe-button {
  background-color: #f44336;
  color: white;
}

.delete-button {
  background-color: #ff9800;
  color: white;
}

.edit-button {
  background-color: #007bff;
  color: white;
}

.upvote-button {
  background-color: #4caf50;
  color: white;
}

.downvote-button {
  background-color: #f44336;
  color: white;
}

.report-button {
  background-color: #ff9800;
  color: white;
}

.response-section {
  margin-top: 20px;
}

.response-input {
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  resize: none;
  height: 96px;
  border: 1px solid #414141;
  background-color: transparent;
  font-family: inherit;
}

.post-button {
  background-color: #2196f3;
  color: white;
}

.responses {
  margin-top: 20px;
}

.response {
  border: 1px solid #ccc;
  padding: 10px;
  margin-top: 10px;
  border-radius: 5px;
  background-color: #f9f9f9;
}

.edit-input {
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  resize: none;
  height: 96px;
  border: 1px solid #414141;
  background-color: transparent;
  font-family: inherit;
}

.loading {
  text-align: center;
  font-size: 1.5rem;
}
</style>
