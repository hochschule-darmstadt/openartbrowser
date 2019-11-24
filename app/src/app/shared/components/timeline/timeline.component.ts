import {
  Component,
  Input,
  SimpleChanges,
  OnChanges,
  EventEmitter,
  Output,
  OnInit,
  AfterContentInit
} from '@angular/core';
import {Artwork, Entity} from 'src/app/shared/models/models';
import {CustomStepDefinition, Options} from 'ng5-slider';
import {Slide} from "../slider/slider.component";
import {NgbCarousel} from "@ng-bootstrap/ng-bootstrap";
import {FormControl} from "@angular/forms";


@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})

export class TimelineComponent implements AfterContentInit {
  /**  entities that should be displayed in this slider */
  @Input() items: Artwork[] = [];



  sliderItems: Entity[];
  carousel = NgbCarousel;
  itemCountPerPeriod: Number = 4;
  sliderControl: FormControl = new FormControl(3);



  ngOnChanges(changes: SimpleChanges) {
    // rebuild slides if slider items input changed.
    this.calculatePeriod();
    this.sliderItems = this.items;//.slice(0,4);
    //console.log(this)

  }

  ngAfterContentInit(): void {
    //this.calculatePeriod()

  }

  value: number = 5;
  options: Options = {
    showTicksValues: true,
    stepsArray: [],
    customValueToPosition: function(val, minVal, maxVal) {
      //val = Math.sqrt(val);

      //minVal = Math.sqrt(minVal);
      //maxVal = Math.sqrt(maxVal);
      var range = maxVal - minVal;
      return (val - minVal) / range;
    },
    customPositionToValue: function(percent, minVal, maxVal) {
      //minVal = Math.sqrt(minVal);
      //maxVal = Math.sqrt(maxVal);
      var value = percent * (maxVal - minVal) + minVal;
      return value;//Math.pow(value, 2);
    }
  };

  calculatePeriod() {
    let sliderSteps: CustomStepDefinition[] = [];

    //Math.min(this.items.map(i => i.inception));
    //console.log(first, this.items);
    //  p.inception : min, this.items[0].inception);
    //let first = this.items.reduce((min, p) => p.inception < min ?items
    console.log(this.items);
    this.items.sort((a, b) => (a.inception > b.inception) ?
      1 : (a.inception === b.inception) ? ((a.artists[0].label > b.artists[0].label) ? 1 : -1) : -1);

    for (let i = 0; i < this.items.length; i += 4) {
      if (!this.items[i].inception) {
        i -= 3;
        continue
      }
      sliderSteps.push({value: this.items[i].inception});
    }
    /*this.items.forEach(function (item, index) {
      sliderSteps.push({value: item.inception});
    });*/

    console.log(sliderSteps);
    this.options = {
      showTicksValues: true,
      stepsArray: sliderSteps
    };
  }

  setSliderValue(value) {
    this.value = value;
  }

  public onCarouselMoved(slideData) {
    console.log("Moved!", slideData)
    console.log(slideData.hasOwnProperty("current"), +slideData.current.split("-").pop()-3)
    this.value = +slideData.current.split("-").pop()-3;

    this.sliderControl.setValue(this.value)
  }
}
