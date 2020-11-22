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
  { path: '', loadChildren: './pages/home/home.routing.module#HomeRoutingModule' },
  { path: 'imprint', loadChildren: './pages/imprint/imprint.routing.module#ImprintRoutingModule' },
  {
    path: 'data-protection',
    loadChildren: './pages/data-protection/data-protection.routing.module#DataProtectionRoutingModule'
  },
  { path: 'about', loadChildren: './pages/about/about.routing.module#AboutRoutingModule' },
  { path: 'movements', loadChildren: './pages/entities/entities.routing.module#EntitiesRoutingModule' },
  { path: 'artists', loadChildren: './pages/entities/entities.routing.module#EntitiesRoutingModule' },
  { path: 'artworks', loadChildren: './pages/entities/entities.routing.module#EntitiesRoutingModule' },
  { path: 'genres', loadChildren: './pages/entities/entities.routing.module#EntitiesRoutingModule' },
  { path: 'motifs', loadChildren: './pages/entities/entities.routing.module#EntitiesRoutingModule' },
  { path: 'locations', loadChildren: './pages/entities/entities.routing.module#EntitiesRoutingModule' },
  { path: 'materials', loadChildren: './pages/entities/entities.routing.module#EntitiesRoutingModule' },
  { path: 'artist/:artistId', loadChildren: './pages/artist/artist.routing.module#ArtistRoutingModule' },
  { path: 'artwork/:artworkId', loadChildren: './pages/artwork/artwork.routing.module#ArtworkRoutingModule' },
  { path: 'genre/:genreId', loadChildren: './pages/genre/genre.routing.module#GenreRoutingModule' },
  { path: 'location/:locationId', loadChildren: './pages/location/location.routing.module#LocationRoutingModule' },
  { path: 'material/:materialId', loadChildren: './pages/material/material.routing.module#MaterialRoutingModule' },
  { path: 'movement/:movementId', loadChildren: './pages/movement/movement.routing.module#MovementRoutingModule' },
  { path: 'motif/:motifId', loadChildren: './pages/motif/motif.routing.module#MotifRoutingModule' },
  { path: 'iconography/:notation', loadChildren: './pages/iconography/iconography.routing.module#IconographyRoutingModule' },
  { path: 'search', loadChildren: './pages/search-result/search-result.routing.module#SearchResultRoutingModule' },
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
export class AppRoutingModule {}
