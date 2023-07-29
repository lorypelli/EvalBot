import { AuthResult } from './addons';
import { User } from 'serverless_bots_addons';
export default async (request: import('@vercel/node').VercelRequest, response: import('@vercel/node').VercelResponse) => {
    if (request.method !== 'GET') {
        response.setHeader('Content-Type', 'text/plain');
        return response.status(405).send('Method not allowed');
    }
    else if (request.method === 'GET') {
        if (!request.query.code) {
            return response.redirect(307, '/api/login');
        }
        let formData = new URLSearchParams({
            client_id: process.env.ID,
            client_secret: process.env.CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: request.query.code.toString(),
            redirect_uri: 'https://evalbot.vercel.app/api/redirect'
        });
        let res: Response | AuthResult = await fetch('https://discord.com/api/v10/oauth2/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString()
        });
        if (res.status != 200) {
            formData = new URLSearchParams({
                client_id: process.env.ID,
                client_secret: process.env.CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: request.query.code.toString(),
                redirect_uri: 'https://evalbotbeta.vercel.app/api/redirect'
            });
            res = await fetch('https://discord.com/api/v10/oauth2/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString()
            });
        }
        res = await res.json() as AuthResult;
        let user: Response | User = await fetch('https://discord.com/api/v10/users/@me', {
            headers: { 'Authorization': `Bearer ${res.access_token}` }
        });
        if (user.status != 200) {
            return response.redirect(307, '/api/login');
        }
        user = await user.json() as User;
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
                window.location.href = "/api/dashboard?user=${user.id}"
            }
        </script>
    </body>
    
    </html>
    `;
        return response.send(html);
    }
};