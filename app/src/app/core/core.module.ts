import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { DataService } from './services/data.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';

/** Everything that should be loaded globally and only once goes here */
@NgModule({
  declarations: [HeaderComponent, FooterComponent],
  imports: [CommonModule, NgbModule, FormsModule, SharedModule],
  exports: [HeaderComponent, FooterComponent],
  providers: [DataService],
})
export class CoreModule {}
