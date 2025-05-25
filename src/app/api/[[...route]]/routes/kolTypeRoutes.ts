import { Hono } from 'hono';
import { protect, isKOLManager } from '../middlewares';
import { kolType } from '../controllers';

const kolTypes = new Hono();

kolTypes.post('/', protect, isKOLManager, (c) => kolType.createKolType(c));
kolTypes.get('/', protect, isKOLManager, (c) => kolType.getKolTypes(c));
kolTypes.patch('/:id', protect, isKOLManager, (c) => kolType.updateKolType(c));
kolTypes.delete('/:id', protect, isKOLManager, (c) => kolType.deleteKolType(c));

export default kolTypes;
