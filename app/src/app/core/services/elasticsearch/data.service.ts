import * as _ from 'lodash';
import {HttpClient} from '@angular/common/http';
import {Inject, Injectable, LOCALE_ID} from '@angular/core';
import {ArtSearch, Artwork, Entity, EntityIcon, EntityType, Iconclass, Movement} from 'src/app/shared/models/models';
import {environment} from 'src/environments/environment';
import {usePlural} from 'src/app/shared/models/entity.interface';
import * as bodyBuilder from 'bodybuilder';
import {Bodybuilder} from 'bodybuilder';

const defaultSortField = 'relativeRank';

/**
 * Service that handles the requests to the API
 */
@Injectable()
export class DataService {
  /** base url of elasticSearch server */
  private readonly searchEndPoint: string;
  private readonly countEndPoint: string;
  private readonly ISO_639_1_LOCALE: string;

  /**
   * Constructor
   */
  constructor(private http: HttpClient, @Inject(LOCALE_ID) localeId: string) {
    // build backend api url with specific index by localeId
    this.ISO_639_1_LOCALE = localeId.substr(0, 2);
    this.searchEndPoint = environment.elastic.base + '/' + (this.ISO_639_1_LOCALE || 'en') + '/_search';
    this.countEndPoint = environment.elastic.base + '/' + (this.ISO_639_1_LOCALE || 'en') + '/_count';
  }

  /**
   * Fetches an entity from the server
   * Returns null if not found
   * @param id Id of the entity to retrieve
   * @param type if specified, it is assured that the returned entity has this entityType
   */
  public async findById<T>(id: string, type?: EntityType): Promise<T> {
    const body = bodyBuilder()
      .query('match', 'id', id);
    const entities = await this.performQuery<T>(body, this.searchEndPoint, type);
    return !entities.length ? null : entities[0];
  }

  /**
   * Fetches multiple entities from the server
   * @param ids ids of entities that should be retrieved
   * @param type if specified, it is assured that the returned entities have this entityType
   * @param count the number of items returned
   */
  public async findMultipleById<T>(ids: string[], type?: EntityType, count = 400): Promise<T[]> {
    const copyids = ids && ids.filter(id => !!id);
    if (!copyids || copyids.length === 0) {
      return [];
    }
    const body = bodyBuilder().size(count);
    _.each(ids, id => body.orQuery('match', 'id', id));
    return this.performQuery<T>(body, this.searchEndPoint, type);
  }

  /**
   * Find Artworks by the given ids for the given type
   * @param type the type to search in
   * @param ids the ids to search for
   * @param count the number of items returned
   * @param from the offset from where the result set should start
   */
  public findArtworksByType(type: EntityType, ids: string[], count = 200, from = 0): Promise<Artwork[]> {
    const body = bodyBuilder()
      .queryMinimumShouldMatch(1, true)
      .query('match', 'type', EntityType.ARTWORK)
      .sort(defaultSortField, 'desc')
      .size(count)
      .from(from);
    _.each(ids, id => body.orQuery('match', usePlural(type), id));
    return this.performQuery<Artwork>(body);
  }

  public async countArtworksByType(type: EntityType, ids: string[]) {
    let body = bodyBuilder()
      .queryMinimumShouldMatch(1, true)
      .query('match', 'type', EntityType.ARTWORK)
    _.each(ids, id => body.orQuery('match', usePlural(type), id));
    const response: any = await this.http.post(this.countEndPoint, body.build()).toPromise()
    return response && response.count ? response.count : undefined
  }

  /**
   * Find all movements which are part of topMovement and have start_time and end_time set
   * @param topMovementId Id of 'parent' movement
   */
  public getHasPartMovements(topMovementId: string): Promise<Movement[]> {
    return this.findById<Movement>(topMovementId, EntityType.MOVEMENT).then(topMovement => {
      return this.findMultipleById<Movement>(topMovement.has_part, EntityType.MOVEMENT).then(hasPartMovements => {
        return hasPartMovements.filter(m => m.start_time && m.end_time);
      });
    });
  }

  /**
   * Find all movements which movement is part of and have start_time and end_time set
   * @param subMovementId Id of 'sub' movement
   */
  public getPartOfMovements(subMovementId: string): Promise<Movement[]> {
    return this.findById<Movement>(subMovementId, EntityType.MOVEMENT).then(subMovement => {
      return this.findMultipleById<Movement>(subMovement.part_of, EntityType.MOVEMENT).then(partOfMovements => {
        return partOfMovements.filter(m => m.start_time && m.end_time);
      });
    });
  }

  /**
   * Find an artwork by movement
   * @param movement label of movement
   * @param count number of returned items
   */
  public findArtworksByMovement(movement: string, count = 5): Promise<Artwork[]> {
    const body = bodyBuilder()
      .size(count)
      .sort(defaultSortField, 'desc')
      .query('match', 'type', EntityType.ARTWORK)
      .query('match', usePlural(EntityType.MOVEMENT), movement);
    return this.performQuery<Artwork>(body);
  }

  /**
   * Returns the artworks that contain all the given arguments.
   * @param searchObj the arguments to search for.
   * @param keywords the list of words to search for.
   * @param count the number of items returned
   */
  public searchArtworks(searchObj: ArtSearch, keywords: string[] = [], count = 400): Promise<Artwork[]> {
    const body = bodyBuilder()
      .size(count)
      .sort(defaultSortField, 'desc');
    _.each(searchObj, (arr, key) => {
      if (Array.isArray(arr)) {
        _.each(arr, val => body.query('match', key, val));
      }
    });
    _.each(keywords, keyword =>
      body.query('bool', (q) => {
        return q.orQuery('match', 'label', keyword)
          .orQuery('match', 'description', keyword)
      })
    );
    return this.performQuery(body);
  }

  /**
   * Get items match by type
   * @param type the related type
   * @param count the number of items returned
   * @param from the offset of the query
   */
  public async getEntityItems<T>(type: EntityType, count = 20, from = 0): Promise<T[]> {
    const body = bodyBuilder()
      .query('match', 'type', type)
      .sort(defaultSortField, 'desc')
      .size(count)
      .from(from);
    return this.performQuery<T>(body);
  }

  /**
   * Get item count of type
   * @param type the type which should be counted
   */
  public async countEntityItems<T>(type: EntityType){
    const body = bodyBuilder()
      .query('match', 'type', type);
    const response: any = await this.http.post(this.countEndPoint, body.build()).toPromise();
    return response && response.count ? response.count : undefined;
  }

  /**
   * Find any object in the index by the field label with the given label
   * @param label object label
   * @param count the number of items returned
   */
  public findByLabel(label: string, count = 200): Promise<any[]> {
    const body = bodyBuilder()
      .orQuery('match', 'label', label)
      .orQuery('wildcard', 'label', '*' + label + '*')
      .sort(defaultSortField, 'desc')
      .size(count);
    return this.performQuery(body);
  }

  /**
   * Return 20 items for an specific category.
   * @param type category type
   * @param count size of return set
   */
  public async getCategoryItems<T>(type: EntityType, count = 20): Promise<T[]> {
    const body = bodyBuilder()
      .query('match', 'type', type)
      .query('prefix', 'image', 'http')
      .sort(defaultSortField, 'desc')
      .size(count);
    return this.performQuery(body);
  }

  /**
   * Retrieves IconclassData from the iconclass.org web-service
   * @see http://www.iconclass.org/help/lod for the documentation
   * @param iconclasses an Array of Iconclasses to retrieve
   * @returns an Array containing the iconclassData to the respective Iconclass
   */
  public async getIconclassData(iconclasses: Array<Iconclass>): Promise<any> {
    const iconclassData = await Promise.all(
      iconclasses.map(async (key: Iconclass) => {
        try {
          return await this.http.get(`https://openartbrowser.org/api/iconclass/${key}.json`).toPromise();
        } catch (error) {
          console.warn(error);
          return null;
        }
      })
    );
    return iconclassData.filter(entry => entry !== null);
  }

  /**
   * Perform an ajax request and filter response
   * @param query elasticsearch query as body
   * @param url endpoint
   * @param type type to filter for
   */
  private async performQuery<T>(query: Bodybuilder, url: string = this.searchEndPoint, type?: EntityType) {
    const response = await this.http.post<T>(url, query.build()).toPromise();
    const entities = this.filterData<T>(response, type);
    // set type specific attributes
    entities.forEach(entity => this.setTypes(entity));

    if (!entities.length) {
      console.warn(NoResultsWarning(query));
    }
    return entities;
  }

  /**
   * filters the data that is fetched from the server
   * @param data Elasticsearch Data
   * @param filterBy optional: type of entities that should be filtered
   */
  private filterData<T>(data: any, filterBy?: EntityType): T[] {
    const entities: T[] = [];
    _.each(
      data.hits.hits,
      function (val) {
        if (!filterBy || (filterBy && val._source.type === filterBy)) {
          entities.push(this.addThumbnails(val._source));
        }
      }.bind(this)
    );
    return entities;
  }

  /**
   * fills entity fields imageSmall and imageMedium
   * @param entity entity for which thumbnails should be added
   */
  private addThumbnails(entity: Entity) {
    const prefix = 'https://upload.wikimedia.org/wikipedia/commons/';
    if (entity.image && !entity.image.endsWith('.tif') && !entity.image.endsWith('.tiff')) {
      entity.imageSmall = entity.image.replace(prefix, prefix + 'thumb/') + '/256px-' + entity.image.substring(entity.image.lastIndexOf('/') + 1);
      entity.imageMedium = entity.image.replace(prefix, prefix + 'thumb/') + '/512px-' + entity.image.substring(entity.image.lastIndexOf('/') + 1);
    } else {
      // There can only be loaded 4 images at once https://phabricator.wikimedia.org/T255854 so HTTP 429 error may occur.
      entity.imageSmall =
        entity.image.replace(prefix, prefix + 'thumb/') + '/lossy-page1-256px-' + entity.image.substring(entity.image.lastIndexOf('/') + 1) + '.jpg';
      entity.image = entity.imageMedium =
        entity.image.replace(prefix, prefix + 'thumb/') + '/lossy-page1-512px-' + entity.image.substring(entity.image.lastIndexOf('/') + 1) + '.jpg';
    }
    return entity;
  }

  /**
   * set type specific attributes
   * @param entity entity object
   */
  private setTypes(entity: any) {
    if (entity.type && entity.id) {
      entity.route = `/${entity.type}/${entity.id}`;
      entity.icon = EntityIcon[entity.type.toUpperCase()];
    }
  }
}

const NoResultsWarning = query => `
  The performed es-query did not yield any results. This might result in strange behavior in the application.

  If you encounter any such issues please consider opening a bug report: https://github.com/hochschule-darmstadt/openartbrowser/issues/new?assignees=&labels=&template=bug_report.md&title=

  Query: ${query.toString()}`;
