import * as _ from 'lodash';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { ArtSearch, Artwork, Entity, EntityIcon, EntityType, Iconclass, Movement } from 'src/app/shared/models/models';
import { elasticEnvironment } from 'src/environments/environment';
import QueryBuilder from './query.builder';
import { usePlural } from 'src/app/shared/models/entity.interface';

const defaultSortField = 'relativeRank';

/**
 * Service that handles the requests to the API
 */
@Injectable()
export class DataService {
  /** base url of elasticSearch server */
  private readonly baseUrl: string;
  private readonly ISO_639_1_LOCALE: string;

  /**
   * Constructor
   */
  constructor(private http: HttpClient, @Inject(LOCALE_ID) localeId: string) {
    // build backend api url with specific index by localeId
    this.ISO_639_1_LOCALE = localeId.substr(0, 2);
    this.baseUrl = elasticEnvironment.serverURI + '/' + (this.ISO_639_1_LOCALE || 'en') + '/_search';
  }

  /**
   * Fetches an entity from the server
   * Returns null if not found
   * @param id Id of the entity to retrieve
   * @param type if specified, it is assured that the returned entity has this entityType
   */
  public async findById<T>(id: string, type?: EntityType): Promise<T> {
    const response = await this.http.get<T>(this.baseUrl + '?q=id:' + id).toPromise();
    const entities = this.filterData<T>(response, type);
    // set type specific attributes
    entities.forEach(entity => this.setTypes(entity));
    return !entities.length ? null : entities[0];
  }

  /**
   * Fetches multiple entities from the server
   * @param ids ids of entities that should be retrieved
   * @param type if specified, it is assured that the returned entities have this entityType
   */
  public async findMultipleById<T>(ids: string[], type?: EntityType): Promise<T[]> {
    const copyids = ids && ids.filter(id => !!id);
    if (!copyids || copyids.length === 0) {
      return [];
    }
    const query = new QueryBuilder().size(400);
    copyids.forEach(id => query.shouldMatch('id', `${id}`));
    return this.performQuery<T>(query, this.baseUrl, type);
  }

  /**
   * Find Artworks by the given ids for the given type
   * @param type the type to search in
   * @param ids the ids to search for
   */
  public findArtworksByType(type: EntityType, ids: string[], count = 200): Promise<Artwork[]> {
    const query = new QueryBuilder()
      .size(count)
      .sort(defaultSortField)
      .minimumShouldMatch(1)
      .ofType(EntityType.ARTWORK);
    ids.forEach(id => query.shouldMatch(usePlural(type), `${id}`));
    return this.performQuery<Artwork>(query);
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
   * Find an artwork by label
   * @param label artwork label
   */
  public findArtworksByLabel(label: string): Promise<Artwork[]> {
    const query = new QueryBuilder()
      .size(20)
      .sort(defaultSortField)
      .mustMatch('type', 'artwork')
      .shouldMatch('label', `${label}`);
    return this.performQuery<Artwork>(query);
  }

  /**
   * Find an artwork by movement
   * @param movement label of movement
   */
  public findArtworksByMovement(movement: string): Promise<Artwork[]> {
    const query = new QueryBuilder()
      .size(5)
      .sort(defaultSortField)
      .mustMatch('type', 'artwork')
      .mustMatch('movements', `${movement}`);
    return this.performQuery<Artwork>(query);
  }

  /**
   * Returns the artworks that contain all the given arguments.
   * @param searchObj the arguments to search for.
   * @param keywords the list of words to search for.
   *
   */
  public searchArtworks(searchObj: ArtSearch, keywords: string[] = []): Promise<Artwork[]> {
    const query = new QueryBuilder()
      .size(400)
      .sort(defaultSortField)
      .mustMatch('type', 'artwork');

    _.each(searchObj, (arr, key) => {
      if (Array.isArray(arr)) {
        arr.forEach(val => query.mustMatch(key, val));
      }
    });

    keywords.forEach(keyword =>
      query.mustShouldMatch([
        { key: 'label', value: keyword },
        { key: 'description', value: keyword }
      ])
    );
    return this.performQuery(query);
  }

  public async getEntityItems<T>(type: EntityType, count = 20, from = 0): Promise<T[]> {
    const query = new QueryBuilder()
      .mustMatch('type', type)
      .sort(defaultSortField)
      .size(count)
      .from(from);
    return this.performQuery<T>(query);
  }

  public async countEntityItems<T>(type: EntityType) {
    const response: any = await this.http
      .get('https://openartbrowser.org/' + elasticEnvironment.serverURI + '/' + (this.ISO_639_1_LOCALE || 'en') + '/_count?q=type:' + type)
      .toPromise();
    return response && response.count ? response.count : undefined;
  }

  public async getRandomMovementArtwork<T>(movementId: string, count = 20): Promise<T[]> {
    const query = new QueryBuilder()
      .mustMatch('type', 'artwork')
      .mustPrefix('image', 'http')
      .sort(defaultSortField)
      .size(count);
    return this.performQuery<T>(query);
  }

  /**
   * Find any obejct in the index by the field label with the given label
   * @param label object label
   */
  public findByLabel(label: string): Promise<any[]> {
    const query = new QueryBuilder()
      .shouldMatch('label', `${label}`)
      .shouldWildcard('label', `${label}`)
      .sort(defaultSortField)
      .size(200);
    return this.performQuery(query);
  }

  /**
   * Return 20 items for an specific category.
   * @param type category type
   * @param count size of return set
   */
  public async getCategoryItems<T>(type: EntityType, count = 20): Promise<T[]> {
    const query = new QueryBuilder()
      .mustMatch('type', type)
      .mustPrefix('image', 'http')
      .sort(defaultSortField)
      .size(count);
    return this.performQuery<T>(query);
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
  private async performQuery<T>(query: QueryBuilder, url: string = this.baseUrl, type?: EntityType) {
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
      function(val) {
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

Query: ${query.toString()}
`;
