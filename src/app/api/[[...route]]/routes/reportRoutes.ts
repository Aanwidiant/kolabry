import { Hono } from 'hono';
import { protect, isKOLManager } from '../middlewares';
import { report } from '../controllers';

const reports = new Hono();

reports.post('/', protect, isKOLManager, (c) => report.createReports(c));
reports.get('/', protect, (c) => report.getReports(c));
reports.get('/:id', protect, (c) => report.getReportById(c));
reports.patch('/:id', protect, isKOLManager, (c) => report.updateReport(c));
reports.delete('/:id', protect, isKOLManager, (c) => report.deleteReport(c));
reports.get('/export/:id', protect, (c) => report.exportCampaignReport(c));

export default reports;
