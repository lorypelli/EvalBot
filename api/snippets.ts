import mongoose from 'mongoose';
import snippets from './schemas/Snippet';
export default async (request: import('@vercel/node').VercelRequest, response: import('@vercel/node').VercelResponse) => {
    response.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:3000, https://evalbotbeta.vercel.app');
    if (request.method !== 'POST') {
        return response.status(405).send('Method not allowed');
    }
    if (request.method === 'POST') {
        if (request.headers.authorization == undefined || request.headers.authorization == ''.trim()) {
            return response.status(400).send('Missing authorization header');
        }
        if (request.headers.authorization === process.env.PASSWORD) {
            mongoose.connect(`mongodb+srv://EvalBot:${request.headers.authorization}@evalbot.crs0qn4.mongodb.net/EvalBot?retryWrites=true&w=majority`).then(() => {
                console.log(request.body.user);
                snippets.find({ userId: request.body.user }).then(s => {
                    if (s.length == 0) {
                        return response.status(404).send('The user doesn\'t have any snippet');
                    }
                    return response.status(302).send(s);
                }).catch(() => {
                    return response.status(403).send('An error occurred while finding user snippets');
                });
            }).catch(() => {
                return response.status(403).send('An error occurred while connecting');
            });
        }
        else {
            return response.status(406).send('Wrong password');
        }
    }
};