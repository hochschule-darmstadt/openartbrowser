import {Component, Input, HostListener} from '@angular/core';
import {Artist, Artwork, Entity, EntityType} from 'src/app/shared/models/models';
import {CustomStepDefinition, Options} from 'ng5-slider';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {DataService} from "../../../core/services/data.service";

interface TimelineItem extends Entity {
  date: number;
  type: EntityType;
}

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
  animations: [
    trigger('slideNext', [
      state('out', style({transform: 'translateX(7%)', opacity: 0})),
      state('in', style({transform: 'translateX(0)', opacity: 1})),
      transition('in => out', [
        animate(0),
      ]),
      transition('out => in', [
        animate(300),
      ])
    ]),
    trigger('slidePrev', [
      state('out', style({transform: 'translateX(-7%)', opacity: 0})),
      state('in', style({transform: 'translateX(0)', opacity: 1})),
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
  /**  Artworks that should be displayed in this slider */
  @Input() artworks: Artwork[] = [];
  /**  TimelineItems that should be displayed in this slider */
  items: TimelineItem[] = [];
  //sliderItems: Artwork[];
  private periodSpan = 1;

  private itemCountPerPeriod: number = 4;
  private averagePeriodCount: number;

  private slideStart: number;
  private slideEnd: number;
  private sliderAllowEvent: boolean = true;

  private slideOutRight = false;
  private slideOutLeft = false;
  private referenceItem: number;

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

  @HostListener('window:resize', ['$event'])
  onResize() {
    let screenWidth = window.innerWidth;
    this.itemCountPerPeriod = Math.min(4, Math.max(1, Math.floor(screenWidth / 300)));
    this.referenceItem = +(this.itemCountPerPeriod > 1); // Convert bool to int, cause i can, LOL
    this.averagePeriodCount = Math.min(7, Math.floor(screenWidth / 125));
    this.refreshComponent();
  }

  constructor(private dataService: DataService) {
    this.onResize();
  }

  ngOnChanges() {
    if (typeof this.artworks !== 'undefined' && this.artworks.length > 0) {
      this.buildTimelineItemsFromArtworks();
      this.getArtistTimelineItems().then(artists => {
        this.items = this.items.concat(artists);
        this.sortItems();
      });
      this.sortItems();
      this.items = this.items.filter(item => item.date);
      this.value = +this.items[0].date;
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

    let firstDate = +this.items[0].date;
    let lastDate = +this.items[this.items.length - 1].date;

    let dateSpan = lastDate - firstDate;
    if (dateSpan === 0) {
      //only 1 period
    }
    let reasonablePeriodDistance = 5;
    let minimumPeriodDistance = 1;
    // Example:  30/7 = 4,28 ; 4,28 / 5 = 0,85 ; Math.max( Math.round(0.85)*5, 1) = 5
    this.periodSpan = Math.max(Math.round(dateSpan / this.averagePeriodCount / reasonablePeriodDistance)
      * reasonablePeriodDistance, minimumPeriodDistance);
    /*
    console.log(dateSpan, "/", averagePeriodCount, "/", reasonablePeriodDistance, " = ",
      dateSpan / averagePeriodCount / reasonablePeriodDistance, " rounded: ",
      Math.round(dateSpan / averagePeriodCount / reasonablePeriodDistance), " result = ", this.periodSpan);
    */

    // get the biggest multiple of periodSpan that is less than firstDate / same for lastDate
    let firstPeriod = firstDate - (firstDate % this.periodSpan);
    let lastPeriod = lastDate - (lastDate % this.periodSpan) + this.periodSpan;

    for (let i = firstPeriod; i <= lastPeriod; i++) {
      if (i % this.periodSpan === 0) {
        sliderSteps.push({value: i, legend: "" + i});

      } else {
        sliderSteps.push({value: i});
      }
    }

    const newOptions: Options = Object.assign({}, this.options);
    newOptions.stepsArray = sliderSteps;
    newOptions.minLimit = firstDate - firstPeriod;
    newOptions.maxLimit = lastDate - firstPeriod;
    this.options = newOptions;
  }

  calcSlideStart() {
    let itemCountSmallerReference = 2;
    let countReference = this.items.filter(item => +item.date === this.value).length;

    let referenceIndex: number;
    if (countReference > itemCountSmallerReference) {
      referenceIndex = this.items.findIndex(item => +item.date === this.value);
    } else {
      let firstBiggerRef = this.items.findIndex(item => +item.date > this.value);
      referenceIndex = firstBiggerRef > 0 ? firstBiggerRef - 1 : this.items.length - (this.itemCountPerPeriod - 1);
    }

    if (0 >= referenceIndex - 1 && referenceIndex <= this.items.length - 3) {
      //first slide
      this.slideStart = 0
    } else if (referenceIndex + (this.itemCountPerPeriod - this.referenceItem) > this.items.length) {
      //last slide
      this.slideStart = this.items.length - this.itemCountPerPeriod;
    } else {
      //between
      this.slideStart = referenceIndex - this.referenceItem;
    }
  }

  updateSliderItems() {
    this.slideEnd = this.slideStart + this.itemCountPerPeriod;
  }

  onSliderMoved() {
    if (!this.sliderAllowEvent) {
      this.sliderAllowEvent = true;
      return;
    }
    this.calcSlideStart();
    this.updateSliderItems();

    this.value = +this.items[this.slideStart + this.referenceItem].date;
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
    this.value = +this.items[this.slideStart + this.referenceItem].date;
    // decide if sliderMoved-Event should be suppressed
    this.sliderAllowEvent = false;
    this.updateSliderItems();
  }

  nextClicked() {
    if (this.slideEnd < this.items.length) {
      this.slideOutRight = true;
    }

    this.slideStart = Math.min(this.slideStart + (2 * this.itemCountPerPeriod),
      this.items.length) - this.itemCountPerPeriod;
    this.value = +this.items[this.slideStart + this.referenceItem].date;
    // decide if sliderMoved-Event should be suppressed
    this.sliderAllowEvent = false;

    this.updateSliderItems();
  }

  resetSlideAnimation() {
    this.slideOutRight = false;
    this.slideOutLeft = false;
  }

  buildTimelineItemsFromArtworks() {
    this.artworks.forEach(artwork => this.items.push(<TimelineItem>{
      id: artwork.id,
      label: artwork.label,
      description: artwork.description,
      abstract: artwork.abstract,
      wikipediaLink: artwork.wikipediaLink,
      image: artwork.image,
      imageSmall: artwork.imageSmall,
      imageMedium: artwork.imageMedium,
      type: artwork.type,
      absoluteRank: artwork.absoluteRank,
      relativeRank: artwork.relativeRank,
      date: artwork.inception,
    }))
  }

  async getArtistTimelineItems() {
    let artists: TimelineItem[] = [];
    let artistIds: Set<string> = new Set();
    this.artworks.sort((a, b) => a.relativeRank > b.relativeRank ? 1 : -1)
      .slice(0, Math.max(10, Math.floor(this.artworks.length / 10))) //get top 10%
      .forEach(artwork => {
        artwork.artists.forEach(artistId => artistIds.add(artistId + ""))
      })
    await this.dataService.findMultipleById(Array.from(artistIds) as any, EntityType.ARTIST)
      .then((artworkArtists: Artist[]) => {
        artworkArtists.forEach(artist => {
          if (artist.imageSmall && artist.date_of_birth) {
            artists.push(<TimelineItem>{
              id: artist.id,
              label: artist.label,
              description: "*" + artist.date_of_birth + " †" + artist.date_of_death,
              abstract: artist.abstract,
              wikipediaLink: artist.wikipediaLink,
              image: artist.image,
              imageSmall: artist.imageSmall,
              imageMedium: artist.imageMedium,
              type: artist.type,
              absoluteRank: artist.absoluteRank,
              relativeRank: artist.relativeRank,
              date: artist.date_of_birth
            })
          }
        })
      });
    return artists
  }

  private sortItems() {
    // rebuild slides if slider items input changed.
    this.items.sort((a, b) => (a.date > b.date) ? 1 : -1);
  }
}
