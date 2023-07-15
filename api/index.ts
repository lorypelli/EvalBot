/* eslint-disable no-self-assign */
import { InteractionResponseType, InteractionType, verifyKey, MessageComponentTypes, ButtonStyleTypes, TextStyleTypes } from 'discord-interactions';
import getRawBody from 'raw-body';
import { version } from 'os';
import { ApplicationCommandTypes, ApplicationCommandOptionTypes, deferReply, updateDefer, showModal, followUp, editFollowup, get, autocompleteResult, Interaction, Embeds, AutocompleteOptions, SlashCommandsStructure, ButtonsComponent, SelectMenusComponent } from 'serverless_bots_addons';
import mongoose from 'mongoose';
import snippets from './schemas/Snippet';
import { Runtimes, PackageSize, PackageName, Result } from './addons';
import flourite, { DetectedLanguage } from 'flourite';
const url = `mongodb+srv://EvalBot:${process.env.PASSWORD}@evalbot.crs0qn4.mongodb.net/EvalBot?retryWrites=true&w=majority`;
const html = `
<!DOCTYPE html>
<html>

<head>
    <title>EvalBot</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Martian+Mono:wght@600&display=swap">
    <link rel="shortcut icon" href="/favicon.ico">
    <style>
        * {
            font-family: 'Martian Mono', monospace;
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
        }

        #navtext {
            font-size: 20px;
            color: white;
            text-align: center;
        }

        h1 {
            color: white;
            text-align: center;
        }

        img {
            display: block;
            margin-left: auto;
            margin-right: auto;
        }
    </style>
</head>

<body>
    <nav id="navbar">
        <h1 id="navtext">EvalBot</h1>
    </nav>
    <h1>- A discord bot to eval code with the piston api -</h1>
    <img src="/favicon.ico">
    <h1 id="servercount">The bot is currently in 0 servers</h1>
    <script>
        window.onload = async () => {
            let guilds = await fetch('https://evalbot.vercel.app/api/server_count').then(async g => await g.json());
            document.getElementById("servercount").innerHTML = \`The bot is currently in \${guilds} servers\`
        }
    </script>
</body>

</html>
`;
const RUN_CMD: SlashCommandsStructure = {
    name: 'run',
    name_localizations: {
        it: 'esegui',
        pl: 'uruchom'
    },
    description: 'Run a code (Piston API)',
    description_localizations: {
        it: 'Esegui un codice (Piston API)',
        pl: 'Uruchom kod (Piston API)'
    },
    type: ApplicationCommandTypes.CHAT_INPUT
};
const LANGS_CMD: SlashCommandsStructure = {
    name: 'languages',
    name_localizations: {
        it: 'linguaggi',
        pl: 'języki'
    },
    description: 'Show supported programming languages',
    description_localizations: {
        it: 'Mostra i linguaggi di programmazione supportati',
        pl: 'Pokaż obsługiwane języki programowania'
    },
    type: ApplicationCommandTypes.CHAT_INPUT
};
const INVITE_CMD: SlashCommandsStructure = {
    name: 'invite',
    name_localizations: {
        it: 'invita',
        pl: 'zaproś'
    },
    description: 'Get the bot invite link',
    description_localizations: {
        it: 'Ottieni il link d\'invito del bot',
        pl: 'Uzyskaj link z zaproszeniem bota'
    },
    type: ApplicationCommandTypes.CHAT_INPUT
};
const VOTE_CMD: SlashCommandsStructure = {
    name: 'vote',
    name_localizations: {
        it: 'vota',
        pl: 'głosuj'
    },
    description: 'Vote for the bot on topgg',
    description_localizations: {
        it: 'Vota per il bot su topgg',
        pl: 'Głosuj na bota na topgg'
    },
    type: ApplicationCommandTypes.CHAT_INPUT
};
const SIZE_CMD: SlashCommandsStructure = {
    name: 'size',
    name_localizations: {
        it: 'dimensione',
        pl: 'rozmiar'
    },
    description: 'Get the size of an npm package',
    description_localizations: {
        it: 'Ottieni la dimensione di un pacchetto npm',
        pl: 'Uzyskaj rozmiar pakietu npm'
    },
    type: ApplicationCommandTypes.CHAT_INPUT,
    options: [
        {
            name: 'name',
            name_localizations: {
                it: 'nome',
                pl: 'nazwa'
            },
            description: 'Name of the npm package',
            description_localizations: {
                it: 'Nome del pacchetto npm',
                pl: 'Nazwa pakietu npm'
            },
            type: ApplicationCommandOptionTypes.STRING,
            required: true,
            autocomplete: true
        }
    ]
};
const EVAL_CMD: SlashCommandsStructure = {
    name: 'eval',
    description: 'Eval code (only developer)',
    type: ApplicationCommandTypes.CHAT_INPUT
};
const REGISTER_CMD: SlashCommandsStructure = {
    name: 'register',
    description: 'Register slash commands (only developer)',
    type: ApplicationCommandTypes.CHAT_INPUT
};
const INFO_CMD: SlashCommandsStructure = {
    name: 'info',
    description: 'Get bot info (only developer)',
    type: ApplicationCommandTypes.CHAT_INPUT
};
const CONVERT_CMD: SlashCommandsStructure = {
    name: 'convert',
    name_localizations: {
        it: 'converti',
        pl: 'konwertuj'
    },
    description: 'Convert a decimal number into binary one or vice versa',
    description_localizations: {
        it: 'Converti un numero decimale in binario o viceversa',
        pl: 'Konwertuj liczbę dziesiętną na jedną lub odwrotnie'
    },
    type: ApplicationCommandTypes.CHAT_INPUT,
    options: [
        {
            name: 'system',
            name_localizations: {
                it: 'sistema',
                pl: 'system'
            },
            description: 'Convert into binary or decimal?',
            description_localizations: {
                it: 'Converti in binario o decimale?',
                pl: 'Konwertować na binarny czy dziesiętny?'
            },
            type: ApplicationCommandOptionTypes.STRING,
            required: true,
            choices: [
                { name: 'Decimal to Binary', name_localizations: { it: 'Decimale a Binario', pl: 'Ułamek dziesiętny do ułamka binarnego' }, value: 'Decimal to Binary' },
                { name: 'Binary to Decimal', name_localizations: { it: 'Binario a Decimale', pl: 'Ułamek binarny do ułamka dziesiętnego' }, value: 'Binary to Decimal' }
            ]
        },
        {
            name: 'number',
            name_localizations: {
                it: 'numero',
                pl: 'liczba'
            },
            description: 'The number to convert',
            description_localizations: {
                it: 'Il numero da convertire',
                pl: 'Liczba do przekonwertowania'
            },
            type: ApplicationCommandOptionTypes.NUMBER,
            required: true
        }
    ]
};
const SNIPPETS_CMD: SlashCommandsStructure = {
    name: 'snippets',
    name_localizations: {
        it: 'snippets',
        pl: 'snippets'
    },
    description: 'View your snippets or another user snippets',
    description_localizations: {
        it: 'Visualizza i tuoi snippets o quelli di un altro utente',
        pl: 'Zobacz snippets lub snippets innego użytkownika'
    },
    type: ApplicationCommandTypes.CHAT_INPUT,
    options: [
        {
            name: 'id',
            name_localizations: {
                it: 'id',
                pl: 'id'
            },
            description: 'The id of the snippet you want to see',
            description_localizations: {
                it: 'L\'id dello snippet che vuoi vedere',
                pl: 'Id snippet które chcesz zobaczyć'
            },
            type: ApplicationCommandOptionTypes.NUMBER,
            required: true,
            autocomplete: true
        },
        {
            name: 'user',
            name_localizations: {
                it: 'utente',
                pl: 'użytkownik'
            },
            description: 'The user of which you want to see snippets',
            description_localizations: {
                it: 'L\'utente di cui vuoi vedere gli snippets',
                pl: 'Użytkownik, którego chcesz zobaczyć snippets'
            },
            type: ApplicationCommandOptionTypes.USER,
            required: false
        }
    ]
};
const RUN_CONTEXT_MENU: SlashCommandsStructure = {
    name: 'Run',
    name_localizations: {
        it: 'Esegui',
        pl: 'Uruchom'
    },
    type: ApplicationCommandTypes.MESSAGE,
    description: ''
};
export default async (request: import('@vercel/node').VercelRequest, response: import('@vercel/node').VercelResponse) => {
    if (request.method !== 'POST') {
        return response.send(html);
    }
    else if (request.method === 'POST') {
        let runtimes: Response | Runtimes[] = await fetch('https://emkc.org/api/v2/piston/runtimes');
        runtimes = await runtimes.json() as Runtimes[];
        const signature: string | string[] = request.headers['x-signature-ed25519']!;
        const timestamp: string | string[] = request.headers['x-signature-timestamp']!;
        const body: Buffer = await getRawBody(request);
        const isValidRequest: boolean = verifyKey(
            body,
            signature as string,
            timestamp as string,
            process.env.PUBLIC_KEY!
        );
        if (!isValidRequest) {
            return response.status(401).send({ error: 'Unauthorized' });
        }
        const message: Interaction = request.body;
        let id: string = (process.env.TOKEN)!.split('.')[0];
        const buffer: Buffer = Buffer.from(id, 'base64');
        id = buffer.toString('utf8');
        if (id == '1077228141531123852' && (message.member!.user.id || message.user!.id) != '604339998312890379') {
            await deferReply(message, { ephemeral: true });
            return response.send({
                content: await followUp(message, {
                    content: '❌ You can\'t use <@1077228141531123852>, use <@1076200668810985634> instead'
                })
            });
        }
        if (message.type === InteractionType.PING) {
            return response.send(JSON.stringify({
                type: InteractionResponseType.PONG,
            }));
        }
        else if (message.type === InteractionType.APPLICATION_COMMAND) {
            switch (message.data!.name) {
            case INVITE_CMD.name: {
                await deferReply(message, { ephemeral: true });
                let guilds: Response | [] = await fetch('https://discord.com/api/v10/users/@me/guilds', {
                    headers: { 'Authorization': `Bot ${process.env.TOKEN}`, 'Content-Type': 'application/json' }
                });
                guilds = await guilds.json() as [];
                return response.send({
                    content: await followUp(message, {
                        content: `The bot is currently on **${guilds.length} servers**. Click the button below to invite the bot!\nIf you have a problem with the bot, you can join the [support server](https://dsc.gg/evalbotsupport)`,
                        components: [
                            {
                                type: MessageComponentTypes.ACTION_ROW,
                                components: [
                                    {
                                        type: MessageComponentTypes.BUTTON,
                                        label: 'Invite',
                                        style: ButtonStyleTypes.LINK,
                                        url: 'https://discord.com/api/oauth2/authorize?client_id=1076200668810985634&permissions=274877975552&scope=bot%20applications.commands'
                                    }
                                ]
                            }
                        ]
                    })
                });
            }
            case VOTE_CMD.name: {
                await deferReply(message, { ephemeral: true });
                let guilds: Response | Runtimes[] = await fetch('https://discord.com/api/v10/users/@me/guilds', {
                    headers: { 'Authorization': `Bot ${process.env.TOKEN}`, 'Content-Type': 'application/json' }
                });
                guilds = await guilds.json() as Runtimes[];
                await fetch(`https://top.gg/api/bots/${process.env.ID}/stats`, {
                    method: 'POST',
                    headers: { 'Authorization': process.env.TOPGG!, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        server_count: guilds.length
                    })
                });
                await fetch(`https://discordbotlist.com/api/v1/bots/${process.env.ID}/stats`, {
                    method: 'POST',
                    headers: { 'Authorization': process.env.DBL!, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        guilds: guilds.length
                    })
                });
                await fetch(`https://discordbotlist.com/api/v1/bots/${process.env.ID}/commands`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bot ${process.env.DBL}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify([RUN_CMD, LANGS_CMD, INVITE_CMD, VOTE_CMD, SIZE_CMD, CONVERT_CMD, SNIPPETS_CMD, RUN_CONTEXT_MENU])
                });
                return response.send({
                    content: await followUp(message, {
                        components: [
                            {
                                type: MessageComponentTypes.ACTION_ROW,
                                components: [
                                    {
                                        type: MessageComponentTypes.BUTTON,
                                        label: 'Vote',
                                        style: ButtonStyleTypes.LINK,
                                        url: 'https://top.gg/bot/1076200668810985634/vote'
                                    }
                                ]
                            }
                        ]
                    })
                });
            }
            case LANGS_CMD.name: {
                await deferReply(message, { ephemeral: true });
                const languages: Embeds['fields'] = [{ name: '', value: '', inline: false }];
                for (let c = 0; c < runtimes.length; c++) {
                    languages.push({ name: `Language: ${runtimes[c].language}`, value: `Version: ${runtimes[c].version}`, inline: true });
                }
                return response.send({
                    content: await followUp(message, {
                        embeds: [
                            {
                                color: 0x607387,
                                title: 'Supported Languages',
                                description: `Total languages: ${runtimes.length}`,
                                fields: languages.slice(0, 25)
                            }
                        ],
                        components: [
                            {
                                type: MessageComponentTypes.ACTION_ROW,
                                components: [
                                    {
                                        type: MessageComponentTypes.BUTTON,
                                        label: '',
                                        style: ButtonStyleTypes.PRIMARY,
                                        custom_id: 'previous1',
                                        disabled: true,
                                        emoji: { name: 'Arrow_Left', id: '1104480446076690493' }
                                    },
                                    {
                                        type: MessageComponentTypes.BUTTON,
                                        label: '',
                                        style: ButtonStyleTypes.PRIMARY,
                                        custom_id: 'next1',
                                        emoji: { name: 'Arrow_Right', id: '1104480448232570881' }
                                    }
                                ]
                            }
                        ]
                    })
                });
            }
            case RUN_CMD.name: {
                return response.send({
                    content: await showModal(message, {
                        title: 'Run Code',
                        custom_id: 'run',
                        components: [
                            {
                                type: MessageComponentTypes.ACTION_ROW,
                                components: [
                                    {
                                        type: MessageComponentTypes.INPUT_TEXT,
                                        label: 'Language',
                                        style: TextStyleTypes.SHORT,
                                        custom_id: 'language',
                                        required: true,
                                        min_length: 1,
                                        max_length: 10
                                    }
                                ]
                            },
                            {
                                type: MessageComponentTypes.ACTION_ROW,
                                components: [
                                    {
                                        type: MessageComponentTypes.INPUT_TEXT,
                                        label: 'Code',
                                        style: TextStyleTypes.PARAGRAPH,
                                        custom_id: 'code',
                                        required: true,
                                        min_length: 5
                                    }
                                ]
                            },
                            {
                                type: MessageComponentTypes.ACTION_ROW,
                                components: [
                                    {
                                        type: MessageComponentTypes.INPUT_TEXT,
                                        label: 'Input',
                                        style: TextStyleTypes.PARAGRAPH,
                                        custom_id: 'input',
                                        required: false,
                                        placeholder: '(separate with a new line)'
                                    }
                                ]
                            },
                            {
                                type: MessageComponentTypes.ACTION_ROW,
                                components: [
                                    {
                                        type: MessageComponentTypes.INPUT_TEXT,
                                        label: 'Packages (python only)',
                                        style: TextStyleTypes.PARAGRAPH,
                                        custom_id: 'packages',
                                        required: false,
                                        placeholder: '(separate with a new line)'
                                    }
                                ]
                            }
                        ]
                    })
                });
            }
            case SIZE_CMD.name: {
                await deferReply(message, { ephemeral: false });
                const pkg = get(message, 'name');
                let result: Response | PackageSize = await fetch(`https://packagephobia.com/v2/api.json?p=${pkg}`);
                if (result.status != 200) {
                    return response.send({
                        content: await followUp(message, {
                            content: 'There was an error, try again!',
                        })
                    });
                }
                result = await result.json() as PackageSize;
                return response.send({
                    content: await followUp(message, {
                        embeds: [
                            {
                                color: 0x607387,
                                title: `Info of __**${result.name}**__`,
                                fields: [
                                    {
                                        name: 'Version:',
                                        value: '```' + result.version + '```',
                                        inline: false
                                    },
                                    {
                                        name: 'Publish Size:',
                                        value: '```' + result.publish.pretty + '```',
                                        inline: false
                                    },
                                    {
                                        name: 'Install Size:',
                                        value: '```' + result.install.pretty + '```',
                                        inline: false
                                    }
                                ]
                            }
                        ],
                        components: [
                            {
                                type: MessageComponentTypes.ACTION_ROW,
                                components: [
                                    {
                                        type: MessageComponentTypes.BUTTON,
                                        label: '',
                                        style: ButtonStyleTypes.PRIMARY,
                                        custom_id: `reload - ${pkg}`,
                                        emoji: { name: 'Reload', id: '1104736112049659995' }
                                    }
                                ]
                            }
                        ]
                    })
                });
            }
            case EVAL_CMD.name: {
                return response.send({
                    content: await showModal(message, {
                        title: 'Eval Code',
                        custom_id: 'eval',
                        components: [
                            {
                                type: MessageComponentTypes.ACTION_ROW,
                                components: [
                                    {
                                        type: MessageComponentTypes.INPUT_TEXT,
                                        label: 'Code',
                                        style: TextStyleTypes.PARAGRAPH,
                                        custom_id: 'code',
                                        required: true,
                                        min_length: 5
                                    }
                                ]
                            }
                        ]
                    })
                });
            }
            case REGISTER_CMD.name: {
                await deferReply(message, { ephemeral: true });
                if ((message.member!.user.id || message.user!.id) != '604339998312890379') {
                    return response.send({
                        content: await followUp(message, {
                            content: '❌ You can\'t do this',
                        })
                    });
                }
                const globalCommands: Response = await fetch(`https://discord.com/api/v10/applications/${process.env.ID}/commands`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bot ${process.env.TOKEN}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify([RUN_CMD, LANGS_CMD, INVITE_CMD, VOTE_CMD, SIZE_CMD, CONVERT_CMD, SNIPPETS_CMD, RUN_CONTEXT_MENU])
                });
                const guildCommands: Response = await fetch(`https://discord.com/api/v10/applications/${process.env.ID}/guilds/818058268978315286/commands`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bot ${process.env.TOKEN}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify([EVAL_CMD, REGISTER_CMD, INFO_CMD])
                });
                return response.send({
                    content: await followUp(message, {
                        content: globalCommands.status == 200 && guildCommands.status == 200 ? 'Registered all commands without errors' : 'Encountered one or more errors while registering commands:\n' + (globalCommands.status != 200 && guildCommands.status != 200 ? `**GLOBAL COMMANDS** (${globalCommands.status + ': ' + globalCommands.statusText})` + '\n' + '```' + '\n' + JSON.stringify(await globalCommands.json(), null, 2) + '```' + '\n' + `**GUILD COMMANDS** (${guildCommands.status + ': ' + guildCommands.statusText})` + '\n' + '```' + '\n' + JSON.stringify(await guildCommands.json(), null, 2) + '```' + '\n': globalCommands.status != 200 ? `**GLOBAL COMMANDS** (${globalCommands.status + ': ' + globalCommands.statusText})` + '\n' + '```' + '\n' + JSON.stringify(await globalCommands.json(), null, 2) + '```' + '\n' : `**GUILD COMMANDS** (${guildCommands.status + ': ' + guildCommands.statusText})` + '\n' + '```' + '\n' + JSON.stringify(await guildCommands.json(), null, 2) + '```' + '\n')
                    })
                });
            }
            case INFO_CMD.name: {
                await deferReply(message, { ephemeral: true });
                if ((message.member!.user.id || message.user!.id) != '604339998312890379') {
                    return response.send({
                        content: await followUp(message, {
                            content: '❌ You can\'t do this',
                        })
                    });
                }
                const totalRam: number = (process.memoryUsage().heapTotal / (1024 * 1024)).toFixed(3) as unknown as number;
                const usedRam: number = (process.memoryUsage().heapUsed / (1024 * 1024)).toFixed(3) as unknown as number;
                return response.send({
                    content: await followUp(message, {
                        embeds: [
                            {
                                color: 0x607387,
                                title: 'Bot info',
                                fields: [
                                    { name: 'Total RAM:', value: '```' + totalRam + ' MB' + '```', inline: false },
                                    { name: 'Used RAM:', value: '```' + usedRam + ' MB' + '```', inline: false },
                                    { name: 'Used RAM Percentage:', value: '```' + ((usedRam * 100 / totalRam).toFixed(2)) + ' %' + '```', inline: false },
                                    { name: 'I am running on:', value: '```' + process.platform + ' – ' + version() + ' – ' + process.cwd() + '```', inline: false },
                                    { name: 'Versions', value: '```' + JSON.stringify(process.versions, null, 2) + '```', inline: false }
                                ]
                            }
                        ]
                    })
                });
            }
            case CONVERT_CMD.name: {
                await deferReply(message, { ephemeral: true });
                const originalNumber: number = get(message, 'number')! as unknown as number;
                const system: string = get(message, 'system')!;
                let number: number | string = 0;
                switch (system) {
                case 'Decimal to Binary': {
                    number = originalNumber.toString(2);
                    break;
                }
                case 'Binary to Decimal': {
                    if (originalNumber.toString().includes('2') || originalNumber.toString().includes('3') || originalNumber.toString().includes('4') || originalNumber.toString().includes('5') || originalNumber.toString().includes('6') || originalNumber.toString().includes('7') || originalNumber.toString().includes('8') || originalNumber.toString().includes('9')) {
                        return response.send({
                            content: await followUp(message, {
                                content: '❌ The binary number isn\'t valid',
                            })
                        });
                    }
                    number = parseInt(originalNumber.toString(), 2);
                    break;
                }
                }
                return response.send({
                    content: await followUp(message, {
                        content: `The number \`${originalNumber}\` converted using the \`${system}\` system is \`${number}\``,
                    })
                });
            }
            case SNIPPETS_CMD.name: {
                const user: string = get(message, 'user')! || (message.member!.user.id || message.user!.id)!;
                const id: number = get(message, 'id') as unknown as number;
                if (id <= 0) {
                    await deferReply(message, { ephemeral: true });
                    return response.send({
                        content: await followUp(message, {
                            content: 'ID not valid',
                        })
                    });
                }
                await deferReply(message, { ephemeral: false });
                await mongoose.connect(url);
                const totalSnippets = await snippets.find({ userId: user });
                const currentSnippet = await snippets.findOne({ userId: user, evaluatorId: id });
                const historyMenu: SelectMenusComponent = {
                    type: MessageComponentTypes.STRING_SELECT,
                    custom_id: `history - ${message.member!.user.id || message.user!.id} - ${id}`,
                    options: [{ label: '', value: '' }],
                    disabled: true
                };
                let latestVersion: number = 1;
                if (currentSnippet == undefined) {
                    return response.send({
                        content: await followUp(message, {
                            content: 'The user doesn\'t have a snippet with that id'
                        })
                    });
                }
                if (currentSnippet.history.length != 0) {
                    historyMenu.disabled = false;
                        historyMenu.options!.pop();
                        for (let i = 1; i <= (currentSnippet.history.length < 24 ? currentSnippet.history.length : 24); i++) {
                            historyMenu.options!.push({ label: `Version ${i}`, value: `Version ${i}` });
                            latestVersion = i + 1;
                        }
                }
                    historyMenu.options!.push({ label: `Version ${latestVersion} (latest)`, value: `Version ${latestVersion} (latest)`, default: true });
                    const snippetsembed: Embeds = {
                        color: 0x607387,
                        title: 'Snippets',
                        description: `Total snippets: ${totalSnippets.length}`,
                        fields: [{ name: `Language: ${currentSnippet!.language}`, value: '```' + currentSnippet!.language + '\n' + currentSnippet!.code.slice(0, 1024) + '\n' + '```', inline: false }],
                    };
                    return response.send({
                        content: await followUp(message, {
                            embeds: [snippetsembed],
                            components: [
                                {
                                    type: MessageComponentTypes.ACTION_ROW,
                                    components: [
                                        {
                                            type: MessageComponentTypes.BUTTON,
                                            label: '',
                                            style: ButtonStyleTypes.PRIMARY,
                                            custom_id: `run_code - ${user} - ${id}`,
                                            emoji: { name: 'Play', id: '1124682991692677120' }
                                        }
                                    ]
                                },
                                {
                                    type: MessageComponentTypes.ACTION_ROW,
                                    components: [historyMenu]
                                }
                            ]
                        })
                    });
            }
            case RUN_CONTEXT_MENU.name: {
                let code: string = message.data!.resolved!.messages![message.data!.target_id!].content;
                let isCodeblock: boolean = false;
                if (code.startsWith('```') && code.endsWith('```'))
                    code = code.replace(/```/g, '');
                isCodeblock = true;
                code = code.replace(/\n/, '');
                code = code.replace(/\n$/, '');
                await deferReply(message, { ephemeral: false });
                const res: DetectedLanguage = flourite(code);
                let language: string = res.language.toLowerCase();
                let version: number = 0;
                let index: number = 0;
                for (let i = 0; i < runtimes.length; i++) {
                    if (code.startsWith(runtimes[i].language) && !isCodeblock != false) {
                        language = runtimes[i].language;
                        index = i;
                    }
                    else {
                        for (let c = 0; c < runtimes[i].aliases.length; c++) {
                            if (code.startsWith(runtimes[i].aliases[c]) && !isCodeblock != false) {
                                language = runtimes[i].language;
                                index = i;
                            }
                        }
                    }
                }
                for (let i = 0; i < runtimes.length; i++) {
                    if (runtimes[i].aliases.length != 0) {
                        for (let c = 0; c < runtimes[i].aliases.length; c++) {
                            if (language == runtimes[i].language || language == runtimes[i].aliases[c]) {
                                code = code.replace(runtimes[i].aliases[c], '');
                                language = runtimes[i].language;
                                version = runtimes[i].version;
                                index = i;
                            }
                        }
                    }
                    else {
                        if (language == runtimes[i].language) {
                            code = code.replace(runtimes[i].language, '');
                            language = runtimes[i].language;
                            version = runtimes[i].version;
                            index = i;
                        }
                    }
                }
                if (version == 0) {
                    return response.send({
                        content: await followUp(message, {
                            content: 'Unknown Language!, try with a codeblock by specifing code language'
                        })
                    });
                }
                if (runtimes[index].language == 'go') {
                    if (code.includes('func main() {')) code = code;
                    else {
                        code = 'package main' + '\n' + 'import "fmt"' + '\n' + 'func main() {' + '\n' + '  ' + code.replace(/\n/g, '\n  ') + '\n' + '}';
                    }
                }
                else if (runtimes[index].language == 'rust') {
                    if (code.includes('fn main() {')) code = code;
                    else {
                        code = 'use std::io;' + '\n' + 'fn main() {' + '\n' + '  ' + code.replace(/\n/g, '\n  ') + '\n' + '}';
                    }
                }
                else if (runtimes[index].language == 'c') {
                    if (code.includes('int main() {')) code = code;
                    else {
                        code = '#include <stdio.h>' + '\n' + 'int main() {' + '\n' + '  ' + code.replace(/\n/g, '\n  ') + '\n' + '}';
                    }
                }
                else if (runtimes[index].language == 'c++') {
                    if (code.includes('int main() {')) code = code;
                    else {
                        code = '#include <iostream>' + '\n' + 'using namespace std;' + '\n' + 'int main() {' + '\n' + '  ' + code.replace(/\n/g, '\n  ') + '\n' + '}';
                    }
                }
                else if (runtimes[index].language == 'csharp') {
                    if (code.includes('static void Main(string[] args) {')) code = code;
                    else {
                        code = 'using System;' + '\n' + 'class Program {' + '\n' + '  static void Main(string[] args) {' + '\n' + '    ' + code.replace(/\n/g, '\n    ') + '\n' + '  }' + '\n' + '}';
                    }
                }
                else if (runtimes[index].language == 'java') {
                    if (code.includes('public static void Main(string[] args) {')) code = code;
                    else {
                        code = 'public class Main {' + '\n' + '  public static void main(String[] args) {' + '\n' + '    ' + code.replace(/\n/g, '\n    ') + '\n' + '  }' + '\n' + '}';
                    }
                }
                else if (runtimes[index].language == 'kotlin') {
                    if (code.includes('fun main() {')) code = code;
                    else {
                        code = 'fun main() {' + '\n' + '  ' + code.replace(/\n/g, '\n  ') + '\n' + '}';
                    }
                }
                const start: number = Date.now();
                let result: Response | Result = await fetch('https://emkc.org/api/v2/piston/execute', {
                    method: 'POST',
                    body: JSON.stringify({
                        'language': language,
                        'version': '*',
                        'files': [{
                            'content': code
                        }]
                    })
                });
                result = await result.json() as Result;
                const end: number = Date.now();
                let runembed: Embeds = {
                    color: 0x607387,
                    title: 'Evaluation Result',
                    fields: [
                        { name: 'Language', value: '```' + '\n' + runtimes[index].language + '\n' + '```', inline: false },
                        { name: 'Version', value: '```' + '\n' + version + '\n' + '```', inline: false },
                        { name: 'Input', value: '```' + runtimes[index].language + '\n' + code.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```', inline: false },
                        { name: 'Output', value: '```' + runtimes[index].language + '\n' + result.run.output.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```', inline: false },
                        { name: 'Output code', value: '```' + '\n' + result.run.code + '\n' + '```', inline: false }
                    ],
                    footer: {
                        text: `The code took ${Math.floor(end - start).toFixed(0)}ms to be executed`
                    }
                };
                if (code.length > 925) {
                    runembed = {
                        color: 0x607387,
                        title: 'Evaluation Result',
                        fields: [
                            { name: 'Language', value: '```' + '\n' + runtimes[index].language + '\n' + '```', inline: false },
                            { name: 'Version', value: '```' + '\n' + version + '\n' + '```', inline: false },
                            { name: 'Input', value: '```' + runtimes[index].language + '\n' + code.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```' + '**__TOO LONG__**', inline: false },
                            { name: 'Output', value: '```' + runtimes[index].language + '\n' + result.run.output.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```', inline: false },
                            { name: 'Output code', value: '```' + '\n' + result.run.code + '\n' + '```', inline: false }
                        ],
                        footer: {
                            text: `The code took ${Math.floor(end - start).toFixed(0)}ms to be executed`
                        }
                    };
                }
                if (result.run.output.length > 925) {
                    let url: Response | string = await fetch('https://dpaste.com/api/v2/', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'EvalBot' },
                        body: `title=Evaluation%20Result&content=${result.run.output}&expiry_days=365`
                    });
                    url = await url.text() as string;
                    runembed = {
                        color: 0x607387,
                        title: 'Evaluation Result',
                        fields: [
                            { name: 'Language', value: '```' + '\n' + runtimes[index].language + '\n' + '```', inline: false },
                            { name: 'Version', value: '```' + '\n' + version + '\n' + '```', inline: false },
                            { name: 'Input', value: '```' + runtimes[index].language + '\n' + code.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```', inline: false },
                            { name: 'Output', value: '```' + runtimes[index].language + '\n' + result.run.output.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```' + '**__TOO LONG__**' + '\n' + `view the entire output [here](${url})`, inline: false },
                            { name: 'Output code', value: '```' + '\n' + result.run.code + '\n' + '```', inline: false }
                        ],
                        footer: {
                            text: `The code took ${Math.floor(end - start).toFixed(0)}ms to be executed`
                        }
                    };
                }
                if (code.length > 925 && result.run.output.length > 925) {
                    let url: Response | string = await fetch('https://dpaste.com/api/v2/', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'EvalBot' },
                        body: `title=Evaluation%20Result&content=${result.run.output}&expiry_days=365`
                    });
                    url = await url.text() as string;
                    runembed = {
                        color: 0x607387,
                        title: 'Evaluation Result',
                        fields: [
                            { name: 'Language', value: '```' + '\n' + runtimes[index].language + '\n' + '```', inline: false },
                            { name: 'Version', value: '```' + '\n' + version + '\n' + '```', inline: false },
                            { name: 'Input', value: '```' + runtimes[index].language + '\n' + code.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```' + '**__TOO LONG__**', inline: false },
                            { name: 'Output', value: '```' + runtimes[index].language + '\n' + result.run.output.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```' + '**__TOO LONG__**' + '\n' + `view the entire output [here](${url})`, inline: false },
                            { name: 'Output code', value: '```' + '\n' + result.run.code + '\n' + '```', inline: false }
                        ],
                        footer: {
                            text: `The code took ${Math.floor(end - start).toFixed(0)}ms to be executed`
                        }
                    };
                }
                if (result.run.output.length == 0 || result.run.output == '\n') {
                    runembed = {
                        color: 0x607387,
                        title: 'Evaluation Result',
                        fields: [
                            { name: 'Language', value: '```' + '\n' + runtimes[index].language + '\n' + '```', inline: false },
                            { name: 'Version', value: '```' + '\n' + version + '\n' + '```', inline: false },
                            { name: 'Input', value: '```' + runtimes[index].language + '\n' + code.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```', inline: false },
                            { name: 'Output', value: 'No output!', inline: false },
                        ],
                        footer: {
                            text: `The code took ${Math.floor(end - start).toFixed(0)}ms to be executed`
                        }
                    };
                }
                if ((result.run.output.length == 0 || result.run.output == '\n') && code.length > 925) {
                    runembed = {
                        color: 0x607387,
                        title: 'Evaluation Result',
                        fields: [
                            { name: 'Language', value: '```' + '\n' + language + '\n' + '```', inline: false },
                            { name: 'Version', value: '```' + '\n' + version + '\n' + '```', inline: false },
                            { name: 'Input', value: '```' + language + '\n' + code.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```' + '**__TOO LONG__**', inline: false },
                            { name: 'Output', value: 'No output!', inline: false },
                        ],
                        footer: {
                            text: `The code took ${Math.floor(end - start).toFixed(0)}ms to be executed`
                        }
                    };
                }
                await mongoose.connect(url);
                const currentEvaluatorId = await snippets.find();
                let currentId: number = 0;
                for (let i = 1; i <= currentEvaluatorId.length; i++) {
                    currentId = i;
                }
                runembed.title = `Evaluation Result - [ID: ${currentId + 1}]`;
                await snippets.create({ userId: message.member!.user.id || message.user!.id, language: runtimes[index].language, code: code, evaluatorId: currentId + 1 });
                return response.send({
                    content: await followUp(message, {
                        embeds: [runembed],
                        components: [
                            {
                                type: MessageComponentTypes.ACTION_ROW,
                                components: [
                                    {
                                        type: MessageComponentTypes.BUTTON,
                                        label: '',
                                        style: ButtonStyleTypes.PRIMARY,
                                        custom_id: `edit - ${message.member!.user.id || message.user!.id} - ${currentId + 1}`,
                                        emoji: { name: 'Edit', id: '1104464874744074370' }
                                    },
                                    {
                                        type: MessageComponentTypes.BUTTON,
                                        label: '',
                                        style: ButtonStyleTypes.SECONDARY,
                                        custom_id: `undo - ${message.member!.user.id || message.user!.id}`,
                                        emoji: { name: 'Undo', id: '1125394556804931696' },
                                        disabled: true
                                    },
                                    {
                                        type: MessageComponentTypes.BUTTON,
                                        label: '',
                                        style: ButtonStyleTypes.DANGER,
                                        custom_id: `delete - ${message.member!.user.id || message.user!.id}`,
                                        emoji: { name: 'Delete', id: '1104477832308068352' }
                                    }
                                ]
                            }
                        ]
                    })
                });
            }
            }
        }
        else if (message.type === InteractionType.MESSAGE_COMPONENT) {
            switch (message.data!.custom_id!) {
            case 'next1': {
                await updateDefer(message);
                const languages: Embeds['fields'] = [{ name: '', value: '', inline: false }];
                for (let c = 0; c < runtimes.length; c++) {
                    languages.push({ name: `Language: ${runtimes[c].language}`, value: `Version: ${runtimes[c].version}`, inline: true });
                }
                return response.send({
                    content: await editFollowup(message, {
                        embeds: [
                            {
                                color: 0x607387,
                                title: 'Supported Languages',
                                description: `Total languages: ${runtimes.length}`,
                                fields: languages.slice(25, 50)
                            }
                        ],
                        components: [
                            {
                                type: MessageComponentTypes.ACTION_ROW,
                                components: [
                                    {
                                        type: MessageComponentTypes.BUTTON,
                                        label: '',
                                        style: ButtonStyleTypes.PRIMARY,
                                        custom_id: 'previous2',
                                        emoji: { name: 'Arrow_Left', id: '1104480446076690493' }
                                    },
                                    {
                                        type: MessageComponentTypes.BUTTON,
                                        label: '',
                                        style: ButtonStyleTypes.PRIMARY,
                                        custom_id: 'next2',
                                        emoji: { name: 'Arrow_Right', id: '1104480448232570881' }
                                    }
                                ]
                            }
                        ]
                    })
                });
            }
            case 'next2': {
                await updateDefer(message);
                const languages: Embeds['fields'] = [{ name: '', value: '', inline: false }];
                for (let c = 0; c < runtimes.length; c++) {
                    languages.push({ name: `Language: ${runtimes[c].language}`, value: `Version: ${runtimes[c].version}`, inline: true });
                }
                return response.send({
                    content: await editFollowup(message, {
                        embeds: [
                            {
                                color: 0x607387,
                                title: 'Supported Languages',
                                description: `Total languages: ${runtimes.length}`,
                                fields: languages.slice(50, 75)
                            }
                        ],
                        components: [
                            {
                                type: MessageComponentTypes.ACTION_ROW,
                                components: [
                                    {
                                        type: MessageComponentTypes.BUTTON,
                                        label: '',
                                        style: ButtonStyleTypes.PRIMARY,
                                        custom_id: 'previous3',
                                        emoji: { name: 'Arrow_Left', id: '1104480446076690493' }
                                    },
                                    {
                                        type: MessageComponentTypes.BUTTON,
                                        label: '',
                                        style: ButtonStyleTypes.PRIMARY,
                                        custom_id: 'next3',
                                        emoji: { name: 'Arrow_Right', id: '1104480448232570881' }
                                    }
                                ]
                            }
                        ]
                    })
                });
            }
            case 'next3': {
                await updateDefer(message);
                const languages: Embeds['fields'] = [{ name: '', value: '', inline: false }];
                for (let c = 0; c < runtimes.length; c++) {
                    languages.push({ name: `Language: ${runtimes[c].language}`, value: `Version: ${runtimes[c].version}`, inline: true });
                }
                return response.send({
                    content: await editFollowup(message, {
                        embeds: [
                            {
                                color: 0x607387,
                                title: 'Supported Languages',
                                description: `Total languages: ${runtimes.length}`,
                                fields: languages.slice(75)
                            }
                        ],
                        components: [
                            {
                                type: MessageComponentTypes.ACTION_ROW,
                                components: [
                                    {
                                        type: MessageComponentTypes.BUTTON,
                                        label: '',
                                        style: ButtonStyleTypes.PRIMARY,
                                        custom_id: 'previous4',
                                        emoji: { name: 'Arrow_Left', id: '1104480446076690493' }
                                    },
                                    {
                                        type: MessageComponentTypes.BUTTON,
                                        label: '',
                                        style: ButtonStyleTypes.PRIMARY,
                                        custom_id: 'next4',
                                        disabled: true,
                                        emoji: { name: 'Arrow_Right', id: '1104480448232570881' }
                                    }
                                ]
                            }
                        ]
                    })
                });
            }
            case 'previous2': {
                await updateDefer(message);
                const languages: Embeds['fields'] = [{ name: '', value: '', inline: false }];
                for (let c = 0; c < runtimes.length; c++) {
                    languages.push({ name: `Language: ${runtimes[c].language}`, value: `Version: ${runtimes[c].version}`, inline: true });
                }
                return response.send({
                    content: await editFollowup(message, {
                        embeds: [
                            {
                                color: 0x607387,
                                title: 'Supported Languages',
                                description: `Total languages: ${runtimes.length}`,
                                fields: languages.slice(0, 25)
                            }
                        ],
                        components: [
                            {
                                type: MessageComponentTypes.ACTION_ROW,
                                components: [
                                    {
                                        type: MessageComponentTypes.BUTTON,
                                        label: '',
                                        style: ButtonStyleTypes.PRIMARY,
                                        custom_id: 'previous1',
                                        disabled: true,
                                        emoji: { name: 'Arrow_Left', id: '1104480446076690493' }
                                    },
                                    {
                                        type: MessageComponentTypes.BUTTON,
                                        label: '',
                                        style: ButtonStyleTypes.PRIMARY,
                                        custom_id: 'next1',
                                        emoji: { name: 'Arrow_Right', id: '1104480448232570881' }
                                    }
                                ]
                            }
                        ]
                    })
                });
            }
            case 'previous3': {
                await updateDefer(message);
                const languages: Embeds['fields'] = [{ name: '', value: '', inline: false }];
                for (let c = 0; c < runtimes.length; c++) {
                    languages.push({ name: `Language: ${runtimes[c].language}`, value: `Version: ${runtimes[c].version}`, inline: true });
                }
                return response.send({
                    content: await editFollowup(message, {
                        embeds: [
                            {
                                color: 0x607387,
                                title: 'Supported Languages',
                                description: `Total languages: ${runtimes.length}`,
                                fields: languages.slice(25, 50)
                            }
                        ],
                        components: [
                            {
                                type: MessageComponentTypes.ACTION_ROW,
                                components: [
                                    {
                                        type: MessageComponentTypes.BUTTON,
                                        label: '',
                                        style: ButtonStyleTypes.PRIMARY,
                                        custom_id: 'previous2',
                                        emoji: { name: 'Arrow_Left', id: '1104480446076690493' }
                                    },
                                    {
                                        type: MessageComponentTypes.BUTTON,
                                        label: '',
                                        style: ButtonStyleTypes.PRIMARY,
                                        custom_id: 'next2',
                                        emoji: { name: 'Arrow_Right', id: '1104480448232570881' }
                                    }
                                ]
                            }
                        ]
                    })
                });
            }
            case 'previous4': {
                await updateDefer(message);
                const languages: Embeds['fields'] = [{ name: '', value: '', inline: false }];
                for (let c = 0; c < runtimes.length; c++) {
                    languages.push({ name: `Language: ${runtimes[c].language}`, value: `Version: ${runtimes[c].version}`, inline: true });
                }
                return response.send({
                    content: await editFollowup(message, {
                        embeds: [
                            {
                                color: 0x607387,
                                title: 'Supported Languages',
                                description: `Total languages: ${runtimes.length}`,
                                fields: languages.slice(50, 75)
                            }
                        ],
                        components: [
                            {
                                type: MessageComponentTypes.ACTION_ROW,
                                components: [
                                    {
                                        type: MessageComponentTypes.BUTTON,
                                        label: '',
                                        style: ButtonStyleTypes.PRIMARY,
                                        custom_id: 'previous3',
                                        emoji: { name: 'Arrow_Left', id: '1104480446076690493' }
                                    },
                                    {
                                        type: MessageComponentTypes.BUTTON,
                                        label: '',
                                        style: ButtonStyleTypes.PRIMARY,
                                        custom_id: 'next3',
                                        emoji: { name: 'Arrow_Right', id: '1104480448232570881' }
                                    }
                                ]
                            }
                        ]
                    })
                });
            }
            case 'camera': {
                await updateDefer(message);
                await mongoose.connect(url);
                const cameraSnippet = await snippets.findOne({ evaluatorId: parseInt(message.message.embeds[0].title!.split(' - ')[1].slice(5)) });
                const image: Response = await fetch('https://code2img.vercel.app/api/to-image?theme=material-dark&language=typescript&background-color=rgb(96, 115, 135)', {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: cameraSnippet!.code
                });
                const imageBuffer: ArrayBuffer = await image.arrayBuffer();
                const buffer: Blob = new Blob([imageBuffer], { type: 'image/png' });
                const formData: FormData = new FormData();
                formData.append('file', buffer, 'codesnippet.png');
                return response.send({
                    content: await fetch(`https://discord.com/api/v10/channels/${message.channel_id}/messages`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bot ${process.env.TOKEN}` },
                        body: formData
                    })
                });
            }
            }
            if (message.data!.custom_id!.startsWith('reload')) {
                await updateDefer(message);
                let result: Response | PackageSize = await fetch(`https://packagephobia.com/v2/api.json?p=${message.data!.custom_id!.split(' - ')[1]}`);
                if (result.status != 200) {
                    return response.send({
                        content: await followUp(message, {
                            content: 'There was an error, try again!',
                        })
                    });
                }
                result = await result.json() as PackageSize;
                return response.send({
                    content: await editFollowup(message, {
                        embeds: [
                            {
                                color: 0x607387,
                                title: `Info of __**${result.name}**__`,
                                fields: [
                                    {
                                        name: 'Version:',
                                        value: '```' + result.version + '```',
                                        inline: false
                                    },
                                    {
                                        name: 'Publish Size:',
                                        value: '```' + result.publish.pretty + '```',
                                        inline: false
                                    },
                                    {
                                        name: 'Install Size:',
                                        value: '```' + result.install.pretty + '```',
                                        inline: false
                                    }
                                ]
                            }
                        ],
                        components: [
                            {
                                type: MessageComponentTypes.ACTION_ROW,
                                components: [
                                    {
                                        type: MessageComponentTypes.BUTTON,
                                        label: '',
                                        style: ButtonStyleTypes.PRIMARY,
                                        custom_id: `reload - ${message.data!.custom_id!.split(' - ')[1]}`,
                                        emoji: { name: 'Reload', id: '1104736112049659995' }
                                    }
                                ]
                            }
                        ]
                    })
                });
            }
            else if (message.data!.custom_id!.startsWith('edit')) {
                if ((message.member!.user.id || message.user!.id) != message.data!.custom_id!.split(' - ')[1]) {
                    await deferReply(message, { ephemeral: true });
                    return response.send({
                        content: await followUp(message, {
                            content: '❌ You can\'t do this',
                        })
                    });
                }
                if (message.message.embeds[0].title!.split(' - ')[1] == undefined) {
                    return response.send({
                        content: await followUp(message, {
                            content: 'Unknown Evaluation',
                        })
                    });
                }
                await mongoose.connect(url);
                const originalSnippet = await snippets.findOne({ userId: message.member!.user.id || message.user!.id, evaluatorId: parseInt(message.message.embeds[0].title!.split(' - ')[1].slice(5)) });
                return response.send({
                    content: await showModal(message, {
                        title: 'Run Code',
                        custom_id: 'runedit',
                        components: [
                            {
                                type: MessageComponentTypes.ACTION_ROW,
                                components: [
                                    {
                                        type: MessageComponentTypes.INPUT_TEXT,
                                        label: 'Language',
                                        style: TextStyleTypes.SHORT,
                                        custom_id: 'language',
                                        required: true,
                                        min_length: 1,
                                        max_length: 10,
                                        value: '' || originalSnippet!.language
                                    }
                                ]
                            },
                            {
                                type: MessageComponentTypes.ACTION_ROW,
                                components: [
                                    {
                                        type: MessageComponentTypes.INPUT_TEXT,
                                        label: 'Code',
                                        style: TextStyleTypes.PARAGRAPH,
                                        custom_id: 'code',
                                        required: true,
                                        min_length: 5,
                                        value: '' || originalSnippet!.code
                                    }
                                ]
                            },
                            {
                                type: MessageComponentTypes.ACTION_ROW,
                                components: [
                                    {
                                        type: MessageComponentTypes.INPUT_TEXT,
                                        label: 'Input',
                                        style: TextStyleTypes.PARAGRAPH,
                                        custom_id: 'input',
                                        required: false,
                                        placeholder: '(separate with a new line)'
                                    }
                                ]
                            },
                            {
                                type: MessageComponentTypes.ACTION_ROW,
                                components: [
                                    {
                                        type: MessageComponentTypes.INPUT_TEXT,
                                        label: 'Packages (python only)',
                                        style: TextStyleTypes.PARAGRAPH,
                                        custom_id: 'packages',
                                        required: false,
                                        placeholder: '(separate with a new line)'
                                    }
                                ]
                            }
                        ]
                    })
                });
            }
            else if (message.data!.custom_id!.startsWith('delete')) {
                await deferReply(message, { ephemeral: true });
                if ((message.member!.user.id || message.user!.id) != message.data!.custom_id!.split(' - ')[1]) {
                    return response.send({
                        content: await followUp(message, {
                            content: '❌ You can\'t do this',
                        })
                    });
                }
                if (message.message.embeds[0].title!.split(' - ')[1] == undefined) {
                    return response.send({
                        content: await followUp(message, {
                            content: 'Unknown Evaluation',
                        })
                    });
                }
                return response.send({
                    content: await followUp(message, {
                        content: 'You are about to delete this evaluation from the chat. Do you want to delete it also from the database?',
                        components: [
                            {
                                type: MessageComponentTypes.ACTION_ROW,
                                components: [
                                    {
                                        type: MessageComponentTypes.BUTTON,
                                        label: 'Yes',
                                        style: ButtonStyleTypes.SUCCESS,
                                        custom_id: `yes - ${message.message.id} - ${message.message.embeds[0].title!.split(' - ')[1].slice(5)}`
                                    },
                                    {
                                        type: MessageComponentTypes.BUTTON,
                                        label: 'No',
                                        style: ButtonStyleTypes.DANGER,
                                        custom_id: `no - ${message.message.id}`
                                    },
                                ]
                            }
                        ]
                    })
                });
            }
            else if (message.data!.custom_id!.startsWith('run_code')) {
                await deferReply(message, { ephemeral: true });
                await mongoose.connect(url);
                const currentSnippet = await snippets.findOne({ userId: message.data!.custom_id!.split(' - ')[1], evaluatorId: message.data!.custom_id!.split(' - ')[2] });
                let language: string = '';
                let code: string = '';
                if (currentSnippet == undefined) {
                    return response.send({
                        content: await followUp(message, {
                            content: 'Snippet not found'
                        })
                    });
                }
                if (message.data!.custom_id!.split(' - ')[3] == undefined || currentSnippet!.history[parseInt(message.data!.custom_id!.split(' - ')[3])] == undefined) {
                    language = currentSnippet!.language;
                    code = currentSnippet!.code;
                }
                else {
                    language = currentSnippet!.history[parseInt(message.data!.custom_id!.split(' - ')[3])].language;
                    code = currentSnippet!.history[parseInt(message.data!.custom_id!.split(' - ')[3])].code;
                }
                let version: number = 0;
                let index: number = 0;
                for (let i = 0; i < runtimes.length; i++) {
                    if (runtimes[i].aliases.length != 0) {
                        for (let c = 0; c < runtimes[i].aliases.length; c++) {
                            if (language == runtimes[i].language || language == runtimes[i].aliases[c]) {
                                version = runtimes[i].version;
                                index = i;
                            }
                        }
                    }
                    else {
                        if (language == runtimes[i].language) {
                            version = runtimes[i].version;
                            index = i;
                        }
                    }
                }
                if (version == 0) {
                    return response.send({
                        content: await followUp(message, {
                            content: 'Unknown Language!'
                        })
                    });
                }
                if (runtimes[index].language == 'go') {
                    if (code.includes('func main() {')) code = code;
                    else {
                        code = 'package main' + '\n' + 'import "fmt"' + '\n' + 'func main() {' + '\n' + '  ' + code.replace(/\n/g, '\n  ') + '\n' + '}';
                    }
                }
                else if (runtimes[index].language == 'rust') {
                    if (code.includes('fn main() {')) code = code;
                    else {
                        code = 'use std::io;' + '\n' + 'fn main() {' + '\n' + '  ' + code.replace(/\n/g, '\n  ') + '\n' + '}';
                    }
                }
                else if (runtimes[index].language == 'c') {
                    if (code.includes('int main() {')) code = code;
                    else {
                        code = '#include <stdio.h>' + '\n' + 'int main() {' + '\n' + '  ' + code.replace(/\n/g, '\n  ') + '\n' + '}';
                    }
                }
                else if (runtimes[index].language == 'c++') {
                    if (code.includes('int main() {')) code = code;
                    else {
                        code = '#include <iostream>' + '\n' + 'using namespace std;' + '\n' + 'int main() {' + '\n' + '  ' + code.replace(/\n/g, '\n  ') + '\n' + '}';
                    }
                }
                else if (runtimes[index].language == 'csharp') {
                    if (code.includes('static void Main(string[] args) {')) code = code;
                    else {
                        code = 'using System;' + '\n' + 'class Program {' + '\n' + '  static void Main(string[] args) {' + '\n' + '    ' + code.replace(/\n/g, '\n    ') + '\n' + '  }' + '\n' + '}';
                    }
                }
                else if (runtimes[index].language == 'java') {
                    if (code.includes('public static void Main(string[] args) {')) code = code;
                    else {
                        code = 'public class Main {' + '\n' + '  public static void main(String[] args) {' + '\n' + '    ' + code.replace(/\n/g, '\n    ') + '\n' + '  }' + '\n' + '}';
                    }
                }
                else if (runtimes[index].language == 'kotlin') {
                    if (code.includes('fun main() {')) code = code;
                    else {
                        code = 'fun main() {' + '\n' + '  ' + code.replace(/\n/g, '\n  ') + '\n' + '}';
                    }
                }
                const start: number = Date.now();
                let result: Response | Result = await fetch('https://emkc.org/api/v2/piston/execute', {
                    method: 'POST',
                    body: JSON.stringify({
                        'language': language,
                        'version': '*',
                        'files': [{
                            'content': code
                        }]
                    })
                });
                result = await result.json() as Result;
                const end: number = Date.now();
                let runembed: Embeds = {
                    color: 0x607387,
                    title: 'Evaluation Result',
                    fields: [
                        { name: 'Language', value: '```' + '\n' + runtimes[index].language + '\n' + '```', inline: false },
                        { name: 'Version', value: '```' + '\n' + version + '\n' + '```', inline: false },
                        { name: 'Input', value: '```' + runtimes[index].language + '\n' + code.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```', inline: false },
                        { name: 'Output', value: '```' + runtimes[index].language + '\n' + result.run.output.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```', inline: false },
                        { name: 'Output code', value: '```' + '\n' + result.run.code + '\n' + '```', inline: false }
                    ],
                    footer: {
                        text: `The code took ${Math.floor(end - start).toFixed(0)}ms to be executed`
                    }
                };
                if (code.length > 925) {
                    runembed = {
                        color: 0x607387,
                        title: 'Evaluation Result',
                        fields: [
                            { name: 'Language', value: '```' + '\n' + runtimes[index].language + '\n' + '```', inline: false },
                            { name: 'Version', value: '```' + '\n' + version + '\n' + '```', inline: false },
                            { name: 'Input', value: '```' + runtimes[index].language + '\n' + code.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```' + '**__TOO LONG__**', inline: false },
                            { name: 'Output', value: '```' + runtimes[index].language + '\n' + result.run.output.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```', inline: false },
                            { name: 'Output code', value: '```' + '\n' + result.run.code + '\n' + '```', inline: false }
                        ],
                        footer: {
                            text: `The code took ${Math.floor(end - start).toFixed(0)}ms to be executed`
                        }
                    };
                }
                if (result.run.output.length > 925) {
                    let url: Response | string = await fetch('https://dpaste.com/api/v2/', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'EvalBot' },
                        body: `title=Evaluation%20Result&content=${result.run.output}&expiry_days=365`
                    });
                    url = await url.text() as string;
                    runembed = {
                        color: 0x607387,
                        title: 'Evaluation Result',
                        fields: [
                            { name: 'Language', value: '```' + '\n' + runtimes[index].language + '\n' + '```', inline: false },
                            { name: 'Version', value: '```' + '\n' + version + '\n' + '```', inline: false },
                            { name: 'Input', value: '```' + runtimes[index].language + '\n' + code.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```', inline: false },
                            { name: 'Output', value: '```' + runtimes[index].language + '\n' + result.run.output.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```' + '**__TOO LONG__**' + '\n' + `view the entire output [here](${url})`, inline: false },
                            { name: 'Output code', value: '```' + '\n' + result.run.code + '\n' + '```', inline: false }
                        ],
                        footer: {
                            text: `The code took ${Math.floor(end - start).toFixed(0)}ms to be executed`
                        }
                    };
                }
                if (code.length > 925 && result.run.output.length > 925) {
                    let url: Response | string = await fetch('https://dpaste.com/api/v2/', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'EvalBot' },
                        body: `title=Evaluation%20Result&content=${result.run.output}&expiry_days=365`
                    });
                    url = await url.text() as string;
                    runembed = {
                        color: 0x607387,
                        title: 'Evaluation Result',
                        fields: [
                            { name: 'Language', value: '```' + '\n' + runtimes[index].language + '\n' + '```', inline: false },
                            { name: 'Version', value: '```' + '\n' + version + '\n' + '```', inline: false },
                            { name: 'Input', value: '```' + runtimes[index].language + '\n' + code.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```' + '**__TOO LONG__**', inline: false },
                            { name: 'Output', value: '```' + runtimes[index].language + '\n' + result.run.output.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```' + '**__TOO LONG__**' + '\n' + `view the entire output [here](${url})`, inline: false },
                            { name: 'Output code', value: '```' + '\n' + result.run.code + '\n' + '```', inline: false }
                        ],
                        footer: {
                            text: `The code took ${Math.floor(end - start).toFixed(0)}ms to be executed`
                        }
                    };
                }
                if (result.run.output.length == 0 || result.run.output == '\n') {
                    runembed = {
                        color: 0x607387,
                        title: 'Evaluation Result',
                        fields: [
                            { name: 'Language', value: '```' + '\n' + runtimes[index].language + '\n' + '```', inline: false },
                            { name: 'Version', value: '```' + '\n' + version + '\n' + '```', inline: false },
                            { name: 'Input', value: '```' + runtimes[index].language + '\n' + code.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```', inline: false },
                            { name: 'Output', value: 'No output!', inline: false },
                        ],
                        footer: {
                            text: `The code took ${Math.floor(end - start).toFixed(0)}ms to be executed`
                        }
                    };
                }
                if ((result.run.output.length == 0 || result.run.output == '\n') && code.length > 925) {
                    runembed = {
                        color: 0x607387,
                        title: 'Evaluation Result',
                        fields: [
                            { name: 'Language', value: '```' + '\n' + language + '\n' + '```', inline: false },
                            { name: 'Version', value: '```' + '\n' + version + '\n' + '```', inline: false },
                            { name: 'Input', value: '```' + language + '\n' + code.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```' + '**__TOO LONG__**', inline: false },
                            { name: 'Output', value: 'No output!', inline: false },
                        ],
                        footer: {
                            text: `The code took ${Math.floor(end - start).toFixed(0)}ms to be executed`
                        }
                    };
                }
                return response.send({
                    content: await followUp(message, {
                        embeds: [runembed]
                    })
                });
            }
            else if (message.data!.custom_id!.startsWith('yes') || message.data!.custom_id!.startsWith('no')) {
                await updateDefer(message);
                const messageId = message.data!.custom_id!.split(' - ')[1];
                if (message.data!.custom_id!.startsWith('yes')) {
                    const evaluatorId = message.data!.custom_id!.split(' - ')[2];
                    await mongoose.connect(url);
                    await snippets.deleteOne({ userId: message.member!.user.id || message.user!.id, evaluatorId: parseInt(evaluatorId) });
                    await fetch(`https://discord.com/api/v10/channels/${message.channel_id}/messages/${messageId}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bot ${process.env.TOKEN}`, 'Content-Type': 'application/json' }
                    });
                }
                else {
                    await fetch(`https://discord.com/api/v10/channels/${message.channel_id}/messages/${messageId}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bot ${process.env.TOKEN}`, 'Content-Type': 'application/json' }
                    });
                }
                return response.send({
                    content: await editFollowup(message, {
                        content: 'Done',
                        components: []
                    })
                });
            }
            else if (message.data!.custom_id!.startsWith('undo')) {
                if ((message.member!.user.id || message.user!.id) != message.data!.custom_id!.split(' - ')[1]) {
                    await deferReply(message, { ephemeral: true });
                    return response.send({
                        content: await followUp(message, {
                            content: '❌ You can\'t do this',
                        })
                    });
                }
                await updateDefer(message);
                const undoComponent: ButtonsComponent = {
                    type: MessageComponentTypes.BUTTON,
                    label: '',
                    style: ButtonStyleTypes.SECONDARY,
                    custom_id: `undo - ${message.member!.user.id || message.user!.id}`,
                    emoji: { name: 'Undo', id: '1125394556804931696' }
                };
                await mongoose.connect(url);
                const oldSnippet = await snippets.findOne({ userId: message.member!.user.id || message.user!.id, evaluatorId: parseInt(message.message.embeds[0].title!.split(' - ')[1].slice(5)) });
                if (oldSnippet!.history.length == 1) {
                    undoComponent.disabled = true;
                }
                let version: number = 0;
                for (let i = 0; i < runtimes.length; i++) {
                    if (runtimes[i].aliases.length != 0) {
                        for (let c = 0; c < runtimes[i].aliases.length; c++) {
                            if (oldSnippet!.history[oldSnippet!.history.length - 1].language == runtimes[i].language || oldSnippet!.history[oldSnippet!.history.length - 1].language == runtimes[i].aliases[c]) {
                                version = runtimes[i].version;
                            }
                        }
                    }
                    else {
                        if (oldSnippet!.history[oldSnippet!.history.length - 1].language == runtimes[i].language) {
                            version = runtimes[i].version;
                        }
                    }
                }
                const currentId = oldSnippet!.evaluatorId!;
                const start: number = Date.now();
                let result: Response | Result = await fetch('https://emkc.org/api/v2/piston/execute', {
                    method: 'POST',
                    body: JSON.stringify({
                        'language': oldSnippet!.history[oldSnippet!.history.length - 1].language,
                        'version': '*',
                        'files': [{
                            'content': oldSnippet!.history[oldSnippet!.history.length - 1].code
                        }]
                    })
                });
                result = await result.json() as Result;
                const end: number = Date.now();
                let runembed: Embeds = {
                    color: 0x607387,
                    title: 'Evaluation Result',
                    fields: [
                        { name: 'Language', value: '```' + '\n' + oldSnippet!.history[oldSnippet!.history.length - 1].language + '\n' + '```', inline: false },
                        { name: 'Version', value: '```' + '\n' + version + '\n' + '```', inline: false },
                        { name: 'Input', value: '```' + oldSnippet!.history[oldSnippet!.history.length - 1].language + '\n' + oldSnippet!.history[oldSnippet!.history.length - 1].code.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```', inline: false },
                        { name: 'Output', value: '```' + oldSnippet!.history[oldSnippet!.history.length - 1].language + '\n' + result.run.output.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```', inline: false },
                        { name: 'Output code', value: '```' + '\n' + result.run.code + '\n' + '```', inline: false }
                    ],
                    footer: {
                        text: `The code took ${Math.floor(end - start).toFixed(0)}ms to be executed`
                    }
                };
                if (oldSnippet!.history[oldSnippet!.history.length - 1].code.length > 925) {
                    runembed = {
                        color: 0x607387,
                        title: 'Evaluation Result',
                        fields: [
                            { name: 'Language', value: '```' + '\n' + oldSnippet!.history[oldSnippet!.history.length - 1].language + '\n' + '```', inline: false },
                            { name: 'Version', value: '```' + '\n' + version + '\n' + '```', inline: false },
                            { name: 'Input', value: '```' + oldSnippet!.history[oldSnippet!.history.length - 1].language + '\n' + oldSnippet!.history[oldSnippet!.history.length - 1].code.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```' + '**__TOO LONG__**', inline: false },
                            { name: 'Output', value: '```' + oldSnippet!.history[oldSnippet!.history.length - 1].language + '\n' + result.run.output.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```', inline: false },
                            { name: 'Output code', value: '```' + '\n' + result.run.code + '\n' + '```', inline: false }
                        ],
                        footer: {
                            text: `The code took ${Math.floor(end - start).toFixed(0)}ms to be executed`
                        }
                    };
                }
                if (result.run.output.length > 925) {
                    let url: Response | string = await fetch('https://dpaste.com/api/v2/', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'EvalBot' },
                        body: `title=Evaluation%20Result&content=${result.run.output}&expiry_days=365`
                    });
                    url = await url.text() as string;
                    runembed = {
                        color: 0x607387,
                        title: 'Evaluation Result',
                        fields: [
                            { name: 'Language', value: '```' + '\n' + oldSnippet!.history[oldSnippet!.history.length - 1].language + '\n' + '```', inline: false },
                            { name: 'Version', value: '```' + '\n' + version + '\n' + '```', inline: false },
                            { name: 'Input', value: '```' + oldSnippet!.history[oldSnippet!.history.length - 1].language + '\n' + oldSnippet!.history[oldSnippet!.history.length - 1].code.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```', inline: false },
                            { name: 'Output', value: '```' + oldSnippet!.history[oldSnippet!.history.length - 1].language + '\n' + result.run.output.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```' + '**__TOO LONG__**' + '\n' + `view the entire output [here](${url})`, inline: false },
                            { name: 'Output code', value: '```' + '\n' + result.run.code + '\n' + '```', inline: false }
                        ],
                        footer: {
                            text: `The code took ${Math.floor(end - start).toFixed(0)}ms to be executed`
                        }
                    };
                }
                if (oldSnippet!.history[oldSnippet!.history.length - 1].code.length > 925 && result.run.output.length > 925) {
                    let url: Response | string = await fetch('https://dpaste.com/api/v2/', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'EvalBot' },
                        body: `title=Evaluation%20Result&content=${result.run.output}&expiry_days=365`
                    });
                    url = await url.text() as string;
                    runembed = {
                        color: 0x607387,
                        title: 'Evaluation Result',
                        fields: [
                            { name: 'Language', value: '```' + '\n' + oldSnippet!.history[oldSnippet!.history.length - 1].language + '\n' + '```', inline: false },
                            { name: 'Version', value: '```' + '\n' + version + '\n' + '```', inline: false },
                            { name: 'Input', value: '```' + oldSnippet!.history[oldSnippet!.history.length - 1].language + '\n' + oldSnippet!.history[oldSnippet!.history.length - 1].code.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```' + '**__TOO LONG__**', inline: false },
                            { name: 'Output', value: '```' + oldSnippet!.history[oldSnippet!.history.length - 1].language + '\n' + result.run.output.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```' + '**__TOO LONG__**' + '\n' + `view the entire output [here](${url})`, inline: false },
                            { name: 'Output code', value: '```' + '\n' + result.run.code + '\n' + '```', inline: false }
                        ],
                        footer: {
                            text: `The code took ${Math.floor(end - start).toFixed(0)}ms to be executed`
                        }
                    };
                }
                if (result.run.output.length == 0 || result.run.output == '\n') {
                    runembed = {
                        color: 0x607387,
                        title: 'Evaluation Result',
                        fields: [
                            { name: 'Language', value: '```' + '\n' + oldSnippet!.history[oldSnippet!.history.length - 1].language + '\n' + '```', inline: false },
                            { name: 'Version', value: '```' + '\n' + version + '\n' + '```', inline: false },
                            { name: 'Input', value: '```' + oldSnippet!.history[oldSnippet!.history.length - 1].language + '\n' + oldSnippet!.history[oldSnippet!.history.length - 1].code.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```', inline: false },
                            { name: 'Output', value: 'No output!', inline: false },
                        ],
                        footer: {
                            text: `The code took ${Math.floor(end - start).toFixed(0)}ms to be executed`
                        }
                    };
                }
                if ((result.run.output.length == 0 || result.run.output == '\n') && oldSnippet!.history[oldSnippet!.history.length - 1].code.length > 925) {
                    runembed = {
                        color: 0x607387,
                        title: 'Evaluation Result',
                        fields: [
                            { name: 'Language', value: '```' + '\n' + oldSnippet!.history[oldSnippet!.history.length - 1].language + '\n' + '```', inline: false },
                            { name: 'Version', value: '```' + '\n' + version + '\n' + '```', inline: false },
                            { name: 'Input', value: '```' + oldSnippet!.history[oldSnippet!.history.length - 1].language + '\n' + oldSnippet!.history[oldSnippet!.history.length - 1].code.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```' + '**__TOO LONG__**', inline: false },
                            { name: 'Output', value: 'No output!', inline: false },
                        ],
                        footer: {
                            text: `The code took ${Math.floor(end - start).toFixed(0)}ms to be executed`
                        }
                    };
                }
                runembed.title = `Evaluation Result - [ID: ${currentId}]`;
                await snippets.updateOne({ userId: message.member!.user.id || message.user!.id, evaluatorId: currentId }, { $set: { language: oldSnippet!.history[oldSnippet!.history.length - 1].language, code: oldSnippet!.history[oldSnippet!.history.length - 1].code }, $pop: { history: 1 } });
                return response.send({
                    content: await editFollowup(message, {
                        embeds: [runembed],
                        components: [
                            {
                                type: MessageComponentTypes.ACTION_ROW,
                                components: [
                                    {
                                        type: MessageComponentTypes.BUTTON,
                                        label: '',
                                        style: ButtonStyleTypes.PRIMARY,
                                        custom_id: `edit - ${message.member!.user.id || message.user!.id} - ${currentId + 1}`,
                                        emoji: { name: 'Edit', id: '1104464874744074370' }
                                    },
                                    undoComponent,
                                    {
                                        type: MessageComponentTypes.BUTTON,
                                        label: '',
                                        style: ButtonStyleTypes.SECONDARY,
                                        custom_id: `camera - ${oldSnippet!.history[oldSnippet!.history.length - 1].code}`,
                                        emoji: { name: 'Camera', id: '1127175733245128805' }
                                    },
                                    {
                                        type: MessageComponentTypes.BUTTON,
                                        label: '',
                                        style: ButtonStyleTypes.DANGER,
                                        custom_id: `delete - ${message.member!.user.id || message.user!.id}`,
                                        emoji: { name: 'Delete', id: '1104477832308068352' }
                                    }
                                ]
                            }
                        ]
                    })
                });
            }
            else if (message.data!.custom_id!.startsWith('history')) {
                await deferReply(message, { ephemeral: true });
                const user = message.data!.custom_id!.split(' - ')[1];
                const id = message.data!.custom_id!.split(' - ')[2];
                const historyEntry: number = parseInt(message.data!.values[0].split(' ')[1]) - 1;
                const isLatest = message.data!.values[0].split(' ')[2] == '(latest)' ? true : false;
                await mongoose.connect(url);
                const totalSnippets = await snippets.find({ userId: user });
                const currentSnippet = await snippets.findOne({ userId: user, evaluatorId: id });
                if (currentSnippet == undefined) {
                    return response.send({
                        content: await followUp(message, {
                            content: 'Snippet not found'
                        })
                    });
                }
                let snippetsembed: Embeds;
                if (isLatest == true) {
                    snippetsembed = {
                        color: 0x607387,
                        title: 'Snippets',
                        description: `Total snippets: ${totalSnippets.length}`,
                        fields: [{ name: `Language: ${currentSnippet!.language}`, value: '```' + currentSnippet!.language + '\n' + currentSnippet!.code.slice(0, 1024) + '\n' + '```', inline: false }],
                    };
                }
                else {
                    if (currentSnippet!.history[historyEntry] == undefined) {
                        return response.send({
                            content: await followUp(message, {
                                content: 'History entry not found'
                            })
                        });
                    }
                    snippetsembed = {
                        color: 0x607387,
                        title: 'Snippets',
                        description: `Total snippets: ${totalSnippets.length}`,
                        fields: [{ name: `Language: ${currentSnippet!.history[historyEntry].language}`, value: '```' + currentSnippet!.history[historyEntry].language + '\n' + currentSnippet!.history[historyEntry].code.slice(0, 1024) + '\n' + '```', inline: false }],
                    };
                }
                return response.send({
                    content: await followUp(message, {
                        embeds: [snippetsembed],
                        components: [
                            {
                                type: MessageComponentTypes.ACTION_ROW,
                                components: [
                                    {
                                        type: MessageComponentTypes.BUTTON,
                                        label: '',
                                        style: ButtonStyleTypes.PRIMARY,
                                        custom_id: `run_code - ${user} - ${id} - ${historyEntry}`,
                                        emoji: { name: 'Play', id: '1124682991692677120' }
                                    }
                                ]
                            }
                        ]
                    })
                });
            }
        }
        else if (message.type === InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE) {
            switch (message.data!.name) {
            case SIZE_CMD.name: {
                const pkg: string = get(message, 'name')!;
                let result: Response | PackageName[] = await fetch(`https://api.npms.io/v2/search/suggestions?q=${pkg}`);
                result = await result.json() as PackageName[];
                const choices: AutocompleteOptions['choices'] = [];
                for (let i = 0; i < 25; i++) {
                    choices.push({ name: result[i].package.name, value: result[i].package.name });
                }
                return response.send({
                    content: await autocompleteResult(message, {
                        choices: choices,
                    })
                });
            }
            case SNIPPETS_CMD.name: {
                const id: string = get(message, 'id')!;
                await mongoose.connect(url);
                const totalSnippets = await snippets.find();
                let choices: AutocompleteOptions['choices'] = [];
                for (let i = 0; i < totalSnippets.length; i++) {
                    if (id == totalSnippets[i].evaluatorId.toString()) {
                        choices = [{ name: totalSnippets[i].evaluatorId.toString(), value: totalSnippets[i].evaluatorId.toString() }];
                    }
                    else if (id != totalSnippets[i].evaluatorId.toString()) {
                        choices.push({ name: totalSnippets[i].evaluatorId.toString(), value: totalSnippets[i].evaluatorId.toString() });
                    }
                    if (choices.length > 25) {
                        choices = choices.slice(0, 25);
                    }
                    else if (parseInt(id) <= 0) {
                        choices = [];
                    }
                }
                return response.send({
                    content: await autocompleteResult(message, {
                        choices: choices,
                    })
                });
            }
            }
        }
        else if (message.type === InteractionType.MODAL_SUBMIT) {
            switch (message.data!.custom_id!) {
            case 'run': {
                await deferReply(message, { ephemeral: false });
                const language: string = get(message, 'language')!.toLowerCase().trim();
                let code: string = get(message, 'code')!.trim();
                const input: string = '' || get(message, 'input')!.trim();
                let packages: string | string[] = '' || get(message, 'packages')!.trim();
                let version: number = 0;
                let index: number = 0;
                for (let i = 0; i < runtimes.length; i++) {
                    if (runtimes[i].aliases.length != 0) {
                        for (let c = 0; c < runtimes[i].aliases.length; c++) {
                            if (language == runtimes[i].language || language == runtimes[i].aliases[c]) {
                                version = runtimes[i].version;
                                index = i;
                            }
                        }
                    }
                    else {
                        if (language == runtimes[i].language) {
                            version = runtimes[i].version;
                            index = i;
                        }
                    }
                }
                if (version == 0) {
                    return response.send({
                        content: await followUp(message, {
                            content: 'Unknown Language!'
                        })
                    });
                }
                if (packages && runtimes[index].language == 'python') {
                    packages = packages.split('\n');
                    const imports: string[] = [];
                    for (let i = 0; i < packages.length; i++) {
                        imports.push(`import ${packages[i]}`);
                    }
                    code = imports.join('\n') + '\n' + code;
                }
                else if (runtimes[index].language == 'go') {
                    if (code.includes('func main() {')) code = code;
                    else {
                        code = 'package main' + '\n' + 'import "fmt"' + '\n' + 'func main() {' + '\n' + '  ' + code.replace(/\n/g, '\n  ') + '\n' + '}';
                    }
                }
                else if (runtimes[index].language == 'rust') {
                    if (code.includes('fn main() {')) code = code;
                    else {
                        code = 'use std::io;' + '\n' + 'fn main() {' + '\n' + '  ' + code.replace(/\n/g, '\n  ') + '\n' + '}';
                    }
                }
                else if (runtimes[index].language == 'c') {
                    if (code.includes('int main() {')) code = code;
                    else {
                        code = '#include <stdio.h>' + '\n' + 'int main() {' + '\n' + '  ' + code.replace(/\n/g, '\n  ') + '\n' + '}';
                    }
                }
                else if (runtimes[index].language == 'c++') {
                    if (code.includes('int main() {')) code = code;
                    else {
                        code = '#include <iostream>' + '\n' + 'using namespace std;' + '\n' + 'int main() {' + '\n' + '  ' + code.replace(/\n/g, '\n  ') + '\n' + '}';
                    }
                }
                else if (runtimes[index].language == 'csharp') {
                    if (code.includes('static void Main(string[] args) {')) code = code;
                    else {
                        code = 'using System;' + '\n' + 'class Program {' + '\n' + '  static void Main(string[] args) {' + '\n' + '    ' + code.replace(/\n/g, '\n    ') + '\n' + '  }' + '\n' + '}';
                    }
                }
                else if (runtimes[index].language == 'java') {
                    if (code.includes('public static void Main(string[] args) {')) code = code;
                    else {
                        code = 'public class Main {' + '\n' + '  public static void main(String[] args) {' + '\n' + '    ' + code.replace(/\n/g, '\n    ') + '\n' + '  }' + '\n' + '}';
                    }
                }
                else if (runtimes[index].language == 'kotlin') {
                    if (code.includes('fun main() {')) code = code;
                    else {
                        code = 'fun main() {' + '\n' + '  ' + code.replace(/\n/g, '\n  ') + '\n' + '}';
                    }
                }
                const start: number = Date.now();
                let result: Response | Result = await fetch('https://emkc.org/api/v2/piston/execute', {
                    method: 'POST',
                    body: JSON.stringify({
                        'language': language,
                        'version': '*',
                        'files': [{
                            'content': code
                        }],
                        'stdin': input,
                        'args': input.split('\n')
                    })
                });
                result = await result.json() as Result;
                const end: number = Date.now();
                let runembed: Embeds = {
                    color: 0x607387,
                    title: 'Evaluation Result',
                    fields: [
                        { name: 'Language', value: '```' + '\n' + runtimes[index].language + '\n' + '```', inline: false },
                        { name: 'Version', value: '```' + '\n' + version + '\n' + '```', inline: false },
                        { name: 'Input', value: '```' + runtimes[index].language + '\n' + code.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```', inline: false },
                        { name: 'Output', value: '```' + runtimes[index].language + '\n' + result.run.output.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```', inline: false },
                        { name: 'Output code', value: '```' + '\n' + result.run.code + '\n' + '```', inline: false }
                    ],
                    footer: {
                        text: `The code took ${Math.floor(end - start).toFixed(0)}ms to be executed`
                    }
                };
                if (code.length > 925) {
                    runembed = {
                        color: 0x607387,
                        title: 'Evaluation Result',
                        fields: [
                            { name: 'Language', value: '```' + '\n' + runtimes[index].language + '\n' + '```', inline: false },
                            { name: 'Version', value: '```' + '\n' + version + '\n' + '```', inline: false },
                            { name: 'Input', value: '```' + runtimes[index].language + '\n' + code.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```' + '**__TOO LONG__**', inline: false },
                            { name: 'Output', value: '```' + runtimes[index].language + '\n' + result.run.output.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```', inline: false },
                            { name: 'Output code', value: '```' + '\n' + result.run.code + '\n' + '```', inline: false }
                        ],
                        footer: {
                            text: `The code took ${Math.floor(end - start).toFixed(0)}ms to be executed`
                        }
                    };
                }
                if (result.run.output.length > 925) {
                    let url: Response | string = await fetch('https://dpaste.com/api/v2/', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'EvalBot' },
                        body: `title=Evaluation%20Result&content=${result.run.output}&expiry_days=365`
                    });
                    url = await url.text() as string;
                    runembed = {
                        color: 0x607387,
                        title: 'Evaluation Result',
                        fields: [
                            { name: 'Language', value: '```' + '\n' + runtimes[index].language + '\n' + '```', inline: false },
                            { name: 'Version', value: '```' + '\n' + version + '\n' + '```', inline: false },
                            { name: 'Input', value: '```' + runtimes[index].language + '\n' + code.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```', inline: false },
                            { name: 'Output', value: '```' + runtimes[index].language + '\n' + result.run.output.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```' + '**__TOO LONG__**' + '\n' + `view the entire output [here](${url})`, inline: false },
                            { name: 'Output code', value: '```' + '\n' + result.run.code + '\n' + '```', inline: false }
                        ],
                        footer: {
                            text: `The code took ${Math.floor(end - start).toFixed(0)}ms to be executed`
                        }
                    };
                }
                if (code.length > 925 && result.run.output.length > 925) {
                    let url: Response | string = await fetch('https://dpaste.com/api/v2/', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'EvalBot' },
                        body: `title=Evaluation%20Result&content=${result.run.output}&expiry_days=365`
                    });
                    url = await url.text() as string;
                    runembed = {
                        color: 0x607387,
                        title: 'Evaluation Result',
                        fields: [
                            { name: 'Language', value: '```' + '\n' + runtimes[index].language + '\n' + '```', inline: false },
                            { name: 'Version', value: '```' + '\n' + version + '\n' + '```', inline: false },
                            { name: 'Input', value: '```' + runtimes[index].language + '\n' + code.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```' + '**__TOO LONG__**', inline: false },
                            { name: 'Output', value: '```' + runtimes[index].language + '\n' + result.run.output.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```' + '**__TOO LONG__**' + '\n' + `view the entire output [here](${url})`, inline: false },
                            { name: 'Output code', value: '```' + '\n' + result.run.code + '\n' + '```', inline: false }
                        ],
                        footer: {
                            text: `The code took ${Math.floor(end - start).toFixed(0)}ms to be executed`
                        }
                    };
                }
                if (result.run.output.length == 0 || result.run.output == '\n') {
                    runembed = {
                        color: 0x607387,
                        title: 'Evaluation Result',
                        fields: [
                            { name: 'Language', value: '```' + '\n' + runtimes[index].language + '\n' + '```', inline: false },
                            { name: 'Version', value: '```' + '\n' + version + '\n' + '```', inline: false },
                            { name: 'Input', value: '```' + runtimes[index].language + '\n' + code.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```', inline: false },
                            { name: 'Output', value: 'No output!', inline: false },
                        ],
                        footer: {
                            text: `The code took ${Math.floor(end - start).toFixed(0)}ms to be executed`
                        }
                    };
                }
                if ((result.run.output.length == 0 || result.run.output == '\n') && code.length > 925) {
                    runembed = {
                        color: 0x607387,
                        title: 'Evaluation Result',
                        fields: [
                            { name: 'Language', value: '```' + '\n' + language + '\n' + '```', inline: false },
                            { name: 'Version', value: '```' + '\n' + version + '\n' + '```', inline: false },
                            { name: 'Input', value: '```' + language + '\n' + code.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```' + '**__TOO LONG__**', inline: false },
                            { name: 'Output', value: 'No output!', inline: false },
                        ],
                        footer: {
                            text: `The code took ${Math.floor(end - start).toFixed(0)}ms to be executed`
                        }
                    };
                }
                if (input) {
                        runembed.fields!.push({ name: 'Input from user', value: '```' + '\n' + input + '\n' + '```', inline: false });
                }
                if (packages && runtimes[index].language == 'python') {
                        runembed.fields!.push({ name: 'Packages', value: '```' + '\n' + packages.toString().replace(/,/g, '\n') + '\n' + '```', inline: false });
                }
                await mongoose.connect(url);
                const currentEvaluatorId = await snippets.find();
                let currentId: number = 0;
                for (let i = 1; i <= currentEvaluatorId.length; i++) {
                    currentId = i;
                }
                runembed.title = `Evaluation Result - [ID: ${currentId + 1}]`;
                await snippets.create({ userId: message.member!.user.id || message.user!.id, language: runtimes[index].language, code: code, evaluatorId: currentId + 1 });
                return response.send({
                    content: await followUp(message, {
                        embeds: [runembed],
                        components: [
                            {
                                type: MessageComponentTypes.ACTION_ROW,
                                components: [
                                    {
                                        type: MessageComponentTypes.BUTTON,
                                        label: '',
                                        style: ButtonStyleTypes.PRIMARY,
                                        custom_id: `edit - ${message.member!.user.id || message.user!.id} - ${currentId + 1}`,
                                        emoji: { name: 'Edit', id: '1104464874744074370' }
                                    },
                                    {
                                        type: MessageComponentTypes.BUTTON,
                                        label: '',
                                        style: ButtonStyleTypes.SECONDARY,
                                        custom_id: `undo - ${message.member!.user.id || message.user!.id}`,
                                        emoji: { name: 'Undo', id: '1125394556804931696' },
                                        disabled: true
                                    },
                                    {
                                        type: MessageComponentTypes.BUTTON,
                                        label: '',
                                        style: ButtonStyleTypes.SECONDARY,
                                        custom_id: 'camera',
                                        emoji: { name: 'Camera', id: '1127175733245128805' }
                                    },
                                    {
                                        type: MessageComponentTypes.BUTTON,
                                        label: '',
                                        style: ButtonStyleTypes.DANGER,
                                        custom_id: `delete - ${message.member!.user.id || message.user!.id}`,
                                        emoji: { name: 'Delete', id: '1104477832308068352' }
                                    }
                                ]
                            }
                        ]
                    })
                });
            }
            case 'runedit': {
                await updateDefer(message);
                const language: string = get(message, 'language')!.toLowerCase().trim();
                let code: string = get(message, 'code')!.trim();
                const input: string = '' || get(message, 'input')!.trim();
                let packages: string | string[] = '' || get(message, 'packages')!.trim();
                let version: number = 0;
                let index: number = 0;
                for (let i = 0; i < runtimes.length; i++) {
                    if (runtimes[i].aliases.length != 0) {
                        for (let c = 0; c < runtimes[i].aliases.length; c++) {
                            if (language == runtimes[i].language || language == runtimes[i].aliases[c]) {
                                version = runtimes[i].version;
                                index = i;
                            }
                        }
                    }
                    else {
                        if (language == runtimes[i].language) {
                            version = runtimes[i].version;
                            index = i;
                        }
                    }
                }
                if (version == 0) {
                    return response.send({
                        content: await followUp(message, {
                            content: 'Unknown Language!'
                        })
                    });
                }
                if (packages && runtimes[index].language == 'python') {
                    packages = packages.split('\n');
                    const imports: string[] = [];
                    for (let i = 0; i < packages.length; i++) {
                        imports.push(`import ${packages[i]}`);
                    }
                    code = imports.join('\n') + '\n' + code;
                }
                else if (runtimes[index].language == 'go') {
                    if (code.includes('func main() {')) code = code;
                    else {
                        code = 'package main' + '\n' + 'import "fmt"' + '\n' + 'func main() {' + '\n' + '  ' + code.replace(/\n/g, '\n  ') + '\n' + '}';
                    }
                }
                else if (runtimes[index].language == 'rust') {
                    if (code.includes('fn main() {')) code = code;
                    else {
                        code = 'use std::io;' + '\n' + 'fn main() {' + '\n' + '  ' + code.replace(/\n/g, '\n  ') + '\n' + '}';
                    }
                }
                else if (runtimes[index].language == 'c') {
                    if (code.includes('int main() {')) code = code;
                    else {
                        code = '#include <stdio.h>' + '\n' + 'int main() {' + '\n' + '  ' + code.replace(/\n/g, '\n  ') + '\n' + '}';
                    }
                }
                else if (runtimes[index].language == 'c++') {
                    if (code.includes('int main() {')) code = code;
                    else {
                        code = '#include <iostream>' + '\n' + 'using namespace std;' + '\n' + 'int main() {' + '\n' + '  ' + code.replace(/\n/g, '\n  ') + '\n' + '}';
                    }
                }
                else if (runtimes[index].language == 'csharp') {
                    if (code.includes('static void Main(string[] args) {')) code = code;
                    else {
                        code = 'using System;' + '\n' + 'class Program {' + '\n' + '  static void Main(string[] args) {' + '\n' + '    ' + code.replace(/\n/g, '\n    ') + '\n' + '  }' + '\n' + '}';
                    }
                }
                else if (runtimes[index].language == 'java') {
                    if (code.includes('public static void Main(string[] args) {')) code = code;
                    else {
                        code = 'public class Main {' + '\n' + '  public static void main(String[] args) {' + '\n' + '    ' + code.replace(/\n/g, '\n    ') + '\n' + '  }' + '\n' + '}';
                    }
                }
                else if (runtimes[index].language == 'kotlin') {
                    if (code.includes('fun main() {')) code = code;
                    else {
                        code = 'fun main() {' + '\n' + '  ' + code.replace(/\n/g, '\n  ') + '\n' + '}';
                    }
                }
                const start: number = Date.now();
                let result: Response | Result = await fetch('https://emkc.org/api/v2/piston/execute', {
                    method: 'POST',
                    body: JSON.stringify({
                        'language': language,
                        'version': '*',
                        'files': [{
                            'content': code
                        }],
                        'stdin': input,
                        'args': input.split('\n')
                    })
                });
                result = await result.json() as Result;
                const end: number = Date.now();
                let runembed: Embeds = {
                    color: 0x607387,
                    title: 'Evaluation Result',
                    fields: [
                        { name: 'Language', value: '```' + '\n' + runtimes[index].language + '\n' + '```', inline: false },
                        { name: 'Version', value: '```' + '\n' + version + '\n' + '```', inline: false },
                        { name: 'Input', value: '```' + runtimes[index].language + '\n' + code.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```', inline: false },
                        { name: 'Output', value: '```' + runtimes[index].language + '\n' + result.run.output.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```', inline: false },
                        { name: 'Output code', value: '```' + '\n' + result.run.code + '\n' + '```', inline: false }
                    ],
                    footer: {
                        text: `The code took ${Math.floor(end - start).toFixed(0)}ms to be executed`
                    }
                };
                if (code.length > 925) {
                    runembed = {
                        color: 0x607387,
                        title: 'Evaluation Result',
                        fields: [
                            { name: 'Language', value: '```' + '\n' + runtimes[index].language + '\n' + '```', inline: false },
                            { name: 'Version', value: '```' + '\n' + version + '\n' + '```', inline: false },
                            { name: 'Input', value: '```' + runtimes[index].language + '\n' + code.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```' + '**__TOO LONG__**', inline: false },
                            { name: 'Output', value: '```' + runtimes[index].language + '\n' + result.run.output.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```', inline: false },
                            { name: 'Output code', value: '```' + '\n' + result.run.code + '\n' + '```', inline: false }
                        ],
                        footer: {
                            text: `The code took ${Math.floor(end - start).toFixed(0)}ms to be executed`
                        }
                    };
                }
                if (result.run.output.length > 925) {
                    let url: Response | string = await fetch('https://dpaste.com/api/v2/', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'EvalBot' },
                        body: `title=Evaluation%20Result&content=${result.run.output}&expiry_days=365`
                    });
                    url = await url.text() as string;
                    runembed = {
                        color: 0x607387,
                        title: 'Evaluation Result',
                        fields: [
                            { name: 'Language', value: '```' + '\n' + runtimes[index].language + '\n' + '```', inline: false },
                            { name: 'Version', value: '```' + '\n' + version + '\n' + '```', inline: false },
                            { name: 'Input', value: '```' + runtimes[index].language + '\n' + code.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```', inline: false },
                            { name: 'Output', value: '```' + runtimes[index].language + '\n' + result.run.output.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```' + '**__TOO LONG__**' + '\n' + `view the entire output [here](${url})`, inline: false },
                            { name: 'Output code', value: '```' + '\n' + result.run.code + '\n' + '```', inline: false }
                        ],
                        footer: {
                            text: `The code took ${Math.floor(end - start).toFixed(0)}ms to be executed`
                        }
                    };
                }
                if (code.length > 925 && result.run.output.length > 925) {
                    let url: Response | string = await fetch('https://dpaste.com/api/v2/', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'EvalBot' },
                        body: `title=Evaluation%20Result&content=${result.run.output}&expiry_days=365`
                    });
                    url = await url.text() as string;
                    runembed = {
                        color: 0x607387,
                        title: 'Evaluation Result',
                        fields: [
                            { name: 'Language', value: '```' + '\n' + runtimes[index].language + '\n' + '```', inline: false },
                            { name: 'Version', value: '```' + '\n' + version + '\n' + '```', inline: false },
                            { name: 'Input', value: '```' + runtimes[index].language + '\n' + code.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```' + '**__TOO LONG__**', inline: false },
                            { name: 'Output', value: '```' + runtimes[index].language + '\n' + result.run.output.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```' + '**__TOO LONG__**' + '\n' + `view the entire output [here](${url})`, inline: false },
                            { name: 'Output code', value: '```' + '\n' + result.run.code + '\n' + '```', inline: false }
                        ],
                        footer: {
                            text: `The code took ${Math.floor(end - start).toFixed(0)}ms to be executed`
                        }
                    };
                }
                if (result.run.output.length == 0 || result.run.output == '\n') {
                    runembed = {
                        color: 0x607387,
                        title: 'Evaluation Result',
                        fields: [
                            { name: 'Language', value: '```' + '\n' + runtimes[index].language + '\n' + '```', inline: false },
                            { name: 'Version', value: '```' + '\n' + version + '\n' + '```', inline: false },
                            { name: 'Input', value: '```' + runtimes[index].language + '\n' + code.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```', inline: false },
                            { name: 'Output', value: 'No output!', inline: false },
                        ],
                        footer: {
                            text: `The code took ${Math.floor(end - start).toFixed(0)}ms to be executed`
                        }
                    };
                }
                if ((result.run.output.length == 0 || result.run.output == '\n') && code.length > 925) {
                    runembed = {
                        color: 0x607387,
                        title: 'Evaluation Result',
                        fields: [
                            { name: 'Language', value: '```' + '\n' + language + '\n' + '```', inline: false },
                            { name: 'Version', value: '```' + '\n' + version + '\n' + '```', inline: false },
                            { name: 'Input', value: '```' + language + '\n' + code.slice(0, 925).replace(/`/g, '`\u200b') + '\n' + '```' + '**__TOO LONG__**', inline: false },
                            { name: 'Output', value: 'No output!', inline: false },
                        ],
                        footer: {
                            text: `The code took ${Math.floor(end - start).toFixed(0)}ms to be executed`
                        }
                    };
                }
                if (input) {
                        runembed.fields!.push({ name: 'Input from user', value: '```' + '\n' + input + '\n' + '```', inline: false });
                }
                if (packages && runtimes[index].language == 'python') {
                        runembed.fields!.push({ name: 'Packages', value: '```' + '\n' + packages.toString().replace(/,/g, '\n') + '\n' + '```', inline: false });
                }
                await mongoose.connect(url);
                const currentId = parseInt(message.message.embeds[0].title!.split(' - ')[1].slice(5));
                runembed.title = `Evaluation Result - [ID: ${currentId}]`;
                const oldSnippet = await snippets.findOne({ userId: message.member!.user.id || message.user!.id, evaluatorId: currentId });
                await snippets.updateOne({ userId: message.member!.user.id || message.user!.id, evaluatorId: currentId }, { $set: { language: runtimes[index].language, code: code }, $push: { history: { language: oldSnippet!.language, code: oldSnippet!.code } } });
                return response.send({
                    content: await editFollowup(message, {
                        embeds: [runembed],
                        components: [
                            {
                                type: MessageComponentTypes.ACTION_ROW,
                                components: [
                                    {
                                        type: MessageComponentTypes.BUTTON,
                                        label: '',
                                        style: ButtonStyleTypes.PRIMARY,
                                        custom_id: `edit - ${message.member!.user.id || message.user!.id} - ${currentId}`,
                                        emoji: { name: 'Edit', id: '1104464874744074370' }
                                    },
                                    {
                                        type: MessageComponentTypes.BUTTON,
                                        label: '',
                                        style: ButtonStyleTypes.SECONDARY,
                                        custom_id: `undo - ${message.member!.user.id || message.user!.id}`,
                                        emoji: { name: 'Undo', id: '1125394556804931696' }
                                    },
                                    {
                                        type: MessageComponentTypes.BUTTON,
                                        label: '',
                                        style: ButtonStyleTypes.SECONDARY,
                                        custom_id: 'camera',
                                        emoji: { name: 'Camera', id: '1127175733245128805' }
                                    },
                                    {
                                        type: MessageComponentTypes.BUTTON,
                                        label: '',
                                        style: ButtonStyleTypes.DANGER,
                                        custom_id: `delete - ${message.member!.user.id || message.user!.id}`,
                                        emoji: { name: 'Delete', id: '1104477832308068352' }
                                    }
                                ]
                            }
                        ]
                    })
                });
            }
            case 'eval': {
                await deferReply(message, { ephemeral: true });
                if ((message.member!.user.id || message.user!.id) != '604339998312890379') {
                    return response.send({
                        content: await followUp(message, {
                            content: '❌ You can\'t do this',
                        })
                    });
                }
                try {
                    const code = eval(get(message, 'code')!.slice(0, 950));
                    return response.send({
                        content: await followUp(message, {
                            content: '```js' + '\n' + JSON.stringify(code, null, 2) + '\n' + '```'
                        })
                    });
                }
                catch (e) {
                    return response.send({
                        content: await followUp(message, {
                            content: '```js' + '\n' + e + '\n' + '```'
                        })
                    });
                }
            }
            }
        }
    }
};