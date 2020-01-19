import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface TagItem {
    label: string;
    type?: string;
    id?: string;
}

@Injectable()
export class SearchService {
    /** search chips */
    private searchItems: TagItem[] = [];

    /** search chips as observable */
    public $searchItems: Subject<TagItem[]> = new Subject();

    constructor() { }

    /** 
     * add a new search tag to the search (displayed as chip)
     * @param tag TagItem that should be added
     */
    public addSearchTag(tag: TagItem) {
        const existingTag = this.searchItems.filter((i) =>
            i.id === tag.id && i.type === tag.type && i.label === tag.label
        );
        if (existingTag.length === 0) {
            this.searchItems.push({
                label: tag.label,
                type: tag.type,
                id: tag.id,
            });
            this.$searchItems.next(this.searchItems);
        }
    }

    /** 
     * remove a search tag from the search
     * @param tag TagItem that should be removed
     */
    public removeSearchTag(tag: TagItem) {
        this.searchItems = this.searchItems.filter((i) =>
            i.id !== tag.id || i.type !== tag.type || i.label !== tag.label
        );
        this.$searchItems.next(this.searchItems);
    }

    /** 
     * clear all search tags 
     */
    public clearSearchTags() {
        this.searchItems = [];
        this.$searchItems.next(this.searchItems);
    }
}
