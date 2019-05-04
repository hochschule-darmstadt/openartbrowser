import { Component, OnInit } from '@angular/core';
import { Artwork, Entity } from 'src/app/shared/models/models';
import { take } from 'rxjs/operators';
import { DataService } from 'src/app/core/services/data.service';
import { ActivatedRoute } from '@angular/router';

/*Interface for the tabs*/
interface SliderTab {
  heading: string;
  items: Entity[];
  active: boolean;
}

@Component({
  selector: 'app-artwork',
  templateUrl: './artwork.component.html',
  styleUrls: ['./artwork.component.scss'],
})

export class ArtworkComponent implements OnInit {
  constructor(private dataService: DataService, private route: ActivatedRoute) {}

  /** hook that is executed at component initialization */
  ngOnInit() {
    /** Extract the id of entity from URL params. */
    this.route.paramMap.pipe(take(1)).subscribe((params) => {
      const artworkId = params.get('artworkId');
      /** Use data service to fetch entity from database */
      this.dataService
        .findById(artworkId)
        .then((entity) => {
          this.artwork = entity as Artwork;
        })
        .catch((err) => {
          console.log(err);
        });
    });
  }

  /** The entity this page is about */
  artwork: Artwork = null;

  /** Change collapse icon */
  collapseDown: boolean = true;

  toggleDetails() {
    this.collapseDown = !this.collapseDown;
  }

  /** Dummy artworks */
  sliderItems_all: Entity[] = [
    {
      id: '',
      description: '',
      type: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/0/04/Bernardino_Luini_-_Salome_with_the_Head_of_John_the_Baptist_-_WGA13772.jpg',
      label: 'Salome with the Head of John the Baptist',
    },
    {
      id: '',
      description: '',
      type: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/3/39/Leonardo_da_Vinci_-_Ginevra_de%27_Benci_-_Google_Art_Project.jpg',
      label: 'Ginevra de Benci',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/b/b6/Giampetrino-Leonardo.jpg',
      label: 'Maria Magdalena',
    },
    {
      id: '',
      description: '',
      type: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/9/91/Scuola_di_leonardo_da_vinci%2C_la_belle_ferroni%C3%A8re%2C_XVI_sec.JPG',
      label: 'La Belle Ferronière',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/6/66/Lorenzo_di_Credi_-_Madonna_Dreyfus.jpg',
      label: 'Madonna and Child with a Pomegranate',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/The_Isleworth_Mona_Lisa.jpg',
      label: 'Isleworth Mona Lisa',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Leonardo_da_Vinci_attributed_-_Madonna_Litta.jpg',
      label: 'Madonna Litta',
    },
    {
      id: '',
      description: '',
      type: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/b/ba/Leonardo%2C_testa_di_cristo%2C_1494_circa%2C_pinacoteca_di_brera.jpg',
      label: 'Head of Christ',
    },
    {
      id: '',
      description: '',
      type: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/687px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
      label: 'Mona Lisa',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://www.leonardodavinci.net/images/gallery/the-virgin-of-the-rocks-louvre.jpg',
      label: 'The Virgin of the Rocks',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://artinwords.de/wp-content/uploads/Leonardo-da-Vinci-La-Belle-Ferroniere-Detail-747x480.jpg',
      label: 'La Bella Ferronière',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://www.leonardodavinci.net/images/gallery/lady-with-an-ermine.jpg',
      label: 'Lady with	an Ermine',
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
      label: '	Madonna of the Yarnwinder',
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

  sliderItems_artist: Entity[] = [
    {
      id: '',
      description: '',
      type: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/0/04/Bernardino_Luini_-_Salome_with_the_Head_of_John_the_Baptist_-_WGA13772.jpg',
      label: 'Salome with the Head of John the Baptist',
    },
    {
      id: '',
      description: '',
      type: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/3/39/Leonardo_da_Vinci_-_Ginevra_de%27_Benci_-_Google_Art_Project.jpg',
      label: 'Ginevra de Benci',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/b/b6/Giampetrino-Leonardo.jpg',
      label: 'Maria Magdalena',
    },
    {
      id: '',
      description: '',
      type: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/b/ba/Leonardo%2C_testa_di_cristo%2C_1494_circa%2C_pinacoteca_di_brera.jpg',
      label: 'Head of Christ',
    },
    {
      id: '',
      description: '',
      type: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/687px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
      label: 'Mona Lisa',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://www.leonardodavinci.net/images/gallery/the-virgin-of-the-rocks-louvre.jpg',
      label: 'The Virgin of the Rocks',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://artinwords.de/wp-content/uploads/Leonardo-da-Vinci-La-Belle-Ferroniere-Detail-747x480.jpg',
      label: 'La Bella Ferronière',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://www.leonardodavinci.net/images/gallery/lady-with-an-ermine.jpg',
      label: 'Lady with	an Ermine',
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
      label: '	Madonna of the Yarnwinder',
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

  sliderItems_location: Entity[] = [
    {
      id: '',
      description: '',
      type: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/0/04/Bernardino_Luini_-_Salome_with_the_Head_of_John_the_Baptist_-_WGA13772.jpg',
      label: 'Salome with the Head of John the Baptist',
    },
    {
      id: '',
      description: '',
      type: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/3/39/Leonardo_da_Vinci_-_Ginevra_de%27_Benci_-_Google_Art_Project.jpg',
      label: 'Ginevra de Benci',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/b/b6/Giampetrino-Leonardo.jpg',
      label: 'Maria Magdalena',
    },
    {
      id: '',
      description: '',
      type: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/9/91/Scuola_di_leonardo_da_vinci%2C_la_belle_ferroni%C3%A8re%2C_XVI_sec.JPG',
      label: 'La Belle Ferronière',
    },
    {
      id: '',
      description: '',
      type: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/687px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
      label: 'Mona Lisa',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://www.leonardodavinci.net/images/gallery/the-virgin-of-the-rocks-louvre.jpg',
      label: 'The Virgin of the Rocks',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://artinwords.de/wp-content/uploads/Leonardo-da-Vinci-La-Belle-Ferroniere-Detail-747x480.jpg',
      label: 'La Bella Ferronière',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://www.leonardodavinci.net/images/gallery/lady-with-an-ermine.jpg',
      label: 'Lady with	an Ermine',
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
      label: '	Madonna of the Yarnwinder',
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

  sliderItems_genre: Entity[] = [
    {
      id: '',
      description: '',
      type: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/0/04/Bernardino_Luini_-_Salome_with_the_Head_of_John_the_Baptist_-_WGA13772.jpg',
      label: 'Salome with the Head of John the Baptist',
    },
    {
      id: '',
      description: '',
      type: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/3/39/Leonardo_da_Vinci_-_Ginevra_de%27_Benci_-_Google_Art_Project.jpg',
      label: 'Ginevra de Benci',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/b/b6/Giampetrino-Leonardo.jpg',
      label: 'Maria Magdalena',
    },
    {
      id: '',
      description: '',
      type: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/9/91/Scuola_di_leonardo_da_vinci%2C_la_belle_ferroni%C3%A8re%2C_XVI_sec.JPG',
      label: 'La Belle Ferronière',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/6/66/Lorenzo_di_Credi_-_Madonna_Dreyfus.jpg',
      label: 'Madonna and Child with a Pomegranate',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/The_Isleworth_Mona_Lisa.jpg',
      label: 'Isleworth Mona Lisa',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://artinwords.de/wp-content/uploads/Leonardo-da-Vinci-La-Belle-Ferroniere-Detail-747x480.jpg',
      label: 'La Bella Ferronière',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://www.leonardodavinci.net/images/gallery/lady-with-an-ermine.jpg',
      label: 'Lady with	an Ermine',
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
      label: '	Madonna of the Yarnwinder',
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

  sliderItems_movement: Entity[] = [
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/6/66/Lorenzo_di_Credi_-_Madonna_Dreyfus.jpg',
      label: 'Madonna and Child with a Pomegranate',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/The_Isleworth_Mona_Lisa.jpg',
      label: 'Isleworth Mona Lisa',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Leonardo_da_Vinci_attributed_-_Madonna_Litta.jpg',
      label: 'Madonna Litta',
    },
    {
      id: '',
      description: '',
      type: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/b/ba/Leonardo%2C_testa_di_cristo%2C_1494_circa%2C_pinacoteca_di_brera.jpg',
      label: 'Head of Christ',
    },
    {
      id: '',
      description: '',
      type: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/687px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
      label: 'Mona Lisa',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://www.leonardodavinci.net/images/gallery/the-virgin-of-the-rocks-louvre.jpg',
      label: 'The Virgin of the Rocks',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://artinwords.de/wp-content/uploads/Leonardo-da-Vinci-La-Belle-Ferroniere-Detail-747x480.jpg',
      label: 'La Bella Ferronière',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://www.leonardodavinci.net/images/gallery/lady-with-an-ermine.jpg',
      label: 'Lady with	an Ermine',
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
      label: '	Madonna of the Yarnwinder',
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

  sliderItems_material: Entity[] = [
    {
      id: '',
      description: '',
      type: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/0/04/Bernardino_Luini_-_Salome_with_the_Head_of_John_the_Baptist_-_WGA13772.jpg',
      label: 'Salome with the Head of John the Baptist',
    },
    {
      id: '',
      description: '',
      type: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/3/39/Leonardo_da_Vinci_-_Ginevra_de%27_Benci_-_Google_Art_Project.jpg',
      label: 'Ginevra de Benci',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/b/b6/Giampetrino-Leonardo.jpg',
      label: 'Maria Magdalena',
    },
    {
      id: '',
      description: '',
      type: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/9/91/Scuola_di_leonardo_da_vinci%2C_la_belle_ferroni%C3%A8re%2C_XVI_sec.JPG',
      label: 'La Belle Ferronière',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/6/66/Lorenzo_di_Credi_-_Madonna_Dreyfus.jpg',
      label: 'Madonna and Child with a Pomegranate',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/The_Isleworth_Mona_Lisa.jpg',
      label: 'Isleworth Mona Lisa',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Leonardo_da_Vinci_attributed_-_Madonna_Litta.jpg',
      label: 'Madonna Litta',
    },
    {
      id: '',
      description: '',
      type: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/b/ba/Leonardo%2C_testa_di_cristo%2C_1494_circa%2C_pinacoteca_di_brera.jpg',
      label: 'Head of Christ',
    },
    {
      id: '',
      description: '',
      type: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/687px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
      label: 'Mona Lisa',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://www.leonardodavinci.net/images/gallery/the-virgin-of-the-rocks-louvre.jpg',
      label: 'The Virgin of the Rocks',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://artinwords.de/wp-content/uploads/Leonardo-da-Vinci-La-Belle-Ferroniere-Detail-747x480.jpg',
      label: 'La Bella Ferronière',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://www.leonardodavinci.net/images/gallery/lady-with-an-ermine.jpg',
      label: 'Lady with	an Ermine',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://www.leonardodavinci.net/images/gallery/portrait-of-a-musician.jpg',
      label: 'Portrait of a Musician',
    },
  ];

  sliderItems_depict: Entity[] = [
    {
      id: '',
      description: '',
      type: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/0/04/Bernardino_Luini_-_Salome_with_the_Head_of_John_the_Baptist_-_WGA13772.jpg',
      label: 'Salome with the Head of John the Baptist',
    },
    {
      id: '',
      description: '',
      type: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/3/39/Leonardo_da_Vinci_-_Ginevra_de%27_Benci_-_Google_Art_Project.jpg',
      label: 'Ginevra de Benci',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/b/b6/Giampetrino-Leonardo.jpg',
      label: 'Maria Magdalena',
    },
    {
      id: '',
      description: '',
      type: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/9/91/Scuola_di_leonardo_da_vinci%2C_la_belle_ferroni%C3%A8re%2C_XVI_sec.JPG',
      label: 'La Belle Ferronière',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/6/66/Lorenzo_di_Credi_-_Madonna_Dreyfus.jpg',
      label: 'Madonna and Child with a Pomegranate',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/The_Isleworth_Mona_Lisa.jpg',
      label: 'Isleworth Mona Lisa',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Leonardo_da_Vinci_attributed_-_Madonna_Litta.jpg',
      label: 'Madonna Litta',
    },
    {
      id: '',
      description: '',
      type: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/b/ba/Leonardo%2C_testa_di_cristo%2C_1494_circa%2C_pinacoteca_di_brera.jpg',
      label: 'Head of Christ',
    },
    {
      id: '',
      description: '',
      type: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/687px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
      label: 'Mona Lisa',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://www.leonardodavinci.net/images/gallery/the-virgin-of-the-rocks-louvre.jpg',
      label: 'The Virgin of the Rocks',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://artinwords.de/wp-content/uploads/Leonardo-da-Vinci-La-Belle-Ferroniere-Detail-747x480.jpg',
      label: 'La Bella Ferronière',
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

  /*Fill SliderTab with tab categories*/
  artworkTabs: SliderTab[] = [
    {
      heading: 'All',
      items: this.sliderItems_all,
      active: true,
    },
    {
      heading: 'Artist',
      items: this.sliderItems_artist,
      active: false,
    },
    {
      heading: 'Location',
      items: this.sliderItems_location,
      active: false,
    },
    {
      heading: 'Genre',
      items: this.sliderItems_genre,
      active: false,
    },
    {
      heading: 'Movement',
      items: this.sliderItems_movement,
      active: false,
    },
    {
      heading: 'Material',
      items: this.sliderItems_material,
      active: false,
    },
    {
      heading: 'Depict',
      items: this.sliderItems_depict,
      active: false,
    },
  ]
}
