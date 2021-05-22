import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

/** routes to our feature modules.
 * advantage of routing to modules instead of components: lazy loading.
 */
const routes: Routes = [
  { path: '', loadChildren: () => import('./pages/home/home.routing.module').then(m => m.HomeRoutingModule) },
  { path: 'imprint', loadChildren: () => import('./pages/imprint/imprint.routing.module').then(m => m.ImprintRoutingModule) },
  {
    path: 'data-protection',
    loadChildren: () => import('./pages/data-protection/data-protection.routing.module').then(m => m.DataProtectionRoutingModule)
  },
  { path: 'about', loadChildren: () => import('./pages/about/about.routing.module').then(m => m.AboutRoutingModule) },
  { path: 'movements', loadChildren: () => import('./pages/entities/entities.routing.module').then(m => m.EntitiesRoutingModule) },
  { path: 'artists', loadChildren: () => import('./pages/entities/entities.routing.module').then(m => m.EntitiesRoutingModule) },
  { path: 'artworks', loadChildren: () => import('./pages/entities/entities.routing.module').then(m => m.EntitiesRoutingModule) },
  { path: 'genres', loadChildren: () => import('./pages/entities/entities.routing.module').then(m => m.EntitiesRoutingModule) },
  { path: 'motifs', loadChildren: () => import('./pages/entities/entities.routing.module').then(m => m.EntitiesRoutingModule) },
  { path: 'locations', loadChildren: () => import('./pages/entities/entities.routing.module').then(m => m.EntitiesRoutingModule) },
  { path: 'materials', loadChildren: () => import('./pages/entities/entities.routing.module').then(m => m.EntitiesRoutingModule) },
  { path: 'classes', loadChildren: () => import('./pages/entities/entities.routing.module').then(m => m.EntitiesRoutingModule) },
  { path: 'artist/:artistId', loadChildren: () => import('./pages/artist/artist.routing.module').then(m => m.ArtistRoutingModule) },
  { path: 'artwork/:artworkId', loadChildren: () => import('./pages/artwork/artwork.routing.module').then(m => m.ArtworkRoutingModule) },
  { path: 'genre/:genreId', loadChildren: () => import('./pages/genre/genre.routing.module').then(m => m.GenreRoutingModule) },
  { path: 'location/:locationId', loadChildren: () => import('./pages/location/location.routing.module').then(m => m.LocationRoutingModule) },
  { path: 'material/:materialId', loadChildren: () => import('./pages/material/material.routing.module').then(m => m.MaterialRoutingModule) },
  { path: 'movement/:movementId', loadChildren: () => import('./pages/movement/movement.routing.module').then(m => m.MovementRoutingModule) },
  { path: 'motif/:motifId', loadChildren: () => import('./pages/motif/motif.routing.module').then(m => m.MotifRoutingModule) },
  { path: 'search', loadChildren: () => import('./pages/search-result/search-result.routing.module').then(m => m.SearchResultRoutingModule) },
  { path: '**', loadChildren: () => import('./pages/error/error.routing.module').then(m => m.ErrorRoutingModule) }
];

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    CoreModule,
    SharedModule,
    NgbModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled', relativeLinkResolution: 'legacy' })
  ],
  bootstrap: [AppComponent]
})
export class AppRoutingModule {
}
