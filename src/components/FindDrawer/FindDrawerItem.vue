<template>
  <v-list-item
    density="comfortable"
    :active="props.currentChatIndex === props.message.chatIndex"
    :value="props.message.index"
    class="pa-3 pr-0"
    @click="onSelectChat"
  >
    <template v-slot:title>
      <div ref="findTextResult">
        <p v-html="text"></p>
      </div>
    </template>
  </v-list-item>
</template>

<script setup>
/* eslint-disable */
import { ref, computed, onMounted } from "vue";
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
  findRegex: {
    type: Object,
    required: true,
  },
});
const findTextResult = ref();
const text = ref(props.message.content);

onMounted(() => {
  const regex = new RegExp(props.findRegex, "g");
  regex.lastIndex = 0; // reset
  let match;
  let matchIndexes = [];
  let matchString;
  while ((match = regex.exec(text.value)) !== null) {
    // Prevent empty matches causing infinite loops
    if (!match[0].length) {
      regex.lastIndex++;
      continue;
    }

    if (match.index > 40) {
      break;
    }

    matchIndexes.push(match.index);
    if (matchString === undefined) {
      matchString = match[0];
    }
  }

  let offset = 0;
  for (const index of matchIndexes) {
    var span = document.createElement("span");
    span.className = "border-dashed find-item-border";
    span.innerText = matchString;
    text.value =
      text.value.substring(0, index + offset) +
      span.outerHTML +
      text.value.substring(index + offset + matchString.length);
    offset += span.outerHTML.length;
  }
});
// const text = computed(() => {
//   let match;
//   const p = document.createElement("p");
//   document.body.appendChild(p);
//   p.innerHTML = props.message.content;
//   const regex = props.findRegex;
//   regex.lastIndex = 0; // reset
//   while ((match = regex.exec(props.message.content)) !== null) {
//     // Prevent empty matches causing infinite loops
//     if (!match[0].length) {
//       regex.lastIndex++;
//       continue;
//     }

//     var range = document.createRange();
//     range.setStart(p, match.index);
//     range.setEnd(p, regex.lastIndex);

//     var span = document.createElement("span");
//     span.className = "highlight";
//     span.appendChild(range.extractContents());
//     range.insertNode(span);
//   }
//   return p.outerHTML;
// });
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

  :deep() .find-item-border {
    border-width: 2px;
    border-radius: 2px;
  }
</style>
