import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TAB_ID } from '../../tab-id.injector';
import { ActionType } from '../enums/action-type.enum';
import { DataType } from '../enums/data-type.enum';
import { Data } from '../models/data.model';
import { Message } from '../models/message.model';

/**
 * The data service coordinates the communication between
 * - Angular App (SPA / PWA) that runs in a separate browser window
 * - Background script that runs even if the Angular App is not open
 * - Site script that is integrated into the site when the corresponding URL is called
 * - Chrome storage that holds the data ready in case the app or browser is closed
 *
 * Communication is organized via the `chrome.tabs` and `chrome.runtime` messages.
 * `chrome.tabs` is used to send messages to the site script.
 * `chrom.runtime` is used to send messages to the app and the background script.
 *
 * Since `chrome.runtime` addresses both the app and the background script at the same time, they must check who a new
 * message is intended for when they receive it. Differentiation can be made via the Enum ActionType
 * (see `src/app/core/enums/action-type.enum.ts`).
 *
 * The recommended communication channels are
 * - App => Background script
 * - App => Site script
 * - Background script => App
 * - Site script => Background script
 *
 * Background => Site script is may be useful in some cases, but a communication from Site script => App can run empty
 * if the app is not opened.
 */
@Injectable({
  providedIn: 'root'
})
export class DataService {
  // ===================================================================================================================
  // Properties
  // ===================================================================================================================

  // Data (in Chrome storage)
  data$: BehaviorSubject<Data[]> = new BehaviorSubject<any>([]);

  // ===================================================================================================================
  // Initializations
  // ===================================================================================================================

  /**
   * Constructor
   * Integrates the ID of the current Tab of the extension, loads data and initialize listener
   */
  constructor(@Inject(TAB_ID) protected readonly tabId: number) {
    this.loadData(); // Load data from Chrome storage
    this.initListener(); // Init listener for incoming messages from background script
    this.informBackgroundScriptThatAppIsInitialized(); // Inform background script that the app is initialized
  }

  /**
   * Initialize listener for messages from background (or site script)
   */
  public initListener() {
    // Listen to messages form background script
    chrome.runtime.onMessage.addListener((message: Message, sender, respond) => {
      this.processMessages(message, sender, respond);
      return true;
    });
  }

  // ===================================================================================================================
  // Methods for data (storage)
  // ===================================================================================================================

  /**
   * Getter for data
   */
  public get data(): Data[] {
    return this.data$.getValue();
  }

  /**
   * Setter for data
   */
  public set data(data: Data[]) {
    chrome.storage.local.set({ data }, () => {
      this.data$.next(data);
    });
  }

  /**
   * Getter for Observable of data
   */
  public get dataObservable(): Observable<Data[]> {
    return this.data$.asObservable();
  }

  /**
   * (Re)Load data from Chrome storage
   */
  public loadData() {
    return new Promise((resolve) => {
      chrome.storage.local.get('data', (result: any) => {
        this.data = result.data || [];
        resolve(this.data);
      });
    });
  }

  // ===================================================================================================================
  // Methods communication with site & background scripts
  // ===================================================================================================================

  /**
   * Inform background script that the app is initialized
   */
  public informBackgroundScriptThatAppIsInitialized() {
    this.sendToBackground(ActionType.APP_INTIALIZED, { type: DataType.ACTION, value: Date.now() }).subscribe();
  }

  /**
   * Process messages
   */
  public async processMessages(message: Message, sender, respond) {
    try {
      // Check message and action
      if (!message || !message.action) {
        const errorMsg = 'Missing message or message.action';
        throw new Error(errorMsg);
      }

      // Choose the appropriate form of processing the specific action
      switch (message.action) {
        // Background send data (action with data but without special addressees)
        case ActionType.BACKGROUND_DATA_SEND: {
          // Check data
          if (!message.data) {
            const errorMsg = 'Missing message.data';
            throw new Error(errorMsg);
          }

          // Process data
          console.log('Data for APP: ', message.data.id, message.data.type, message.data.value);

          // Acknowledge the processing
          return respond(true);
        }

        // Background send data (action with data but without special addressees)
        case ActionType.BACKGROUND_DATA_SEND_FOR_APP: {
          // Check data
          if (!message.data) {
            const errorMsg = 'Missing message.data';
            throw new Error(errorMsg);
          }

          // Process data
          console.log('Data for APP only: ', message.data.id, message.data.type, message.data.value);

          // Acknowledge the processing
          return respond(true);
        }

        // Background stored data in Chrome storage (action without data and special without addressees)
        case ActionType.BACKGROUND_DATA_STORED: {
          // Background has data stored, so load the data from storage to get it
          await this.loadData();

          // Acknowledge the processing
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
   * Send data to site script via TabID
   */
  public sendToSite(action: ActionType, data?: Data): Observable<any> {
    return new Observable((subscriber) => {
      try {
        const message: Message = { action, data };
        chrome.tabs.sendMessage(this.tabId, message, (response) => {
          subscriber.next(response);
          subscriber.complete();
        });
      } catch (err) {
        console.log(err);
        subscriber.error(err);
      }
    });
  }

  /**
   * Send data to background script
   */
  public sendToBackground(action: ActionType, data?: Data): Observable<any> {
    return new Observable((subscriber) => {
      try {
        const message: Message = { action, data };
        chrome.runtime.sendMessage(message, (response) => {
          subscriber.next(response);
          subscriber.complete();
        });
      } catch (err) {
        console.log(err);
        subscriber.error(err);
      }
    });
  }
}
