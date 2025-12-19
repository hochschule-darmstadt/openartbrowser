import { Component, Input, HostListener, OnInit, OnChanges, OnDestroy } from '@angular/core';
import { Subject, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Artist, Artwork, Entity, EntityType } from 'src/app/shared/models/models';
import { CustomStepDefinition, Options } from '@angular-slider/ngx-slider';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { DataService } from 'src/app/core/services/elasticsearch/data.service';

interface TimelineItem extends Entity {
  date: number; // represents the value the item is located in the timeline
}

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
  animations: [
    trigger('slideNext', [
      state('out', style({ transform: 'translateX(7%)', opacity: 0 })),
      state('in', style({ transform: 'translateX(0)', opacity: 1 })),
      transition('in => out', [animate(0)]),
      transition('out => in', [animate(300)]),
    ]),
    trigger('slidePrev', [
      state('out', style({ transform: 'translateX(-7%)', opacity: 0 })),
      state('in', style({ transform: 'translateX(0)', opacity: 1 })),
      transition('in => out', [animate(0)]),
      transition('out => in', [animate(300)]),
    ]),
  ],
})
export class TimelineComponent implements OnInit, OnChanges, OnDestroy {
  /** Artworks that should be displayed in this slider */
  @Input() artworks: Artwork[] = [];
  /** Decide whether artists should be displayed */
  @Input() displayArtists = false;

  /** title of this slider */
  @Input() heading: string;

  /** TimelineItems that should be displayed in this slider */
  items: TimelineItem[] = [];

  private periodSpan = 1;

  private maxSliderSteps = 1000;
  /** Specifies the amount of items displayed once at a time */
  private itemCountPerPeriod = 4;
  /** Specifies the average amount of labels on the slider */
  private averagePeriodCount: number;

  /** Index of the starting and ending items */
  slideStart: number;
  slideEnd: number;

  /** Controls carousel movement by the slider
   *  In case the carousel moves the timeline, the timeline
   *  event should not move the carousel for its part
   */
  private sliderAllowEvent = true;

  /** Controls carousel animations */
  slideOutRight = false;
  slideOutLeft = false;

  /** The reference item describes the index of the item referring
   *  to the displayed value in the slider.
   *  It is either the first or second item (Values 0 or 1)
   *  It is only 0 if only one item is displayed per period
   */
  private referenceItem: number;

  /** variables to control automatic rotation of the timeline  */
  private nextRotationTime = 10; // number in seconds, set to '0' to disable
  private rotationTimer$ = new Subject<void>();
  private timerSubscription;

  /** The current value of the slider */
  value: number;
  /** Used to determine which animation direction to trigger when slider was clicked */
  previousValue: number;
  /** Settings for slider component */
  options: Options = {
    showTicksValues: false,
    showTicks: true,
    showSelectionBar: false,
    stepsArray: [],
    animateOnMove: true,
    getPointerColor() {
      return '#00bc8c';
    },
    getTickColor() {
      return '#FFFFFF00';
    },
    customValueToPosition(val, minVal, maxVal) {
      const range = maxVal - minVal;
      return (val - minVal) / range;
    },
    customPositionToValue(percent, minVal, maxVal) {
      return percent * (maxVal - minVal) + minVal;
    },
  };

  /** Determine values based on screen width (responsivity) */
  @HostListener('window:resize', ['$event'])
  onResize() {
    const screenWidth = window.innerWidth;
    /** Set itemCountPerPeriod to value between 1 and 4, depending on screen width */
    this.itemCountPerPeriod = Math.min(4, Math.max(1, Math.floor(screenWidth / 300)));
    /** decide whether reference item should be 0 or 1 */
    this.referenceItem = +(this.itemCountPerPeriod > 1 && this.items.length > 1); // Convert bool to int, cause i can, LOL
    /** Determine the amount of marked steps in the slider, depending on screen width */
    this.averagePeriodCount = Math.min(7, Math.floor(screenWidth / 125));
    this.refreshComponent();
  }

  constructor(private dataService: DataService) {
    this.onResize();
  }

  ngOnChanges() {
    if (typeof this.artworks !== 'undefined' && this.artworks.length > 0) {
      /** Clear items */
      this.items = [];
      this.buildTimelineItemsFromArtworks();
      if (this.displayArtists) {
        /** Insert artists into items */
        this.getArtistTimelineItems().then((artists) => {
          this.items = this.items.concat(artists);
          this.sortItems();
          this.refreshComponent();
        });
      }
      this.sortItems();
      this.items = this.items.filter((item) => item.date);
      const beginOfTimeline = this.items[0].date - (this.items[0].date % this.periodSpan);
      const endOfTimeline = this.items[this.items.length - 1].date - (this.items[this.items.length - 1].date % this.periodSpan) + this.periodSpan;
      // Set the slider of the timeline to the middle!
      // this.value = (beginOfTimeline + endOfTimeline) / 2;
      this.value = this.items[Math.floor(this.items.length / 2)].date;
      this.previousValue = this.value;
      this.refreshComponent();
    }
  }

  ngOnInit() {
    // setup timer for automatic timeline rotation
    // This will run the function 'nextClicked' every 'nextRotationTime' seconds
    if (this.nextRotationTime > 0) {
      this.timerSubscription = this.rotationTimer$
        .pipe(switchMap(() => timer(this.nextRotationTime * 1000, this.nextRotationTime * 1000)))
        .subscribe(() => this.nextClicked());
      // start timer
      this.rotationTimer$.next(undefined);
    }
  }

  ngOnDestroy() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  /** This method should be called whenever the timeline should adapt to new circumstances like new width or items */
  private refreshComponent() {
    if (typeof this.items !== 'undefined' && this.items.length > 0) {
      this.calculatePeriod();
      this.calcSlideStart();
      this.updateSliderItems();
    }
  }

  /**
   *  Calculates and sets the slider legend based on averagePeriodCount,
   *  this influences not the amount of steps of the slider
   */
  private calculatePeriod() {
    let sliderSteps: CustomStepDefinition[] = [];

    const firstDate = +this.items[0].date;
    const lastDate = +this.items[this.items.length - 1].date;

    const dateSpan = lastDate - firstDate;

    /** The period span must be either a multiple of reasonablePeriodDistance or minimumPeriodDistance */
    const reasonablePeriodDistance = 5;
    const minimumPeriodDistance = 1;
    /** Example:  30/7 = 4,28 ; 4,28 / 5 = 0,85 ; Math.max( Math.round(0.85)*5, 1) = 5 */
    this.periodSpan = Math.max(Math.round(dateSpan / this.averagePeriodCount / reasonablePeriodDistance) * reasonablePeriodDistance, minimumPeriodDistance);

    /** get the biggest multiple of periodSpan that is less than firstDate / same for lastDate */
    const firstPeriod = firstDate - (firstDate % this.periodSpan);
    const lastPeriod = lastDate - (lastDate % this.periodSpan) + this.periodSpan;

    /** setup options */
    const newOptions: Options = Object.assign({}, this.options);

    /** Fill the slider steps with period legends respectively steps */
    const timeDifference = lastPeriod - firstPeriod;
    if (timeDifference <= this.maxSliderSteps) {
      for (let i = firstPeriod; i <= lastPeriod; i++) {
        if (i % this.periodSpan === 0) {
          sliderSteps.push({ value: i, legend: '' + i });
        } else {
          sliderSteps.push({ value: i });
        }
      }

      /** set min and max slider limits */
      newOptions.minLimit = firstDate - firstPeriod;
      newOptions.maxLimit = lastDate - firstPeriod;
    } else {
      /**
       * if timeDifference bigger than maxSliderSteps, use distinct date values of the items
       * This is done to avoid too much items in the timeline
       */
      const distinctItems = this.items.filter((thing, i, arr) => arr.findIndex((t) => t.date === thing.date) === i);

      /**
       *  determine indices which divide distinctItems in averagePeriodCount blocks of roughly the same length
       *  this method guarantees that the first and last element are always an index
       */
      const stepNr = (distinctItems.length - 1) / (this.averagePeriodCount - 1);
      const indices = [];
      for (let i = 0; i < this.averagePeriodCount; i++) {
        indices.push(Math.floor(stepNr * i));
      }

      sliderSteps = distinctItems.map((item, index) => {
        const step = {
          value: item.date,
          legend: '',
        };

        /** if current index is in indices make this item a legend point */
        if (indices.includes(index)) {
          step.legend = item.date.toString();
        }

        return step;
      });
    }

    /** Set slider options */
    newOptions.stepsArray = sliderSteps;
    this.options = newOptions;
  }

  /**
   * Calculate the starting index of the displayed items relative to items
   */
  private calcSlideStart() {
    /** How many of the displayed items should have a date less/equal to the slider value */
    const itemCountSmallerReference = 2;
    /** Amount of items where date is the exact slider value */
    const countReference = this.items.filter((item) => +item.date === this.value).length;
    /** ReferenceIndex is the index of the first item with date equal to slider value or bigger */
    let referenceIndex: number;
    if (countReference > itemCountSmallerReference) {
      referenceIndex = this.items.findIndex((item) => +item.date === this.value);
    } else {
      const firstBiggerRef = this.items.findIndex((item) => +item.date > this.value);
      referenceIndex = firstBiggerRef > 0 ? firstBiggerRef - 1 : this.items.length - (this.itemCountPerPeriod - 1);
    }
    /** Determine start index */
    if (0 >= referenceIndex - 1 && referenceIndex <= this.items.length - 3) {
      // first slide
      this.slideStart = 0;
    } else if (referenceIndex + (this.itemCountPerPeriod - this.referenceItem) > this.items.length) {
      // last slide
      this.slideStart = this.items.length - this.itemCountPerPeriod;
    } else {
      // between
      this.slideStart = referenceIndex - this.referenceItem;
    }
  }

  /** This refreshes the ending index of the displayed items according to the start value */
  private updateSliderItems() {
    this.slideEnd = this.slideStart + this.itemCountPerPeriod;
  }

  /** Handler for valueChange event from slider.
   * Sets slideStart, slideEnd and value according to the new value and handles animation
   */
  onSliderMoved() {
    /** Check if event should happen */
    if (!this.sliderAllowEvent) {
      this.sliderAllowEvent = true;
      return;
    }
    // this resets the 'rotationTimer$'
    this.rotationTimer$.next(undefined);

    this.calcSlideStart();
    this.updateSliderItems();

    /** Set the value to the date of the chosen referenceItem */
    this.value = +this.items[this.slideStart + this.referenceItem].date;
    /** Set animation */
    if (this.value > this.previousValue) {
      this.slideOutRight = true;
    } else if (this.value < this.previousValue) {
      this.slideOutLeft = true;
    }
    this.previousValue = this.value;
  }

  /** Handler for click event from left control button. Updates startSlide, value and animation. */
  prevClicked() {
    // this resets the 'rotationTimer$'
    this.rotationTimer$.next(undefined);

    // decide if sliderMoved-Event should be suppressed
    this.sliderAllowEvent = false;
    this.slideOutLeft = true;
    if (this.slideStart <= 0) {
      this.slideStart = this.items.length - this.itemCountPerPeriod;
      this.value = this.items[this.items.length - 1].date;
    } else {
      this.slideStart = Math.max(this.slideStart - this.itemCountPerPeriod, 0);
      this.value = +this.items[this.slideStart + this.referenceItem].date;
    }
    this.updateSliderItems();
  }

  /** Handler for click event from right control button. Updates startSlide, value and animation. */
  nextClicked() {
    // this resets the 'rotationTimer$'
    this.rotationTimer$.next(undefined);

    // decide if sliderMoved-Event should be suppressed
    this.sliderAllowEvent = false;
    this.slideOutRight = true;
    if (this.slideEnd >= this.items.length) {
      this.slideStart = 0;
      this.value = this.items[0].date;
    } else {
      this.slideStart = Math.min(this.slideStart + 2 * this.itemCountPerPeriod, this.items.length) - this.itemCountPerPeriod;
      this.value = +this.items[this.slideStart + this.referenceItem].date;
    }
    this.updateSliderItems();
  }

  /** resets slide animation. Gets called after each animation */
  resetSlideAnimation() {
    this.slideOutRight = false;
    this.slideOutLeft = false;
  }

  /** Transform artworks into TimelineItems to display them aside with artists */
  private buildTimelineItemsFromArtworks() {
    this.artworks.forEach((artwork) =>
      this.items.push({
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
      } as TimelineItem)
    );
  }

  /** This adds artists to the timeline according to the displayed artworks. The artists get placed at their birth date */
  private async getArtistTimelineItems() {
    const artists: TimelineItem[] = [];
    const artistIds: Set<string> = new Set();
    /** Get the artist ids from the top 10% ranked artworks to display them aside with artworks */
    this.artworks
      .sort((a, b) => (a.relativeRank > b.relativeRank ? 1 : -1))
      .slice(0, Math.max(10, Math.floor(this.artworks.length / 10))) // get top 10%
      .forEach((artwork) => {
        if (artwork.artists) {
          artwork.artists.forEach((artistId) => artistIds.add(artistId + ''));
        }
      });
    /** Transform artists into Timeline items and set description */
    await this.dataService.findMultipleById(Array.from(artistIds) as any, EntityType.ARTIST).then((artworkArtists: Artist[]) => {
      artworkArtists.forEach(async (artist) => {
        if (artist.imageSmall && (artist.date_of_birth || artist.date_of_death)) {
          // decide whether to use date of birth or date of death for sorting (default: date of birth)
          // and set description accordingly
          let artistDescription;
          if (artist.date_of_birth && artist.date_of_death) {
            artistDescription = `${artist.date_of_birth} - ${artist.date_of_death}`;
          } else if (artist.date_of_birth) {
            artistDescription = `*${artist.date_of_birth}`;
          } else {
            artistDescription = '†' + artist.date_of_death;
          }
          let artistSortDate;
          if (artist.date_of_birth && artist.date_of_death) {
            artistSortDate = Math.floor(artist.date_of_birth + (artist.date_of_death - artist.date_of_birth) * 0.33);
          } else if (artist.date_of_birth) {
            artistSortDate = artist.date_of_birth;
          } else {
            artistSortDate = artist.date_of_death;
          }

          artists.push({
            id: artist.id,
            label: artist.label,
            description: artistDescription,
            abstract: artist.abstract,
            wikipediaLink: artist.wikipediaLink,
            image: artist.image,
            imageSmall: artist.imageSmall,
            imageMedium: artist.imageMedium,
            type: artist.type,
            absoluteRank: artist.absoluteRank,
            relativeRank: artist.relativeRank,
            date: artistSortDate,
          } as TimelineItem);
        }
      });
    });
    return artists;
  }

  /** This sorts the component items by date */
  private sortItems() {
    // rebuild slides if slider items input changed.
    this.items.sort((a, b) => (a.date > b.date ? 1 : -1));
  }

  /** Removes items from the component which cannot be displayed */
  onLoadingError(item: TimelineItem) {
    this.items.splice(
      this.items.findIndex((i) => i.id === item.id),
      1
    );
    this.refreshComponent();
  }
}
