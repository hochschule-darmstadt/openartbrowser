import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { HttpClientModule } from '@angular/common/http';

/** routes to our feature modules.
 * advantage of routing to modules instead of components: lazy loading.
 **/
const routes: Routes = [
  {
    path: 'artist/:artistId',
    loadChildren: './pages/artist/artist.routing.module#ArtistRoutingModule',
  },
];

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, HttpClientModule, CoreModule, SharedModule, RouterModule.forRoot(routes)],
  bootstrap: [AppComponent],
})
export class AppRoutingModule {}
