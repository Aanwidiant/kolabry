import { NicheType, AgeRangeType } from './kol';

export interface Campaigns {
    id: number;
    user_id: number;
    name: string;
    kol_type_id: number | undefined;
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
}

export type GenderType = 'MALE' | 'FEMALE';
