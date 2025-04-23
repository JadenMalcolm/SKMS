<template>
  <div class="main-container">
    <div class="ask-container">
      <div class="section-header">
        <h2>Ask a Question</h2>
      </div>
      <input v-model="newQuestionText" placeholder="Type your question here..." class="input" />
      <button @click="submitQuestion(category)" class="button button-success">Submit Question</button>

      <div class="search-container">
        <div class="section-header">
          <h2>Search {{ category }} Questions</h2>
        </div>
        <input v-model="searchQuery" :placeholder="`Search ${category.toLowerCase()} questions...`" class="input" />
        <button @click="searchQuestions(category)" class="button button-success">Search</button>
      </div>

      <!-- Search Results -->
      <div v-if="searchQuery" class="search-results">
        <h3 class="subsection-header">Search Results</h3>
        <ul>
          <template v-for="(q, index) in searchResults" :key="index">
            <li class="question-item">
              <router-link :to="`/question/${q.id}`">{{ q.question }}</router-link>
              <small>{{ formatDateTime(q.timestamp) }}</small>
              <small>Asked by: {{ q.user_email }}</small>
            </li>
          </template>
        </ul>
      </div>
    </div>

    <div class="questions-box">
      <h3 class="subsection-header">{{ category }} Questions</h3>
      <ul>
        <template v-for="(q, index) in categoryQuestions" :key="index">
          <li class="question-item">
            <router-link :to="`/question/${q.id}`">{{ q.question }}</router-link>
            <small>{{ formatDateTime(q.timestamp) }}</small>
            <small>Asked by: {{ q.user_email }}</small>
          </li>
        </template>
      </ul>
      <div v-if="feedbackMessage" class="feedback-box">{{ feedbackMessage }}</div>
    </div>
  </div>
  <FloatingChat />
  <SidebarMenu />
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import useCurrentUser from '../composables/useCurrentUser'
import useQuestions from '../composables/useQuestions'
import useFormatDate from '../composables/useFormatDate'

const props = defineProps<{ category: string }>()
const router = useRouter()

// Initialize composables
const { currentUser, loadCurrentUser } = useCurrentUser()
const {
  searchQuery, allQuestions, searchResults, newQuestionText,
  feedbackMessage, fetchAllQuestions, searchQuestions, submitQuestion
} = useQuestions(currentUser)
const { formatDateTime } = useFormatDate()

// Filter questions by category
const categoryQuestions = computed(() =>
  allQuestions.value.filter(q => q.category === props.category)
)

// Initialize component
onMounted(async () => {
  await loadCurrentUser()
  if (!currentUser.value) return router.push('/')
  await fetchAllQuestions()
})
</script>

<style scoped>
.main-container {
  margin-top: 70px;
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background-color: #f0f0f0;
}

/* Container styles */
.ask-container, .questions-box {
  padding: 15px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}
.ask-container { width: 40%; text-align: center; margin-right: 10px; }
.questions-box { width: 65%; padding-right: 20px; }

/* Headers */
.ask-container h2, .questions-box h3, .search-results h3 { font-size: 1.2rem; color: #333; padding: 5px; }

/* Button styling */
.button-success { margin-top: 15px; }

/* Lists */
ul { list-style: none; padding: 0; }

/* Feedback message */
.feedback-box {
  margin-top: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f4f4f4;
  color: #333;
}
</style>
