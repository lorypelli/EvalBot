export default async (request: import('@vercel/node').VercelRequest, response: import('@vercel/node').VercelResponse) => {
    let statusCode: Status = {
        image: {
            avif: '',
            jpg: '',
            jxl: '',
            webp: ''
        },
        status_code: 0,
        title: '',
        url: ''
    };
    let randomStatus: number = parseInt(request.query.status as string) >= 100 || parseInt(request.query.status as string) <= 999 ? parseInt(request.query.status as string) : Math.floor(Math.random() * (999 - 100 + 1) + 100);
    let isRealStatusCode: Response | Status = await fetch(`https://http.dog/${randomStatus}.json`);
    if (isRealStatusCode.status == 200) {
        statusCode = await isRealStatusCode.json();
    }
    else {
        while (isRealStatusCode.status != 200) {
            randomStatus = Math.floor(Math.random() * (999 - 100 + 1) + 100);
            isRealStatusCode = await fetch(`https://http.dog/${randomStatus}.json`);
            if (isRealStatusCode.status == 200) {
                statusCode = await isRealStatusCode.json();
                break;
            }
        }
    }
    response.setHeader('Content-Type', 'text/plain');
    return response.status(randomStatus).send(`${statusCode.status_code} - ${statusCode.title}`);
};
interface Status {
    image: {
        avif: string,
        jpg: string,
        jxl: string,
        webp: string
    },
    status_code: number,
    title: string,
    url: string
}