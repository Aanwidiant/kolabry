export interface KolReport {
    id: number;
    campaign_id: number;
    kol_id: number;
    like_count: number;
    comment_count: number;
    share_count: number;
    save_count: number;
    engagement: number;
    reach: number;
    er: number;
    cpe: number;
    final_score?: number;
    ranking?: number;
    created_at: Date;
    updated_at: Date;
}
