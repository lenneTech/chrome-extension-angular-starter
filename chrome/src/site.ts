// Site script
// The site script is integrated in sites specified in angular/src/manifest.json
// See https://developer.chrome.com/extensions/content_scripts

import { ActionType } from '../../angular/src/app/core/enums/action-type.enum';
import { DataType } from '../../angular/src/app/core/enums/data-type.enum';
import { Data } from '../../angular/src/app/core/models/data.model';
import { Message } from '../../angular/src/app/core/models/message.model';

/**
 * Content page class
 */
class Site {
  lastURL = '';

  /**
   * Initializations
   */
  constructor() {
    setInterval(() => {
      if (this.lastURL !== window.location.href) {
        this.lastURL = window.location.href;
        if (this.lastURL.startsWith('https://github.com/lenneTech')) {
          this.initListener();
          this.insertButton();
        }
      }
    }, 500);
  }

  /**
   * Insert button
   */
  public insertButton() {
    try {
      // Check if button already inserted
      if (document.querySelector('#cea-starter-button')) {
        return;
      }

      // Insert button
      const header = document.querySelector('h1');
      const button = document.createElement('button');
      button.title = 'CEA Starter button';
      button.id = 'cea-starter-button';
      button.innerText = 'CEA Starter button';
      button.className = 'btn btn-primary';
      header.appendChild(button);
      button.addEventListener('click', async () => {
        button.disabled = true;
        const data: Data = {
          type: DataType.MESSAGE,
          value: `Message with Timestamp: ${Date.now()}`
        };
        await this.sendToAppOrBackground(ActionType.SITE_BUTTON_CLICKED, data);
        button.disabled = false;
      });
    } catch (e) {
      setTimeout(this.insertButton, 500);
    }
  }

  /**
   * Initialize listener for messages from app or background script
   */
  public initListener() {
    // Listen to request form extension
    (chrome.runtime.onMessage as chrome.runtime.ExtensionMessageEvent).addListener(
      (message: Message, sender, respond) => {
        this.processMessages(message, sender, respond);
        return true;
      }
    );
  }

  /**
   * Process messages
   */
  public async processMessages(message: Message, sender, respond) {
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
        default: {
          // Handling must be implemented here
          const errorMsg = 'Unknown request type: ' + message.action;
          respond(new Error(errorMsg));
        }
      }
    } catch (err) {
      console.log(err);
      respond(err);
    }
  }

  /**
   * Send data to app
   */
  public sendToAppOrBackground(action: ActionType, data?: any): Promise<any> {
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
}

// Init
// tslint:disable-next-line:no-unused-expression
new Site();
