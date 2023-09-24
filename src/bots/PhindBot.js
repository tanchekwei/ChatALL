import Bot from "@/bots/Bot";
import AsyncLock from "async-lock";
import axios from "axios";
import { SSE } from "sse.js";
const { ipcRenderer } = window.require("electron");

export default class PhindBot extends Bot {
  static _brandId = "phind"; // Brand id of the bot, should be unique. Used in i18n.
  static _className = "PhindBot"; // Class name of the bot
  static _logoFilename = "phind-logo.svg"; // Place it in public/bots/
  static _isDarkLogo = true; // The main color of logo is dark
  static _loginUrl = "https://www.phind.com";
  static _lock = new AsyncLock(); // AsyncLock for prompt requests

  constructor() {
    super();
  }

  /**
   * Check whether the bot is logged in, settings are correct, etc.
   * @returns {boolean} - true if the bot is available, false otherwise.
   */
  async _checkAvailability() {
    return true;
  }

  /**
   * Send a prompt to the bot and call onResponse(response, callbackParam)
   * when the response is ready.
   * @param {string} prompt
   * @param {function} onUpdateResponse params: callbackParam, Object {content, done}
   * @param {object} callbackParam - Just pass it to onUpdateResponse() as is
   */
  async _sendPrompt(prompt, onUpdateResponse, callbackParam) {
    try {
      const context = await this.getChatContext();
      const rewrite = await axios.post(
        "https://www.phind.com/api/infer/followup/rewrite",
        {
          questionToRewrite: prompt,
          questionHistory: context.questionHistory,
          answerHistory: context.answerHistory,
        },
      );
      const search = await axios.post("https://www.phind.com/api/web/search", {
        q: rewrite.data.query,
        browserLanguage: "en-GB",
        userSearchRules: {},
      });

      const date = new Date();
      const formatDate = this.getFormattedDate(date);
      const payload = JSON.stringify({
        questionHistory: context.questionHistory,
        answerHistory: context.answerHistory,
        question: prompt,
        webResults: search.data,
        options: {
          date: formatDate,
          language: "en-GB",
          detailed: true,
          anonUserId: await this.getUUID(),
          answerModel: "Phind Model", // GPT-3.5-Turbo // GPT-4
          customLinks: [],
        },
        context: "",
      });

      return new Promise((resolve, reject) => {
        try {
          const source = new SSE("https://www.phind.com/api/infer/answer", {
            start: false,
            payload,
          });
          let text = "";
          let isSuccess = false;
          source.addEventListener("message", (event) => {
            if (event.data) {
              if (event.data.startsWith("<PHIND_METADATA>")) {
                isSuccess = true;
              } else {
                text += event.data;
                onUpdateResponse(callbackParam, {
                  content: text,
                  done: false,
                });
              }
            }
          });

          source.addEventListener("readystatechange", (event) => {
            if (event.readyState === source.CLOSED) {
              // after stream closed, done
              if (isSuccess) {
                // save answerHistory and questionHistory to context
                this.setChatContext({
                  answerHistory: [...context.answerHistory, text],
                  questionHistory: [...context.questionHistory, prompt],
                });

                // replace link with hostname
                if (search.data && search.data.length) {
                  for (let i = 0; i < search.data.length; i++) {
                    const hostname = new URL(search.data[i].url).hostname;
                    text = text.replaceAll(`[Source${i}]`, `[${hostname}]`);
                  }
                }
              }
              onUpdateResponse(callbackParam, {
                content: text,
                done: true,
              });
              resolve();
            }
          });
          source.addEventListener("error", (event) => {
            console.error(event);
            reject(this.getSSEDisplayError(event));
          });

          let isPrevDataEmpty = false;
          // override default _onStreamProgress to fix missing new line in response due to trimming, line modified mark with "// modified "
          source._onStreamProgress = function (e) {
            if (!source.xhr) {
              return;
            }

            if (source.xhr.status !== 200) {
              source._onStreamFailure(e);
              return;
            }

            if (source.readyState == source.CONNECTING) {
              source.dispatchEvent(new CustomEvent("open"));
              source._setReadyState(source.OPEN);
            }

            var data = source.xhr.responseText.substring(source.progress);

            source.progress += data.length;
            var parts = (source.chunk + data).split(/[\r\n]+/); // modified, split with newline character and avoid empty string in result array
            var lastPart = parts.pop();
            // modified
            for (const part of parts) {
              const event = source._parseEventChunk(part);
              if (event.data === "") {
                if (isPrevDataEmpty) {
                  // for two consecutive empty string, display newline by set data to newline character
                  event.data = "\n";
                } else {
                  isPrevDataEmpty = true; // set flag to true for first empty string
                }
              } else {
                isPrevDataEmpty = false; // set flag to false if not empty string
              }
              source.dispatchEvent(event);
            }
            source.chunk = lastPart;
          };
          source.stream();
        } catch (err) {
          reject(err);
        }
      });
    } catch (error) {
      console.error("Error PhindBot _sendPrompt:", error);
    }
  }

  /**
   * Should implement this method if the bot supports conversation.
   * The conversation structure is defined by the subclass.
   * @param null
   * @returns {any} - Conversation structure. null if not supported.
   */
  async createChatContext() {
    return { answerHistory: [], questionHistory: [] };
  }

  getFormattedDate(date) {
    let year = date.getFullYear();
    let month = (1 + date.getMonth()).toString().padStart(2, "0");
    let day = date.getDate().toString().padStart(2, "0");
    return month + "/" + day + "/" + year;
  }

  async getUUID() {
    const cookies = await ipcRenderer.invoke("get-cookies", {
      domain: "www.phind.com",
    });
    const uuidCookie = cookies.find((cookie) => cookie.name === "uuid");
    return uuidCookie ? uuidCookie.value : "";
  }
}
