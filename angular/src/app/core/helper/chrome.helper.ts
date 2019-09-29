export class ChromeHelper {
  /**
   * Clear local storage
   */
  public static clearStorage() {
    return new Promise<void>((resolve, reject) => {
      chrome.storage.local.clear(() => {
        const error = chrome.runtime.lastError;
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Create window
   */
  public static createWindow(createData: chrome.windows.CreateData) {
    return new Promise<chrome.windows.Window>((resolve, reject) => {
      chrome.windows.create(createData, (window) => {
        if (window instanceof Error) {
          reject(window);
        } else {
          resolve(window);
        }
      });
    });
  }

  /**
   * Get from local storage
   */
  public static getFromStorage(keys: string | string[] | object | null) {
    return new Promise<{ [key: string]: any }>((resolve, reject) => {
      chrome.storage.local.get(keys, (items) => {
        if (items instanceof Error) {
          reject(items);
        } else {
          resolve(items);
        }
      });
    });
  }

  /**
   * Get tabs
   */
  public static getTabs(queryInfo: chrome.tabs.QueryInfo) {
    return new Promise<chrome.tabs.Tab[]>((resolve, reject) => {
      chrome.tabs.query(queryInfo, (tabs) => {
        if (tabs instanceof Error) {
          reject(tabs);
        } else {
          resolve(tabs);
        }
      });
    });
  }

  /**
   * Remove from local storage
   */
  public static removeFromStorage(keys: string | string[]) {
    return new Promise<{ [key: string]: any }>((resolve, reject) => {
      chrome.storage.local.remove(keys, () => {
        const error = chrome.runtime.lastError;
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Set in local storage
   */
  public static setInStorage(items: any) {
    return new Promise<void>((resolve) => {
      chrome.storage.local.set(items, () => {
        resolve();
      });
    });
  }
}
