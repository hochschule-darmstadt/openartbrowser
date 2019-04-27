import { Component, OnInit } from '@angular/core';
import { Artist, Entity } from 'src/app/shared/models/models';
import { DataService } from 'src/app/core/services/data.service';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-artist',
  templateUrl: './artist.component.html',
  styleUrls: ['./artist.component.scss'],
})
export class ArtistComponent implements OnInit {
  constructor(private dataService: DataService, private route: ActivatedRoute) {}

  /** hook that is executed at component initialization */
  ngOnInit() {
    /** Extract the id of entity from URL params. */
    this.route.paramMap.pipe(take(1)).subscribe((params) => {
      const artistId = params.get('artistId');
      /** Use data service to fetch entity from database */
      this.dataService
        .findById(artistId)
        .then((entity) => {
          this.artist = entity as Artist;
        })
        .catch((err) => {
          console.log(err);
        });
    });
    /** Cuts big array into smaller arrays */
    this.spliceArray(this.sliderItemsDummy);
  }

  /** The entity this page is about */
  artist: Artist = null;

  //sliderItems: Entity[] = [];

  /** Change collapse icon */
  collapseDown: boolean = true;

  switchIcon(){
    this.collapseDown = !this.collapseDown;
  }

  /** Dummy artworks */
  sliderItemsDummy: Entity[] = [
    {
      id: '',
      description: '',
      type: '',
      image: 'https://artinwords.de/wp-content/uploads/Leonardo-da-Vinci-La-Belle-Ferroniere-Detail-747x480.jpg', 
      label: 'Ferronière'
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'http://kulturmeister.de/assets/images/9/A2-madonna-mit-spindel-da-vinci-c38035e9.jpg', 
      label: 'Madonna'
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/687px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg', 
      label: 'Ferronière'
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://cdn.topofart.com/images/artists/da_Vinci_Leonardo/paintings/leonardo014.jpg', 
      label: 'Madonna'
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/687px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg', 
      label: 'Mona Lisa'
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'http://kulturmeister.de/assets/images/9/A2-madonna-mit-spindel-da-vinci-c38035e9.jpg', 
      label: 'Hallo'
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://artinwords.de/wp-content/uploads/Leonardo-da-Vinci-La-Belle-Ferroniere-Detail-747x480.jpg', 
      label: 'Ferronière'
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://cdn.topofart.com/images/artists/da_Vinci_Leonardo/paintings/leonardo014.jpg', 
      label: 'Hola'
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/687px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg', 
      label: 'Mona Lisa'
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'http://kulturmeister.de/assets/images/9/A2-madonna-mit-spindel-da-vinci-c38035e9.jpg', 
      label: 'Madonna'
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://artinwords.de/wp-content/uploads/Leonardo-da-Vinci-La-Belle-Ferroniere-Detail-747x480.jpg', 
      label: 'Ferronière'
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://cdn.topofart.com/images/artists/da_Vinci_Leonardo/paintings/leonardo014.jpg', 
      label: 'Madonna'
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/687px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg', 
      label: 'Mona Lisa'
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'http://kulturmeister.de/assets/images/9/A2-madonna-mit-spindel-da-vinci-c38035e9.jpg', 
      label: 'Bla'
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://artinwords.de/wp-content/uploads/Leonardo-da-Vinci-La-Belle-Ferroniere-Detail-747x480.jpg', 
      label: 'Ferronière'
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://cdn.topofart.com/images/artists/da_Vinci_Leonardo/paintings/leonardo014.jpg', 
      label: 'Bla'
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://cdn.topofart.com/images/artists/da_Vinci_Leonardo/paintings/leonardo014.jpg', 
      label: 'Bla'
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://cdn.topofart.com/images/artists/da_Vinci_Leonardo/paintings/leonardo014.jpg', 
      label: 'Bla'
    }
  ];

  /** Cut array of artworks in multiple arrays each with 8 items 
   * arrayNumber : how many arrays with 8 items
   * sliderItems: Array<Entity[]> = [];  Is Array of arrays with 8 items each
   * temporaryArray   one array with 8 items
  */
  arrayNumber: number;
  sliderItems: Array<Entity[]> = [];
  temporaryArray: Entity[] = [];

  spliceArray(arrayToSplice: Entity[]){ 
    // There are 8 images on each slide. 
    this.arrayNumber = arrayToSplice.length / 8;
    for (let i = 0; i < this.arrayNumber; i++ ){   
      this.temporaryArray = arrayToSplice.splice(0,8);
      this.sliderItems.push(this.temporaryArray);      
    }
  }
}
