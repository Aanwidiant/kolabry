import { Hono } from 'hono';
import { protect, isKOLManager } from '../middlewares';
import { campaignType } from '../controllers';

const campaignTypes = new Hono();

campaignTypes.post('/', protect, isKOLManager, (c) => campaignType.createCampaignType(c));
campaignTypes.get('/', protect, isKOLManager, (c) => campaignType.getCampaignTypes(c));
campaignTypes.patch('/:id', protect, isKOLManager, (c) => campaignType.updateCampaignType(c));
campaignTypes.delete('/:id', protect, isKOLManager, (c) => campaignType.deleteCampaignType(c));

export default campaignTypes;
