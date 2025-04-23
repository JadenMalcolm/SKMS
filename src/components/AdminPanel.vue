<template>
  <div class="admin-container">
    <header class="page-header">
      <h1>Admin Panel</h1>
    </header>
    <div class="section-header">
      <h2>Feedback Management</h2>
    </div>

    <p v-if="loading" class="loading-indicator">Loading feedback data...</p>

    <div v-else class="feedback-categories">
      <template v-for="(config, category) in feedbackTypes" :key="category">
        <div class="feedback-card container">
          <div class="subsection-header">{{ config.title }}</div>
          <div class="feedback-items">
            <div v-if="!categorizedFeedback[category].length" class="empty-state">
              No {{ config.title.toLowerCase() }} available
            </div>
            <div v-else v-for="item in categorizedFeedback[category]" :key="item.id" class="question-item">
              <div class="feedback-item-header">
                <span class="feedback-from">From: {{ config.identified ? item.user_email : 'Anonymous' }}</span>
                <span class="feedback-date">{{ formatDate(item.timestamp) }}</span>
              </div>
              <div class="feedback-content">{{ item.feedback_text }}</div>
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
  <floating-chat />
  <sidebar-menu />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import useFeedback from '../composables/useFeedback'
import useFormatDate from '../composables/useFormatDate'

const router = useRouter()
const { loading, categorizedFeedback, fetchFeedbackData, replyToFeedback, deleteFeedback } = useFeedback()
const { formatDate } = useFormatDate()

const feedbackTypes = {
  identifiedVoice: { title: 'Identified Voice Feedback', identified: true },
  anonymousVoice: { title: 'Anonymous Voice Feedback', identified: false },
  identifiedReport: { title: 'Identified Reports', identified: true },
  anonymousReport: { title: 'Anonymous Reports', identified: false }
}

onMounted(async () => {
  const currentUser = JSON.parse(sessionStorage.getItem('user') || 'null')
  if (!currentUser || currentUser.role !== 'admin') {
    router.push('/')
    return
  }
  await fetchFeedbackData()
})
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
  gap: 8px;
}

.reply-button,
.delete-button {
  padding: 6px 12px;
  font-size: 0.85rem;
  border-radius: 16px;
}
</style>
