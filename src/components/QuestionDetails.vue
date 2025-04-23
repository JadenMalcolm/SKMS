<template>
  <div class="question-details-container container">
    <div class="page-header">
      <h1>Question Details</h1>
    </div>

    <div v-if="questionDetails" class="question-content">
      <div class="question-main">
        <div class="question-item">
          <p v-if="!isEditing" class="question-text">{{ questionDetails.question }}</p>
          <textarea v-else v-model="editText" class="textarea" maxlength="500"></textarea>
          <div class="question-meta">
            <small>Asked on: {{ formatDateTime(questionDetails.timestamp) }}</small>
            <small>Asked by: {{ questionDetails.user_email }}</small>
            <small>Category: {{ questionDetails.category }}</small>
          </div>
        </div>

        <!-- Display buttons and actions -->
        <div class="action-buttons">
          <button
            v-if="currentUser && !isSubscribedToQuestion"
            @click="subscribeToQuestion"
            class="button button-primary"
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
          <button v-if="isQuestionOwner" @click="handleToggleEdit" class="button button-primary">
            {{ isEditing ? 'Save' : 'Edit' }}
          </button>
          <button
            v-if="canDeleteQuestion"
            @click="handleDeleteQuestion"
            class="button button-danger"
          >
            Delete Question
          </button>

          <button @click="handleQuestionVote('upvote')" class="button button-success">
            Upvote ({{ upvoteCount }})
          </button>
          <button @click="handleQuestionVote('downvote')" class="button button-danger">
            Downvote ({{ downvoteCount }})
          </button>
          <button @click="handleQuestionVote('report')" class="button button-warning">
            Report ({{ reportCount }})
          </button>
        </div>

        <!-- Response Section -->
        <div class="response-section">
          <div class="section-header">
            <h2>Add Your Response</h2>
          </div>
          <textarea
            v-model="newResponseText"
            placeholder="Type your response here..."
            class="textarea"
          ></textarea>
          <button @click="postResponse" class="button button-success">Post Response</button>
        </div>
      </div>

      <!-- Responses List -->
      <div v-if="responseList.length" class="responses-container">
        <div class="subsection-header">
          <h3>Responses ({{ responseList.length }})</h3>
        </div>
        <div
          v-for="response in responseList"
          :key="response.id"
          class="question-item response-item"
        >
          <p v-if="!response.isEditing">{{ response.response }}</p>
          <textarea v-else v-model="response.editText" class="textarea" maxlength="500"></textarea>
          <div class="response-meta">
            <small>Responded on: {{ formatDateTime(response.timestamp) }}</small>
            <small>Responded by: {{ response.user_email }}</small>
          </div>
          <div class="response-actions">
            <button
              v-if="response.user_email === currentUser?.email"
              @click="editResponse(response)"
              class="button button-primary button-small"
            >
              {{ response.isEditing ? 'Save' : 'Edit' }}
            </button>
            <button
              v-if="response.user_email === currentUser?.email || isAdmin"
              @click="
                deleteResponse(response.id);feedbackMessage = responseMessage
              "
              class="button button-danger button-small"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
      <div v-else class="no-responses">
        <p>No responses yet. Be the first to respond!</p>
      </div>

      <!-- Feedback message box -->
      <div v-if="feedbackMessage" class="feedback-box">
        <p>{{ feedbackMessage }}</p>
      </div>
    </div>
    <div v-else class="loading-container">
      <p class="loading">Loading...</p>
    </div>
  </div>
  <FloatingChat />
  <SidebarMenu />
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import useSubscriptions from '../composables/useSubscriptions'
import useResponses from '../composables/useResponses'
import useVotes from '../composables/useVotes'
import useQuestions from '../composables/useQuestions'
import useCurrentUser from '../composables/useCurrentUser'
import useFormatDate from '../composables/useFormatDate'

const route = useRoute()
const router = useRouter()

// Initialize the current user
const { currentUser, loadCurrentUser } = useCurrentUser()
onMounted(loadCurrentUser)

// Initialize the questions composable
const {
  questionDetails,
  isEditing,
  editText,
  feedbackMessage,
  fetchQuestionDetails,
  deleteQuestion,
  toggleEdit,
} = useQuestions(currentUser)

// Initialize the subscription composable
const {
  isSubscribed: isSubscribedToQuestion,
  subscriptionMessage,
  checkSubscriptionStatus,
  subscribeToQuestion: subscribe,
  unsubscribeFromQuestion: unsubscribe,
} = useSubscriptions(currentUser)

// Initialize the responses composable
const {
  responseList,
  newResponseText,
  responseMessage,
  fetchResponses,
  postResponse: submitResponse,
  editResponse,
  deleteResponse,
} = useResponses(currentUser)

// Initialize the votes composable
const { upvoteCount, downvoteCount, reportCount, voteMessage, fetchVoteCounts, handleVote } =
  useVotes(currentUser)

// Initialize the formatDate composable
const { formatDateTime } = useFormatDate()

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

// Fetch data on mount
onMounted(async () => {
  const questionId = route.params.id
  try {
    await fetchQuestionDetails(String(questionId))
    await fetchResponses(String(questionId))
    await fetchVoteCounts(String(questionId))

    // Check subscription status using the composable
    if (currentUser.value) {
      await checkSubscriptionStatus(String(questionId))
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  }
})

// Using the vote composable to handle voting
const handleQuestionVote = async (type: 'upvote' | 'downvote' | 'report') => {
  const result = await handleVote(String(route.params.id), type)
  feedbackMessage.value = voteMessage.value
}

// Using the composable for response handling
const postResponse = async () => {
  const result = await submitResponse(String(route.params.id))
  feedbackMessage.value = responseMessage.value
}

// Handle question editing
const handleToggleEdit = async () => {
  // Pass the question ID explicitly to ensure it's available
  await toggleEdit(String(route.params.id))
}

// Handle question deletion
const handleDeleteQuestion = async () => {
  const result = await deleteQuestion(String(route.params.id))
  if (result) {
    router.push('/dashboard')
  }
}

// Using the composable's subscription functions
const subscribeToQuestion = async () => {
  const result = await subscribe(String(route.params.id))
  if (result) {
    feedbackMessage.value = subscriptionMessage.value
  }
}

const unsubscribeFromQuestion = async () => {
  const result = await unsubscribe(String(route.params.id))
  if (result) {
    feedbackMessage.value = subscriptionMessage.value
  }
}
</script>

<style scoped>
.question-details-container {
  max-width: 900px;
  margin: 20px auto;
  padding: 20px;
}

.question-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.question-main {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.question-text {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 12px;
}

.question-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 10px;
}

.question-meta small {
  margin: 0;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 10px 0;
}

.vote-buttons {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.response-section {
  margin-top: 20px;
  padding: 15px;
  background-color: #f9fbff;
  border-radius: 8px;
  border: 1px solid rgba(76, 149, 232, 0.2);
}

.responses-container {
  margin-top: 15px;
}

.response-item {
  margin-bottom: 15px;
  background-color: #f9fbff;
}

.response-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 8px;
  font-size: 0.85rem;
}

.response-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  justify-content: flex-end;
}

.no-responses {
  text-align: center;
  padding: 20px;
  color: #666;
  font-style: italic;
  background-color: #f9fbff;
  border-radius: 8px;
  border: 1px dashed #ccc;
}

.feedback-box {
  margin-top: 20px;
  padding: 10px 15px;
  border-radius: 8px;
  background-color: #e8f5e9;
  color: #2e7d32;
  text-align: center;
}

.loading-container {
  text-align: center;
  padding: 40px;
}

.loading {
  font-size: 1.2rem;
  color: #666;
}

@media (max-width: 600px) {
  .action-buttons,
  .vote-buttons {
    flex-direction: column;
    width: 100%;
  }

  .action-buttons .button {
    width: 100%;
  }
}
</style>
