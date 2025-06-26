import { Hono } from 'hono';
import { protect, isKOLManager } from '../middlewares';
import { campaign } from '../controllers';

const campaigns = new Hono();

campaigns.post('/', protect, isKOLManager, (c) => campaign.createCampaign(c));
campaigns.get('/', protect, isKOLManager, (c) => campaign.getCampaigns(c));
campaigns.get('/:id', protect, isKOLManager, (c) => campaign.getCampaignsById(c));
campaigns.patch('/', protect, isKOLManager, (c) => campaign.updateCampaign(c));
campaigns.delete('/:id', protect, isKOLManager, (c) => campaign.deleteCampaign(c));

export default campaigns;
