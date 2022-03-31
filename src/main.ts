import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

function matchPath(path: string): boolean {
  return window.location.pathname.includes(path);
}

if ('serviceWorker' in navigator) {
  if (matchPath('/en/')) {
    navigator.serviceWorker.register('/en/ngsw-worker.js');
  } else if (matchPath('/ch/')) {
    navigator.serviceWorker.register('/ch/ngsw-worker.js');
  } else if (matchPath('/')) {
    navigator.serviceWorker.register('/ngsw-worker.js');
  }
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
