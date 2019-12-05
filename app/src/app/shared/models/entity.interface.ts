
export interface Entity {
    id: string;
    label?: string;
    description?: string;
    abstract?: string;
    wikipediaLink?: string;
    image?: string;
    imageSmall?: string;
    imageMedium?: string;
    type: string;
    absoluteRank: number;
    relativeRank: number;
    videos?: string;
}