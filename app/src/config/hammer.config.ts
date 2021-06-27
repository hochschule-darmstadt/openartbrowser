import { HammerGestureConfig } from "@angular/platform-browser";
import * as hammer from "hammerjs";
 
export class HammerConfig extends HammerGestureConfig {
  overrides = <any>{
    swipe: { direction: hammer.DIRECTION_HORIZONTAL },
    pinch: { enable: false },
    rotate: { enable: false }
  };
}