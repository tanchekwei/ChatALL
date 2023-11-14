<template>
  <v-card
    ref="root"
    class="message prompt"
    style="cursor: auto"
    :class="isThread ? 'thread-prompt' : ''"
    :ripple="store.state.scrollToMessage !== undefined"
    @click="() => {}"
  >
    <!-- need to pass in empty function to @click event for ripple to work ==' -->
    <pre :id="message.index">{{ message ? message.content : "" }}</pre>
  </v-card>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import { useStore } from "vuex";

const store = useStore();
const root = ref();
const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
  columns: {
    type: Number,
    required: true,
  },
  isThread: {
    type: Boolean,
    default: false,
  },
});

watch(
  () => props.columns,
  () => {
    root.value.$el.style.setProperty("--columns", props.columns);
  },
);

onMounted(() => {
  root.value.$el.style.setProperty("--columns", props.columns);
});
</script>

<style scoped>
.message {
  border-radius: 8px;
  padding: 16px;
  word-wrap: break-word;
  text-align: left;
}

.prompt {
  background-color: rgb(var(--v-theme-prompt));
  width: fit-content;
  grid-column: 1 / span var(--columns);
}

.prompt pre {
  white-space: pre-wrap;
  font-family: inherit;
}

.thread-prompt {
  width: 100%;
  margin-top: 1rem;
  margin-bottom: 1rem;
}
</style>
