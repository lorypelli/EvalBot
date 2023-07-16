import mongoose from 'mongoose';
const url = `mongodb+srv://EvalBot:${process.env.PASSWORD}@evalbot.crs0qn4.mongodb.net/EvalBot?retryWrites=true&w=majority`;
export default async (request: import('@vercel/node').VercelRequest, response: import('@vercel/node').VercelResponse) => {
    if (request.method === 'POST') {
        mongoose.connect(url).then(() => {
            response.status(202).send('Connected to the database');
        }).catch(() => {
            response.status(403).send('An error occurred while connecting');
        });
    }
};