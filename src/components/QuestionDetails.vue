<template>
  <div class="question-details-container">
    <h1>Question Details</h1>
    <div v-if="questionDetails">
      <p v-if="!isEditing">{{ questionDetails.question }}</p>
      <textarea v-else v-model="editText" class="edit-input" maxlength="500"></textarea>
      <small>Asked on: {{ formatDate(questionDetails.timestamp) }}</small>
      <small>Asked by: {{ questionDetails.user_email }}</small>

      <!-- Display buttons and actions -->
      <button
        v-if="currentUser && !isSubscribedToQuestion"
        @click="subscribeToQuestion"
        class="button button-success"
      >
        Subscribe
      </button>
      <button
        v-if="currentUser && isSubscribedToQuestion"
        @click="unsubscribeFromQuestion"
        class="button button-danger"
      >
        Unsubscribe
      </button>
      <button v-if="canDeleteQuestion" @click="deleteQuestion" class="button button-warning">
        Delete Question
      </button>
      <button v-if="isQuestionOwner" @click="toggleEdit" class="button button-primary">
        {{ isEditing ? 'Save' : 'Edit' }}
      </button>
      <button @click="handleVote('upvote')" class="button button-success">
        Upvote ({{ upvoteCount }})
      </button>
      <button @click="handleVote('downvote')" class="button button-danger">
        Downvote ({{ downvoteCount }})
      </button>
      <button @click="handleVote('report')" class="button button-warning">
        Report ({{ reportCount }})
      </button>

      <!-- Response Section -->
      <div class="response-section">
        <textarea
          v-model="newResponseText"
          placeholder="Type your response here..."
          class="response-input"
        ></textarea>
        <button @click="postResponse" class="button button-primary">Post Response</button>
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
          <small>Responded on: {{ formatDate(response.timestamp) }}</small>
          <small>Responded by: {{ response.user_email }}</small>
          <button
            v-if="response.user_email === currentUser?.email"
            @click="editResponse(response)"
            class="button button-primary"
          >
            {{ response.isEditing ? 'Save' : 'Edit' }}
          </button>
          <button v-if="isAdmin" @click="deleteResponse(response.id)" class="button button-warning">
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
  <FloatingChat />
  <SidebarMenu />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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
const feedbackMessage = ref('')

// Computed properties for common logic
const isAdmin = computed(() => currentUser.value?.role === 'admin')
const isQuestionOwner = computed(
  () => currentUser.value?.email === questionDetails.value?.user_email,
)
const canDeleteQuestion = computed(() => {
  return (
    isAdmin.value ||
    isQuestionOwner.value ||
    currentUser.value?.role === `expert-${questionDetails.value?.category.trim().toLowerCase()}`
  )
})

// Utility function to format dates
const formatDate = (timestamp: string) => {
  return new Date(timestamp).toLocaleString([], {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Fetch data on mount
onMounted(async () => {
  const storedUser = sessionStorage.getItem('user')
  if (storedUser) currentUser.value = JSON.parse(storedUser)

  const questionId = route.params.id
  try {
    const [questionResponse, responsesResponse, countsResponse] = await Promise.all([
      axios.get<Question>(`http://localhost:5000/questions/${questionId}`),
      axios.get<Response[]>(`http://localhost:5000/questions/${questionId}/responses`),
      axios.get(`http://localhost:5000/questions/${questionId}/counts`),
    ])
    questionDetails.value = questionResponse.data
    editText.value = questionDetails.value.question
    responseList.value = responsesResponse.data.map((response) => ({
      ...response,
      isEditing: false,
      editText: response.response,
    }))
    upvoteCount.value = countsResponse.data.upvotes
    downvoteCount.value = countsResponse.data.downvotes
    reportCount.value = countsResponse.data.reports

    if (currentUser.value) {
      const subscriptionResponse = await axios.get<boolean>(
        `http://localhost:5000/subscriptions/${currentUser.value.id}/${questionId}`,
      )
      isSubscribedToQuestion.value = subscriptionResponse.data
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  }
})

// Consolidated vote handling
const handleVote = async (type: 'upvote' | 'downvote' | 'report') => {
  try {
    if (!currentUser.value) throw new Error('User not logged in.')
    await axios.post(`http://localhost:5000/questions/${route.params.id}/${type}`, {
      user_id: currentUser.value.id,
    })
    const countsResponse = await axios.get(
      `http://localhost:5000/questions/${route.params.id}/counts`,
    )
    upvoteCount.value = countsResponse.data.upvotes
    downvoteCount.value = countsResponse.data.downvotes
    reportCount.value = countsResponse.data.reports
    feedbackMessage.value = `Question ${type}d successfully!`
  } catch (error) {
    console.error(`Error handling ${type}:`, error)
    feedbackMessage.value = `Error handling ${type}.`
  }
}

// Other functions remain unchanged
const postResponse = async () => {
  if (!newResponseText.value.trim() || newResponseText.value.length > 500) return
  try {
    if (!currentUser.value) throw new Error('User not logged in.')
    const response = await axios.post(`http://localhost:5000/responses`, {
      question_id: route.params.id,
      user_id: currentUser.value.id,
      response: newResponseText.value,
    })
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
  if (response.isEditing) {
    if (response.editText && response.editText.length > 500) {
      feedbackMessage.value = 'Response text exceeds the character limit of 500.'
      return
    }
    try {
      await axios.put(`http://localhost:5000/responses/${response.id}`, {
        response: response.editText,
      })
      response.response = response.editText || response.response
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
    if (!currentUser.value) throw new Error('User not logged in.')
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

.button {
  margin-left: 5px;
  margin-right: 5px;
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
  background: linear-gradient(90deg, #2196f3, #1976d2); /* Gradient background */
}

.post-button:hover {
  background: linear-gradient(90deg, #1976d2, #1565c0); /* Darker gradient on hover */
  transform: scale(1.05); /* Slight zoom effect */
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
