import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from 'src/app/core/services/data.service';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Entity, Motif } from 'src/app/shared/models/models';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-motif',
  templateUrl: './motif.component.html',
  styleUrls: ['./motif.component.scss'],
})
export class MotifComponent implements OnInit, OnDestroy {
  /** The entity this page is about */
  motif: Motif = null;

  /** use this to end subscription to url parameter in ngOnDestroy */
  private ngUnsubscribe = new Subject();

  constructor(private dataService: DataService, private route: ActivatedRoute) {}

  /** hook that is executed at component initialization */
  ngOnInit() {
    /** Extract the id of entity from URL params. */
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params) => {
      const motifId = params.get('motifId');
      /** Use data service to fetch entity from database */
      this.dataService
        .findById(motifId)
        .then((entity) => {
          this.motif = entity as Motif;
        })
        .catch((err) => {
          console.log(err);
        });
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  /** Dummy artworks */
  sliderItems: Entity[] = [
    {
      id: 'Q27955518',
      description: '',
      type: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/6/69/%22Die_Nassauer_bei_Belle_Alliance_am_18th_Juni_1815%22_by_Richard_Kn%C3%B6tel.jpg',
      label: 'Salome with the Head of John the Baptist',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/b/b2/13th_Light_Dragoons_Waterloo.jpg',
      label: 'Ginevra de Benci',
    },
    {
      id: '',
      description: '',
      type: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/5/57/The_Battle_of_Waterloo_-_Orme%27s_Historic%2C_military%2C_and_naval_anecdotes_%281819%29%2C_opposite_15_-_BL.jpg',
      label: 'Maria Magdalena',
    },
    {
      id: '',
      description: '',
      type: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/d/d7/The_meeting_of_Wellington_and_Blucher_during_the_Battle_of_Waterloo._-_The_Wars_of_Wellington%2C_a_narrative_poem_%281819%29%2C_opposite_172_-_BL.jpg',
      label: 'La Belle Ferronière',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/4/48/De_Slag_bij_Waterloo_Rijksmuseum_SK-A-1115.jpeg',
      label: 'Madonna and Child with a Pomegranate',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/5/58/Jan_Willem_Pieneman_-_De_Slag_bij_Waterloo_001.JPG',
      label: 'Isleworth Mona Lisa',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Jan_Willem_Pieneman00.jpg',
      label: 'Mona Lisa',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/5/55/5481-waterloo.jpg',
      label: 'The Virgin of the Rocks',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/b/b9/After_Waterloo._Samuel_Drummond_ARA.jpg',
      label: 'La Bella Ferronière',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://www.leonardodavinci.net/images/gallery/lady-with-an-ermine.jpg',
      label: 'Lady with an Ermine',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://www.leonardodavinci.net/images/gallery/portrait-of-a-musician.jpg',
      label: 'Portrait of a Musician',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'http://kulturmeister.de/assets/images/9/A2-madonna-mit-spindel-da-vinci-c38035e9.jpg',
      label: '  Madonna of the Yarnwinder',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://www.leonardodavinci.net/images/gallery/st-jerome-in-the-desert.jpg',
      label: 'St. Jerome in the Desert',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://cdn.topofart.com/images/artists/da_Vinci_Leonardo/paintings/leonardo014.jpg',
      label: 'Madonna of the Carnation',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://www.leonardodavinci.net/images/gallery/the-annunciation.jpg',
      label: 'The Annunciation',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://www.leonardodavinci.net/images/gallery/the-virgin-and-child-with-st-anne.jpg',
      label: 'The Virgin and Child with St Anne',
    },
  ];
}
