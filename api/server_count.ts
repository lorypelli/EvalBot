export default async (request: import('@vercel/node').VercelRequest, response: import('@vercel/node').VercelResponse) => {
    if (request.method === 'GET') {
        let guilds: Response | [] = await fetch('https://discord.com/api/v10/users/@me/guilds', {
            headers: { 'Authorization': `Bot ${process.env.TOKEN}`, 'Content-Type': 'application/json' }
        });
        guilds = await guilds.json() as [];
        return response.send(guilds.length);
    }
};