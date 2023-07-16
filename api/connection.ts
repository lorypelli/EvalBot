import mongoose from 'mongoose';
export default async (request: import('@vercel/node').VercelRequest, response: import('@vercel/node').VercelResponse) => {
    response.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:3000');
    if (request.method !== 'POST') {
        return response.status(405).send('Method not allowed');
    }
    if (request.method === 'POST') {
        if (request.headers.authorization == undefined || request.headers.authorization == ''.trim()) {
            return response.status(400).send('Missing authorization header');
        }
        if (request.headers.authorization == process.env.PASSWORD) {
            mongoose.connect(`mongodb+srv://EvalBot:${request.headers.authorization}@evalbot.crs0qn4.mongodb.net/EvalBot?retryWrites=true&w=majority`).then(() => {
                return response.status(202).send('Connected to the database');
            }).catch(() => {
                return response.status(403).send('An error occurred while connecting');
            });
        }
        else {
            return response.status(406).send('Wrong password');
        }
    }
};