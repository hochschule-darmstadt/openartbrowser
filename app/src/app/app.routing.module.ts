import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SearchResultComponent } from './pages/search-result/search-result.component';

/** routes to our feature modules.
 * advantage of routing to modules instead of components: lazy loading.
 **/
const routes: Routes = [
  {
    path: '',
    loadChildren: './pages/home/home.routing.module#HomeRoutingModule',
  },
  {
    path: 'impress',
    loadChildren: './pages/impress/impress.routing.module#ImpressRoutingModule',
  },
  {
    path: 'data-protection',
    loadChildren: './pages/data-protection/data-protection.routing.module#DataProtectionRoutingModule',
  },
  {
    path: 'about',
    loadChildren: './pages/about/about.routing.module#AboutRoutingModule',
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
  {
    path: 'search/:term',
    component: SearchResultComponent
  }
];

@NgModule({
  declarations: [AppComponent, SearchResultComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    CoreModule,
    SharedModule,
    NgbModule,
    RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })
  ],
  bootstrap: [AppComponent],
})
export class AppRoutingModule { }
