export interface HomepageSettings {
    images?: GalleryItem[]
    creditsToPurchase?: number[];
    promoterRate?: number[];
    pricePerCredit?: number;
    fees?: {
        bronze?: number;
        silver?: number;
        gold?: number;
    },
    categories?: string[];
    skills?: string[];
    featured?: string;
    promotions?: string[];
    social?: {
        facebook?: string;
        youtube?: string;
        twitter?: string;
        instagram?: string;
    }
    title?: string;
    title_ch?: string;
    titleItems?: string[];
    loginText?: string;
}

export interface GalleryItem {
    src?: string;
    date?: Date;
}
