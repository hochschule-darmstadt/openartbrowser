import {
  Component,
  OnInit,
  LOCALE_ID,
  Inject,
  ElementRef,
  ViewChild,
  OnDestroy,
  AfterViewInit,
  Output, EventEmitter
} from '@angular/core';
import {Router} from '@angular/router';
import * as elementResizeDetectorMaker from 'element-resize-detector';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, AfterViewInit, OnDestroy {
  public path: string = '';
  public locale: string = '';

  /* the ElementResizeDetectorMaker creates an ElementResizeDetector, which will later on listen to the header nav bar
   to detect changes in height, so other content can be pushed down by the spacer */
  erd = elementResizeDetectorMaker({strategy: 'scroll', callOnAdd: true});
  spacerHeight = 0;

  @ViewChild('navbar', {static: false}) navbarElem: ElementRef<HTMLElement>;
  @ViewChild('spacer', {static: false}) spacerElem: ElementRef<HTMLElement>;
  @Output() headerResize = new EventEmitter<object>();

  constructor(private router: Router, @Inject(LOCALE_ID) protected localeId: string, private el: ElementRef) {
    /**
     * Set the variable path to router url
     * every time the url changed.
     */
    router.events.subscribe(val => (this.path = this.router.url));
    this.locale = localeId;
  }

  ngOnInit() {
    this.spacerHeight = +document.getElementById('navbar').offsetHeight;
  }

  ngAfterViewInit() {
    this.erd.listenTo(this.navbarElem.nativeElement!, (element) => {
      const height = element.offsetHeight;
      if (height !== this.spacerHeight) {
        this.spacerHeight = height;
        this.spacerElem.nativeElement.style.height = this.spacerHeight + '';
        this.headerResize.emit({height: height})
      }
    });
  }

  ngOnDestroy() {
    this.erd.removeListener(this.navbarElem.nativeElement!, (testElement) => {
    }); // tailing ! -> non-null assertion operator
    this.erd.removeAllListeners(this.navbarElem.nativeElement!);
    this.erd.uninstall(this.navbarElem.nativeElement!);
  }
}
