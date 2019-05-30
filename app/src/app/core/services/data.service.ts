import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Entity, Artwork, artSearch, EntityType } from 'src/app/shared/models/models';
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
			"size": 500
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
	 * 
	 */
	public async findArtworksByCategories(searchObj: artSearch): Promise<Artwork[]> {
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
			"size": 10 // change it if you want more results 
		};
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
		const reponse = await this.http.post<any>(this.serverURI, options).toPromise();
		return this.filterData<Artwork>(reponse);
	}
	public async findArtworksByArtists(artistIds: string[]): Promise<Artwork[]> {
		const response = await this.http.post<any>(this.serverURI, this.constructQuery("creators", artistIds)).toPromise();
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
		const response = await this.http.post<any>(this.serverURI, this.constructQuery("depicts", motifIds)).toPromise();
		return this.filterData<Artwork>(response);
	}

	public async findArtworksByLocations(locationIds: string[]): Promise<Artwork[]> {
		const response = await this.http.post<any>(this.serverURI, this.constructQuery("locations", locationIds)).toPromise();
		return this.filterData<Artwork>(response);
	}

	public async get10CategoryItems<T>(type: string): Promise<T[]> {
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
			"size": 10
		}
	}

	/**
	 * Gets an entity from the server
	 * @param id Id of the entity to retrieve
	 * @param type if specified, it is assured that the returned entity has this entityType
	 * @param enrich whether other entities referenced by this entity should also be loaded
	 */
	public async findById<T>(
		id: string,
		type?: EntityType,
		enrich: boolean = true
	): Promise<T> {
		const response = await this.http.get<T>(this.serverURI + '?q=id:' + id).toPromise();
		const rawEntities = this.filterData<T>(response, type);
		if (!rawEntities.length) {
			return null;
		}
		if (!enrich) {
			return rawEntities[0];
		} else {
			return await this.enrichEntity<T>(rawEntities[0]);
		}
	}

	/**
	 * load the related entities referenced by the ids in the entities attributes
	 * @param entity the raw entity for which attributes should be dereferenced
	 */
	private async enrichEntity<T>(entity: T): Promise<T> {
		/** go though all attributes of entity */
		for (const key of Object.keys(entity)) {
			/** check if attribute is an array (only attributes holding relations to other entities are arrays) */
			if (Array.isArray(entity[key]) && key !== 'classes') {
				const resolvedEntities = [];
				for (const id of entity[key]) {
					if (id) {
						const relatedEntity = await this.findById<any>(id, null, false);
						if (relatedEntity) {
							resolvedEntities.push(relatedEntity);
						}
					}
				}
				/** replace the old array holding only the ids with the new array holding the fetched entities */
				entity[key] = resolvedEntities;
			}
		}
		return entity;
	}

}
