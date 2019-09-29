import { InjectionToken } from '@angular/core';

/**
 * Inject the currently opened tab id
 */
export const TAB_ID = new InjectionToken<number>('CHROME_TAB_ID');
