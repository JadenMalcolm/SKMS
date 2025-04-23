<template>
  <div class="main-container">
    <div class="ask-container">
      <div class="section-header">
        <h2>Ask a Question</h2>
      </div>
      <input
        type="text"
        v-model="newQuestionText"
        placeholder="Type your question here..."
        class="input"
      />
      <button @click="submitQuestion(category)" class="button button-success">
        Submit Question
      </button>
      <div class="search-container">
        <div class="section-header">
          <h2>Search {{ category }} Questions</h2>
        </div>
        <input type="text" v-model="searchQuery" :placeholder="searchPlaceholder" class="input" />
        <button @click="searchQuestions(category)" class="button button-success">Search</button>
      </div>
      <div class="search-results">
        <h3 class="subsection-header">Search Results</h3>
        <ul>
          <li v-for="(q, index) in searchResults" :key="index" class="question-item">
            <router-link :to="`/question/${q.id}`">{{ q.question }}</router-link>
            <small>{{
              new Date(q.timestamp).toLocaleString([], {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })
            }}</small>
            <small>Asked by: {{ q.user_email }}</small>
          </li>
        </ul>
      </div>
    </div>
    <div class="questions-box">
      <h3 class="subsection-header">{{ category }} Questions</h3>
      <ul>
        <li v-for="(q, index) in categoryQuestions" :key="index" class="question-item">
          <router-link :to="`/question/${q.id}`">{{ q.question }}</router-link>
          <small>{{
            new Date(q.timestamp).toLocaleString([], {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })
          }}</small>
          <small>Asked by: {{ q.user_email }}</small>
        </li>
      </ul>
      <div v-if="feedbackMessage" class="feedback-box">
        <p>{{ feedbackMessage }}</p>
      </div>
    </div>
    <!-- Feedback message box -->
  </div>
  <FloatingChat />
  <SidebarMenu />
</template>

<script setup lang="ts">
import { computed, onMounted, defineProps } from 'vue'
import { useRouter } from 'vue-router'
import useCurrentUser from '../composables/useCurrentUser'
import useQuestions from '../composables/useQuestions'

const props = defineProps<{ category: string }>()
const router = useRouter()
const { currentUser, loadCurrentUser } = useCurrentUser()
const {
  searchQuery,
  allQuestions,
  searchResults,
  newQuestionText,
  feedbackMessage,
  fetchAllQuestions,
  searchQuestions,
  submitQuestion,
  getCategoryQuestions,
} = useQuestions(currentUser)

const searchPlaceholder = computed(() => `Search ${props.category.toLowerCase()} questions...`)
const categoryQuestions = computed(() => {
  return allQuestions.value.filter((q) => q.category === props.category)
})

onMounted(async () => {
  await loadCurrentUser()
  if (!currentUser.value) {
    router.push('/')
    return
  }

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
.ask-container {
  width: 40%;
  padding: 15px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  text-align: center;
  margin-right: 10px;
}
.ask-container h2 {
  font-size: 1.2rem;
  color: #333;
  padding: 5px;
}
.button-success {
  margin-top: 15px;
}
.questions-box {
  width: 65%;
  padding: 15px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding-right: 20px;
}
.questions-box h3 {
  font-size: 1.2rem;
  color: #333;
}
.questions-box ul,
.search-results ul {
  list-style: none;
  padding: 0;
}
.search-results h3 {
  font-size: 1.2rem;
  color: #333;
  padding: 5px;
}
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
</style>
