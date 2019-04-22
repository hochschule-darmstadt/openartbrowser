import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Entity, Artist } from 'src/app/shared/models/models';

/**
 * Service that handles the requests to the API
 */
@Injectable()
export class DataService {
  /**
   * Constructor
   */
  constructor(private http: HttpClient) {}

  public async findArtistById(id: string): Promise<Artist> {
    const entity = await this.findById(id);
    if (entity && entity.type !== 'artist') {
      throw new Error('Entity is not of type artist');
    } else return entity as Artist;
  }

  /**
   * Gets an entity from the server
   */
  public async findById(id: string): Promise<Entity> {
    try {
      const result: any = await this.http.get<Entity>('http://localhost:4200/wiki_data/_search?q=id:' + id).toPromise();
      /*if (result.hits.hits.length !== 1) {
        throw new Error('findById didnt return a single result');
      }*/
      return result.hits.hits[0]._source;
    } catch (err) {
      console.log(err);
      throw new Error('Something went wrong during API request');
    }
  }
}
