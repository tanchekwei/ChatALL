<template>
  <v-list-item
    density="comfortable"
    :active="props.currentChatIndex === props.message.chatIndex"
    :subtitle="props.message.content"
    :value="props.message.index"
    class="pa-3 pr-0"
    @click="onSelectChat"
  >
  </v-list-item>
</template>

<script setup>
const emit = defineEmits(["selectChatAndScrollToMessage"]);
const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
  currentChatIndex: {
    type: String,
    required: true,
  },
});

async function onSelectChat() {
  emit("selectChatAndScrollToMessage", {
    message: props.message,
    isThread: Boolean(props.message.messageIndex),
  });
}
</script>

<style scoped>
:deep() .v-input__append {
    margin-left: 0 !important;
  }
  
  :deep() .v-input__prepend {
    margin-right: 0.25rem !important;
  }
  
  :deep() .v-field__input {
    padding-left: 12px;
    padding-right: 0;
  }
  
  :deep() i.v-icon {
    color: rgb(var(--v-theme-primary));
  }
  
  :deep() div.v-list-item__prepend {
    display: block;
  }

  :deep() .v-list-item-subtitle {
    text-wrap: nowrap;
  }
</style>
