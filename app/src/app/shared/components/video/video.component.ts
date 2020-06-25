import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Entity } from '../../models/models';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class VideoComponent implements OnInit, OnChanges {
  @Input() videoUrl: string;

  /**
   *  url that gets embedded in iframe in html
   */
  safeUrl: SafeResourceUrl;

  @Output() videoFound = new EventEmitter<boolean>();
  videoExists = false;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {}

  initVideo(): void {
    if (this.videoUrl) {
        this.safeUrl = this.getTrustedUrl(this.videoUrl);
        this.validateVideoExists(this.videoUrl).then(exists => {
          this.videoExists = exists;
          this.videoFound.emit(this.videoExists);
        });
    } else {
      this.videoExists = false;
      this.videoFound.emit(this.videoExists);
    }
  }

  /**
   * @see https://gist.github.com/tonY1883/a3b85925081688de569b779b4657439b
   * Checks if video exists based on the video thumbnail. For non existent videos YT returns an error picture with a
   * width of 120 pixels.
   */
  private validateVideoExists(youtubeVideoHref: string): Promise<boolean> {
    return new Promise(resolve => {
      const regExpMatchArray = youtubeVideoHref.match('https://www.youtube(-nocookie)?.com/embed/([^/]+)');
      if (regExpMatchArray.length === 3) {
        const id = regExpMatchArray[2];
        const checkURI = 'https://img.youtube.com/vi/' + id + '/mqdefault.jpg';
        const img = new Image();
        img.src = checkURI;
        img.onload = () => resolve(img.width !== 120);
      }
    });
  }

  /**
   * @description converts url into SafeUrl object. Needed to bypass Angular cross scripting protection.
   */
  private getTrustedUrl(url: string): any {
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : '';
  }

  /**
   * @description This reinitializes the video every time the entity changes. Cannot be done in ngOnInit, because
   * Angular reuses the component instance when the entity changes.
   */
  ngOnChanges(changes): void {
    if (changes.videoUrl !== undefined) {
      this.initVideo();
    }
  }
}
