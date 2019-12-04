import {Component, Input, SimpleChanges, EventEmitter, ViewChild, Output} from '@angular/core';
import {Artwork, Entity} from 'src/app/shared/models/models';
import {CustomStepDefinition, Options} from 'ng5-slider';
import {animate, style, transition, trigger} from "@angular/animations";


@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({opacity: '0'}),
        animate('.5s ease-out', style({opacity: '1'})),
      ]),
    ]),
  ],
})

export class TimelineComponent {
  /**  entities that should be displayed in this slider */
  @Input() items: Artwork[] = [];
  //sliderItems: Artwork[];
  private periodSpan = 1;

  itemCountPerPeriod: number = 4;
  manualRefresh: EventEmitter<void> = new EventEmitter<void>();

  /** trigger deletion of unused slides in slider component */
  @Output()
  deleteUnusedSlides: EventEmitter<void> = new EventEmitter<void>();

  private selectLastSlide: boolean = false;
  private slideStart: number;
  private slideEnd: number;

  minValue: number;
  maxValue: number;
  options: Options = {
    showTicksValues: false,
    showTicks: true,
    pushRange: true,
    draggableRange: true,

    maxRange: 10,
    minRange: 10,

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


  ngOnChanges(changes: SimpleChanges) {
    if (typeof this.items !== 'undefined' && this.items.length > 0) {
      // rebuild slides if slider items input changed.
      this.calculatePeriod();
      this.updateSliderItems();
    }
    console.log(this.maxValue)


  }

  calculatePeriod() {
    let sliderSteps: CustomStepDefinition[] = [];
    let sliderItems: Artwork[] = [];

    this.items.sort((a, b) => (a.inception > b.inception) ?
      1 : (a.inception === b.inception) ? ((a.artists[0].label > b.artists[0].label) ? 1 : -1) : -1);
    this.items = this.items.filter(item => item.inception);
    let firstInception = +this.items[0].inception;
    let lastInception = +this.items[this.items.length - 1].inception;

    let inceptionSpan = lastInception - firstInception;
    if (inceptionSpan === 0) {
      //only 1 period
    }
    let averagePeriodCount = 7;
    let reasonablePeriodDistance = 5;
    let minimumPeriodDistance = 1;
    this.periodSpan = Math.max(Math.round(inceptionSpan / averagePeriodCount / reasonablePeriodDistance)
      * reasonablePeriodDistance, minimumPeriodDistance);
    console.log(inceptionSpan, "/", averagePeriodCount, "/", reasonablePeriodDistance, " = ",
      inceptionSpan / averagePeriodCount / reasonablePeriodDistance, " rounded: ",
      Math.round(inceptionSpan / averagePeriodCount / reasonablePeriodDistance), " result = ", this.periodSpan);
    // 30/7 = 4,28 ; 4,28 / 5 = 0,85 ; Math.max( Math.round(0.85)*5, 1) = 5

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
    newOptions.minLimit = firstInception-firstPeriod;
    newOptions.maxLimit = lastInception-firstPeriod-10;
    console.log("max limit",newOptions.maxLimit);
    this.options = newOptions;
    this.minValue = firstPeriod + this.periodSpan; //change to items[0].inception

  }

  calcSlideStart() {
    let referenceIndex = this.items.findIndex(item => +item.inception > this.minValue) - 1;

    if (0 >= referenceIndex - 1 && referenceIndex <= this.items.length - 3) {
      this.slideStart = 0
    } else if (referenceIndex > this.items.length - this.itemCountPerPeriod - 1) {
      this.slideStart = this.items.length - this.itemCountPerPeriod
    } else {
      this.slideStart = referenceIndex - 1;
      console.log((0 <= referenceIndex - 1 && referenceIndex <= this.items.length - 2), "Requirement met!");
    }

    console.log("Slide starting at index: ", this.slideStart, "ending at ", this.slideEnd,
      "referenceIndex: ", referenceIndex, "minValue", this.minValue);
  }

  updateSliderItems() {
    this.slideEnd = this.slideStart + this.itemCountPerPeriod;
    this.maxValue = +this.items[this.slideEnd - 1].inception;

    console.log(this.minValue, this.slideStart, this.itemCountPerPeriod, this.slideEnd, this.maxValue);
    // let newMax = this.sliderItems[this.sliderItems.length - 1].inception;
    // const newOptions: Options = Object.assign({}, this.options);
    // newOptions.minRange = newMax;
    // newOptions.maxRange = newMax;
    // this.options = newOptions;


    //      && +item.inception < this.minValue + this.periodSpan);
    //console.log(this.carousel.carousel.slides.toArray())
  }

  public onCarouselMoved(slideData) {


    let newValue = +this.minValue + (+slideData * +this.itemCountPerPeriod);
    this.selectLastSlide = (+slideData === -1 && newValue < this.minValue);

    if (+this.options.stepsArray[0].value <= newValue &&
      newValue <= +this.options.stepsArray[this.options.stepsArray.length - 1].value) {
      // New Value in valid range
      this.minValue = newValue;
    } else if (Math.abs(newValue - +this.options.stepsArray[0].value) <=
      Math.abs(newValue - +this.options.stepsArray[this.options.stepsArray.length - 1].value)) {
      // New Value out of range and first value is closer than last value
      this.minValue = this.options.stepsArray[0].value
    } else {
      // New Value out of range and last value is closer than first value
      this.minValue = this.options.stepsArray[this.options.stepsArray.length - 1].value
    }
    console.log("onCarouselMoved", newValue, this.minValue);

  }

  onSliderMoved() {
    this.calcSlideStart();
    this.updateSliderItems();
    console.log("Slider moved!", this.slideStart, this.minValue)
    this.minValue = this.items[this.slideStart + 1].inception;

    console.log("test", this.selectLastSlide);

  }

  getItemData(itemId) {
    let item = this.items.filter(item => item.id === itemId)[0];
    return item.inception
  }


  prevClicked() {
    //this.onCarouselMoved(-1)
    this.slideStart = Math.max(this.slideStart - this.itemCountPerPeriod, 0);
    this.minValue = +this.items[this.slideStart + 1].inception;
    this.updateSliderItems()
  }

  nextClicked() {
    //this.onCarouselMoved(1)
    this.slideStart = Math.min(this.slideStart + (2 * this.itemCountPerPeriod), this.items.length) - this.itemCountPerPeriod;
    this.minValue = +this.items[this.slideStart + 1].inception;
    this.updateSliderItems()
  }


}
