import {AfterViewInit, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {Entity} from '../../models/models';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss'],
})
export class VideoComponent implements OnInit, OnDestroy, AfterViewInit {

  /**
   *  url that gets embedded in iframe in html
   */
  public safeUrl: SafeResourceUrl;

  public videoExists = false;

  @Input() entity: Entity;

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
  }

  ngOnInit(): void {
    if (this.entity) {
      const videoUrl = Array.isArray(this.entity.videos) ? this.entity.videos.pop() : this.entity.videos;
      if (videoUrl) {
        this.safeUrl = this.getTrustedUrl(videoUrl);
        console.log(this.safeUrl);
        this.validateVideoExists(videoUrl);
      }
    }

  }

  /**
   * @see https://gist.github.com/tonY1883/a3b85925081688de569b779b4657439b
   */
  validateVideoExists(youtubeVideoHref: string) {
    const regExpMatchArray = youtubeVideoHref.match('https://www.youtube.com/embed/([^/]+)');
    if (regExpMatchArray.length === 2) {
      const that = this;
      const id = regExpMatchArray[1];
      const checkURI = 'http://img.youtube.com/vi/' + id + '/mqdefault.jpg';
      const img = new Image();
      img.src = checkURI;
      img.onload = () => that.videoExists = img.width !== 120;
    }
  }

  constructor(private sanitizer: DomSanitizer) {
  }

  /**
   * @description sanitizes video url
   */
  getTrustedUrl(url: string) {
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : '';
  }


}
