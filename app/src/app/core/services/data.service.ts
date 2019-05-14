import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Entity, Artwork } from 'src/app/shared/models/models';
import { Observable } from 'rxjs';

/**
 * Service that handles the requests to the API
 */
@Injectable()
export class DataService {
  /**
   * Constructor
   */
  constructor(private http: HttpClient) {}

  public async findEntitiesByLabelText(text: string): Promise<Entity[]> {
    return this.dummySearchResults;
  }

  public async findArtworksByArtists(artistIds: string[]): Promise<Artwork[]> {
    return [...this.dummyArtworks] as Artwork[];
  }

  public async findArtworksByMaterials(materialIds: string[]): Promise<Artwork[]> {
    return [...this.dummyArtworks] as Artwork[];
  }

  public async findArtworksByMovements(movementIds: string[]): Promise<Artwork[]> {
    return [...this.dummyArtworks] as Artwork[];
  }

  public async findArtworksByGenres(genreIds: string[]): Promise<Artwork[]> {
    return [...this.dummyArtworks] as Artwork[];
  }

  public async findArtworksByMotifs(motifIds: string[]): Promise<Artwork[]> {
    return [...this.dummyArtworks] as Artwork[];
  }

  public async findArtworksByLocations(locationIds: string[]): Promise<Artwork[]> {
    return [...this.dummyArtworks] as Artwork[];
  }

  /**
   * Gets an entity from the server
   * @param id Id of the entity to retrieve
   * @param enrich whether related entities should also be loaded
   */
  public async findById(id: string, enrich: boolean = true): Promise<Entity> {
    let result;
    try {
      result = await this.http.get<Entity>('http://localhost:4200/art_data/_search?q=id:' + id).toPromise();
    } catch (error) {
      console.log('Something went wrong during API request');
      return null;
    }
    if (!result || !result.hits || !result.hits.hits[0]) {
      return null;
    }
    // due to some ids being present multiple times in the data store (bug)-> always take the first result
    const rawEntity = result.hits.hits[0]._source;
    if (!enrich) {
      return rawEntity;
    } else {
      return await this.enrichEntity(rawEntity);
    }
  }

  /**
   * load the related entities referenced by the ids in the entities attributes
   * @param entity the raw entity for which attributes should be loaded
   */
  private async enrichEntity(entity: Entity): Promise<Entity> {
    /** go though all attributes of entity */
    for (const key of Object.keys(entity)) {
      /** check if attribute is an array (only attributes holding relations to other entities are arrays) */
      if (Array.isArray(entity[key]) && key !== 'classes') {
        const newValues = [];
        /** for every id in the array-> fetch entity and extract values from it  */
        for (const relatedEntityId of entity[key]) {
          if (relatedEntityId !== '') {
            const relatedEntity = await this.findById(relatedEntityId, false);
            if (relatedEntity) {
              newValues.push({
                id: relatedEntity.id,
                label: relatedEntity.label,
                description: relatedEntity.description,
                image: relatedEntity.image,
                type: relatedEntity.type,
              });
            }
          }
        }
        /** replace the old array holding only the ids with the new array holding the fetched entities */
        entity[key] = newValues;
      }
    }
    return entity;
  }

  dummySearchResults: Entity[] = [
    {
      id: 'Q19925319',
      label: 'Prayer before the meal',
      image: 'https://upload.wikimedia.org/wikipedia/commons/2/2d/Quiringh_Gerritsz._van_Brekelenkam_003.jpg',
      type: 'artwork',
      absoluteRank: 80,
      relativeRank: 0.9,
    },
    {
      id: 'Q23936108',
      label: 'Liturgical cabinet with the Holy Burial, Saint Agnes and a Bishop Saint',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/f/fd/Liturgical_cabinet_with_the_Holy_Burial%2C_Saint_Agnes_and_a_Bishop_Saint_-_Google_Art_Project.jpg',
      type: 'artwork',
      absoluteRank: 80,
      relativeRank: 0.8,
    },
    {
      id: 'Q27980400',
      label: 'Madonna & Child Statuette in a Niche surrounded by a Garland of Flowers',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/5/55/Daniel_Seghers_and_Erasmus_Quellinus_%28II%29_-_Garlands_of_Flowers_surrounding_a_Statue_of_the_Madonna.jpg',
      type: 'artwork',
      absoluteRank: 80,
      relativeRank: 0.75,
    },
    {
      id: 'Q762',
      label: 'Leonardo da Vinci',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/3/38/Leonardo_da_Vinci_-_presumed_self-portrait_-_WGA12798.jpg',
      type: 'artist',
      absoluteRank: 80,
      relativeRank: 0.7,
    },
    {
      id: 'Q5592',
      label: 'Michelangelo',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/5/5e/Miguel_%C3%81ngel%2C_por_Daniele_da_Volterra_%28detalle%29.jpg',
      type: 'artist',
      absoluteRank: 80,
      relativeRank: 0.65,
    },
    {
      id: 'Q740966',
      label: 'James Turrell',
      image: 'https://upload.wikimedia.org/wikipedia/commons/d/dc/JamesTurrell.jpg',
      type: 'artist',
      absoluteRank: 80,
      relativeRank: 0.6,
    },
    {
      id: 'Q326478',
      label: 'land art',
      image: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Spiral-jetty-from-rozel-point.png',
      type: 'movement',
      absoluteRank: 80,
      relativeRank: 0.55,
    },
    {
      id: 'Q207445',
      label: 'De Stijl',
      image: 'https://upload.wikimedia.org/wikipedia/commons/9/94/Stijl_vol_07_nr_79-84_front_cover.jpg',
      type: 'movement',
      absoluteRank: 80,
      relativeRank: 0.5,
    },
    {
      id: 'Q203209',
      label: 'conceptual art',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/d/dd/Art_%26_Language%2C_Untitled_Painting_%281965%29%2C_Tate_Modern%2C_London_-_20130627.jpg',
      type: 'movement',
      absoluteRank: 80,
      relativeRank: 0.45,
    },
    {
      id: 'Q1411180',
      label: 'Luxembourg Museum',
      image: 'https://upload.wikimedia.org/wikipedia/commons/c/cd/Paris_Musee_Luxembourg_facade.jpg',
      type: 'location',
      absoluteRank: 80,
      relativeRank: 0.4,
    },
    {
      id: 'Q4795381',
      label: 'Arnot Art Museum',
      image: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Elmira_Civic_Historic_District.jpg',
      type: 'location',
      absoluteRank: 80,
      relativeRank: 0.34,
    },
    {
      id: 'Q676788',
      label: 'Chigi Chapel',
      image: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Santa_Maria_del_Popolo_Capella_Chigi_Panorama.jpg',
      type: 'location',
      absoluteRank: 80,
      relativeRank: 0.3,
    },
    {
      id: 'Q219803',
      label: 'plywood',
      image: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Plywood.jpg',
      type: 'material',
      absoluteRank: 80,
      relativeRank: 0.25,
    },
    {
      id: 'Q897',
      label: 'gold',
      image: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Gold-crystals.jpg',
      type: 'material',
      absoluteRank: 80,
      relativeRank: 0.2,
    },
    {
      id: 'Q133067',
      label: 'mosaic',
      image: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Arabischer_Maler_um_690_002.jpg',
      type: 'material',
      absoluteRank: 80,
      relativeRank: 0.15,
    },
    {
      id: 'Q2586345',
      label: 'Cycladic art',
      image: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Harp_player%2C_Cycladic_civilization_-_Greece.JPG',
      type: 'genre',
      absoluteRank: 80,
      relativeRank: 0.1,
    },
    {
      id: 'Q158607',
      label: 'marine art',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/6/61/Schepen_aan_lager_wal_-_Ships_running_aground_-_The_%27Ridderschap%27_and_%27Hollandia%27_in_trouble_in_the_Street_of_Gibraltar_1-3_March_1694_%28Ludolf_Backhuysen%2C_1708%29.jpg',
      type: 'genre',
      absoluteRank: 80,
      relativeRank: 0.08,
    },
    {
      id: 'Q2302151',
      label: 'animal painting',
      image: 'https://upload.wikimedia.org/wikipedia/commons/f/f4/Durer_Young_Hare.jpg',
      type: 'genre',
      absoluteRank: 80,
      relativeRank: 0.06,
    },
    {
      id: 'Q10737',
      label: 'suicide',
      image: 'https://upload.wikimedia.org/wikipedia/commons/d/dc/Edouard_Manet_-_Le_Suicid%C3%A9.jpg',
      type: 'motif',
      absoluteRank: 80,
      relativeRank: 0.04,
    },
    {
      id: 'Q48314',
      label: 'Battle of Waterloo',
      image: 'https://upload.wikimedia.org/wikipedia/commons/9/99/Sadler%2C_Battle_of_Waterloo.jpg',
      type: 'motif',
      absoluteRank: 80,
      relativeRank: 0.03,
    },
    {
      id: 'Q11405',
      label: 'flute',
      image: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Fluiers.jpg',
      type: 'motif',
      absoluteRank: 80,
      relativeRank: 0.02,
    },
  ];

  dummyArtworks: Entity[] = [
    {
      id: 'Q27955518',
      description: '',
      type: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/0/04/Bernardino_Luini_-_Salome_with_the_Head_of_John_the_Baptist_-_WGA13772.jpg',
      label: 'Salome with the Head of John the Baptist',
      absoluteRank: 80,
      relativeRank: 0.9,
    },
    {
      id: '',
      description: '',
      type: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/3/39/Leonardo_da_Vinci_-_Ginevra_de%27_Benci_-_Google_Art_Project.jpg',
      label: 'Ginevra de Benci',
      absoluteRank: 80,
      relativeRank: 0.9,
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/b/b6/Giampetrino-Leonardo.jpg',
      label: 'Maria Magdalena',
      absoluteRank: 80,
      relativeRank: 0.9,
    },
    {
      id: '',
      description: '',
      type: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/9/91/Scuola_di_leonardo_da_vinci%2C_la_belle_ferroni%C3%A8re%2C_XVI_sec.JPG',
      label: 'La Belle Ferronière',
      absoluteRank: 80,
      relativeRank: 0.9,
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/6/66/Lorenzo_di_Credi_-_Madonna_Dreyfus.jpg',
      label: 'Madonna and Child with a Pomegranate',
      absoluteRank: 80,
      relativeRank: 0.9,
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/The_Isleworth_Mona_Lisa.jpg',
      label: 'Isleworth Mona Lisa',
      absoluteRank: 80,
      relativeRank: 0.9,
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Leonardo_da_Vinci_attributed_-_Madonna_Litta.jpg',
      label: 'Madonna Litta',
      absoluteRank: 80,
      relativeRank: 0.9,
    },
    {
      id: '',
      description: '',
      type: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/b/ba/Leonardo%2C_testa_di_cristo%2C_1494_circa%2C_pinacoteca_di_brera.jpg',
      label: 'Head of Christ',
      absoluteRank: 80,
      relativeRank: 0.9,
    },
    {
      id: '',
      description: '',
      type: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/687px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
      label: 'Mona Lisa',
      absoluteRank: 80,
      relativeRank: 0.9,
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://www.leonardodavinci.net/images/gallery/the-virgin-of-the-rocks-louvre.jpg',
      label: 'The Virgin of the Rocks',
      absoluteRank: 80,
      relativeRank: 0.9,
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://artinwords.de/wp-content/uploads/Leonardo-da-Vinci-La-Belle-Ferroniere-Detail-747x480.jpg',
      label: 'La Bella Ferronière',
      absoluteRank: 80,
      relativeRank: 0.9,
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://www.leonardodavinci.net/images/gallery/lady-with-an-ermine.jpg',
      label: 'Lady with an Ermine',
      absoluteRank: 80,
      relativeRank: 0.9,
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://www.leonardodavinci.net/images/gallery/portrait-of-a-musician.jpg',
      label: 'Portrait of a Musician',
      absoluteRank: 80,
      relativeRank: 0.9,
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'http://kulturmeister.de/assets/images/9/A2-madonna-mit-spindel-da-vinci-c38035e9.jpg',
      label: '  Madonna of the Yarnwinder',
      absoluteRank: 80,
      relativeRank: 0.9,
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://www.leonardodavinci.net/images/gallery/st-jerome-in-the-desert.jpg',
      label: 'St. Jerome in the Desert',
      absoluteRank: 80,
      relativeRank: 0.9,
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://cdn.topofart.com/images/artists/da_Vinci_Leonardo/paintings/leonardo014.jpg',
      label: 'Madonna of the Carnation',
      absoluteRank: 80,
      relativeRank: 0.9,
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://www.leonardodavinci.net/images/gallery/the-annunciation.jpg',
      label: 'The Annunciation',
      absoluteRank: 80,
      relativeRank: 0.9,
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://www.leonardodavinci.net/images/gallery/the-virgin-and-child-with-st-anne.jpg',
      label: 'The Virgin and Child with St Anne',
      absoluteRank: 80,
      relativeRank: 0.9,
    },
  ];
}
