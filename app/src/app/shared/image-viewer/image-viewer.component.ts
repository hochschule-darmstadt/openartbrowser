import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-image-viewer',
  template: `
    <div class="image-viewer" [style.background-color]="config?.containerBackgroundColor || 'transparent'">
      <div class="controls align-items-center ">
        <app-commons-info *ngIf="firstSrc"  class="license-info" [fileUrl]="firstSrc"></app-commons-info>
        <button (click)="zoomIn()" title="Zoom in">+</button>
        <button (click)="zoomOut()" title="Zoom out">-</button>
        <button (click)="reset()" title="Reset">⤾</button>
        <button (click)="emitClose()" title="Close">X</button>
      </div>
      <div
        #viewport
        class="iv-viewport"
        (pointerdown)="onPointerDown($event)"
        (pointerup)="onPointerUp($event)"
        (pointercancel)="onPointerUp($event)"
        (pointermove)="onPointerMove($event)"
        (wheel)="onWheel($event)"
      >
        <img
          #imgEl
          *ngIf="firstSrc"
          [src]="firstSrc"
          (load)="onImageLoad()"
          [style.transform]="transformStyle"
          class="iv-image"
          [class.dragging]="dragging"
          draggable="false"
        />
      </div>
    </div>
  `,
  styleUrls: ['./image-viewer.component.scss'],
})
export class ImageViewerComponent implements OnInit {
  @Input() src: string[] | string;
  @Input() config: any;
  @ViewChild('imgEl', { static: false }) imgEl: ElementRef<HTMLImageElement> | undefined;
  @ViewChild('viewport', { static: false }) viewport: ElementRef<HTMLDivElement> | undefined;
  @Output()
  closed: EventEmitter<void> = new EventEmitter<void>();

  scale = 1;
  minScale = 0.05;
  maxScale = 35;
  translateX = 0;
  translateY = 0;

  dragging = false;
  private lastPointerX = 0;
  private lastPointerY = 0;
  private pointerId: number | null = null;
  private baseScale = 1;
  private naturalWidth = 0;
  private naturalHeight = 0;

  ngOnInit(): void {
    if (!this.config) {
      this.config = {};
    }
    if (typeof this.config.zoomFactor === 'undefined') {
      this.config.zoomFactor = 0.1;
    }
    if (typeof this.config.wheelZoom === 'undefined') {
      this.config.wheelZoom = true;
    }
    if (typeof this.config.maxZoom === 'undefined') {
      this.config.maxZoom = 2;
    }
    if (typeof this.scale !== 'number' || isNaN(this.scale)) {
      this.scale = 1;
    }
  }

  // no ngOnDestroy required

  get firstSrc(): string | null {
    if (!this.src) {
      return null;
    }
    if (Array.isArray(this.src)) {
      return this.src.length ? this.src[0] : null;
    }
    return this.src as string;
  }

  get transformStyle(): string {
    return `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
  }

  emitClose(): void {
    this.closed.emit();
  }

  zoomIn(): void {
    const vw = this.viewport?.nativeElement.clientWidth || 0;
    const vh = this.viewport?.nativeElement.clientHeight || 0;
    const step = this.config.zoomFactor || 0.1;
    this.applyZoom(this.scale + step, vw / 2, vh / 2);
  }

  zoomOut(): void {
    const vw = this.viewport?.nativeElement.clientWidth || 0;
    const vh = this.viewport?.nativeElement.clientHeight || 0;
    const step = this.config.zoomFactor || 0.1;
    this.applyZoom(this.scale - step, vw / 2, vh / 2);
  }

  reset(): void {
    // reset to fit-to-container scale (set on image load) and center
    this.scale = this.baseScale || 1;
    this.translateX = 0;
    this.translateY = 0;
  }

  setScale(newScale: number): void {
    this.applyZoom(Math.max(this.minScale, Math.min(this.maxScale, newScale)));
  }

  private applyZoom(newScale: number, clientX?: number, clientY?: number): void {
    const vp = this.viewport?.nativeElement;
    if (!vp) {
      this.scale = Math.max(this.minScale, Math.min(this.maxScale, newScale));
      return;
    }

    // Clamp the new scale to min/max bounds
    const clampedScale = Math.max(this.minScale, Math.min(this.maxScale, newScale));

    const vw = vp.clientWidth;
    const vh = vp.clientHeight;
    const cx = typeof clientX === 'number' ? clientX : vw / 2;
    const cy = typeof clientY === 'number' ? clientY : vh / 2;

    const prev = this.scale || 1;

    // Convert client coordinates to viewport-relative coordinates
    const rect = vp.getBoundingClientRect();
    const viewportX = cx - rect.left;
    const viewportY = cy - rect.top;

    // Calculate the point in the current image coordinate system (before scaling)
    const imagePointX = (viewportX - vw / 2 - this.translateX) / prev;
    const imagePointY = (viewportY - vh / 2 - this.translateY) / prev;

    // Apply new scale
    this.scale = clampedScale;

    // Calculate new translate to keep the same image point under the cursor/zoom center
    this.translateX = viewportX - vw / 2 - imagePointX * this.scale;
    this.translateY = viewportY - vh / 2 - imagePointY * this.scale;

    this.clampTranslate();
  }

  onWheel(event: WheelEvent): void {
    if (!this.config.wheelZoom) {
      return;
    }
    event.preventDefault();
    const delta = -Math.sign(event.deltaY) * (this.config.zoomFactor || 0.1);
    this.applyZoom(this.scale + delta, event.clientX, event.clientY);
  }

  onPointerDown(event: PointerEvent): void {
    if (this.pointerId !== null && event.pointerId !== this.pointerId) {
      return;
    }
    this.viewport?.nativeElement.setPointerCapture?.(event.pointerId);
    this.pointerId = event.pointerId;
    this.dragging = true;
    this.lastPointerX = event.clientX;
    this.lastPointerY = event.clientY;
  }

  onPointerMove(event: PointerEvent): void {
    if (!this.dragging || this.pointerId !== event.pointerId) {
      return;
    }
    event.preventDefault();
    const dx = event.clientX - this.lastPointerX;
    const dy = event.clientY - this.lastPointerY;
    this.lastPointerX = event.clientX;
    this.lastPointerY = event.clientY;
    this.translateX += dx;
    this.translateY += dy;
    this.clampTranslate();
  }

  onPointerUp(event: PointerEvent): void {
    if (this.pointerId !== event.pointerId) {
      return;
    }
    this.viewport?.nativeElement.releasePointerCapture?.(event.pointerId);
    this.pointerId = null;
    this.dragging = false;
  }

  private clampTranslate(): void {
    const vp = this.viewport?.nativeElement;
    const img = this.imgEl?.nativeElement;
    if (!vp || !img) {
      const max = 2000;
      this.translateX = Math.max(-max, Math.min(max, this.translateX));
      this.translateY = Math.max(-max, Math.min(max, this.translateY));
      return;
    }

    const vw = vp.clientWidth;
    const vh = vp.clientHeight;
    const natW = this.naturalWidth || img.naturalWidth || img.width || vw;
    const natH = this.naturalHeight || img.naturalHeight || img.height || vh;

    const scaledW = natW * this.scale;
    const scaledH = natH * this.scale;

    const maxX = Math.max(0, (scaledW - vw) / 2);
    const maxY = Math.max(0, (scaledH - vh) / 2);

    this.translateX = Math.max(-maxX, Math.min(maxX, this.translateX));
    this.translateY = Math.max(-maxY, Math.min(maxY, this.translateY));
  }

  onImageLoad(): void {
    const img = this.imgEl?.nativeElement;
    const vp = this.viewport?.nativeElement;
    if (!img || !vp) {
      return;
    }
    this.naturalWidth = img.naturalWidth || img.width;
    this.naturalHeight = img.naturalHeight || img.height;
    const vw = vp.clientWidth;
    const vh = vp.clientHeight;
    const fitScale = Math.min(vw / (this.naturalWidth || vw), vh / (this.naturalHeight || vh));
    this.baseScale = Math.min(1, fitScale || 1);
    const cfgMax = this.config?.maxZoom || 2;
    this.maxScale = Math.max(this.minScale, cfgMax);
    this.translateX = 0;
    this.translateY = 0;
    this.scale = this.baseScale;
    this.clampTranslate();
  }
}
