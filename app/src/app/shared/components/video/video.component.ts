import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class VideoComponent implements OnInit {

  public safeURL: SafeResourceUrl;

  constructor(private _sanitizer: DomSanitizer) {
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube-nocookie.com/embed/C0DPdy98e4c?controls=0');
  }

  ngOnInit() {
  }

}
