import { Guild } from 'serverless_bots_addons';
export default async (request: import('@vercel/node').VercelRequest, response: import('@vercel/node').VercelResponse) => {
    response.setHeader('Access-Control-Allow-Origin', 'https://evalbotbeta.vercel.app');
    if (request.method !== 'GET') {
        response.setHeader('Content-Type', 'text/plain');
        return response.status(405).send('Method not allowed');
    }
    else if (request.method === 'GET' && request.headers.authorization === `Bot ${process.env.TOKEN}`) {
        let guilds: Response | Guild[] = await fetch('https://discord.com/api/v10/users/@me/guilds', {
            headers: { 'Authorization': `Bot ${process.env.TOKEN}` }
        });
        guilds = await guilds.json() as Guild[];
        return response.send(guilds);
    }
    else {
        response.setHeader('Content-Type', 'text/plain');
        return response.status(401).send('Unauthorized');
    }
};