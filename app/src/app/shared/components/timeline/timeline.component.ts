import {
  Component,
  Input,
  SimpleChanges,
  OnChanges,
  EventEmitter,
  Output,
  OnInit,
  AfterContentInit, ViewChild
} from '@angular/core';
import {Artwork, Entity} from 'src/app/shared/models/models';
import {CustomStepDefinition, Options} from 'ng5-slider';
import {Slide, SliderComponent} from "../slider/slider.component";
import {NgbCarousel} from "@ng-bootstrap/ng-bootstrap";
import {FormControl} from "@angular/forms";
import {by, element} from "protractor";


@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})

export class TimelineComponent {
  /**  entities that should be displayed in this slider */
  @Input() items: Artwork[] = [];


  sliderItems: Entity[];

  @ViewChild(SliderComponent)
  private carousel: SliderComponent;

  itemCountPerPeriod: number = 4;
  sliderControl: FormControl = new FormControl(3);

  manualRefresh: EventEmitter<void> = new EventEmitter<void>();

  value: number = 5;
  options: Options = {
    showTicksValues: true,
    stepsArray: [],
    customValueToPosition: function (val, minVal, maxVal) {
      var range = maxVal - minVal;
      return (val - minVal) / range;
    },
    customPositionToValue: function (percent, minVal, maxVal) {
      var value = percent * (maxVal - minVal) + minVal;
      return value;
    }
  };

  ngOnChanges(changes: SimpleChanges) {
    // rebuild slides if slider items input changed.
    this.calculatePeriod();
    this.sliderItems = this.items;
  }

  calculatePeriod() {
    let sliderSteps: CustomStepDefinition[] = [];

    this.items.sort((a, b) => (a.inception > b.inception) ?
      1 : (a.inception === b.inception) ? ((a.artists[0].label > b.artists[0].label) ? 1 : -1) : -1);

    for (let i = 0; i < this.items.length; i += 4) {
      if (!this.items[i].inception) {
        i -= 3;
        continue
      }
      sliderSteps.push({value: this.items[i].inception});
    }

    const newOptions: Options = Object.assign({}, this.options);
    newOptions.stepsArray = sliderSteps;
    this.options = newOptions;
  }

  setSliderValue(value) {
    this.value = value;
  }

  public onCarouselMoved(slideData) {
    let slideNumber = +slideData.current.split("-").pop() - (this.itemCountPerPeriod - 1);
    let year = +this.options.stepsArray[slideNumber].value;

    this.value = year;
    this.manualRefresh.emit();
  }

  onSliderMoved() {
    let ind = this.options.stepsArray.findIndex(x => x.value === this.value);
    this.carousel.selectSlide(ind + 3);
  }
}
