import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
							"wildcard": {
								"label": `*${text}*`
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
	 */
	filterData<T>(data: any): T[] {
		let entities: T[] = [];
		_.each(data.hits.hits, function (val) {
			entities.push(val._source);
		});
		return entities;
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
					"should": []
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
	categoryQuery(type: string): Object{
		return {
			"query": {
				"bool": {
					"must": [ 
						{ "match": { "type": type	} },
						{ "prefix": {"image":"http"} }	
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
}
