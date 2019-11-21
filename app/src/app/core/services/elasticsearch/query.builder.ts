
export interface QueryObject {
    query: {
        bool: {
            should: any[];
            must: any[];
            minimum_should_match?: number
        }
    };
    sort: any[];
    size?: number;
}

/**
 * A builder for an elasticsearch query
 */
export default class QueryBuilder {
    /** query object */
    public query: QueryObject = {
        query: { bool: { should: [], must: [] } },
        sort: []
    }

    /**
     * Create new QueryBilder object.
     * @param query predefined query
     */
    constructor(query?: QueryObject) {
        this.query = query;
    }

    /**
     * Add should have prefix query
     * @param key attribute name
     * @param value attribute value
     * @returns QueryBuilder instance
     */
    public shouldPrefix(key: string, value: string): QueryBuilder {
        this.query.query.bool.should.push({
            prefix: { [key]: value }
        });
        return this;
    }

    /**
     * Add should have term query
     * @param key attribute name
     * @param value attribute value
     * @returns QueryBuilder instance
     */
    public shouldTerm(key: string, value: string): QueryBuilder {
        this.query.query.bool.must.push({
            term: { [key]: value }
        });
        return this;
    }

    /**
    * Add should have wildcard query
    * @param key attribute name
    * @param value attribute value
    * @returns QueryBuilder instance
    */
    public shouldWildcard(key: string, value: string): QueryBuilder {
        this.query.query.bool.should.push({
            wildcard: { [key]: '*' + value + '*' }
        });
        return this;
    }

    /**
        * Add should match query
        * @param key attribute name
        * @param value attribute value
        * @returns QueryBuilder instance
        */
    public shouldMatch(key: string, value: string): QueryBuilder {
        this.query.query.bool.should.push({
            match: { [key]: value }
        });
        return this;
    }

    /**
    * Add must have wildcard query
    * @param key attribute name
    * @param value attribute value
    * @returns QueryBuilder instance
    */
    public mustWildcard(key: string, value: string): QueryBuilder {
        this.query.query.bool.must.push({
            wildcard: { [key]: '*' + value + '*' }
        });
        return this;
    }

    /**
    * Add must match query
    * @param key attribute name
    * @param value attribute value
    * @returns QueryBuilder instance
    */
    public mustMatch(key: string, value: string): QueryBuilder {
        this.query.query.bool.must.push({
            match: { [key]: value }
        });
        return this;
    }


    /**
    * Add must have term query
    * @param key attribute name
    * @param value attribute value
    * @returns QueryBuilder instance
    */
    public mustTerm(key: string, value: string): QueryBuilder {
        this.query.query.bool.must.push({
            term: { [key]: value }
        });
        return this;
    }


    /**
    * Add must have prefix query
    * @param key attribute name
    * @param value attribute value
    * @returns QueryBuilder instance
    */
    public mustPrefix(key: string, value: string): QueryBuilder {
        this.query.query.bool.must.push({
            prefix: { [key]: value }
        });
        return this;
    }


    /**
    * Add minimum should match count
    * @param count  minimum count
    * @returns QueryBuilder instance
    */
    public minimumShouldMatch(count: number): QueryBuilder {
        this.query.query.bool.minimum_should_match = count;
        return this;
    }

    /**
     * Add sort by relativeRank 
     * @param order order - default is desc
     * @returns QueryBuilder instance
     */
    public sort(order: string = "desc"): QueryBuilder {
        this.query.sort.push({
            relativeRank: { order: order }
        });
        return this;
    }

    /**
     * Add result size
     * @param size size value - default is 20
     * @returns QueryBuilder instance
     */
    public size(size: number = 20): QueryBuilder {
        this.query.size = size;
        return this;
    }
}