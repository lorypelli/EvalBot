import { User } from 'serverless_bots_addons';
import { snippet } from '../schemas/Snippet';
export default async (request: import('@vercel/node').VercelRequest, response: import('@vercel/node').VercelResponse) => {
    if (request.method !== 'GET') {
        response.setHeader('Content-Type', 'text/plain');
        return response.status(405).send('Method not allowed');
    }
    else if (request.method === 'GET') {
        if (isNaN(parseInt(request.query.user as string))) {
            return response.redirect(307, '/api/login');
        }
        let user: Response | User = await fetch(`https://discord.com/api/v10/users/${request.query.user}`, {
            headers: { 'Authorization': `Bot ${process.env.TOKEN}` }
        });
        if (user.status != 200) {
            return response.redirect(307, '/api/login');
        }
        user = await user.json() as User;
        let userSnippets: Response | snippet[] = await fetch(`https://evalbotbeta.vercel.app/api/snippets?user=${user.id}`, {
            headers: { 'Authorization': process.env.PASSWORD }
        });
        if (userSnippets.status == 200) {
            userSnippets = await userSnippets.json() as snippet[];
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
        
                #userSnippets {
                    font-size: 1.5vw
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
                    font-size: 1vw;
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
            <h1 id="userSnippets">${userSnippets.map(s => s.language + '<br>' + (s.code.length > 80 ? s.code.match(/.{1,80}/g)!.join('<br>') : s.code) + '<br>').join('<br>')}</h1>
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