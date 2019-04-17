import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';

/** routes to our feature modules.
 * advantage of routing to modules instead of components: lazy loading.
 **/
const routes: Routes = [
  {
    path: 'artist/:artistId',
    loadChildren: './pages/artist/artist-page.routing.module#ArtistPageRoutingModule',
  },
];

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, CoreModule, SharedModule, RouterModule.forRoot(routes)],
  bootstrap: [AppComponent],
})
export class AppRoutingModule {}
