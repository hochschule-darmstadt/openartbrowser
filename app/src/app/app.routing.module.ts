import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


/** routes to our feature modules.
 * advantage of routing to modules instead of components: lazy loading.
 **/
const routes: Routes = [
  {
    path: '',
    loadChildren: './pages/home/home.routing.module#HomeRoutingModule',
  },
  {
    path: 'artist/:artistId',
    loadChildren: './pages/artist/artist.routing.module#ArtistRoutingModule',
  },
  {
    path: 'artwork/:artworkId',
    loadChildren: './pages/artwork/artwork.routing.module#ArtworkRoutingModule',
  },
  {
    path: 'genre/:genreId',
    loadChildren: './pages/genre/genre.routing.module#GenreRoutingModule',
  },
  {
    path: 'location/:locationId',
    loadChildren: './pages/location/location.routing.module#LocationRoutingModule',
  },
  {
    path: 'material/:materialId',
    loadChildren: './pages/material/material.routing.module#MaterialRoutingModule',
  },
  {
    path: 'movement/:movementId',
    loadChildren: './pages/movement/movement.routing.module#MovementRoutingModule',
  },
  {
    path: 'motif/:motifId',
    loadChildren: './pages/motif/motif.routing.module#MotifRoutingModule',
  },
];

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, HttpClientModule, CoreModule, SharedModule, RouterModule.forRoot(routes),
  NgbModule.forRoot()],
  bootstrap: [AppComponent],
})
export class AppRoutingModule {}
