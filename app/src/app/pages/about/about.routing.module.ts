import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
import { SharedModule } from "../../shared/shared.module";
import { AboutComponent } from "./about.component";

const aboutRoutes: Routes = [
  {
    path: "",
    component: AboutComponent
  }
];

@NgModule({
  declarations: [AboutComponent],
  imports: [CommonModule, SharedModule, RouterModule.forChild(aboutRoutes)],
  exports: [AboutComponent]
})
export class AboutRoutingModule {}
