import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HeaderComponent} from './components/header/header.component';
import {FooterComponent} from './components/footer/footer.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {FormsModule} from '@angular/forms';
import {SharedModule} from '../shared/shared.module';
import {RouterModule} from '@angular/router';
import {DataService} from './services/elasticsearch/data.service';
import {SearchService} from './services/search.service';
import {AnalyticsComponent} from './components/analytics/analytics.component';
import {Angulartics2Module} from 'angulartics2';
import {AnalyticsOptions} from './components/analytics/analyticsOptions';

/** Everything that should be loaded globally and only once goes here */
@NgModule({
  declarations: [HeaderComponent, FooterComponent, AnalyticsComponent],
  imports: [CommonModule, NgbModule, FormsModule, SharedModule, RouterModule, Angulartics2Module.forRoot(AnalyticsOptions)],
  exports: [HeaderComponent, FooterComponent, AnalyticsComponent],
  providers: [DataService, SearchService],
})
export class CoreModule {
}
