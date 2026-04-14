import { enableProdMode, provideZoneChangeDetection } from '@angular/core';
import { platformBrowser } from '@angular/platform-browser';

import { environment } from './environments/environment';
import { AppRoutingModule } from './app/app.routing.module';

if (environment.production) {
  enableProdMode();
}

platformBrowser()
  .bootstrapModule(AppRoutingModule, { applicationProviders: [provideZoneChangeDetection()] })
  .catch((err) => console.error(err));
