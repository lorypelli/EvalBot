import mongoose from 'mongoose';
export default async (request: import('@vercel/node').VercelRequest, response: import('@vercel/node').VercelResponse) => {
    if (request.method !== 'POST') {
        return response.status(405).send('Method not allowed');
    }
    if (request.method === 'POST') {
        mongoose.connect(request.headers.authorization!).then(() => {
            response.status(202).send('Connected to the database');
        }).catch(() => {
            response.status(403).send('An error occurred while connecting');
        });
    }
};