export default async (request: import('@vercel/node').VercelRequest, response: import('@vercel/node').VercelResponse) => {
    if (request.method === 'GET') {
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
                }
            </style>
        </head>
        
        <body>
            <nav id="navbar">
                <h1 id="navtext">EvalBot</h1>
            </nav>
            <img id="userAvatar">
            <h1 id="username"></h1>
            <script>
                window.onload = async() => {
                    let urlParams = new URLSearchParams(window.location.hash.slice(1))
                    let accessTokent = urlParams.get("access_token")
                    if (!accessTokent) {
                        location.href = window.location.hostname.includes("localhost") || window.location.hostname.includes("127.0.0.1") ? "/" : "/api"
                    }
                    let res = await fetch("https://discord.com/api/users/@me", {
                        headers: {
                            "Authorization": \`Bearer \${accessTokent}\`
                        }
                    })
                    res = await res.json()
                    document.getElementById("userAvatar").src = \`https://cdn.discordapp.com/avatars/\${res.id}/\${res.avatar}.png\`
                    document.getElementById("username").innerHTML = res.username
                };
            </script>
        </body>
        
        </html>
        `;
        return response.send(html);
    }
};