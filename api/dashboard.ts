import { URLSearchParams } from 'url';
import { AuthResult } from './addons';
import { User } from 'serverless_bots_addons';
export default async (request: import('@vercel/node').VercelRequest, response: import('@vercel/node').VercelResponse) => {
    if (request.method === 'GET') {
        if (!request.query.code) {
            return response.redirect(307, '/api/login');
        }
        let formData = new URLSearchParams({
            client_id: process.env.ID,
            client_secret: process.env.CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: request.query.code.toString(),
            redirect_uri: 'https://evalbot.vercel.app/api/dashboard'
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
                redirect_uri: 'https://evalbotbeta.vercel.app/api/dashboard'
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
        let userSnippets: Response | [] = await fetch(`https://evalbotbeta.vercel.app/api/snippets?user=${user.id}`, {
            headers: { 'Authorization': process.env.PASSWORD }
        });
        if (userSnippets.status == 200) {
            userSnippets = await userSnippets.json() as [];
        }
        else {
            userSnippets = [];
        }    
        const html = `
        <!DOCTYPE html>
        <html>
        
        <head>
            <title>EvalBot Dashboard</title>
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
        
                #navbar {
                    border: 5px solid;
                    border-radius: 10px;
                    border-color: white;
                    height: 55px;
                }
        
                #navtext {
                    font-size: 20px;
                    color: white;
                }
        
                h1 {
                    color: white;
                }
        
                img {
                    display: block;
                    margin-left: auto;
                    margin-right: auto;
                    margin-top: 20px;
                    border-radius: 50%;
                    border: 10px solid;
                    border-color: white;
                    width: 148px;
                    height: 148px;
                }
        
                button {
                    margin-top: 45px;
                    width: 300px;
                    height: 50px;
                    font-size: 35px;
                    border: none;
                    color: black;
                    background-color: white;
                    margin-right: -2.5px;
                    border-radius: 25px;
                }

                #logoutdiv {
                    text-align: right;
                    margin-top: -85px;
                }
                #logout {
                    margin-bottom: 10px;
                    margin-right: 10px;
                    width: 20%;
                    height: 25px;
                    font-size: 1.5vw;
                    border: none;
                    color: black;
                    background-color: white;
                    cursor: pointer;
                    border-radius: 25px;
                }
            </style>
        </head>
        
        <body>
            <nav id="navbar">
                <h1 id="navtext">EvalBot</h1>
                <div id="logoutdiv">
                <button id="logout">Logout</button>
            </div>
            </nav>
            <img src="https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png">
            <h1>${user.username}</h1>
            <h1>The user has a total of ${userSnippets.length} snippets</h1>
            <script>
            document.getElementById("logout").addEventListener("click", () => {
                window.location.href = "/api"
            })
            </script>
        </body>
        
        </html>
        `;
        return response.send(html);
    }
};