import { Component, OnInit } from '@angular/core';
import { PictureSliderItem } from 'src/app/shared/components/picture-slider/picture-slider.component';

@Component({
  selector: 'app-artist-page',
  templateUrl: './artist-page.component.html',
  styleUrls: ['./artist-page.component.scss'],
})
export class ArtistPageComponent implements OnInit {
  constructor() {}

  ngOnInit() {}

  artist: any = {
    name: 'Michelangelo Anselmi',
    dataFields: [
      {
        label: 'description',
        value: 'Italien painter',
      },
      {
        label: 'gender',
        value: 'male',
      },
      {
        label: 'date_of_birth',
        value: 1492,
      },
      {
        label: 'date_of_death',
        value: 1556,
      },
      {
        label: 'place_of_birth',
        value: 'Lucca',
      },
      {
        label: 'place_of_death',
        value: 'Parma',
      },
    ],
    image: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Anselmi-Christ_and_Woman_of_Samaria.jpg',
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
  ];
}
