<template>
  <div class="question-details-container container">
    <div class="page-header"><h1>Question Details</h1></div>

    <div v-if="questionDetails" class="question-content">
      <!-- Question Display -->
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

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button v-if="!isSubscribedToQuestion" @click="subscribeToQuestion(questionId)" class="button button-primary">
            Subscribe
          </button>
          <button v-else @click="unsubscribeFromQuestion(questionId)" class="button button-danger">
            Unsubscribe
          </button>

          <button v-if="isQuestionOwner" @click="toggleEdit(questionId)" class="button button-primary">
            {{ isEditing ? 'Save' : 'Edit' }}
          </button>

          <button v-if="canDeleteQuestion" @click="deleteAndNavigate" class="button button-danger">
            Delete Question
          </button>

          <!-- Vote Buttons -->
          <template v-for="(action, i) in voteActions" :key="i">
            <button
              @click="handleVoteWrapper(questionId, action.type)"
              :class="`button ${action.class}`">
              {{ action.label }} ({{ action.count }})
            </button>
          </template>
        </div>

        <!-- Response Section -->
        <div class="response-section">
          <div class="section-header">
            <h2>Add Your Response</h2>
          </div>
          <textarea v-model="newResponseText" placeholder="Type your response here..." class="textarea"></textarea>
          <button @click="postResponse(questionId); feedbackMessage = responseMessage" class="button button-success">
            Post Response
          </button>
        </div>
      </div>

      <!-- Responses List -->
      <div v-if="responseList.length" class="responses-container">
        <div class="subsection-header">
          <h3>Responses ({{ responseList.length }})</h3>
        </div>
        <div v-for="response in responseList" :key="response.id" class="question-item response-item">
          <p v-if="!response.isEditing">{{ response.response }}</p>
          <textarea v-else v-model="response.editText" class="textarea" maxlength="500"></textarea>

          <div class="response-meta">
            <small>Responded on: {{ formatDateTime(response.timestamp) }}</small>
            <small>Responded by: {{ response.user_email }}</small>
          </div>

          <div class="response-actions">
            <button v-if="response.user_email === currentUser?.email"
              @click="editResponse(response)"
              class="button button-primary button-small">
              {{ response.isEditing ? 'Save' : 'Edit' }}
            </button>

            <button v-if="response.user_email === currentUser?.email || isAdmin"
              @click="deleteResponse(response.id); feedbackMessage = responseMessage"
              class="button button-danger button-small">
              Delete
            </button>
          </div>
        </div>
      </div>
      <div v-else class="no-responses">
        <p>No responses yet. Be the first to respond!</p>
      </div>

      <div v-if="feedbackMessage" class="feedback-box">{{ feedbackMessage }}</div>
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

// Import composables
import useCurrentUser from '../composables/useCurrentUser'
import useQuestions from '../composables/useQuestions'
import useFormatDate from '../composables/useFormatDate'
import useSubscriptions from '../composables/useSubscriptions'
import useResponses from '../composables/useResponses'
import useVotes from '../composables/useVotes'

const route = useRoute()
const router = useRouter()

// Ensure questionId is always a string and never undefined
const questionId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' ? id : String(id)
})

// Initialize composables
const { currentUser, loadCurrentUser } = useCurrentUser()
const { questionDetails, isEditing, editText, feedbackMessage, fetchQuestionDetails, deleteQuestion, toggleEdit } = useQuestions(currentUser)
const { isSubscribed: isSubscribedToQuestion, subscriptionMessage, checkSubscriptionStatus, subscribeToQuestion, unsubscribeFromQuestion } = useSubscriptions(currentUser)
const { responseList, newResponseText, responseMessage, fetchResponses, postResponse, editResponse, deleteResponse } = useResponses(currentUser)
const { upvoteCount, downvoteCount, reportCount, fetchVoteCounts, handleVote } = useVotes(currentUser)
const { formatDateTime } = useFormatDate()

// Define a proper type for vote actions
type VoteActionType = 'upvote' | 'downvote' | 'report';
type VoteAction = {
  type: VoteActionType;
  label: string;
  count: number;
  class: string;
};

// Computed properties
const isAdmin = computed(() => currentUser.value?.role === 'admin')
const isQuestionOwner = computed(() => currentUser.value?.email === questionDetails.value?.user_email)
const canDeleteQuestion = computed(() =>
  isAdmin.value || isQuestionOwner.value ||
  currentUser.value?.role === `expert-${questionDetails.value?.category.trim().toLowerCase()}`
)

// Properly type the handleVote function call
const handleVoteWrapper = (id: string, type: VoteActionType) => {
  return handleVote(id, type);
}

// Vote actions array for button generation with proper typing
const voteActions = computed<VoteAction[]>(() => [
  { type: 'upvote', label: 'Upvote', count: upvoteCount.value, class: 'button-success' },
  { type: 'downvote', label: 'Downvote', count: downvoteCount.value, class: 'button-danger' },
  { type: 'report', label: 'Report', count: reportCount.value, class: 'button-warning' }
])

// Handler for delete and navigate
const deleteAndNavigate = async () => {
  if (await deleteQuestion(questionId.value)) router.push('/dashboard')
}

// Initialize component
onMounted(async () => {
  await loadCurrentUser()

  // Ensure we have a valid ID before making API calls
  if (!questionId.value) {
    feedbackMessage.value = "Invalid question ID"
    return
  }

  await fetchQuestionDetails(questionId.value)

  // Only proceed with additional API calls if we successfully loaded the question
  if (questionDetails.value) {
    try {
      // Use Promise.all with proper error handling for concurrent requests
      await Promise.all([
        fetchResponses(questionId.value),
        fetchVoteCounts(questionId.value),
        currentUser.value && checkSubscriptionStatus(questionId.value)
      ])
    } catch (error) {
      console.error("Error loading question data:", error)
      feedbackMessage.value = "Could not load all question data. Please try refreshing."
    }
  }
})
</script>

<style scoped>
/* Main container with constrained width for readability */
.question-details-container {
  max-width: 900px;
  margin: 20px auto;
  padding: 20px;
}

/* Vertical layouts with spacing between sections */
.question-content { display: flex; flex-direction: column; gap: 20px; }
.question-main { display: flex; flex-direction: column; gap: 15px; }

/* Question text formatting for better readability */
.question-text {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 12px;
}

/* Metadata for questions and responses with flexible wrapping */
.question-meta, .response-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 10px;
}

/* Button groups for actions with flexible wrapping */
.action-buttons, .response-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 10px 0;
}

/* Right-align response action buttons */
.response-actions { justify-content: flex-end; }

/* Response input section with visual distinction */
.response-section {
  margin-top: 20px;
  padding: 15px;
  background-color: #f9fbff;
  border-radius: 8px;
  border: 1px solid rgba(76, 149, 232, 0.2);
}

/* Container for response list and individual response styling */
.responses-container { margin-top: 15px; }
.response-item { margin-bottom: 15px; background-color: #f9fbff; }

/* Empty state styling when no responses exist */
.no-responses {
  text-align: center;
  padding: 20px;
  color: #666;
  font-style: italic;
  background-color: #f9fbff;
  border-radius: 8px;
  border: 1px dashed #ccc;
}

/* Feedback message box for user notifications */
.feedback-box {
  margin-top: 20px;
  padding: 10px 15px;
  border-radius: 8px;
  background-color: #e8f5e9;
  color: #2e7d32;
  text-align: center;
}

/* Loading state styling */
.loading-container { text-align: center; padding: 40px; }
.loading { font-size: 1.2rem; color: #666; }

/* Responsive layout for mobile devices */
@media (max-width: 600px) {
  /* Stack buttons vertically on small screens */
  .action-buttons { flex-direction: column; width: 100%; }
  .action-buttons .button { width: 100%; }
}
</style>
