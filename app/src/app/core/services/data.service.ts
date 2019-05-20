import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Entity, Artwork } from 'src/app/shared/models/models';
import * as _ from 'lodash';

/**
 * Service that handles the requests to the API
 */
@Injectable()
export class DataService {
  /**
   * Constructor
   */
  constructor(private http: HttpClient) { }
  serverURI = 'http://141.100.60.99:9200/api/_search';
  public async findEntitiesByLabelText(text: string): Promise<Entity[]> {
    const options = {
		"query": {
			"bool": {
				"must": {
					"wildcard": {
						"label": `*${text}*`
					}
				},
				"must_not": {
					"term": {
						"type": "object"
					}
				}
			}
		},
		"sort": [
			{
				"relativeRank": {
					"order": "desc"
				}
			}
		],
		"size": 100
	};
    const response = await this.http.post<any>(this.serverURI, options).toPromise();
    return this.filterData(response);
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

  filterData(data: any): Entity[] {
    let entities: Entity[] = [];
    _.each(data.hits.hits, function (val) {
      entities.push(val._source);
    });
    return entities;
  }
  /**
   * Gets an entity from the server
   * @param id Id of the entity to retrieve
   * @param enrich whether related entities should also be loaded
   */
  public async findById(id: string, enrich: boolean = true): Promise<Entity> {
    let result;
    try {
      result = await this.http.get<Entity>(this.serverURI + '?q=id:' + id).toPromise();
    } catch (error) {
      console.log('Something went wrong during API request');
      return null;
    }
    if (!result || !result.hits || !result.hits.hits[0]) {
      return null;
    }
    // due to some ids being present multiple times in the data store (bug)-> always take the first result
    const rawEntity = result.hits.hits[0]._source;
    // console.log(rawEntity);
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

  dummyArtworks: Partial<Artwork>[] = [
    {
      id: 'Q27955518',
      description: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/0/04/Bernardino_Luini_-_Salome_with_the_Head_of_John_the_Baptist_-_WGA13772.jpg',
      label: 'Salome with the Head of John the Baptist',
      absoluteRank: 80,
      relativeRank: 0.9,
      materials: [{ id: 'Q296955' }],
      creators: [{ id: 'Q2123501' }]
    },
    {
      id: '',
      description: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/3/39/Leonardo_da_Vinci_-_Ginevra_de%27_Benci_-_Google_Art_Project.jpg',
      label: 'Ginevra de Benci',
      absoluteRank: 80,
      relativeRank: 0.9,
      materials: [{ id: 'Q296955' }]
    },
    {
      id: '',
      description: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/b/b6/Giampetrino-Leonardo.jpg',
      label: 'Maria Magdalena',
      absoluteRank: 80,
      relativeRank: 0.9,
    },
    {
      id: '',
      description: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/9/91/Scuola_di_leonardo_da_vinci%2C_la_belle_ferroni%C3%A8re%2C_XVI_sec.JPG',
      label: 'La Belle Ferronière',
      absoluteRank: 80,
      relativeRank: 0.9,
    },
    {
      id: '',
      description: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/6/66/Lorenzo_di_Credi_-_Madonna_Dreyfus.jpg',
      label: 'Madonna and Child with a Pomegranate',
      absoluteRank: 80,
      relativeRank: 0.9,
    },
    {
      id: '',
      description: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/The_Isleworth_Mona_Lisa.jpg',
      label: 'Isleworth Mona Lisa',
      absoluteRank: 80,
      relativeRank: 0.9,
    },
    {
      id: '',
      description: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Leonardo_da_Vinci_attributed_-_Madonna_Litta.jpg',
      label: 'Madonna Litta',
      absoluteRank: 80,
      relativeRank: 0.9,
    },
    {
      id: '',
      description: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/b/ba/Leonardo%2C_testa_di_cristo%2C_1494_circa%2C_pinacoteca_di_brera.jpg',
      label: 'Head of Christ',
      absoluteRank: 80,
      relativeRank: 0.9,
    },
    {
      id: '',
      description: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/687px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
      label: 'Mona Lisa',
      absoluteRank: 80,
      relativeRank: 0.9,
    },
    {
      id: '',
      description: '',
      image: 'https://www.leonardodavinci.net/images/gallery/the-virgin-of-the-rocks-louvre.jpg',
      label: 'The Virgin of the Rocks',
      absoluteRank: 80,
      relativeRank: 0.9,
    },
    {
      id: '',
      description: '',
      image: 'https://artinwords.de/wp-content/uploads/Leonardo-da-Vinci-La-Belle-Ferroniere-Detail-747x480.jpg',
      label: 'La Bella Ferronière',
      absoluteRank: 80,
      relativeRank: 0.9,
    },
    {
      id: '',
      description: '',
      image: 'https://www.leonardodavinci.net/images/gallery/lady-with-an-ermine.jpg',
      label: 'Lady with an Ermine',
      absoluteRank: 80,
      relativeRank: 0.9,
    },
    {
      id: '',
      description: '',
      image: 'https://www.leonardodavinci.net/images/gallery/portrait-of-a-musician.jpg',
      label: 'Portrait of a Musician',
      absoluteRank: 80,
      relativeRank: 0.9,
    },
    {
      id: '',
      description: '',
      image: 'http://kulturmeister.de/assets/images/9/A2-madonna-mit-spindel-da-vinci-c38035e9.jpg',
      label: '  Madonna of the Yarnwinder',
      absoluteRank: 80,
      relativeRank: 0.9,
    },
    {
      id: '',
      description: '',
      image: 'https://www.leonardodavinci.net/images/gallery/st-jerome-in-the-desert.jpg',
      label: 'St. Jerome in the Desert',
      absoluteRank: 80,
      relativeRank: 0.9,
    },
    {
      id: '',
      description: '',
      image: 'https://cdn.topofart.com/images/artists/da_Vinci_Leonardo/paintings/leonardo014.jpg',
      label: 'Madonna of the Carnation',
      absoluteRank: 80,
      relativeRank: 0.9,
    },
    {
      id: '',
      description: '',
      image: 'https://www.leonardodavinci.net/images/gallery/the-annunciation.jpg',
      label: 'The Annunciation',
      absoluteRank: 80,
      relativeRank: 0.9,
    },
    {
      id: '',
      description: '',
      image: 'https://www.leonardodavinci.net/images/gallery/the-virgin-and-child-with-st-anne.jpg',
      label: 'The Virgin and Child with St Anne',
      absoluteRank: 80,
      relativeRank: 0.9,
    },
  ];
}
