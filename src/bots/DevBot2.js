import Bot from "@/bots/Bot";

export default class DevBot extends Bot {
  static _brandId = "dev1"; // Brand id of the bot, should be unique. Used in i18n.
  static _className = "DevBot1"; // Class name of the bot
  static _logoFilename = "default-logo.svg"; // Place it in public/bots/
  static _loginUrl = "http://chatall.ai";
  static _isAvailable = true;

  constructor() {
    super();
  }

  /**
   * Check whether the bot is logged in, settings are correct, etc.
   * @returns {boolean} - true if the bot is available, false otherwise.
   * @sideeffect - Set this.constructor._isAvailable
   */
  async checkAvailability() {
    // Check:
    // 1. Whether the bot is logged in as needed
    // 2. Whether the bot settings are correct (e.g. API key is valid)
    // If yes:
    //   this.constructor._isAvailable = true;
    // else:
    //   this.constructor._isAvailable = false;

    return this.isAvailable(); // Always return like this
  }

  /**
   * Send a prompt to the bot and call onResponse(response, callbackParam)
   * when the response is ready.
   * @param {string} prompt
   * @param {function} onUpdateResponse params: callbackParam, Object {content, done}
   * @param {object} callbackParam - Just pass it to onUpdateResponse() as is
   */
  /* eslint-disable */
  async _sendPrompt(prompt, onUpdateResponse, callbackParam) {
    let text = "";
    let count = 1;
    while (true && count <= 20) {
      text += prompt + " x " + count++ + '\n';
      await new Promise((resolve) => setTimeout(resolve, 100));
      onUpdateResponse(callbackParam, {
        content: text,
        done: false,
      });
    }
    onUpdateResponse(callbackParam, {
      content: text,
      done: true,
    });
  }

  /**
   * Should implement this method if the bot supports conversation.
   * The conversation structure is defined by the subclass.
   * @param null
   * @returns {any} - Conversation structure. null if not supported.
   */
  async createChatContext() {
    return null;
  }
}
