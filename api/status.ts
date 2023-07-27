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
    if (request.query.status && (request.query.status.includes(' ') || request.query.status.includes('-') || request.query.status.includes('*') || request.query.status.includes('/'))) {
        for (let i = 0; i < request.query.status.length; i++) {
            if ([' ', '-', '*', '/'].includes((request.query.status as string).charAt(i + 1))) {
                switch ((request.query.status as string).charAt(i + 1)) {
                case ' ': {
                    let statusNumber = parseInt((request.query.status as string).split(' ')[0]);
                    for (let i = 0; i < (request.query.status as string).split(' ').length; i++) {
                        if (i == 0) continue;
                        else statusNumber += parseInt((request.query.status as string).split(' ')[i]);
                    }
                    return response.redirect(307, `/api/status?status=${statusNumber}`);
                }
                case '-': {
                    let statusNumber = parseInt((request.query.status as string).split('-')[0]);
                    for (let i = 0; i < (request.query.status as string).split('-').length; i++) {
                        if (i == 0) continue;
                        else statusNumber -= parseInt((request.query.status as string).split('-')[i]);
                    }
                    return response.redirect(307, `/api/status?status=${statusNumber}`);
                }
                case '*': {
                    let statusNumber = parseInt((request.query.status as string).split('*')[0]);
                    for (let i = 0; i < (request.query.status as string).split('*').length; i++) {
                        if (i == 0) continue;
                        else statusNumber *= parseInt((request.query.status as string).split('*')[i]);
                    }
                    return response.redirect(307, `/api/status?status=${statusNumber}`);
                }
                case '/': {
                    let statusNumber = parseInt((request.query.status as string).split('/')[0]);
                    for (let i = 0; i < (request.query.status as string).split('/').length; i++) {
                        if (i == 0) continue;
                        else statusNumber /= parseInt((request.query.status as string).split('/')[i]);
                    }
                    return response.redirect(307, `/api/status?status=${statusNumber}`);
                }
                }
            }
        }
    }
    if ((request.query.status != undefined && isNaN(parseInt(request.query.status as string))) || (parseInt(request.query.status as string) < 200 || parseInt(request.query.status as string) > 999)) {
        return response.redirect(307, '/api/status');
    }
    let randomStatus: number = parseInt(request.query.status as string) >= 200 || parseInt(request.query.status as string) <= 999 ? parseInt(request.query.status as string) : Math.floor(Math.random() * (999 - 200 + 1) + 200);
    while (randomStatus == 204 || randomStatus == 304) {
        if (request.query.status) {
            return response.redirect(307, '/api/status');
        }
        randomStatus = Math.floor(Math.random() * (999 - 200 + 1) + 200);
    }
    while (randomStatus == 500 && parseInt(request.query.status as string) != 500) {
        randomStatus = Math.floor(Math.random() * (999 - 200 + 1) + 200);
    }
    let isRealStatusCode: Response | Status = await fetch(`https://http.dog/${randomStatus}.json`);
    if (isRealStatusCode.status == 200) {
        statusCode = await isRealStatusCode.json();
    }
    else {
        while (isRealStatusCode.status != 200) {
            if (request.query.status) {
                return response.redirect(307, '/api/status');
            }
            randomStatus = Math.floor(Math.random() * (999 - 200 + 1) + 200);
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