import { Guild } from 'serverless_bots_addons';
export default async (request: import('@vercel/node').VercelRequest, response: import('@vercel/node').VercelResponse) => {
    response.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:3000, https://evalbotbeta.vercel.app');
    if (request.method !== 'GET') {
        return response.status(405).send('Method not allowed');
    }
    if (request.method === 'GET') {
        let guilds: Response | Guild[] = await fetch('https://discord.com/api/v10/users/@me/guilds', {
            headers: { 'Authorization': `Bot ${process.env.TOKEN}` }
        });
        guilds = await guilds.json() as Guild[];
        return response.send(guilds);
    }
};