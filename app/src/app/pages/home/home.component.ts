import { Component, OnInit } from '@angular/core';
import { Entity } from 'src/app/shared/models/models';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  iterator: number = 0;
  maxItems: number = 3;

  artworkItems: Entity[];
  artistItems: Entity[];
  movementItems: Entity[];
  locationItems: Entity[];
  materialItems: Entity[];
  genreItems: Entity[];
  motifItems: Entity[];

  constructor() {}
  
  ngOnInit() { 
    this.initDummyData();
    setInterval(() => {
      this.iterator = (this.iterator == this.maxItems - 1) ? 0 : this.iterator + 1;
    }, 10000);
  }

  initDummyData = (): void => {
    this.artworkItems = [
      {
        id: "Q19925319",
        label: "Prayer before the meal",
        image: "https://upload.wikimedia.org/wikipedia/commons/2/2d/Quiringh_Gerritsz._van_Brekelenkam_003.jpg",
        type: "artwork"
      },
      {
        id: "Q23936108",
        label: "Liturgical cabinet with the Holy Burial, Saint Agnes and a Bishop Saint",
        image: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Liturgical_cabinet_with_the_Holy_Burial%2C_Saint_Agnes_and_a_Bishop_Saint_-_Google_Art_Project.jpg",
        type: "artwork"
      },
      {
        id: "Q27980400",
        label: "Madonna & Child Statuette in a Niche surrounded by a Garland of Flowers",
        image: "https://upload.wikimedia.org/wikipedia/commons/5/55/Daniel_Seghers_and_Erasmus_Quellinus_%28II%29_-_Garlands_of_Flowers_surrounding_a_Statue_of_the_Madonna.jpg",
        type: "artwork"
      },
    ]

    this.artistItems = [
      {
        id: "Q762",
        label: "Leonardo da Vinci",
        image: "https://upload.wikimedia.org/wikipedia/commons/3/38/Leonardo_da_Vinci_-_presumed_self-portrait_-_WGA12798.jpg",
        type: "artist",
      },
      {
        id: "Q5592",
        label: "Michelangelo",
        image: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Miguel_%C3%81ngel%2C_por_Daniele_da_Volterra_%28detalle%29.jpg",
        type: "artist",
      },
      {
        id: "Q740966",
        label: "James Turrell",
        image: "https://upload.wikimedia.org/wikipedia/commons/d/dc/JamesTurrell.jpg",
        type: "artist",
      },
    ]
    
    this.movementItems = [
      {
        id: "Q326478",
        label: "land art",
        image: "https://upload.wikimedia.org/wikipedia/commons/8/84/Spiral-jetty-from-rozel-point.png",
        type: "movement",
      },
      {
        id: "Q207445",
        label: "De Stijl",
        image: "https://upload.wikimedia.org/wikipedia/commons/9/94/Stijl_vol_07_nr_79-84_front_cover.jpg",
        type: "artist",
      },
      {
        id: "Q203209",
        label: "conceptual art",
        image: "https://upload.wikimedia.org/wikipedia/commons/d/dd/Art_%26_Language%2C_Untitled_Painting_%281965%29%2C_Tate_Modern%2C_London_-_20130627.jpg",
        type: "artist",
      },
    ]
    
    this.locationItems = [
      {
        id: "Q1411180",
        label: "Luxembourg Museum",
        image: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Paris_Musee_Luxembourg_facade.jpg",
        type: "artist",
      },
      {
        id: "Q4795381",
        label: "Arnot Art Museum",
        image: "https://upload.wikimedia.org/wikipedia/commons/c/c2/Elmira_Civic_Historic_District.jpg",
        type: "artist",
      },
      {
        id: "Q676788",
        label: "Chigi Chapel",
        image: "https://upload.wikimedia.org/wikipedia/commons/b/b3/Santa_Maria_del_Popolo_Capella_Chigi_Panorama.jpg",
        type: "artist",
      },
    ]
    
    this.materialItems = [
      {
        id: "Q219803",
        label: "plywood",
        image: "https://upload.wikimedia.org/wikipedia/commons/1/1d/Plywood.jpg",
        type: "artist",
      },
      {
        id: "Q897",
        label: "gold",
        image: "https://upload.wikimedia.org/wikipedia/commons/d/d7/Gold-crystals.jpg",
        type: "artist",
      },
      {
        id: "Q133067",
        label: "mosaic",
        image: "https://upload.wikimedia.org/wikipedia/commons/2/2e/Arabischer_Maler_um_690_002.jpg",
        type: "artist",
      },
    ]
    this.genreItems = [
      {
        id: "Q2586345",
        label: "Cycladic art",
        image: "https://upload.wikimedia.org/wikipedia/commons/c/c2/Harp_player%2C_Cycladic_civilization_-_Greece.JPG",
        type: "artist",
      },
      {
        id: "Q158607",
        label: "marine art",
        image: "https://upload.wikimedia.org/wikipedia/commons/6/61/Schepen_aan_lager_wal_-_Ships_running_aground_-_The_%27Ridderschap%27_and_%27Hollandia%27_in_trouble_in_the_Street_of_Gibraltar_1-3_March_1694_%28Ludolf_Backhuysen%2C_1708%29.jpg",
        type: "artist",
      },
      {
        id: "Q2302151",
        label: "animal painting",
        image: "https://upload.wikimedia.org/wikipedia/commons/f/f4/Durer_Young_Hare.jpg",
        type: "artist",
      },
    ]
    this.motifItems = [
      {
        id: "Q10737",
        label: "suicide",
        image: "https://upload.wikimedia.org/wikipedia/commons/d/dc/Edouard_Manet_-_Le_Suicid%C3%A9.jpg",
        type: "artist",
      },
      {
        id: "Q48314",
        label: "Battle of Waterloo",
        image: "https://upload.wikimedia.org/wikipedia/commons/9/99/Sadler%2C_Battle_of_Waterloo.jpg",
        type: "artist",
      },
      {
        id: "Q11405",
        label: "flute",
        image: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Fluiers.jpg",
        type: "artist",
      },
    ]
  }
}
  