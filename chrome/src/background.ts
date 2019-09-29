// Background script
// The background script runs as long as the extension is active,
// regardless of whether the app (the app window) is open or not.
// See https://developer.chrome.com/extensions/background_pages

import { ActionType } from '../../angular/src/app/core/enums/action-type.enum';
import { ChromeHelper } from '../../angular/src/app/core/helper/chrome.helper';
import { Message } from '../../angular/src/app/core/models/message.model';

/**
 * Background script
 */
class Background {
  // ===================================================================================================================
  // Properties
  // ===================================================================================================================

  // Configuration of the app window
  config: {
    height: number; // Height of the popup window
    title: string; // Title of the popup window
    width: number; // Width of the popup window
  } = { height: 768, title: 'CEA Starter', width: 1024 };

  // ID of the app window
  id: number | boolean = false;

  // Status off app
  appInitialized = false;

  // ===================================================================================================================
  // Initializations
  // ===================================================================================================================

  /**
   * Initialize background script
   */
  constructor() {
    this.initListener(); // Init listener for incoming messages from site script
    this.initBrowserListener(); // Init listener for browser actions
  }

  /**
   * Initialize listener for browser actions
   * - Click on extension icon
   * - Close app window
   *
   * If you want to open a popup instead of an extra app window, change configuration in manifest.json:
   * `
   *  "browser_action": {
   *    "default_popup": "index.html",
   *    "default_title": "CAE Starter"
   *  }
   * `
   */
  initBrowserListener() {
    chrome.browserAction.onClicked.addListener((tab) => {
      this.initApp();
    });

    // Listen on windows remove
    chrome.windows.onRemoved.addListener((id) => {
      if (this.id === id) {
        this.id = false;
        this.appInitialized = false;
      }
    });
  }

  /**
   * Initialize listener for messages from site script (or app)
   */
  initListener() {
    // Listen to request form extension
    (chrome.runtime.onMessage as chrome.runtime.ExtensionMessageEvent).addListener(
      (message: Message, sender, respond) => {
        this.processMessages(message, sender, respond);
        return true;
      }
    );
  }

  /**
   * Initialize app
   */
  async initApp() {
    try {
      // Check if app window not exists
      if (this.id === false) {
        // Prevents multiple initialization of the app
        this.id = true;

        // Set title
        chrome.browserAction.setTitle({ title: this.config.title });

        // Get app url
        const url = chrome.runtime.getURL('index.html');

        // Create window and initialize app in it
        const tabs = await ChromeHelper.getTabs({ url });

        // Check if no tab with the app exists
        if (tabs.length > -1) {
          // Create new window
          const window = await ChromeHelper.createWindow({
            url,
            height: this.config.height,
            width: this.config.width,
            left: screen.width / 2 - this.config.width / 2,
            top: screen.height / 2 - this.config.height / 2,
            focused: true,
            type: 'popup'
          });

          // Check window
          if (!window) {
            return false;
          }

          // Set id of created window
          this.id = window.id;
          return true;
        }

        // Focus existing window
      } else if (typeof this.id === 'number') {
        // Set focus on existing app window
        chrome.windows.update(this.id, { focused: true });
        return true;
      }

      // App is currently in the initialization phase
      return false;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  // ===================================================================================================================
  // Methods communication with app & site script
  // ===================================================================================================================

  /**
   * Process messages
   */
  async processMessages(message: Message, sender, respond) {
    try {
      // Check message
      if (!message || !message.action) {
        // Respond
        const errorMsg = 'Missing message or message.action';
        respond(new Error(errorMsg));
        return;
      }

      // Choose the appropriate form of processing the specific action
      switch (message.action) {
        // Set app status
        case ActionType.APP_INTIALIZED: {
          this.appInitialized = true;
          respond(true);
          break;
        }

        // Process site button clicked
        case ActionType.SITE_BUTTON_CLICKED: {
          // Get data from storage
          let { data } = await ChromeHelper.getFromStorage(['data']);

          // Prepare data
          if (!data) {
            data = [];
          }

          // Add data
          data.push(message.data);

          // Save data in storage
          await ChromeHelper.setInStorage({ data });

          // Inform App
          if (!this.appInitialized) {
            await this.initApp();
          } else {
            await this.sendToApp(ActionType.BACKGROUND_DATA_STORED, message.data);
          }

          // Respond
          respond(true);
          break;
        }
      }
    } catch (err) {
      console.error(err);
      respond(err);
    }
  }

  /**
   * Send data to app
   */
  sendToApp(action: ActionType, data?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const message: Message = { action, data };
        chrome.runtime.sendMessage(message, (response) => {
          if (response instanceof Error) {
            reject(response);
          } else {
            resolve(response);
          }
        });
      } catch (err) {
        console.log(err);
        reject(err);
      }
    });
  }

  /**
   * Send data to site script
   */
  sendToSite(action: ActionType, data?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const message: Message = { action, data };
          chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
            if (response instanceof Error) {
              reject(response);
            } else {
              resolve(response);
            }
          });
        });
      } catch (err) {
        console.log(err);
        reject(err);
      }
    });
  }
}

// Init background script
// tslint:disable-next-line:no-unused-expression
new Background();
