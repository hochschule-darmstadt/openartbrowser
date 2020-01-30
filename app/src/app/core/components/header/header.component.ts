import { Component, OnInit, LOCALE_ID, Inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  public path: string = '';
  public locale: string = '';

  constructor(private router: Router, @Inject(LOCALE_ID) protected localeId: string) {
    /**
     * Set the variable path to router url
     * every time the url changed.
     */
    router.events.subscribe(val => (this.path = this.router.url));
    this.locale = localeId;
  }

  ngOnInit() {}
}
