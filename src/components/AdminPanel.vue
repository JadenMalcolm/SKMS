<template>
  <div class="admin-container">
    <header class="page-header">
      <h1>Admin Panel</h1>
    </header>

    <div class="section-header">
      <h2>Feedback Management</h2>
    </div>

    <div v-if="loading" class="loading-indicator">
      <p>Loading feedback data...</p>
    </div>

    <div v-else class="feedback-categories">
      <!-- Identified Voice Feedback -->
      <div class="feedback-card container">
        <div class="subsection-header">Identified Voice Feedback</div>
        <div class="feedback-items">
          <div v-if="categorizedFeedback.identifiedVoice.length === 0" class="empty-state">
            No identified voice feedback available
          </div>
          <div
            v-for="item in categorizedFeedback.identifiedVoice"
            :key="item.id"
            class="question-item"
          >
            <div class="feedback-item-header">
              <span class="feedback-from">From: {{ item.user_email }}</span>
              <span class="feedback-date">{{ formatDate(item.timestamp) }}</span>
            </div>
            <div class="feedback-content">{{ item.feedback_text }}</div>
            <div class="feedback-actions">
              <button @click="replyToFeedback(item)" class="button button-primary reply-button">
                Reply
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Anonymous Voice Feedback -->
      <div class="feedback-card container">
        <div class="subsection-header">Anonymous Voice Feedback</div>
        <div class="feedback-items">
          <div v-if="categorizedFeedback.anonymousVoice.length === 0" class="empty-state">
            No anonymous voice feedback available
          </div>
          <div
            v-for="item in categorizedFeedback.anonymousVoice"
            :key="item.id"
            class="question-item"
          >
            <div class="feedback-item-header">
              <span class="feedback-from">From: Anonymous</span>
              <span class="feedback-date">{{ formatDate(item.timestamp) }}</span>
            </div>
            <div class="feedback-content">{{ item.feedback_text }}</div>
          </div>
        </div>
      </div>

      <!-- Identified Report Feedback -->
      <div class="feedback-card container">
        <div class="subsection-header">Identified Reports</div>
        <div class="feedback-items">
          <div v-if="categorizedFeedback.identifiedReport.length === 0" class="empty-state">
            No identified reports available
          </div>
          <div
            v-for="item in categorizedFeedback.identifiedReport"
            :key="item.id"
            class="question-item"
          >
            <div class="feedback-item-header">
              <span class="feedback-from">From: {{ item.user_email }}</span>
              <span class="feedback-date">{{ formatDate(item.timestamp) }}</span>
            </div>
            <div class="feedback-content">{{ item.feedback_text }}</div>
            <div class="feedback-actions">
              <button @click="replyToFeedback(item)" class="button button-primary reply-button">
                Reply
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Anonymous Report Feedback -->
      <div class="feedback-card container">
        <div class="subsection-header">Anonymous Reports</div>
        <div class="feedback-items">
          <div v-if="categorizedFeedback.anonymousReport.length === 0" class="empty-state">
            No anonymous reports available
          </div>
          <div
            v-for="item in categorizedFeedback.anonymousReport"
            :key="item.id"
            class="question-item"
          >
            <div class="feedback-item-header">
              <span class="feedback-from">From: Anonymous</span>
              <span class="feedback-date">{{ formatDate(item.timestamp) }}</span>
            </div>
            <div class="feedback-content">{{ item.feedback_text }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <floating-chat />
  <sidebar-menu />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const loading = ref(true)
interface FeedbackItem {
  id: number
  user_email?: string // Optional for anonymous feedback
  feedback_text: string
  timestamp: string
  user_id?: number // Add user_id for directing messages
}

const categorizedFeedback = ref<{
  identifiedVoice: FeedbackItem[]
  anonymousVoice: FeedbackItem[]
  identifiedReport: FeedbackItem[]
  anonymousReport: FeedbackItem[]
}>({
  identifiedVoice: [],
  anonymousVoice: [],
  identifiedReport: [],
  anonymousReport: [],
})

onMounted(async () => {
  const currentUser = JSON.parse(sessionStorage.getItem('user') || 'null')
  if (!currentUser || currentUser.role !== 'admin') {
    router.push('/') // Redirect to home if not admin
    return
  }

  await fetchFeedbackData()
})

const fetchFeedbackData = async () => {
  try {
    loading.value = true
    const response = await axios.get('http://localhost:5000/feedback/categorized')
    categorizedFeedback.value = response.data
  } catch (error) {
    console.error('Error fetching feedback data:', error)
  } finally {
    loading.value = false
  }
}

const replyToFeedback = async (feedbackItem: FeedbackItem) => {
  if (!feedbackItem.user_id) {
    console.error('No user ID available for this feedback')
    return
  }
  try {
    await router.push('direct-messages') 
    await new Promise(resolve => setTimeout(resolve, 750))

    // Dispatch a custom event to select the user
    const event = new CustomEvent('open-chat', {
      detail: { id: feedbackItem.user_id, email: feedbackItem.user_email },
    })
    window.dispatchEvent(event)
  } catch (error) {
    console.error('Error setting up reply:', error)
  }
}

const formatDate = (timestamp: string | number | Date) => {
  if (!timestamp) return 'N/A'

  const date = new Date(timestamp)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped>
.admin-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.feedback-categories {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.feedback-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.feedback-items {
  flex-grow: 1;
  overflow-y: auto;
  max-height: 400px;
}

.feedback-item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 0.8rem;
  color: #666;
}

.feedback-content {
  font-size: 0.95rem;
  color: #333;
  white-space: pre-line;
}

.feedback-from {
  font-weight: bold;
}

.feedback-date {
  color: #888;
}

.loading-indicator {
  text-align: center;
  padding: 20px;
  color: #666;
}

.empty-state {
  padding: 15px;
  text-align: center;
  color: #888;
  font-style: italic;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  margin: 10px 0;
}

.feedback-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.reply-button {
  padding: 6px 12px;
  font-size: 0.85rem;
  border-radius: 16px;
}
</style>
