import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class VideoComponent implements OnInit {

video = "test";

  constructor(private _sanitizer: DomSanitizer) {

  }

  ngOnInit() {
  }

  getEmbedUrl(video){
    return this._sanitizer.bypassSecurityTrustResourceUrl(video);
  }

}
