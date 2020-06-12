import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

const enum RoutingModules {
  HomeRoutingModule = './pages/home/home.routing.module#HomeRoutingModule',
  ImprintRoutingModule = './pages/imprint/imprint.routing.module#ImprintRoutingModule',
  DataProtectionRoutingModule = './pages/data-protection/data-protection.routing.module#DataProtectionRoutingModule',
  AboutRoutingModule = './pages/about/about.routing.module#AboutRoutingModule',
  EntitiesRoutingModule = './pages/entities/entities.routing.module#EntitiesRoutingModule',
  ArtistRoutingModule = './pages/artist/artist.routing.module#ArtistRoutingModule',
  ArtworkRoutingModule = './pages/artwork/artwork.routing.module#ArtworkRoutingModule',
  GenreRoutingModule = './pages/genre/genre.routing.module#GenreRoutingModule',
  LocationRoutingModule = './pages/location/location.routing.module#LocationRoutingModule',
  MaterialRoutingModule = './pages/material/material.routing.module#MaterialRoutingModule',
  MovementRoutingModule = './pages/movement/movement.routing.module#MovementRoutingModule',
  MotifRoutingModule = './pages/motif/motif.routing.module#MotifRoutingModule',
  SearchResultRoutingModule = './pages/search-result/search-result.routing.module#SearchResultRoutingModule',
}

/** routes to our feature modules.
 * advantage of routing to modules instead of components: lazy loading.
 */
const routes: Routes = [
  { path: '', loadChildren: RoutingModules.HomeRoutingModule },
  { path: 'imprint', loadChildren: RoutingModules.ImprintRoutingModule },
  { path: 'data-protection', loadChildren: RoutingModules.DataProtectionRoutingModule },
  { path: 'about', loadChildren: RoutingModules.AboutRoutingModule },
  { path: 'movements', loadChildren: RoutingModules.EntitiesRoutingModule },
  { path: 'artists', loadChildren: RoutingModules.EntitiesRoutingModule },
  { path: 'artworks', loadChildren: RoutingModules.EntitiesRoutingModule },
  { path: 'genres', loadChildren: RoutingModules.EntitiesRoutingModule },
  { path: 'motifs', loadChildren: RoutingModules.EntitiesRoutingModule },
  { path: 'locations', loadChildren: RoutingModules.EntitiesRoutingModule },
  { path: 'materials', loadChildren: RoutingModules.EntitiesRoutingModule },
  { path: 'artist/:artistId', loadChildren: RoutingModules.ArtistRoutingModule },
  { path: 'artwork/:artworkId', loadChildren: RoutingModules.ArtworkRoutingModule },
  { path: 'genre/:genreId', loadChildren: RoutingModules.GenreRoutingModule },
  { path: 'location/:locationId', loadChildren: RoutingModules.LocationRoutingModule },
  { path: 'material/:materialId', loadChildren: RoutingModules.MaterialRoutingModule },
  { path: 'movement/:movementId', loadChildren: RoutingModules.MovementRoutingModule },
  { path: 'motif/:motifId', loadChildren: RoutingModules.MotifRoutingModule },
  { path: 'search', loadChildren: RoutingModules.SearchResultRoutingModule },
  { path: '**', redirectTo: '' }
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
    RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })
  ],
  bootstrap: [AppComponent]
})
export class AppRoutingModule {
}
