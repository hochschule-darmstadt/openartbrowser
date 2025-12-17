import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class UrlParamService {
  queryQueue: object[] = [];

  params = {};

  constructor(private router: Router, private location: Location) {}

  changeQueryParams(change): UrlParamService {
    if (this.queryQueue.length === 0 || this.queryQueue[this.queryQueue.length - 1] !== change) {
      // only add if change is new
      this.queryQueue.push(change);
    }
    return this;
  }

  /*
   * applies all queued changes to url params without a history entry or triggering a reload
   */
  resolve() {
    // nothing to resolve
    if (this.queryQueue.length === 0) return;

    this.queryQueue.forEach((change) => {
      this.params = Object.assign(this.params, change);
      // remove change from queue
      this.queryQueue.shift();
    });
    const url = this.router
      .createUrlTree([], {
        queryParams: this.params,
        queryParamsHandling: 'merge',
      })
      .toString();
    this.location.replaceState(url);
  }
}
