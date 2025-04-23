<template>
  <div>
    <div v-if="showPopup" class="popup-container">
      <div class="popup container">
        <div class="section-header">
          <h2>Give Feedback</h2>
        </div>

        <div class="form-group">
          <label>Feedback Type:</label>
          <div class="radio-group">
            <label> <input type="radio" v-model="feedbackType" value="voice" /> Voice </label>
            <label> <input type="radio" v-model="feedbackType" value="report" /> Report </label>
          </div>
        </div>

        <div class="form-group">
          <label for="feedbackText">Your Feedback:</label>
          <textarea
            v-model="feedbackText"
            id="feedbackText"
            class="input"
            rows="5"
            placeholder="Please share your thoughts with us..."
          ></textarea>
        </div>

        <div class="form-group">
          <label>Submission Type:</label>
          <div class="radio-group">
            <label> <input type="radio" v-model="isAnonymous" :value="true" /> Anonymous </label>
            <label> <input type="radio" v-model="isAnonymous" :value="false" /> Identified </label>
          </div>
        </div>

        <div class="popup-actions">
          <button @click="submitFeedback" class="button button-success">Submit</button>
          <button @click="closePopup" class="button button-danger">Cancel</button>
        </div>
        <p v-if="feedbackMessage" class="feedback-message">{{ feedbackMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import useFeedback from '../composables/useFeedback'

const props = defineProps({
  showPopup: Boolean,
})

const emit = defineEmits(['close'])

const closePopup = () => {
  emit('close')
}

const { feedbackType, feedbackText, isAnonymous, feedbackMessage, submitFeedback } =
  useFeedback(closePopup)
</script>

<style scoped>
.popup-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.popup {
  width: 500px;
  padding: 25px;
}

.section-header {
  font-size: 1.2rem;
  color: var(--color-heading);
  margin-bottom: 1.5rem;
}

.form-group {
  margin: 1rem 0 1.5rem;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #444;
}

.radio-group {
  display: flex;
  gap: 20px;
  margin-top: 8px;
}

.radio-group label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.radio-group input {
  margin-right: 8px;
}

.input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
}

.popup-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

.feedback-message {
  margin-top: 15px;
  padding: 10px;
  border-radius: 8px;
  color: #1976d2;
  background-color: rgba(25, 118, 210, 0.1);
  text-align: center;
}
</style>
