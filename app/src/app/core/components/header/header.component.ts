import {
  Component, LOCALE_ID, Inject, ElementRef,
  ViewChild, OnDestroy, AfterViewInit
} from '@angular/core';
import {Router} from '@angular/router';
import * as elementResizeDetectorMaker from 'element-resize-detector';
import {interval} from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements AfterViewInit, OnDestroy {
  public path: string = '';
  public locale: string = '';

  /* the ElementResizeDetectorMaker creates an ElementResizeDetector, which will later on listen to the header nav bar
   to detect changes in height, so other content can be pushed down by the spacer */
  erd = elementResizeDetectorMaker({strategy: 'scroll', callOnAdd: true, debug: false});
  spacerHeight = 0;

  @ViewChild('navbar', {static: false}) navbarElem: ElementRef<HTMLElement>;
  @ViewChild('spacer', {static: false}) spacerElem: ElementRef<HTMLElement>;

  constructor(private router: Router, @Inject(LOCALE_ID) protected localeId: string) {
    /**
     * Set the variable path to router url
     * every time the url changed.
     */
    router.events.subscribe(() => (this.path = this.router.url));
    this.locale = localeId;
  }

 

  ngAfterViewInit() {
    // Listen to resize of navbarElem
    this.erd.listenTo(this.navbarElem.nativeElement!, (element) => {
      const height = element.offsetHeight;
      if (height !== this.spacerHeight) {
        this.spacerHeight = height;
        this.spacerElem.nativeElement.style.height = this.spacerHeight + '';
        // find potential stickyTitle element
        let stickyTitle = document.getElementById("stickyTitle")
        if (!stickyTitle) {
          // stickyTitle element not found, but maybe not initialized yet? check 6 seconds
          const subscription = interval(1000).subscribe(val => {
            stickyTitle = document.getElementById("stickyTitle")
            if (stickyTitle) {
              // stickyTitle found, push down
              stickyTitle.style.top = height + 'px'
              subscription.unsubscribe();
            } else if (val > 5) {
              // Unsubscribe after 6 seconds, loading takes too long -> no stickyTitle
              subscription.unsubscribe();
            }
          });
        } else {
          stickyTitle.style.top = height + 'px'
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.navbarElem) {
      this.erd.removeListener(this.navbarElem.nativeElement!, () => {
      }); // tailing ! -> non-null assertion operator
      this.erd.removeAllListeners(this.navbarElem.nativeElement!);
      this.erd.uninstall(this.navbarElem.nativeElement!);
    }
  }
}
