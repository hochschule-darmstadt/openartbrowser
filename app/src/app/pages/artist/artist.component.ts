import { Component, OnInit } from '@angular/core';
import { PictureSliderItem } from 'src/app/shared/components/picture-slider/picture-slider.component';
import { Artist } from 'src/app/shared/models/models';

@Component({
  selector: 'app-artist',
  templateUrl: './artist.component.html',
  styleUrls: ['./artist.component.scss'],
})
export class ArtistComponent implements OnInit {
  constructor() {}

  ngOnInit() {}

  artist: Artist = {
    id: '123',
    label: 'Michelangelo Anselmi',
    description: 'Italien painter',
    gender: 'male',
    date_of_birth: 1492,
    date_of_death: 1556,
    place_of_birth: 'Lucca',
    place_of_death: 'Parma',
    image: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Anselmi-Christ_and_Woman_of_Samaria.jpg',
    movements: [],
    influencedBy: [],
  };

  sliderItems: PictureSliderItem[] = [
    {
      picture: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Anselmi-Christ_and_Woman_of_Samaria.jpg',
      label: 'test',
    },
    {
      picture: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Anselmi-Christ_and_Woman_of_Samaria.jpg',
      label: 'test',
    },
    {
      picture: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Anselmi-Christ_and_Woman_of_Samaria.jpg',
      label: 'test',
    },
    {
      picture: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Anselmi-Christ_and_Woman_of_Samaria.jpg',
      label: 'test',
    },
    {
      picture: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Anselmi-Christ_and_Woman_of_Samaria.jpg',
      label: 'test',
    },
    {
      picture: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Anselmi-Christ_and_Woman_of_Samaria.jpg',
      label: 'test',
    },
    {
      picture: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Anselmi-Christ_and_Woman_of_Samaria.jpg',
      label: 'test',
    },
    {
      picture: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Anselmi-Christ_and_Woman_of_Samaria.jpg',
      label: 'test',
    },
    {
      picture: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Anselmi-Christ_and_Woman_of_Samaria.jpg',
      label: 'test',
    },
  ];
}
