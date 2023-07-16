import { Guild } from 'serverless_bots_addons';
export default async (request: import('@vercel/node').VercelRequest, response: import('@vercel/node').VercelResponse) => {
    if (request.method === 'GET') {
        let guilds: Response | Guild[] = await fetch('https://discord.com/api/v10/users/@me/guilds', {
            headers: { 'Authorization': `Bot ${process.env.TOKEN}`, 'Content-Type': 'application/json' }
        });
        guilds = await guilds.json() as Guild[];
        return response.send(guilds.length);
    }
};