import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Entity } from '../../models/models';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss'],
})
export class VideoComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {

  @Input() entity: Entity;

  /**
   *  url that gets embedded in iframe in html
   */
  safeUrl: SafeResourceUrl;

  @Output() videoFound = new EventEmitter<boolean>();
  videoExists = false;

  constructor(private sanitizer: DomSanitizer) {
  }

  /** TODO:REVIEW
   *   Lifecycle Hooks can be removed if they are not used.
   */

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
  }

  ngOnInit(): void {
  }

  initVideo(): void {
    if (this.entity && this.entity.videos) {
      const videoUrl = Array.isArray(this.entity.videos) ? this.entity.videos.pop() : this.entity.videos;
      if (videoUrl) {
        this.safeUrl = this.getTrustedUrl(videoUrl);
        this.validateVideoExists(videoUrl)
          .then(exists => {
            this.videoExists = exists;
            this.videoFound.emit(this.videoExists);
          });
      }
    } else {
      this.videoExists = false;
      this.videoFound.emit(this.videoExists);
    }
  }

  /**
   * @see https://gist.github.com/tonY1883/a3b85925081688de569b779b4657439b
   */
  private validateVideoExists(youtubeVideoHref: string): Promise<boolean> {
    return new Promise((resolve: Function, reject: Function) => {
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
   * @description sanitizes video url
   */
  private getTrustedUrl(url: string): any {
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : '';
  }

  ngOnChanges(changes): void {
    if (changes.entity !== undefined) {
      this.initVideo();
    }
  }
}
