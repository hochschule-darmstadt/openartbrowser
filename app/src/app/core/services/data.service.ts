import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Entity, Artwork, artSearch, EntityType, TagItem } from 'src/app/shared/models/models';
import * as _ from 'lodash';
import { Subject } from 'rxjs';


/**
 * Service that handles the requests to the API
 */
@Injectable()
export class DataService {

  /** search chips */
  private searchItems: TagItem[] = [];

  /** search chips as observable */
  $searchItems: Subject<TagItem[]> = new Subject();

  /** base url of elasticSearch server */
  serverURI = 'http://openartbrowser.org/api/_search';

	/**
	 * Constructor
	 */
  constructor(private http: HttpClient) { }

  public async findEntitiesByLabelText(text: string): Promise<Entity[]> {
    const options = {
      "query": {
        "bool": {
          "should": [
            {
              "wildcard": {
                "label": `*${text}*`
              }
            }, {
              "match": {
                "label": `${text}`
              }
            }
          ]
        }
      },
      "sort": [
        {
          "relativeRank": {
            "order": "desc"
          }
        }
      ],
      "size": 2000
    };

    const response = await this.http.post<any>(this.serverURI, options).toPromise();
    return this.filterData(response);
  }

  public async findArtworkByLabelText(text: string): Promise<Artwork[]> {
    const options = {
      "query": {
        "bool": {
          "must": [
            {
              "match": {
                "label": `${text}`
              }
            },
            {
              "match": {
                "type": "artwork"
              }
            }
          ]
        }
      },
      "sort": [
        {
          "relativeRank": {
            "order": "desc"
          }
        }
      ],
      "size": 20

    };
    const response = await this.http.post<any>(this.serverURI, options).toPromise();
    return this.filterData<Artwork>(response);
  }
	/**
	 * Returns the artworks that contain all the given arguments.
	 * @param searchObj the arguments to search for.
	 * @param keywords the list of worlds to search for.
	 * 
	 */
  public async findArtworksByCategories(searchObj: artSearch, keywords: string[] = []): Promise<Artwork[]> {
    let options = {
      "query": {
        "bool": {
          "must": []
        }
      },
      "sort": [
        {
          "relativeRank": {
            "order": "desc"
          }
        }
      ],
      "size": 400,
    };
    options.query.bool.must.push({
      "match": {
        "type": "artwork"
      }
    });
    _.each(searchObj, function (arr, key) {
      if (_.isArray(arr))
        _.each(arr, function (val) {
          options.query.bool.must.push({
            "match": {
              [key]: val
            }
          });
        });
    });
    if (keywords.length !== 0) {
      _.each(keywords, function (keyword) {
        options.query.bool.must.push({
          "bool": {
            "should": [
              {
                "match": {
                  "label": keyword
                }
              },
              {
                "match": {
                  "description": keyword
                }
              }
            ]
          }
        })
      });
    }
    const reponse = await this.http.post<any>(this.serverURI, options).toPromise();
    return this.filterData<Artwork>(reponse);
  }
  public async findArtworksByArtists(artistIds: string[]): Promise<Artwork[]> {
    const response = await this.http.post<any>(this.serverURI, this.constructQuery("artists", artistIds)).toPromise();
    return this.filterData<Artwork>(response);
  };

  public async findArtworksByMaterials(materialIds: string[]): Promise<Artwork[]> {
    const response = await this.http.post<any>(this.serverURI, this.constructQuery("materials", materialIds)).toPromise();
    return this.filterData<Artwork>(response);
  }

  public async findArtworksByMovements(movementIds: string[]): Promise<Artwork[]> {
    const response = await this.http.post<any>(this.serverURI, this.constructQuery("movements", movementIds)).toPromise();
    return this.filterData<Artwork>(response);
  }

  public async findArtworksByGenres(genreIds: string[]): Promise<Artwork[]> {
    const response = await this.http.post<any>(this.serverURI, this.constructQuery("genres", genreIds)).toPromise();
    return this.filterData<Artwork>(response);
  }

  public async findArtworksByMotifs(motifIds: string[]): Promise<Artwork[]> {
    const response = await this.http.post<any>(this.serverURI, this.constructQuery("motifs", motifIds)).toPromise();
    return this.filterData<Artwork>(response);
  }

  public async findArtworksByLocations(locationIds: string[]): Promise<Artwork[]> {
    const response = await this.http.post<any>(this.serverURI, this.constructQuery("locations", locationIds)).toPromise();
    return this.filterData<Artwork>(response);
  }

  public async get20CategoryItems<T>(type: string): Promise<T[]> {
    const response = await this.http.post<any>(this.serverURI, this.categoryQuery(type)).toPromise();
    return this.filterData<T>(response);
  }

	/**
	 * filters the data that is fetched from the server
	 * @param data Elasticsearch Data
	 * @param type optional: type of entities that should be filtered
	 */
  filterData<T>(
    data: any,
    filterBy?: EntityType
  ): T[] {
    let entities: T[] = [];
    _.each(data.hits.hits, function (val) {
      if (!filterBy || (filterBy && val._source.type == filterBy)) {
        entities.push(this.addThumbnails(val._source));
      }
    }.bind(this));
    return entities;
  }

	/**
	 * filles entity fields imageSmall and imageMedium
	 * @param entity entity for which thumbnails should be added
	 */
  addThumbnails(entity: Entity) {
    const prefix = 'https://upload.wikimedia.org/wikipedia/commons/';
    if (entity.image && !entity.image.endsWith('.tif') && !entity.image.endsWith('.tiff')) {
      entity.imageSmall = entity.image.replace(prefix, prefix + 'thumb/') + '/256px-' + entity.image.substring(entity.image.lastIndexOf('/') + 1);
      entity.imageMedium = entity.image.replace(prefix, prefix + 'thumb/') + '/512px-' + entity.image.substring(entity.image.lastIndexOf('/') + 1)
    } else {
      entity.imageSmall = entity.image;
      entity.imageMedium = entity.image;
    }
    return entity;
  }

	/**
	 * Constructs an Elasticsearch query
	 * @param type the type to search in
	 * @param ids the ids to search for
	 */
  constructQuery(type: string, ids: string[]) {
    let options = {
      "query": {
        "bool": {
          "should": [],
          "minimum_should_match": 1,
          "must": {
            "term": {
              "type": "artwork"
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
      "size": 200
    };
    _.each(ids, function (id) {
      options.query.bool.should.push({
        "match": {
          [type]: `${id}`
        }
      });
    });
    return options;
  }

	/**
	 * @description construct an elasticsearch query specific for category items
	 * @param {string} type
	 * @returns {Object}
	 * @memberof DataService
	 */
  categoryQuery(type: string): Object {
    return {
      "query": {
        "bool": {
          "must": [
            { "match": { "type": type } },
            { "prefix": { "image": "http" } }
          ]
        }
      },
      "sort": [
        {
          "relativeRank": {
            "order": "desc"
          }
        }
      ],
      "size": 20
    }
  }

  /**
  * Fetches an entity from the server
  * @param id Id of the entity to retrieve
  * @param type if specified, it is assured that the returned entity has this entityType
  */
  public async findById<T>(id: string, type?: EntityType): Promise<T> {
    const response = await this.http.get<T>(this.serverURI + '?q=id:' + id).toPromise();
    const rawEntities = this.filterData<T>(response, type);
    if (!rawEntities.length) {
      return null;
    }
    return rawEntities[0];
  }

  /**
   * Fetches multiple entities from the server
   * @param ids ids of entities that should be retrieved
   * @param type if specified, it is assured that the returned entities have this entityType
   */
  public async findMultipleById<T>(ids: string[], type?: EntityType): Promise<T[]> {
    const copyids =
      ids &&
      ids.filter((id) => {
        return !!id;
      });
    if (!copyids || copyids.length === 0) {
      return [];
    }
    let options = {
      query: {
        bool: {
          should: [],
        },
      },
      size: 400,
    };
    _.each(copyids, (id) => {
      options.query.bool.should.push({
        match: {
          id: `${id}`,
        },
      });
    });

    const response = await this.http.post<any>(this.serverURI, options).toPromise();
    return this.filterData<T>(response, type);
  }

  /** add a new search tag to the search (displayed as chip)
   * @param tag TagItem that should be added
   */
  public addSearchTag(tag: TagItem) {
    const existingTag = this.searchItems.filter((i) => {
      return i.id === tag.id && i.type === tag.type && i.label === tag.label;
    });
    if (existingTag.length === 0) {
      this.searchItems.push({
        label: tag.label,
        type: tag.type,
        id: tag.id,
      });
      this.$searchItems.next(this.searchItems);
    }
  }

  /** remove a search tag from the search
   * @param tag TagItem that should be removed
   */
  public removeSearchTag(tag: TagItem) {
    this.searchItems = this.searchItems.filter((i) => {
      return i.id !== tag.id || i.type !== tag.type || i.label !== tag.label;
    });
    this.$searchItems.next(this.searchItems);
  }

  /** clear all search tags */
  public clearSearchTags() {
    this.searchItems = [];
    this.$searchItems.next(this.searchItems);
  }

}
