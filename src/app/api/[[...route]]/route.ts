import { Hono } from 'hono';
import { User, Kol, CampaignType, Campaign, Report } from './routes';

const app = new Hono().basePath('/api');

app.get('/', (c) => {
    return c.json({ message: 'Welcome to KOL Management API' });
});

app.get('/healthcheck', (c) => {
    return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.route('/user', User);
app.route('/kol', Kol);
app.route('/campaign-type', CampaignType);
app.route('/campaign', Campaign);
app.route('/report', Report);

export async function GET(request: Request) {
    return app.fetch(request);
}

export async function POST(request: Request) {
    return app.fetch(request);
}

export async function PATCH(request: Request) {
    return app.fetch(request);
}

export async function DELETE(request: Request) {
    return app.fetch(request);
}
