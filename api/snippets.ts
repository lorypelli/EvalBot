import mongoose from 'mongoose';
import snippets from './schemas/Snippet';
export default async (request: import('@vercel/node').VercelRequest, response: import('@vercel/node').VercelResponse) => {
    response.setHeader('Access-Control-Allow-Origin', 'https://evalbotbeta.vercel.app');
    if (request.method === 'GET') {
        if (request.headers.authorization == undefined || request.headers.authorization.trim() == '') {
            response.setHeader('Content-Type', 'text/plain');
            return response.status(400).send('Missing authorization header');
        }
        if (request.headers.authorization === process.env.PASSWORD) {
            mongoose.connect(`mongodb+srv://EvalBot:${request.headers.authorization}@evalbot.crs0qn4.mongodb.net/EvalBot?retryWrites=true&w=majority`).then(() => {
                if (request.query.user == undefined || request.query.user.toString().trim() == '') {
                    response.setHeader('Content-Type', 'text/plain');
                    return response.status(400).send('User ID is required');
                }
                snippets.find({ userId: request.query.user }).then(s => {
                    return response.send(s);
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
    if (request.method !== 'GET') {
        response.setHeader('Content-Type', 'text/plain');
        return response.status(405).send('Method not allowed');
    }
};