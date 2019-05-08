import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Entity } from 'src/app/shared/models/models';

/**
 * Service that handles the requests to the API
 */
@Injectable()
export class DataService {
  /**
   * Constructor
   */
  constructor(private http: HttpClient) {}

  /**
   * Gets an entity from the server
   * @param id Id of the entity to retrieve
   * @param enrich whether related entities should also be loaded
   */
  public async findById(id: string, enrich: boolean = true): Promise<Entity> {
    try {
      const result: any = await this.http.get<Entity>('http://localhost:4200/wiki_data/_search?q=id:' + id).toPromise();
      // due to some ids being present multiple times in the data store (bug)-> always take the first result
      if (!result || !result.hits || !result.hits.hits[0]) {
        return null;
      }
      const rawEntity = result.hits.hits[0]._source;
      if (!enrich) {
        return rawEntity;
      } else {
        return await this.enrichEntity(rawEntity);
      }
    } catch (err) {
      console.log(err);
      throw new Error('Something went wrong during API request');
    }
  }

  /**
   * load the related entities referenced by the ids in the entities attributes
   * @param entity the raw entity for which attributes should be loaded
   */
  private async enrichEntity(entity: Entity): Promise<Entity> {
    /** go though all attributes of entity */
    for (const key of Object.keys(entity)) {
      /** check if attribute is an array (only attributes holding relations to other entites are arrays) */
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
