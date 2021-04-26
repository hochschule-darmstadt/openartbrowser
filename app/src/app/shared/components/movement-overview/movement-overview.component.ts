import {AfterViewInit, Component, HostListener, Input, OnDestroy, OnInit} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {Options} from '@angular-slider/ngx-slider';
import {Subject, timer} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {DataService} from '../../../core/services/elasticsearch/data.service';
import {EntityType} from '../../models/entity.interface';
import {Artwork} from '../../models/artwork.interface';
import {Movement} from '../../models/movement.interface';
import * as ConfigJson from 'src/config/home_movements.json';

interface MovementItem extends Movement {
  artworks: Artwork[]; // holds url to thumbnail images
  width: number; // width-percentage of this item, injected into css
}

@Component({
  selector: 'app-movement-overview',
  templateUrl: './movement-overview.component.html',
  styleUrls: ['./movement-overview.component.scss'],
  animations: [
    trigger('newThumb', [
      state('hide', style({opacity: '0'})), // transform: 'scale(0)'})),
      state('show', style({opacity: '1'})), // transform: 'scale(1)'})),
      transition('show => hide', [animate(0)]),
      transition('hide => show', [animate(500)])
    ])
  ]
})
export class MovementOverviewComponent implements OnInit, AfterViewInit, OnDestroy {
  dataService: DataService;

  /** initial movements to be displayed by the component */
  movements: MovementItem[] = [];
  defaultMovementIds: string[] = Object.keys(ConfigJson.movementIds);
  @Input() inputMovements: Movement[];

  /** 2d array holding items to be displayed */
  boxes: MovementItem[][] = [[]];

  /** Specifies the average amount of labels on the slider */
  private averagePeriodCount: number;
  /** Final Size of 1 period */
  private periodSpan = 1;

  /** start and end of the displayed period */
  timelineStart: number;
  timelineEnd: number;

  /** stores current selection to refer on it in onResize()  */
  currentMovementId: string;
  currentMovementLabel: string;
  currentDate: string;
  thumbnail: Artwork;

  /** used to only show the image if it is already loaded (this prevents flickering when changing thumbnails */
  thumbnailLoaded = false;

  /** used for the in/out animation when the thumbnail changes */
  showThumbnail: boolean;

  /** Settings for slider component, which does most of the scaling for us. Sliding is obv. disabled. */
  options: Options = {
    hidePointerLabels: true,
    showTicksValues: true,
    showTicks: true
  };

  /** variables to control automatic periodical selection of a random movement  */
  private nextRandomMovementTime = 15; // number in seconds, set to '0' to disable
  private randomMovementTimer$ = new Subject();
  private timerSubscription;

  constructor(data: DataService) {
    this.dataService = data;

    this.onResize();
  }

  ngOnInit() {
    if (this.inputMovements !== undefined) {
      this.movements = this.inputMovements as MovementItem[];
      this.initializeMovements();
    } else {
      this.dataService.findMultipleById<Movement>(this.defaultMovementIds, EntityType.MOVEMENT)
        .then(movements => {
          this.movements = movements.filter(m => {
            if ((m.start_time || m.start_time_est) && (m.end_time || m.end_time_est)) {
              return true;
            }
          }) as MovementItem[];
          this.initializeMovements();
        });
    }
  }

  ngAfterViewInit() {
    if (this.currentMovementId !== undefined) {
      this.drawThumbnail(this.currentMovementId);
    }
  }

  ngOnDestroy() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  initializeMovements() {
    for (const movement of this.movements) {
      movement.artworks = [];
    }

    this.movements.sort((a, b) => (MovementOverviewComponent.getStartTime(a) > MovementOverviewComponent.getEndTime(b) ? 1 : -1));
    this.currentMovementId = this.movements[0].id;

    // get all movementIds except currentMovementId
    const movementIds = this.movements.filter(value => value.id !== this.currentMovementId).map(A => A.id);
    // get all images if current movement first.
    this.getMovementImages([this.currentMovementId]).then(() => {
      this.setRandomThumbnail(this.currentMovementId);

      // setup timer for period random movement selection
      // This will run the function 'selectRandomMovement' every 'nextRandomMovementTime' seconds
      if (this.nextRandomMovementTime > 0) {
        this.timerSubscription = this.randomMovementTimer$.pipe(
          switchMap(() => timer(this.nextRandomMovementTime * 1000, this.nextRandomMovementTime * 1000))
        ).subscribe(() => this.selectRandomMovement());
        // start timer
        this.randomMovementTimer$.next();
      }

      if (this.currentMovementId !== undefined) {
        this.drawThumbnail(this.currentMovementId);
      }
    });
    // now get those which are not displayed
    this.getMovementImages(movementIds);
    // find start and end of displayed period
    this.setTimeline();
    // fill this.boxes
    this.fillTimeline();
  }

  /** Determine values based on screen width (responsivity) */
  @HostListener('window:resize', ['$event'])
  onResize() {
    const screenWidth = window.innerWidth;
    /** Determine the amount of marked steps in the slider, depending on screen width */
    this.averagePeriodCount = Math.min(7, Math.floor(screenWidth / 125));
    if (this.currentMovementId !== undefined) {
      this.drawThumbnail(this.currentMovementId);
    }
  }

  /** finds start and end of displayed period */
  private setTimeline() {
    const firstStart = Math.min.apply(Math, this.movements.map((m) => MovementOverviewComponent.getStartTime(m)));
    const lastEnd = Math.max.apply(Math, this.movements.map((m) => MovementOverviewComponent.getEndTime(m)));


    const dateSpan = lastEnd - firstStart;
    /** The period span must be either a multiple of reasonablePeriodDistance or minimumPeriodDistance */
    let reasonablePeriodDistance = 50;
    if (dateSpan < this.averagePeriodCount * reasonablePeriodDistance) {
      reasonablePeriodDistance = 10 * (Math.floor(dateSpan / this.averagePeriodCount / 10) + 1);
    }
    const minimumPeriodDistance = 1;
    /** Example:  30/7 = 4,28 ; 4,28 / 5 = 0,85 ; Math.max( Math.round(0.85)*5, 1) = 5 */
    this.periodSpan = Math.max(Math.round(dateSpan / this.averagePeriodCount / reasonablePeriodDistance)
      * reasonablePeriodDistance, minimumPeriodDistance);
    /** get the biggest multiple of firstStart that is less than firstDate / same for lastDate */
    this.timelineStart = firstStart - (firstStart % this.periodSpan);
    this.timelineEnd = lastEnd - (lastEnd % this.periodSpan) + this.periodSpan;


    /** Set slider options */
    const newOptions: Options = Object.assign({}, this.options);
    newOptions.ceil = this.timelineEnd;
    newOptions.floor = this.timelineStart;
    newOptions.tickStep = this.periodSpan;
    this.options = newOptions;
  }

  /** this method fills the timeline with clickable boxes */
  private fillTimeline() {
    this.fillMovementBoxes();
    this.fillSpaces();
  }

  /** this method splits movements into different rows where they overlap and sets their widths. */
  private fillMovementBoxes() {
    this.boxes[0][0] = this.movements[0]; // first item is first to appear (top left corner)
    let rowNum = 0;
    this.movements[0].label = this.movements[0].label.charAt(0).toUpperCase() + this.movements[0].label.slice(1);

    // this splits movements into different rows where they overlap (y.start < x.end)
    for (let i = 1; i < this.movements.length; i++) {
      let set = false; // set is used to check whether a row was found for an item
      this.movements[i].label = this.movements[i].label.charAt(0).toUpperCase() + this.movements[i].label.slice(1);
      while (!set) {
        if (this.boxes[rowNum] === undefined) {
          // create new row if there is none
          this.boxes[rowNum] = Array();
        }
        if (!this.boxes[rowNum].length) {
          this.boxes[rowNum].push(this.movements[i]); // if first item in row, insert
          rowNum = 0; // start again at first row
          set = true;
        } else if (MovementOverviewComponent.getStartTime(this.movements[i]) < MovementOverviewComponent.getEndTime(this.boxes[rowNum].slice(-1)[0])) {
          // if overlapping, continue at next row
          rowNum++;
        } else {
          // no overlapping and last item in row -> insert
          this.boxes[rowNum].push(this.movements[i]);
          rowNum = 0;
          set = true;
        }
        if (rowNum > 10) {
          // no more than 10 rows (backup)
          set = true;
        }
      }
    }
  }

  /** this method adds spacers between movement-boxes and should be executed after fillMovementBoxes */
  private fillSpaces() {
    // get period length
    const timelineLen = this.timelineEnd - this.timelineStart;
    // this fills in the spaces between items and assigns all widths to all items
    let row: MovementItem[];
    for (row of this.boxes) {
      // fill in first space
      row.splice(0, 0, {
        width: (MovementOverviewComponent.getStartTime(row[0]) - this.timelineStart) / (timelineLen / 100)
      } as MovementItem);
      // fill in spaces between all movements in one row
      for (let j = 1; j < row.length; j++) {
        // set width of current movement
        row[j].width = (MovementOverviewComponent.getEndTime(row[j]) - MovementOverviewComponent.getStartTime(row[j])) / (timelineLen / 100);
        // fill in space between predecessor and current item
        if (MovementOverviewComponent.getStartTime(row[j]) > MovementOverviewComponent.getEndTime(row[j - 1])) {
          row.splice(j, 0, {
            width: (MovementOverviewComponent.getStartTime(row[j]) - MovementOverviewComponent.getEndTime(row[j - 1])) / (timelineLen / 100)
          } as MovementItem);
        }
      }
      // fill space between last movement and end of period
      row.push({
        width: (this.timelineEnd - MovementOverviewComponent.getEndTime(row.slice(-1)[0])) / (timelineLen / 100)
      } as MovementItem);
    }
  }

  /** draws Line between thumbnail and movement box and aligns thumbnail properly under the box */
  private drawThumbnail(targetId) {
    if (!targetId) {
      return;
    }
    const clickedMovement = document.getElementById(targetId);
    if (!clickedMovement) {
      return;
    }

    const x1 = clickedMovement.offsetLeft + (clickedMovement.offsetWidth / 2);
    const y1 = clickedMovement.offsetTop + clickedMovement.offsetHeight;

    const thumbnail = document.getElementById('thumbnail');

    const offset = (x1 - (thumbnail.scrollWidth / 2) - 15);
    // move thumbnail
    thumbnail.setAttribute('style', 'margin-left: ' + offset.toString() + 'px;');
    const y2 = thumbnail.offsetTop;

    const line = document.getElementById('line');
    line.setAttribute('x1', x1.toString());
    line.setAttribute('y1', y1.toString());
    line.setAttribute('x2', x1.toString());
    line.setAttribute('y2', y2.toString());

    // restart css animation by removing and adding it again
    const newLine = line.cloneNode(true);
    line.parentNode.replaceChild(newLine, line);
  }

  /** This method gets called when movement box gets clicked and calls drawThumbnail() */
  onClickMovementBox(event) {
    // this resets the 'randomMovementTimer$'
    this.randomMovementTimer$.next();

    const boxId = event.target.attributes.id.nodeValue;
    if (boxId && boxId !== this.currentMovementId) {
      this.updateShownMovement(boxId);
    }
  }

  private async updateShownMovement(newMovementId) {
    this.showThumbnail = false;
    this.thumbnailLoaded = false;
    this.currentMovementId = newMovementId;
    this.setRandomThumbnail(this.currentMovementId).then(() => {
      this.drawThumbnail(this.currentMovementId);
    });
  }

  onThumbnailLoaded() {
    this.thumbnailLoaded = true;
  }

  /** get image sample of each movement in list of ids */
  private async getMovementImages(movementIds: string[]) {
    for (const id of movementIds) {
      const artworks = await this.dataService.findArtworksByMovement(id);
      const mvmntIndex = this.movements.findIndex(mvmnt => mvmnt.id === id);
      this.movements[mvmntIndex].artworks = this.movements[mvmntIndex].artworks.concat(artworks);
    }
  }

  /** choose random image out of artworks of current movement */
  private async setRandomThumbnail(movementId) {
    const currMovementIndex = this.movements.findIndex(move => move.id === movementId);
    if (!this.movements[currMovementIndex].artworks || !this.movements[currMovementIndex].artworks.length) {
      return;
    }
    // choose random new thumb out of first n-1
    const thumbIndex = Math.floor(Math.random() * this.movements[currMovementIndex].artworks.length - 1);
    this.thumbnail = this.movements[currMovementIndex].artworks.splice(thumbIndex, 1)[0];
    // move thumbnail to end of list
    this.movements[currMovementIndex].artworks.push(this.thumbnail);

    // TODO: move this?
    this.currentMovementLabel = this.movements[currMovementIndex].label;
    this.currentDate = MovementOverviewComponent.getStartTime(this.movements[currMovementIndex]) + ' - ' + MovementOverviewComponent.getEndTime(this.movements[currMovementIndex]);
  }

  selectRandomMovement() {
    let randIndex = Math.floor(Math.random() * this.movements.length);
    if (this.movements[randIndex].id === this.currentMovementId) {
      randIndex = (randIndex + 1) % this.movements.length;
    }
    this.updateShownMovement(this.movements[randIndex].id);
  }

  /** Removes items from the component which cannot be displayed */
  onLoadingError(item: Artwork) {
    const currMovementIndex = this.movements.findIndex(move => move.id === this.currentMovementId);
    this.movements[currMovementIndex].artworks.splice(
      this.movements[currMovementIndex].artworks.findIndex(i => i.id === item.id),
      1
    );
    this.setRandomThumbnail(this.currentMovementId);
  }

  resetShowThumbnail() {
    this.showThumbnail = true;
  }

  private static getStartTime(movement: Movement): number {
    return movement.start_time || movement.start_time_est;
  }

  private static getEndTime(movement: Movement): number {
    return movement.end_time || movement.end_time_est;
  }

}

