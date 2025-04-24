<template>
  <!-- Main container that holds the entire category page -->
  <div class="main-container">
    <!-- Left sidebar for asking new questions and searching -->
    <div class="ask-container">
      <div class="section-header">
        <h2>Ask a Question</h2>
      </div>
      <!-- Input field for new questions -->
      <input v-model="newQuestionText" placeholder="Type your question here..." class="input" />
      <button @click="submitQuestion(category)" class="button button-success">Submit Question</button>

      <!-- Search functionality section -->
      <div class="search-container">
        <div class="section-header">
          <h2>Search {{ category }} Questions</h2>
        </div>
        <input v-model="searchQuery" :placeholder="`Search ${category.toLowerCase()} questions...`" class="input" />
        <button @click="searchQuestions(category)" class="button button-success">Search</button>
      </div>

      <!-- Search Results section - only visible when search query exists -->
      <div v-if="searchQuery" class="search-results">
        <h3 class="subsection-header">Search Results</h3>
        <ul>
          <template v-for="(q, index) in searchResults" :key="index">
            <li class="question-item">
              <!-- Link to individual question details page -->
              <router-link :to="`/question/${q.id}`">{{ q.question }}</router-link>
              <small>{{ formatDateTime(q.timestamp) }}</small>
              <small>Asked by: {{ q.user_email }}</small>
            </li>
          </template>
        </ul>
      </div>
    </div>

    <!-- Main content area displaying all questions for this category -->
    <div class="questions-box">
      <h3 class="subsection-header">{{ category }} Questions</h3>
      <ul>
        <template v-for="(q, index) in categoryQuestions" :key="index">
          <li class="question-item">
            <!-- Link to individual question details page -->
            <router-link :to="`/question/${q.id}`">{{ q.question }}</router-link>
            <small>{{ formatDateTime(q.timestamp) }}</small>
            <small>Asked by: {{ q.user_email }}</small>
          </li>
        </template>
      </ul>
      <!-- Feedback message for user actions (success/error messages) -->
      <div v-if="feedbackMessage" class="feedback-box">{{ feedbackMessage }}</div>
    </div>
  </div>
  <!-- Global navigation components -->
  <FloatingChat />
  <SidebarMenu />
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import useCurrentUser from '../composables/useCurrentUser'  // For user authentication
import useQuestions from '../composables/useQuestions'      // For question operations
import useFormatDate from '../composables/useFormatDate'    // For date formatting

// Accept category prop from route configuration
const props = defineProps<{ category: string }>()
const router = useRouter()

// Initialize composables for required functionality
const { currentUser, loadCurrentUser } = useCurrentUser()
const {
  searchQuery,       // Search input text
  allQuestions,      // All questions in the system
  searchResults,     // Filtered search results
  newQuestionText,   // New question input text
  feedbackMessage,   // System feedback for user actions
  fetchAllQuestions, // Load all questions from API
  searchQuestions,   // Search functionality
  submitQuestion     // Submit new questions
} = useQuestions(currentUser)
const { formatDateTime } = useFormatDate()

// Computed property to filter questions by current category
const categoryQuestions = computed(() =>
  allQuestions.value.filter(q => q.category === props.category)
)

// Component initialization on mount
onMounted(async () => {
  // Ensure user is authenticated
  await loadCurrentUser()
  if (!currentUser.value) return router.push('/')  // Redirect to login if not logged in

  // Load question data
  await fetchAllQuestions()
})
</script>

<style scoped>
/* Main layout container with flex layout */
.main-container {
  margin-top: 70px;
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background-color: #f0f0f0;
}

/* Styled containers for the two main sections */
.ask-container, .questions-box {
  padding: 15px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}
/* Left sidebar width and alignment */
.ask-container { width: 40%; text-align: center; margin-right: 10px; }
/* Main content area width and padding */
.questions-box { width: 65%; padding-right: 20px; }

/* Section header text styling */
.ask-container h2, .questions-box h3, .search-results h3 { font-size: 1.2rem; color: #333; padding: 5px; }

/* Button spacing */
.button-success { margin-top: 15px; }

/* Remove default list styles */
ul { list-style: none; padding: 0; }

/* Feedback message styling */
.feedback-box {
  margin-top: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f4f4f4;
  color: #333;
}
</style>
