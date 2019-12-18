import * as _ from 'lodash';
import { HttpClient } from '@angular/common/http';
import { Injectable, Inject, LOCALE_ID } from '@angular/core';
import { EntityType, Artwork, ArtSearch, Entity, Iconclass, EntityIcon, EntityRoute } from 'src/app/shared/models/models';
import { elasticEnvironment } from 'src/environments/environment';
import QueryBuilder from './query.builder';

/**
 * Service that handles the requests to the API
 */
@Injectable()
export class DataService {
    /** base url of elasticSearch server */
    private baseUrl: string;

    /**
     * Constructor
     */
    constructor(private http: HttpClient, @Inject(LOCALE_ID) locale_id: string) {
        // build backend api url with specfic index by locale_id
        const ISO_639_1_LOCALE = locale_id.substr(0, 2);
        this.baseUrl = elasticEnvironment.serverURI + "/" + (ISO_639_1_LOCALE || 'en') + "/_search";
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
        return (!entities.length) ? null : entities[0];
    }

    /**
     * Fetches multiple entities from the server
     * @param ids ids of entities that should be retrieved
     * @param type if specified, it is assured that the returned entities have this entityType
     */
    public async findMultipleById<T>(ids: string[], type?: EntityType): Promise<T[]> {
        const copyids = ids && ids.filter((id) => !!id);
        if (!copyids || copyids.length === 0) {
            return [];
        }
        const query = new QueryBuilder().size(400);
        copyids.forEach((id) => query.shouldMatch("id", `${id}`));
        return this.performQuery<T>(query, this.baseUrl, type);
    }

    /**
     * Find Artworks by the given ids for the given type
     * @param type the type to search in
     * @param ids the ids to search for
     */
    public findArtworksByType(type: string, ids: string[]): Promise<Artwork[]> {
        const query = new QueryBuilder()
            .size(200)
            .sort()
            .minimumShouldMatch(1)
            .mustTerm("type", "artwork");
        ids.forEach((id) => query.shouldMatch(type, `${id}`));
        return this.performQuery<Artwork>(query);
    }

    /**
     * Find an artwork by label
     * @param label artwork label
     */
    public findArtworksByLabel(label: string): Promise<Artwork[]> {
        const query = new QueryBuilder()
            .size(20)
            .sort()
            .mustMatch("type", "artwork")
            .shouldMatch("label", `${label}`);
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
            .sort()
            .mustMatch("type", "artwork");

        _.each(searchObj, (arr, key) => {
            if (Array.isArray(arr))
                arr.forEach(val => query.mustMatch(key, val));
        });

        keywords.forEach(keyword =>
            query.mustShouldMatch([
                { key: 'label', value: keyword },
                { key: "description", value: keyword }
            ])
        );
        return this.performQuery(query);
    }

    /**
     * Find any obejct in the index by the field label with the given label
     * @param label object label
     */
    public findByLabel(label: string): Promise<any[]> {
        const query = new QueryBuilder()
            .shouldMatch("label", `${label}`)
            .shouldWildcard("label", `${label}`)
            .sort()
            .size(2000);
        return this.performQuery(query);
    }

    /**
     * Return 20 items for an specific category.
     * @param type category type
     */
    public async getCategoryItems<T>(type: EntityType): Promise<T[]> {
        const query = new QueryBuilder()
            .mustMatch("type", type)
            .mustPrefix("image", "http")
            .sort()
            .size(20);
        return this.performQuery<T>(query);
    }

    /**
     * Retrieves IconclassData from the iconclass.org web-service
     * @see http://www.iconclass.org/help/lod for the documentation
     * @param iconclasses an Array of Iconclasses to retrieve
     * @returns an Array containing the iconclassData to the respective Iconclass
     */
    public async getIconclassData(iconclasses:Array<Iconclass>): Promise<any> {
        return await Promise.all(iconclasses.map(async (key:Iconclass) =>
            await this.http.get(`https://openartbrowser.org/api/iconclass/${key}.json`).toPromise()
        ));
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
        return entities;
    }

    /**
     * filters the data that is fetched from the server
     * @param data Elasticsearch Data
     * @param type optional: type of entities that should be filtered
     */
    private filterData<T>(data: any, filterBy?: EntityType): T[] {
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
    private addThumbnails(entity: Entity) {
        const prefix = 'https://upload.wikimedia.org/wikipedia/commons/';
        if (entity.image && !entity.image.endsWith('.tif') && !entity.image.endsWith('.tiff')) {
            entity.imageSmall = entity.image.replace(prefix, prefix + 'thumb/') + '/256px-' + entity.image.substring(entity.image.lastIndexOf('/') + 1);
            entity.imageMedium = entity.image.replace(prefix, prefix + 'thumb/') + '/512px-' + entity.image.substring(entity.image.lastIndexOf('/') + 1);
        }
        else {
            entity.imageSmall = entity.image;
            entity.imageMedium = entity.image;
        }
        return entity;
    }

    /**
     * set type specific attributes
     * @param entity entity object
     */
    private setTypes(entity: any) {
        if (entity.type)
            switch (entity.type) {
                case EntityType.ARTIST:
                    entity.type = EntityType.ARTIST;
                    entity.icon = EntityIcon.ARTIST;
                    entity.route = EntityRoute.ARTIST;
                    break;
                case EntityType.ARTWORK:
                    entity.type = EntityType.ARTWORK;
                    entity.icon = EntityIcon.ARTWORK;
                    entity.route = EntityRoute.ARTWORK;
                    break;
                case EntityType.GENRE:
                    entity.type = EntityType.GENRE;
                    entity.icon = EntityIcon.GENRE;
                    entity.route = EntityRoute.GENRE;
                    break;
                case EntityType.LOCATION:
                    entity.type = EntityType.LOCATION;
                    entity.icon = EntityIcon.LOCATION;
                    entity.route = EntityRoute.LOCATION;
                    break;
                case EntityType.MATERIAL:
                    entity.type = EntityType.MATERIAL;
                    entity.icon = EntityIcon.MATERIAL;
                    entity.route = EntityRoute.MATERIAL;
                    break;
                case EntityType.MOTIF:
                    entity.type = EntityType.MOTIF;
                    entity.icon = EntityIcon.MOTIF;
                    entity.route = EntityRoute.MOTIF;
                    break;
                case EntityType.MOVEMENT:
                    entity.type = EntityType.MOVEMENT;
                    entity.icon = EntityIcon.MOVEMENT;
                    entity.route = EntityRoute.MOVEMENT;
                    break;
            }
    }
}
