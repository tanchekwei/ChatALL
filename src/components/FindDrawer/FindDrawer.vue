<template>
  <v-navigation-drawer permanent="" :model-value="props.open">
    <v-list nav class="position-sticky bg-surface" style="top: 0; z-index: 1">
      <v-list-item density="comfortable" class="border" id="find-list-item">
        <template v-slot:default>
          <v-form class="pa-0" @submit.prevent="true">
            <v-text-field
              flat
              autofocus
              hide-details
              single-line
              id="find-text-field"
              ref="findTextRef"
              color="primary"
              density="compact"
              variant="solo"
              prepend-inner-icon="mdi-magnify"
              class="pa-0 pl-1"
              :label="$t('find.find')"
              :rules="[() => isMatch || $t('find.noMatches')]"
              :loading="isFinding"
              v-model="findTextModel"
              @keydown.enter="() => find()"
              @keydown.esc="updateOpenProps(false)"
              @focus="$event.target.select()"
            >
              <template v-slot:append-inner>
                <v-tooltip
                  :text="$t('find.matchCase')"
                  location="bottom"
                  v-model="isShowMatchCaseTooltip"
                >
                  <template v-slot:activator="{ props }">
                    <v-btn-toggle v-model="matchCaseToggle">
                      <v-btn
                        :value="MATCH_CASE_VALUE"
                        v-bind="props"
                        size="x-small"
                        icon="mdi-format-letter-case"
                      ></v-btn>
                    </v-btn-toggle>
                  </template>
                </v-tooltip>
                <v-btn-group>
                  <v-btn
                    size="x-small"
                    icon="mdi-close"
                    @click="updateOpenProps(false)"
                  ></v-btn>
                </v-btn-group>
              </template>
            </v-text-field>
          </v-form>
        </template>
      </v-list-item>
    </v-list>
    <template v-for="messages in currentChatMessages" :key="messages[0]">
      <v-list-item
        density="comfortable"
        :title="chatObj[messages[0]] ? chatObj[messages[0]].title : ''"
      >
      </v-list-item>
      <FindDrawerItem
        v-for="message in messages[1]"
        :key="message.index"
        :message="message"
        :current-chat-index="store.state.currentChatIndex"
        @selectChatAndScrollToMessage="selectChatAndScrollToMessage"
      ></FindDrawerItem>
    </template>
    <v-list-item
      v-if="currentChatMessages.length === 0 && isFinding !== true"
      :title="$t('find.noMatches')"
      density="comfortable"
      class="pa-3 pr-0"
    >
    </v-list-item>
  </v-navigation-drawer>

  <ConfirmModal ref="confirmModal" />
</template>

<script setup>
import ConfirmModal from "@/components/ConfirmModal.vue";
import FindDrawerItem from "@/components/FindDrawer/FindDrawerItem.vue";
import Chats from "@/store/chats";
import Messages from "@/store/messages";
import Threads from "@/store/threads";
import { liveQuery } from "dexie";
import { of } from "rxjs";
import { ref } from "vue";
import { useStore } from "vuex";

const store = useStore();
const props = defineProps(["open"]);
const emit = defineEmits(["update:open"]);

let chatObj = Object.create(null);
const currentChatMessages = ref([]);
let isFinding = undefined;
let currentMessageSub;
let findMessageLiveQuery = () => {
  isFinding = true;
  if (Boolean(findTextModel.value) === false) {
    return of([]);
  }
  const findRegexFlag = matchCaseToggle.value?.length ? undefined : "i";
  const findRegex = new RegExp(findTextModel.value, findRegexFlag);
  store.state.findText = findTextModel.value;
  store.state.findRegexFlag = findRegexFlag;
  return liveQuery(async () => {
    const messages = await Messages.table
      .filter((message) => !message.hide && findRegex.test(message.content))
      .toArray();
    const threads = await Threads.table
      .filter((message) => !message.hide && findRegex.test(message.content))
      .toArray();
    const allMessages = messages.concat(threads);
    allMessages.sort((a, b) => b.createdTime - a.createdTime);

    let groupedMessage = Object.create(null);
    for (const message of allMessages) {
      if (groupedMessage[message.chatIndex] === undefined) {
        groupedMessage[message.chatIndex] = [message];
      } else {
        groupedMessage[message.chatIndex].push(message);
      }
    }

    for (const key of Object.keys(groupedMessage)) {
      if (chatObj[key] === undefined) {
        const chat = await Chats.table.get(key);
        if (chat) {
          chatObj[key] = {
            title: chat.title,
          };
        }
      }
    }
    currentChatMessages.value = Object.entries(groupedMessage);
    isFinding = false;
  });
};

function selectChatAndScrollToMessage(payload) {
  store.commit("selectChatAndScrollToMessage", payload);
}

function updateOpenProps(value) {
  emit("update:open", value);
}

const findTextRef = ref(null);
const findTextModel = ref("");

const MATCH_CASE_VALUE = "case";

const matchCaseToggle = ref([]); // default disable match case
const isShowMatchCaseTooltip = ref(false);

const isMatch = ref(true);
function find() {
  if (currentMessageSub) {
    currentMessageSub.unsubscribe();
  }
  currentMessageSub = findMessageLiveQuery().subscribe();
}

// function highlight(p, regex, text) {
//   let match;
//   while ((match = regex.exec(text)) !== null) {
//     var range = document.createRange();
//     range.setStart(p, match.index);
//     range.setEnd(p, regex.lastIndex);

//     var span = document.createElement("span");
//     span.className = "highlight";
//     span.appendChild(range.extractContents());
//     range.insertNode(span);
//   }
// }
</script>
<style scoped>
:deep() .v-list-item {
  padding-top: 0;
  padding-bottom: 0;
  padding-right: 0;
}
:deep() .v-list-item-title {
  font-size: 1rem !important;
}

:deep() .v-input__control > div {
  padding: 0;
}

:deep() input#find-text-field {
  height: 100%;
  padding: 0;
  padding-left: 0.25rem;
}

#find-list-item {
  padding: 0;
}
</style>
