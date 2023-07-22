import mongoose from 'mongoose';
import snippets from './schemas/Snippet';
export default async (request: import('@vercel/node').VercelRequest, response: import('@vercel/node').VercelResponse) => {
    response.setHeader('Access-Control-Allow-Origin', 'https://evalbotbeta.vercel.app');
    if (request.method !== 'POST') {
        response.setHeader('Content-Type', 'text/plain');
        return response.status(405).send('Method not allowed');
    }
    if (request.method === 'POST') {
        if (request.headers.authorization == undefined || request.headers.authorization == ''.trim()) {
            response.setHeader('Content-Type', 'text/plain');
            return response.status(400).send('Missing authorization header');
        }
        if (request.headers.authorization === process.env.PASSWORD) {
            mongoose.connect(`mongodb+srv://EvalBot:${request.headers.authorization}@evalbot.crs0qn4.mongodb.net/EvalBot?retryWrites=true&w=majority`).then(() => {
                snippets.find({ userId: request.body.user }).then(s => {
                    if (s.length == 0) {
                        response.setHeader('Content-Type', 'text/plain');
                        return response.status(404).send('The user doesn\'t have any snippet');
                    }
                    return response.status(302).send(s);
                }).catch(() => {
                    response.setHeader('Content-Type', 'text/plain');
                    return response.status(403).send('An error occurred while finding user snippets');
                });
            }).catch(() => {
                response.setHeader('Content-Type', 'text/plain');
                return response.status(403).send('An error occurred while connecting');
            });
        }
        else {
            response.setHeader('Content-Type', 'text/plain');
            return response.status(406).send('Wrong password');
        }
    }
};