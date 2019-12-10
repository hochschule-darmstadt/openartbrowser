import {Component, Input, HostListener} from '@angular/core';
import {Artwork} from 'src/app/shared/models/models';
import {CustomStepDefinition, Options} from 'ng5-slider';
import {animate, state, style, transition, trigger} from '@angular/animations';


@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
  animations: [
    trigger('slideNext', [
      state('out', style({transform: 'translateX(7%)', opacity: 0})),
      state('in', style({ transform: 'translateX(0)', opacity: 1})),
      transition('in => out', [
        animate(0),
      ]),
      transition('out => in', [
        animate(300),
      ])
    ]),
    trigger('slidePrev', [
      state('out', style({transform: 'translateX(-7%)', opacity: 0})),
      state('in', style({ transform: 'translateX(0)', opacity: 1})),
      transition('in => out', [
        animate(0),
      ]),
      transition('out => in', [
        animate(300),
      ])
    ])
  ],
})

export class TimelineComponent {
  /**  entities that should be displayed in this slider */
  @Input() items: Artwork[] = [];
  //sliderItems: Artwork[];
  private periodSpan = 1;

  private itemCountPerPeriod: number = 4;
  private averagePeriodCount: number;

  private slideStart: number;
  private slideEnd: number;
  private sliderAllowEvent: boolean = true;

  private slideOutRight = false;
  private slideOutLeft = false;

  value: number;
  previousValue: number;
  options: Options = {
    showTicksValues: false,
    showTicks: true,
    showSelectionBar: false,
    stepsArray: [],
    getPointerColor: function () {
      return "#00bc8c"
    },
    getTickColor: function () {
      return "#FFFFFF00"
    },
    customValueToPosition: function (val, minVal, maxVal) {
      let range = maxVal - minVal;
      return (val - minVal) / range;
    },
    customPositionToValue: function (percent, minVal, maxVal) {
      return percent * (maxVal - minVal) + minVal;
    }
  };
  private referenceItem: number;

  @HostListener('window:resize', ['$event'])
  onResize() {
    let screenWidth = window.innerWidth;
    this.itemCountPerPeriod = Math.min(4, Math.max(1, Math.floor(screenWidth / 300)));
    this.referenceItem = +(this.itemCountPerPeriod > 1); // Convert bool to int, cause i can, LOL
    this.averagePeriodCount = Math.min(7, Math.floor(screenWidth / 125));
    console.log("average count", this.averagePeriodCount);
    this.refreshComponent();
  }

  constructor() {
    this.onResize();
  }

  ngOnChanges() {
    console.log("ON CHANGES", this.items.length);
    if (typeof this.items !== 'undefined' && this.items.length > 0) {
      // rebuild slides if slider items input changed.
      this.items.sort((a, b) => (a.inception > b.inception) ?
        1 : (a.inception === b.inception) ? ((a.artists[0].label > b.artists[0].label) ? 1 : -1) : -1);
      this.items = this.items.filter(item => item.inception);
      this.value = +this.items[0].inception;
      this.previousValue = this.value;
      this.refreshComponent()
    }
  }

  refreshComponent() {
    if (typeof this.items !== 'undefined' && this.items.length > 0) {
      this.calculatePeriod();
      this.calcSlideStart();
      this.updateSliderItems();
    }
  }

  calculatePeriod() {
    let sliderSteps: CustomStepDefinition[] = [];

    let firstInception = +this.items[0].inception;
    let lastInception = +this.items[this.items.length - 1].inception;

    let inceptionSpan = lastInception - firstInception;
    if (inceptionSpan === 0) {
      //only 1 period
    }
    let reasonablePeriodDistance = 5;
    let minimumPeriodDistance = 1;
    // Example:  30/7 = 4,28 ; 4,28 / 5 = 0,85 ; Math.max( Math.round(0.85)*5, 1) = 5
    this.periodSpan = Math.max(Math.round(inceptionSpan / this.averagePeriodCount / reasonablePeriodDistance)
      * reasonablePeriodDistance, minimumPeriodDistance);
    /*
    console.log(inceptionSpan, "/", averagePeriodCount, "/", reasonablePeriodDistance, " = ",
      inceptionSpan / averagePeriodCount / reasonablePeriodDistance, " rounded: ",
      Math.round(inceptionSpan / averagePeriodCount / reasonablePeriodDistance), " result = ", this.periodSpan);
    */

    // get the biggest multiple of periodSpan that is less than firstInception / same for lastInception
    let firstPeriod = firstInception - (firstInception % this.periodSpan);
    let lastPeriod = lastInception - (lastInception % this.periodSpan) + this.periodSpan;

    for (let i = firstPeriod; i <= lastPeriod; i++) {
      if (i % this.periodSpan === 0) {
        sliderSteps.push({value: i, legend: "" + i});

      } else {
        sliderSteps.push({value: i});
      }
    }

    const newOptions: Options = Object.assign({}, this.options);
    newOptions.stepsArray = sliderSteps;
    newOptions.minLimit = firstInception - firstPeriod;
    newOptions.maxLimit = lastInception - firstPeriod;
    this.options = newOptions;
  }

  calcSlideStart() {
    let itemCountSmallerReference = 2;
    let countReference = this.items.filter(item => +item.inception === this.value).length;

    let referenceIndex: number;
    if (countReference > itemCountSmallerReference) {
      referenceIndex = this.items.findIndex(item => +item.inception === this.value);
    } else {
      let firstBiggerRef = this.items.findIndex(item => +item.inception > this.value);
      referenceIndex = firstBiggerRef > 0 ? firstBiggerRef - 1 : this.items.length - (this.itemCountPerPeriod - 1);
    }

    if (0 >= referenceIndex - 1 && referenceIndex <= this.items.length - 3) {
      //first slide
      this.slideStart = 0
    } else if (referenceIndex + (this.itemCountPerPeriod - this.referenceItem) > this.items.length) {
      //last slide
      this.slideStart = this.items.length - this.itemCountPerPeriod;
      console.log("calcSlideStart slideStart:", this.slideStart);
    } else {
      //between
      this.slideStart = referenceIndex - this.referenceItem;
    }
  }

  updateSliderItems() {
    this.slideEnd = this.slideStart + this.itemCountPerPeriod;

    console.log(this.value, this.slideStart, this.slideEnd, this.sliderAllowEvent);
  }

  onSliderMoved() {
    if (!this.sliderAllowEvent) {
      this.sliderAllowEvent = true;
      return;
    }
    this.calcSlideStart();
    this.updateSliderItems();

    console.log("onSliderMove ReferenceItem: ", this.referenceItem, this.slideStart, this.items);

    this.value = +this.items[this.slideStart + this.referenceItem].inception;
    if (this.value > this.previousValue) {
      this.slideOutRight = true;
    } else if (this.value < this.previousValue) {
      this.slideOutLeft = true;
    }

    this.previousValue = this.value;
  }

  prevClicked() {
    if (this.slideStart > 0) {
      this.slideOutLeft = true;
    }

    this.slideStart = Math.max(this.slideStart - this.itemCountPerPeriod, 0);
    this.value = +this.items[this.slideStart + this.referenceItem].inception;
    // decide if sliderMoved-Event should be suppressed
    this.sliderAllowEvent = false;
    console.log("Allowed: ", this.sliderAllowEvent);

    this.updateSliderItems();
  }

  nextClicked() {
    if (this.slideEnd < this.items.length) {
      this.slideOutRight = true;
    }

    this.slideStart = Math.min(this.slideStart + (2 * this.itemCountPerPeriod),
      this.items.length) - this.itemCountPerPeriod;
    this.value = +this.items[this.slideStart + this.referenceItem].inception;
    // decide if sliderMoved-Event should be suppressed
    this.sliderAllowEvent = false;

    this.updateSliderItems();
  }

  resetSlideAnimation() {
    this.slideOutRight = false;
    this.slideOutLeft = false;
  }
}
