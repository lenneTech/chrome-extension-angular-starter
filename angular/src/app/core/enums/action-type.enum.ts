/**
 * Action type enums
 * Schema: WHO_WHAT_ACTION(_FOR_WHOM)
 */
export enum ActionType {
  // Actions of app
  APP_INTIALIZED = 'appInitialized',

  // Actions of background script
  BACKGROUND_DATA_SEND = 'backgroundDataSend',
  BACKGROUND_DATA_STORED = 'backgroundDataStored',
  BACKGROUND_DATA_SEND_FOR_APP = 'backgroundDataSendForApp',

  // Actions of site script
  SITE_BUTTON_CLICKED = 'siteButtonClicked'
}
