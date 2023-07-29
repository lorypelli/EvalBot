export default async (request: import('@vercel/node').VercelRequest, response: import('@vercel/node').VercelResponse) => {
    if (request.method !== 'GET') {
        response.setHeader('Content-Type', 'text/plain');
        return response.status(405).send('Method not allowed');
    }
    else if (request.method === 'GET') {
        const html = `
    <!DOCTYPE html>
    <html>
    
    <head>
        <title>EvalBot</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Martian+Mono:wght@600&display=swap">
        <link rel="shortcut icon" href="/favicon.ico">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
        <style>
            * {
                font-family: 'Martian Mono', monospace;
                text-align: center;
                -webkit-user-select: none;
                -ms-user-select: none;
                -moz-user-select: none;
                user-select: none;
            }
    
            :focus {
                outline: none;
            }
    
            body {
                background-color: #363636;
                overflow-x: hidden;
            }
        </style>
    </head>
    
    <body>
        <script>
            window.onload = () => {
                window.location.href = window.location.hostname.includes("evalbotbeta") ? "https://discord.com/api/oauth2/authorize?client_id=1077228141531123852&redirect_uri=https%3A%2F%2Fevalbotbeta.vercel.app%2Fapi%2Fredirect&response_type=code&scope=identify%20guilds%20guilds.members.read" : "https://discord.com/api/oauth2/authorize?client_id=1076200668810985634&redirect_uri=https%3A%2F%2Fevalbot.vercel.app%2Fapi%2Fredirect&response_type=code&scope=identify%20guilds%20guilds.members.read"
            }
        </script>
    </body>
    
    </html>
    `;
        return response.send(html);
    }
};