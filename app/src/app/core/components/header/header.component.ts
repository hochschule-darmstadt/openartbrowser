import { Component, OnInit, LOCALE_ID, Inject } from '@angular/core';
import { Router } from '@angular/router';
import {Angulartics2} from "angulartics2";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  public path: string = "";
  public locale: string = ""

  public languages = [
    {code: 'en', name: 'English'},
    {code: 'de', name: 'Deutsch'},
    {code: 'fr', name: 'Français'},
    {code: 'es', name: 'Español'},
    {code: 'it', name: 'Italiano'},
  ];

  constructor(private router: Router, @Inject(LOCALE_ID) protected localeId: string, private angulartics2: Angulartics2) {
    /**
     * Set the variable path to router url
     * every time the url changed.
     */
    router.events.subscribe(val => this.path = this.router.url);
    this.locale = localeId;
  }

  ngOnInit() { }
}
