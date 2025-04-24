<template>
  <!-- Main admin container -->
  <div class="admin-container">
    <!-- Page header section -->
    <header class="page-header">
      <h1>Admin Panel</h1>
    </header>
    <div class="section-header">
      <h2>Feedback Management</h2>
    </div>

    <!-- Loading state indicator -->
    <p v-if="loading" class="loading-indicator">Loading feedback data...</p>

    <!-- Feedback display section, organized by categories -->
    <div v-else class="feedback-categories">
      <template v-for="(config, category) in feedbackTypes" :key="category">
        <!-- Individual feedback category card -->
        <div class="feedback-card container">
          <div class="subsection-header">{{ config.title }}</div>
          <div class="feedback-items">
            <!-- Empty state when no feedback exists for category -->
            <div v-if="!categorizedFeedback[category].length" class="empty-state">
              No {{ config.title.toLowerCase() }} available
            </div>
            <!-- Individual feedback items -->
            <div v-else v-for="item in categorizedFeedback[category]" :key="item.id" class="question-item">
              <!-- Feedback header with user info and timestamp -->
              <div class="feedback-item-header">
                <span class="feedback-from">From: {{ config.identified ? item.user_email : 'Anonymous' }}</span>
                <span class="feedback-date">{{ formatDate(item.timestamp) }}</span>
              </div>
              <!-- Feedback text content -->
              <div class="feedback-content">{{ item.feedback_text }}</div>
              <!-- Action buttons for feedback items -->
              <div class="feedback-actions">
                <button v-if="config.identified" @click="replyToFeedback(item)" class="button button-primary reply-button">Reply</button>
                <button @click="deleteFeedback(item)" class="button button-danger delete-button">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
  <!-- Global navigation components -->
  <floating-chat />
  <sidebar-menu />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import useFeedback from '../composables/useFeedback' // Custom composable for feedback functionality
import useFormatDate from '../composables/useFormatDate' // Custom composable for date formatting

const router = useRouter()
// Destructure methods and state from the feedback composable
const { loading, categorizedFeedback, fetchFeedbackData, replyToFeedback, deleteFeedback } = useFeedback()
const { formatDate } = useFormatDate()

// Configuration for different feedback types with their respective titles and identification status
const feedbackTypes = {
  identifiedVoice: { title: 'Identified Voice Feedback', identified: true },
  anonymousVoice: { title: 'Anonymous Voice Feedback', identified: false },
  identifiedReport: { title: 'Identified Reports', identified: true },
  anonymousReport: { title: 'Anonymous Reports', identified: false }
}

// On component mount, check user permissions and fetch feedback data
onMounted(async () => {
  // Access control - redirect non-admin users away from this page
  const currentUser = JSON.parse(sessionStorage.getItem('user') || 'null')
  if (!currentUser || currentUser.role !== 'admin') {
    router.push('/')
    return
  }
  // Fetch all feedback data for display
  await fetchFeedbackData()
})
</script>

<style scoped>
/* Main container styling */
.admin-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Grid layout for feedback category cards */
.feedback-categories {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

/* Individual feedback card styling */
.feedback-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Scrollable container for feedback items */
.feedback-items {
  flex-grow: 1;
  overflow-y: auto;
  max-height: 400px;
}

/* Header styling for individual feedback items */
.feedback-item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 0.8rem;
  color: #666;
}

/* Feedback content text styling */
.feedback-content {
  font-size: 0.95rem;
  color: #333;
  white-space: pre-line;
}

/* User identification styling */
.feedback-from {
  font-weight: bold;
}

/* Timestamp styling */
.feedback-date {
  color: #888;
}

/* Loading state indicator styling */
.loading-indicator {
  text-align: center;
  padding: 20px;
  color: #666;
}

/* Empty state styling when no feedback exists */
.empty-state {
  padding: 15px;
  text-align: center;
  color: #888;
  font-style: italic;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  margin: 10px 0;
}

/* Action buttons container */
.feedback-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
  gap: 8px;
}

/* Button styling for reply and delete actions */
.reply-button,
.delete-button {
  padding: 6px 12px;
  font-size: 0.85rem;
  border-radius: 16px;
}
</style>
