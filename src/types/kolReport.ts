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
    cost: number;
    er: number;
    cpe: number;
    final_score?: number;
    ranking?: number;
    created_at: Date;
    updated_at: Date;
}

export interface KolReportItem {
    id: number | undefined;
    kol_id: number;
    kol_name: string;
    report: Partial<KolReport>;
}
