import { Hono } from 'hono';
import { protect, isKOLManager } from '../middlewares';
import { report } from '../controllers';

const reports = new Hono();

reports.post('/', protect, isKOLManager, (c) => report.createReports(c));
reports.get('/:id', protect, (c) => report.getReports(c));
reports.patch('/:id', protect, isKOLManager, (c) => report.updateReport(c));
reports.delete('/:id', protect, isKOLManager, (c) => report.deleteReport(c));

export default reports;
