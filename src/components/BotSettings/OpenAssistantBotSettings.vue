<template>
  <login-setting :bot="bot"></login-setting>
  <CommonBotSettings
    :settings="modelSetting"
    :brand-id="brandId"
    mutation-type="setOpenAssistant"
  ></CommonBotSettings>
  <v-list-item>
    <v-list-item-title>Preset</v-list-item-title>
    <v-select
      v-model="openAssistant.preset"
      outlined
      dense
      persistent-hint
      :items="presetNames"
      :hint="
        presets.find((preset) => preset.name === openAssistant.preset)
          .description
      "
      @update:model-value="
        setOpenAssistant({
          ...presets.find((preset) => preset.name === $event)
            .samplingParameters,
          preset: $event,
        })
      "
    ></v-select>
  </v-list-item>
  <CommonBotSettings
    :settings="parameterSettings"
    :brand-id="brandId"
    mutation-type="setOpenAssistant"
    :is-disable="openAssistant.preset !== 'Custom'"
  ></CommonBotSettings>
</template>

<script>
import Bot from "@/bots/OpenAssistantBot";
import CommonBotSettings from "@/components/BotSettings/CommonBotSettings.vue";
import LoginSetting from "@/components/BotSettings/LoginSetting.vue";
import i18n from "@/i18n";
import { Type } from "./settings.const";
import { mapState, mapMutations } from "vuex";

const presets = [
  {
    name: "Custom",
  },
  {
    name: "k50",
    description: "Top-k sampling with k=50",
    samplingParameters: {
      topK: 50,
      topP: 0.95,
      typicalP: null,
      temperature: 0.75,
      repetitionPenalty: 1.2,
      maxNewTokens: 1024,
    },
  },
  {
    name: "k50-Creative",
    description: "Top-k sampling with k=50, higher temperature",
    samplingParameters: {
      topK: 50,
      topP: 0.95,
      typicalP: null,
      temperature: 0.85,
      repetitionPenalty: 1.2,
      maxNewTokens: 1024,
    },
  },
  {
    name: "k50-Precise",
    description: "Top-k sampling with k=50, low temperature",
    samplingParameters: {
      topK: 50,
      topP: 0.95,
      typicalP: null,
      temperature: 0.1,
      repetitionPenalty: 1.2,
      maxNewTokens: 1024,
    },
  },
  {
    name: "k50-Original",
    description: "Top-k sampling with k=50, highest temperature",
    samplingParameters: {
      topK: 50,
      topP: 0.95,
      typicalP: null,
      temperature: 0.9,
      repetitionPenalty: 1.2,
      maxNewTokens: 1024,
    },
  },
  {
    name: "k50-Plugins",
    description: "Top-k sampling with k=50 and temperature=0.35",
    samplingParameters: {
      topK: 50,
      topP: null,
      typicalP: null,
      temperature: 0.35,
      repetitionPenalty: 1.1111111111111112,
      maxNewTokens: 1024,
    },
  },
  {
    name: "nucleus9",
    description: "Nucleus sampling with p=0.9",
    samplingParameters: {
      topK: null,
      topP: 0.9,
      typicalP: null,
      temperature: 0.8,
      repetitionPenalty: 1.2,
      maxNewTokens: 1024,
    },
  },
  {
    name: "typical2",
    description: "Typical sampling with p=0.2",
    samplingParameters: {
      topK: null,
      topP: null,
      typicalP: 0.2,
      temperature: 0.8,
      repetitionPenalty: 1.2,
      maxNewTokens: 1024,
    },
  },
  {
    name: "typical3",
    description: "Typical sampling with p=0.3",
    samplingParameters: {
      topK: null,
      topP: null,
      typicalP: 0.3,
      temperature: 0.8,
      repetitionPenalty: 1.2,
      maxNewTokens: 1024,
    },
  },
];

const modelSetting = [
  {
    type: Type.Select,
    name: "model",
    title: "Model",
    items: [
      "OA_SFT_Llama_30B_6",
      "OA_SFT_Llama2_70B_10",
      "OA_SFT_CodeLlama_13B_10",
    ],
    hideDetails: true,
  },
];

const parameterSettings = [
  {
    type: Type.Slider,
    name: "temperature",
    title: i18n.global.t("openaiApi.temperature"),
    description: i18n.global.t("openaiApi.temperaturePrompt"),
    min: 0.01,
    max: 2,
    step: 0.01,
  },
  {
    type: Type.Slider,
    name: "maxNewTokens",
    title: i18n.global.t("falcon.maxNewTokens"),
    description: i18n.global.t("falcon.maxNewTokensPrompt"),
    min: 1,
    max: 1024,
    step: 1,
  },
  {
    type: Type.Slider,
    name: "topP",
    title: i18n.global.t("falcon.topP"),
    description: i18n.global.t("falcon.topPPrompt"),
    min: 0,
    max: 1,
    step: 0.01,
  },
  {
    type: Type.Slider,
    name: "repetitionPenalty",
    title: i18n.global.t("falcon.repetitionPenalty"),
    description: i18n.global.t("falcon.repetitionPenaltyPrompt"),
    min: 1,
    max: 3,
    step: 0.01,
  },
  {
    type: Type.Slider,
    name: "topK",
    title: "Top K",
    // description: i18n.global.t("falcon.repetitionPenaltyPrompt"),
    min: 5,
    max: 2000,
    step: 5,
  },
  {
    type: Type.Slider,
    name: "typicalP",
    title: "Typical P",
    // description: i18n.global.t("falcon.repetitionPenaltyPrompt"),
    min: 0,
    max: 1,
    step: 0.01,
  },
];

export default {
  components: {
    LoginSetting,
    CommonBotSettings,
  },
  data() {
    return {
      bot: Bot.getInstance(),
      modelSetting: modelSetting,
      parameterSettings: parameterSettings,
      brandId: Bot._brandId,
      presets: presets,
      presetNames: presets.map((preset) => preset.name),
    };
  },
  methods: {
    ...mapMutations(["setOpenAssistant"]),
  },
  computed: {
    ...mapState(["openAssistant"]),
  },
};
</script>
