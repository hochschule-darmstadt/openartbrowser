import {AfterViewInit, Component, HostListener, OnInit} from '@angular/core';
import {Entity} from '../../models/entity.interface';
import {Options} from 'ng5-slider';
import {DataService} from '../../../core/services/elasticsearch/data.service';
import {Artwork} from '../../models/artwork.interface';

interface MovementItem extends Entity {
  artworks: Artwork[]; // holds url to thumbnail images
  start: number; // represents the value the item is located in the timeline
  end: number; // represents the value the item ends in the timeline
  width: number; // width-percentage of this item, injected into css
}

@Component({
  selector: 'app-movement-overview',
  templateUrl: './movement-overview.component.html',
  styleUrls: ['./movement-overview.component.scss']
})
export class MovementOverviewComponent implements OnInit, AfterViewInit {
  dataService: DataService;
  /** initial movements to be displayed by the component */
  movements: MovementItem[] = [];

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
  thumbnail: Artwork;

  /** Settings for slider component, which does most of the scaling for us. Sliding is obv. disabled. */
  options: Options = {
    hidePointerLabels: true,
    showTicksValues: true,
    showTicks: true,
  };

  constructor(data: DataService) {
    this.dataService = data;
    this.onResize();
    // sample movements, to be removed
    this.movements.push({
      id: 'Q867769',
      artworks: [],
      label: 'international gothic',
      start: 1143,
      end: 1450,
      width: 10
    } as MovementItem);

    this.movements.push({
      id: 'Q37853',
      artworks: [],
      label: 'baroque',
      start: 1500,
      end: 1800,
      width: 30
    } as MovementItem);

    this.movements.push({
      id: 'Q4692',
      artworks: [],
      label: 'renaissance',
      start: 1400,
      end: 1600,
      width: 30
    } as MovementItem);
  }

  ngOnInit() {
    // sort movements by their inception/start
    this.movements.sort((a, b) => (a.start > b.start ? 1 : -1));
    for (let i = 0; i < this.movements.length; i++) {
      this.dataService.findArtworksByMovement(this.movements[i].id).then(artworks => {
        this.movements[i].artworks = this.movements[i].artworks.concat(artworks);
        console.log(this.movements, artworks);
        this.setRandomThumbnail(this.currentMovementId);
      });
    }
    // find start and end of displayed period
    this.setTimeline();
    // fill this.boxes
    this.fillTimeline();
  }

  ngAfterViewInit() {
    this.currentMovementId = this.movements[0].id;
    this.drawThumbnail(this.currentMovementId);
    console.log(this.movements);
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
    const firstStart = Math.min.apply(Math, this.movements.map((m) => {
      return m.start;
    }));
    const lastEnd = Math.max.apply(Math, this.movements.map((m) => {
      return m.end;
    }));


    const dateSpan = lastEnd - firstStart;
    /** The period span must be either a multiple of reasonablePeriodDistance or minimumPeriodDistance */
    const reasonablePeriodDistance = 50;
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

    console.log(this.timelineStart, this.timelineEnd, this.periodSpan);
  }

  /** this method splits movements into different rows where they overlap and sets their widths. It adds spacers, too */
  private fillTimeline() {
    this.boxes[0][0] = this.movements[0]; // first item is first to appear (top left corner)
    let rowNum = 0;

    // this splits movements into different rows where they overlap (y.start < x.end)
    for (let i = 1; i < this.movements.length; i++) {
      let set = false; // set is used to check whether a row was found for an item

      while (!set) {
        if (this.boxes[rowNum] === undefined) {
          // create new row if there is none
          this.boxes[rowNum] = Array();
        }
        if (!this.boxes[rowNum].length) {
          this.boxes[rowNum].push(this.movements[i]); // if first item in row, insert
          rowNum = 0; // start again at first row
          set = true;
        } else if (this.movements[i].start < this.boxes[rowNum].slice(-1)[0].end) {
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

    console.log(this.boxes);

    // get period length
    const timelineLen = this.timelineEnd - this.timelineStart;
    // this fills in the spaces between items and assigns all widths to all items
    let row: MovementItem[];
    for (row of this.boxes) {
      // for (let i = 0; i < this.boxes.length; i++) {
      // no need for this atm, but sums up duration of all movements in this row. Feeling cute, might delete later.
      const sumRow = row.reduce((a, b) => {
        return a + b.end - b.start;
      }, 0);
      // fill in first space
      row.splice(0, 0, {
        width: (row[0].start - this.timelineStart) / (timelineLen / 100)
      } as MovementItem);
      // fill in spaces between all movements in one row
      for (let j = 1; j < row.length; j++) {
        // set width of current movement
        row[j].width = (row[j].end - row[j].start) / (timelineLen / 100);
        // fill in space between predecessor and current item
        if (row[j].start > row[j - 1].end) {
          row.splice(j, 0, {
            width: (row[j].start - row[j - 1].end) / (timelineLen / 100)
          } as MovementItem);
        }
      }
      // fill space between last movement and end of period
      row.push({
        width: (this.timelineEnd - row.slice(-1)[0].end) / (timelineLen / 100)
      } as MovementItem);
    }
    console.log(this.boxes);
  }

  /** draws Line between thumbnail and movement box and aligns thumbnail properly under the box */
  private drawThumbnail(targetId) {
    const clickedMovement = document.getElementById(targetId);
    const x1 = clickedMovement.offsetLeft + (clickedMovement.offsetWidth / 2);
    const y1 = clickedMovement.offsetTop + clickedMovement.offsetHeight;

    const thumbnail = document.getElementById('thumbnail');
    thumbnail.setAttribute('style',
      'margin-left: ' + (x1 - (thumbnail.offsetWidth / 2) - 15).toString() + 'px');
    const thumbnailWidth = thumbnail.offsetWidth;
    const thumbnailHeight = thumbnail.offsetHeight;

    const x2 = thumbnail.offsetLeft + (thumbnail.offsetWidth / 2);
    const y2 = thumbnail.offsetTop;

    /*
    // This paths draws a line and a frame around the image. Increase stroke-dashoffset and stroke-dasharray to 2000
    //   and uncommend path in html. Animation restart not yet working.
    const path = document.getElementById('svgpath');
    const pathData = `M ${x1} ${y1} L${x2} ${y2} L${x2 - thumbnailWidth / 2} ${y2}
                      L${x2 - thumbnailWidth / 2} ${y2 + thumbnailHeight}
                      L${x2 + thumbnailWidth / 2} ${y2 + thumbnailHeight}
                      L${x2 + thumbnailWidth / 2} ${y2}
                      L${x2} ${y2}Z`;
    path.setAttribute('d', pathData);
    */

    const line = document.getElementById('line');
    line.setAttribute('x1', x1.toString());
    line.setAttribute('y1', y1.toString());
    line.setAttribute('x2', x2.toString());
    line.setAttribute('y2', y2.toString());


    // restart css animation by removing and adding it again
    const newLine = line.cloneNode(true);
    line.parentNode.replaceChild(newLine, line);
  }

  /** This method gets called when movement box gets clicked and calls drawThumbnail() */
  private onClickMovementBox(event) {
    this.currentMovementId = event.target.attributes.id.nodeValue;
    this.setRandomThumbnail(this.currentMovementId);
    this.drawThumbnail(this.currentMovementId);
  }

  private setRandomThumbnail(movementId) {
    const currMovement = this.movements.find(move => move.id === movementId);
    this.thumbnail = currMovement.artworks[Math.floor(Math.random() * currMovement.artworks.length)];
    console.log(currMovement, this.thumbnail);

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
}

