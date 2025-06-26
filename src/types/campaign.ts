import { NicheType, AgeRangeType, Kols } from './kol';

export interface Campaigns {
    id: number;
    user_id: number;
    brand_id: number;
    name: string;
    kol_type_id: number | undefined;
    budget: number;
    target_niche: NicheType;
    target_engagement: number;
    target_reach: number;
    target_gender: GenderType;
    target_gender_min: number;
    target_age_range: AgeRangeType;
    target_rate_card: number;
    start_date: Date;
    end_date: Date;
    created_at: Date;
    updated_at: Date;
    kol_ids: number[];
    campaign_kols: {
        kol: Kols;
    }[];

    kol_types: {
        name: string;
        min_followers: number;
        max_followers: number;
    }
    user: {
        id: number;
        username: string;
    }
}

export type GenderType = 'MALE' | 'FEMALE';
