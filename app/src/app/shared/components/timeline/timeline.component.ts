import {Component, Input, SimpleChanges, EventEmitter, ViewChild} from '@angular/core';
import {Artwork, Entity} from 'src/app/shared/models/models';
import {CustomStepDefinition, Options} from 'ng5-slider';
import {SliderComponent} from "../slider/slider.component";
import {FormControl} from "@angular/forms";


@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})

export class TimelineComponent {
  /**  entities that should be displayed in this slider */
  @Input() items: Artwork[] = [];

  periodDistance = 5;

  sliderItems: Entity[];

  @ViewChild(SliderComponent)
  private carousel: SliderComponent;

  itemCountPerPeriod: number = 4;
  sliderControl: FormControl = new FormControl(3);

  manualRefresh: EventEmitter<void> = new EventEmitter<void>();

  value: number;
  options: Options = {
    showTicksValues: true,
    stepsArray: [],
    customValueToPosition: function (val, minVal, maxVal) {
      let range = maxVal - minVal;
      return (val - minVal) / range;
    },
    customPositionToValue: function (percent, minVal, maxVal) {
      return percent * (maxVal - minVal) + minVal;
    }
  };

  ngOnChanges(changes: SimpleChanges) {
    if (this.items.length > 0) {
      // rebuild slides if slider items input changed.
      this.calculatePeriod();
      this.updateSliderItems();
    }
  }

  calculatePeriod() {
    let sliderSteps: CustomStepDefinition[] = [];

    this.items.sort((a, b) => (a.inception > b.inception) ?
      1 : (a.inception === b.inception) ? ((a.artists[0].label > b.artists[0].label) ? 1 : -1) : -1);

    this.items = this.items.filter(item => item.inception);

    let firstInception = +this.items[0].inception;
    let lastInception = +this.items[this.items.length - 1].inception;

    // get the biggest multiple of periodDistance that is less than firstInception / same for lastInception
    let firstPeriod = firstInception - (firstInception % this.periodDistance);
    let lastPeriod = lastInception - (lastInception % this.periodDistance);

    for (let i = firstPeriod; i <= lastPeriod; i += this.periodDistance) {
      sliderSteps.push({value: i});
    }

    const newOptions: Options = Object.assign({}, this.options);
    newOptions.stepsArray = sliderSteps;
    this.options = newOptions;
    this.value = firstPeriod;
  }

  updateSliderItems() {
    this.sliderItems = this.items.filter(item => +item.inception >= this.value && +item.inception < this.value + this.periodDistance);
  }

  public onCarouselMoved(slideData) {
    let newValue = this.value + (slideData * this.periodDistance);
    if (+this.options.stepsArray[0].value <= newValue &&
      newValue <= +this.options.stepsArray[this.options.stepsArray.length - 1].value) {
      // New Value in valid range
      this.value = newValue;
    } else if (Math.abs(newValue - +this.options.stepsArray[0].value) <=
      Math.abs(newValue - +this.options.stepsArray[this.options.stepsArray.length - 1].value)) {
      // New Value out of range and first value is closer than last value
      this.value = this.options.stepsArray[0].value
    } else {
      // New Value out of range and last value is closer than first value
      this.value = this.options.stepsArray[this.options.stepsArray.length - 1].value
    }
  }

  onSliderMoved() {
    this.updateSliderItems();
  }
}
