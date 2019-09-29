import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { TAB_ID } from './app/tab-id.injector';
import { environment } from './environments/environment';

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (environment.production) {
    enableProdMode();
  }

  const tab = [...tabs].pop();
  const { id: tabId } = tab;

  // Provides the current TabID so messages can be send to the site script
  platformBrowserDynamic([{ provide: TAB_ID, useValue: tabId }])
    .bootstrapModule(AppModule)
    .catch((error) => console.error(error));
});
