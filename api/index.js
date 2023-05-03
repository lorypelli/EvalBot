const { InteractionResponseFlags, InteractionResponseType, InteractionType, verifyKey, ButtonStyleTypes, TextStyleTypes } = require("discord-interactions")
const fetch = require("node-fetch-native")
const getRawBody = require("raw-body")
const { version } = require("os")
const RUN_CMD = {
    name: "run",
    name_localizations: ({
        it: "esegui",
        pl: "uruchom"
    }),
    description: "Run a code (Piston API)",
    description_localizations: ({
        it: "Esegui un codice (Piston API)",
        pl: "Uruchom kod (Piston API)"
    })
}
const LANGS_CMD = {
    name: "languages",
    name_localizations: ({
        it: "linguaggi",
        pl: "języki"
    }),
    description: "Show supported programming languages",
    description_localizations: ({
        it: "Mostra i linguaggi di programmazione supportati",
        pl: "Pokaż obsługiwane języki programowania"
    }),
}
const INVITE_CMD = {
    name: "invite",
    name_localizations: ({
        it: "invita",
        pl: "zaproś"
    }),
    description: "Get the bot invite link",
    description_localizations: ({
        it: "Ottieni il link d'invito del bot",
        pl: "Uzyskaj link z zaproszeniem bota"
    }),
}
const VOTE_CMD = {
    name: "vote",
    name_localizations: ({
        it: "vota",
        pl: "głosuj"
    }),
    description: "Vote for the bot on topgg",
    description_localizations: ({
        it: "Vota per il bot su topgg",
        pl: "Głosuj na bota na topgg"
    })
}
const SIZE_CMD = {
    name: "size",
    name_localizations: ({
        it: "dimensione",
        pl: "rozmiar"
    }),
    description: "Get the size of an npm package",
    description_localizations: ({
        it: "Ottieni la dimensione di un pacchetto npm",
        pl: "Uzyskaj rozmiar pakietu npm"
    }),
    options: [
        {
            name: "name",
            name_localizations: ({
                it: "nome",
                pl: "nazwa"
            }),
            description: "Name of the npm package",
            description_localizations: ({
                it: "Nome del pacchetto npm",
                pl: "Nazwa pakietu npm"
            }),
            type: 3,
            required: true
        }
    ]
}
const EVAL_CMD = {
    name: "eval",
    description: "Eval code (only developer)",
    options: [
        {
            name: "code",
            description: "The code to evaluate",
            type: 3,
            required: true
        }
    ]
}
const REGISTER_CMD = {
    name: "register",
    description: "Register slash commands (only developer)"
}
const INFO_CMD = {
    name: "info",
    description: "Get bot info (only developer)"
}
const CONVERT_CMD = {
    name: "convert",
    name_localizations: ({
        it: "converti",
        pl: "konwertuj"
    }),
    description: "Convert a decimal number into binary one or vice versa",
    description_localizations: ({
        it: "Converti un numero decimale in binario o viceversa",
        pl: "Konwertuj liczbę dziesiętną na jedną lub odwrotnie"
    }),
    options: [
        {
            name: "system",
            name_localizations: ({
                it: "sistema",
                pl: "system"
            }),
            description: "Convert into binary or decimal?",
            description_localizations: ({
                it: "Converti in binario o decimale?",
                pl: "Konwertować na binarny czy dziesiętny?"
            }),
            type: 3,
            required: true,
            choices: [
                { name: "Decimal to Binary", name_localizations: ({ it: "Decimale a Binario", pl: "Ułamek dziesiętny do ułamka binarnego" }), value: "Decimal to Binary" },
                { name: "Binary to Decimal", name_localizations: ({ it: "Binario a Decimale", pl: "Ułamek binarny do ułamka dziesiętnego" }), value: "Binary to Decimal" }
            ]
        },
        {
            name: "number",
            name_localizations: ({
                it: "numero",
                pl: "liczba"
            }),
            description: "The number to convert",
            description_localizations: ({
                it: "Il numero da convertire",
                pl: "Liczba do przekonwertowania"
            }),
            type: 10,
            required: true
        }
    ]
}
/**
 * @param { import("@vercel/node").VercelRequest } request
 * @param { import("@vercel/node").VercelResponse } response
 */
module.exports = async (request, response) => {
    if (request.method !== "POST") {
        return response.status(405).send({ error: "Method not allowed" })
    }
    else if (request.method === "POST") {
        let user = await fetch("https://discord.com/api/v10/users/@me", {
            headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" }
        })
        user = await user.json()
        let guilds = await fetch("https://discord.com/api/v10/users/@me/guilds", {
            headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" }
        })
        guilds = await guilds.json()
        await fetch(`https://top.gg/api/bots/${process.env.ID}/stats`, {
            method: "POST",
            headers: { "Authorization": process.env.TOPGG, "Content-Type": "application/json" },
            body: JSON.stringify({
                server_count: guilds.length
            })
        })
        await fetch(`https://discordbotlist.com/api/v1/bots/${process.env.ID}/stats`, {
            method: "POST",
            headers: { "Authorization": process.env.DBL, "Content-Type": "application/json" },
            body: JSON.stringify({
                guilds: guilds.length
            })
        })
        await fetch(`https://discordbotlist.com/api/v1/bots/${process.env.ID}/commands`, {
            method: "POST",
            headers: { "Authorization": `Bot ${process.env.DBL}`, "Content-Type": "application/json" },
            body: JSON.stringify([RUN_CMD, LANGS_CMD, INVITE_CMD, VOTE_CMD, SIZE_CMD, EVAL_CMD, REGISTER_CMD, INFO_CMD, CONVERT_CMD])
        })
        let runtimes = await fetch("https://emkc.org/api/v2/piston/runtimes")
        runtimes = await runtimes.json()
        let signature = request.headers["x-signature-ed25519"]
        let timestamp = request.headers["x-signature-timestamp"]
        let body = await getRawBody(request)
        let isValidRequest = verifyKey(
            body,
            signature,
            timestamp,
            process.env.PUBLIC_KEY
        )
        if (!isValidRequest) {
            return response.status(401).send({ error: "Unauthorized" })
        }
        let message = request.body
        if (user.username == "EvalBot Beta" && (message.member?.user.id || message.user.id) != "604339998312890379") {
            return response.send({
                content: await fetch(`https://discord.com/api/v10/interactions/${message.id}/${message.token}/callback`, {
                    method: "POST",
                    headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                    body: JSON.stringify({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: "❌ You can't use <@1077228141531123852>, use <@1076200668810985634> instead",
                            flags: InteractionResponseFlags.EPHEMERAL
                        }
                    })
                })
            })
        }
        if (message.type === InteractionType.PING) {
            return response.send(JSON.stringify({
                type: InteractionResponseType.PONG,
            }), {
                headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" }
            })
        }
        else if (message.type === InteractionType.APPLICATION_COMMAND) {
            switch (message.data.name) {
                case INVITE_CMD.name: {
                    await fetch(`https://discord.com/api/v10/interactions/${message.id}/${message.token}/callback`, {
                        method: "POST",
                        headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                        body: JSON.stringify({
                            type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
                            data: {
                                flags: InteractionResponseFlags.EPHEMERAL
                            }
                        })
                    })
                    return response.send({
                        content: await fetch(`https://discord.com/api/v10/webhooks/${process.env.ID}/${message.token}`, {
                            method: "POST",
                            headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                            body: JSON.stringify({
                                content: `The bot is currently on **${guilds.length} servers**. Click the button below to invite the bot!`,
                                components: [
                                    {
                                        type: 1,
                                        components: [
                                            {
                                                type: 2,
                                                label: "Invite",
                                                style: ButtonStyleTypes.LINK,
                                                url: "https://discord.com/api/oauth2/authorize?client_id=1076200668810985634&permissions=274877975552&scope=bot%20applications.commands"
                                            }
                                        ]
                                    }
                                ]
                            })
                        })
                    })
                }
                case VOTE_CMD.name: {
                    await fetch(`https://discord.com/api/v10/interactions/${message.id}/${message.token}/callback`, {
                        method: "POST",
                        headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                        body: JSON.stringify({
                            type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
                            data: {
                                flags: InteractionResponseFlags.EPHEMERAL
                            }
                        })
                    })
                    return response.send({
                        content: await fetch(`https://discord.com/api/v10/webhooks/${process.env.ID}/${message.token}`, {
                            method: "POST",
                            headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                            body: JSON.stringify({
                                components: [
                                    {
                                        type: 1,
                                        components: [
                                            {
                                                type: 2,
                                                label: "Vote",
                                                style: ButtonStyleTypes.LINK,
                                                url: "https://top.gg/bot/1076200668810985634/vote"
                                            }
                                        ]
                                    }
                                ]
                            })
                        })
                    })
                }
                case LANGS_CMD.name: {
                    await fetch(`https://discord.com/api/v10/interactions/${message.id}/${message.token}/callback`, {
                        method: "POST",
                        headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                        body: JSON.stringify({
                            type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
                            data: {
                                flags: InteractionResponseFlags.EPHEMERAL
                            }
                        })
                    })
                    let languages = []
                    for (let c = 0; c < runtimes.length; c++) {
                        languages.push({ name: `Language: ${runtimes[c].language}`, value: `Version: ${runtimes[c].version}`, inline: true })
                    }
                    return response.send({
                        content: await fetch(`https://discord.com/api/v10/webhooks/${process.env.ID}/${message.token}`, {
                            method: "POST",
                            headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                            body: JSON.stringify({
                                embeds: [
                                    {
                                        color: 0x607387,
                                        title: "Supported Languages",
                                        description: `Total languages: ${runtimes.length}`,
                                        fields: languages.slice(0, 25)
                                    }
                                ],
                                components: [
                                    {
                                        type: 1,
                                        components: [
                                            {
                                                type: 2,
                                                label: "Previous",
                                                style: ButtonStyleTypes.PRIMARY,
                                                custom_id: "previous1",
                                                disabled: true
                                            },
                                            {
                                                type: 2,
                                                label: "Next",
                                                style: ButtonStyleTypes.PRIMARY,
                                                custom_id: "next1"
                                            }
                                        ]
                                    }
                                ]
                            })
                        })
                    })
                }
                case RUN_CMD.name: {
                    return response.send({
                        content: await fetch(`https://discord.com/api/v10/interactions/${message.id}/${message.token}/callback`, {
                            method: "POST",
                            headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                            body: JSON.stringify({
                                type: InteractionResponseType.MODAL,
                                data: {
                                    title: "Run Code",
                                    custom_id: "run",
                                    components: [
                                        {
                                            type: 1,
                                            components: [
                                                {
                                                    type: 4,
                                                    label: "Language",
                                                    style: TextStyleTypes.SHORT,
                                                    custom_id: "language",
                                                    required: true,
                                                    min_length: 1,
                                                    max_length: 10
                                                }
                                            ]
                                        },
                                        {
                                            type: 1,
                                            components: [
                                                {
                                                    type: 4,
                                                    label: "Code",
                                                    style: TextStyleTypes.PARAGRAPH,
                                                    custom_id: "code",
                                                    required: true,
                                                    min_length: 5
                                                }
                                            ]
                                        },
                                        {
                                            type: 1,
                                            components: [
                                                {
                                                    type: 4,
                                                    label: "Input",
                                                    style: TextStyleTypes.PARAGRAPH,
                                                    custom_id: "input",
                                                    required: false,
                                                    placeholder: "(separate with a new line)"
                                                }
                                            ]
                                        },
                                        {
                                            type: 1,
                                            components: [
                                                {
                                                    type: 4,
                                                    label: "Packages (python only)",
                                                    style: TextStyleTypes.PARAGRAPH,
                                                    custom_id: "packages",
                                                    required: false,
                                                    placeholder: "(separate with a new line)"
                                                }
                                            ]
                                        }
                                    ]
                                }
                            })
                        })
                    })
                }
                case SIZE_CMD.name: {
                    await fetch(`https://discord.com/api/v10/interactions/${message.id}/${message.token}/callback`, {
                        method: "POST",
                        headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                        body: JSON.stringify({
                            type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE
                        })
                    })
                    let result = await fetch(`https://packagephobia.com/v2/api.json?p=${message.data.options[0].value}`)
                    if (result.status != 200) {
                        return response.send({
                            content: await fetch(`https://discord.com/api/v10/webhooks/${process.env.ID}/${message.token}`, {
                                method: "POST",
                                headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    content: "There was an error, try again!",
                                    flags: InteractionResponseFlags.EPHEMERAL
                                })
                            })
                        })
                    }
                    result = await result.json()
                    return response.send({
                        content: await fetch(`https://discord.com/api/v10/webhooks/${process.env.ID}/${message.token}`, {
                            method: "POST",
                            headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                            body: JSON.stringify({
                                embeds: [
                                    {
                                        color: 0x607387,
                                        title: `Info of __**${result.name}**__`,
                                        fields: [
                                            {
                                                name: "Version:",
                                                value: "```" + result.version + "```",
                                                inline: false
                                            },
                                            {
                                                name: "Publish Size:",
                                                value: "```" + result.publish.pretty + "```",
                                                inline: false
                                            },
                                            {
                                                name: "Install Size:",
                                                value: "```" + result.install.pretty + "```",
                                                inline: false
                                            }
                                        ]
                                    }
                                ]
                            })
                        })
                    })
                }
                case EVAL_CMD.name: {
                    await fetch(`https://discord.com/api/v10/interactions/${message.id}/${message.token}/callback`, {
                        method: "POST",
                        headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                        body: JSON.stringify({
                            type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
                            data: {
                                flags: InteractionResponseFlags.EPHEMERAL
                            }
                        })
                    })
                    if ((message.member?.user.id || message.user.id) != "604339998312890379") {
                        return response.send({
                            content: await fetch(`https://discord.com/api/v10/webhooks/${process.env.ID}/${message.token}`, {
                                method: "POST",
                                headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    content: "❌ You can't do this",
                                    flags: InteractionResponseFlags.EPHEMERAL
                                })
                            })
                        })
                    }
                    try {
                        let code = eval(message.data.options[0].value.slice(0, 950))
                        return response.send({
                            content: await fetch(`https://discord.com/api/v10/webhooks/${process.env.ID}/${message.token}`, {
                                method: "POST",
                                headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    content: "```js" + "\n" + JSON.stringify(code, null, 2) + "\n" + "```"
                                })
                            })
                        })
                    }
                    catch (e) {
                        return response.send({
                            content: await fetch(`https://discord.com/api/v10/webhooks/${process.env.ID}/${message.token}`, {
                                method: "POST",
                                headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    content: "```js" + "\n" + e + "\n" + "```"
                                })
                            })
                        })
                    }
                }
                case REGISTER_CMD.name: {
                    await fetch(`https://discord.com/api/v10/interactions/${message.id}/${message.token}/callback`, {
                        method: "POST",
                        headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                        body: JSON.stringify({
                            type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
                            data: {
                                flags: InteractionResponseFlags.EPHEMERAL
                            }
                        })
                    })
                    if ((message.member?.user.id || message.user.id) != "604339998312890379") {
                        return response.send({
                            content: await fetch(`https://discord.com/api/v10/webhooks/${process.env.ID}/${message.token}`, {
                                method: "POST",
                                headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    content: "❌ You can't do this",
                                    flags: InteractionResponseFlags.EPHEMERAL
                                })
                            })
                        })
                    }
                    await fetch(`https://discord.com/api/v10/applications/${process.env.ID}/commands`, {
                        method: "PUT",
                        headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                        body: JSON.stringify([RUN_CMD, LANGS_CMD, INVITE_CMD, VOTE_CMD, SIZE_CMD, CONVERT_CMD])
                    })
                    await fetch(`https://discord.com/api/v10/applications/${process.env.ID}/guilds/818058268978315286/commands`, {
                        method: "PUT",
                        headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                        body: JSON.stringify([EVAL_CMD, REGISTER_CMD, INFO_CMD])
                    })
                    return response.send({
                        content: await fetch(`https://discord.com/api/v10/webhooks/${process.env.ID}/${message.token}`, {
                            method: "POST",
                            headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                            body: JSON.stringify({
                                content: "Done!"
                            })
                        })
                    })
                }
                case INFO_CMD.name: {
                    await fetch(`https://discord.com/api/v10/interactions/${message.id}/${message.token}/callback`, {
                        method: "POST",
                        headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                        body: JSON.stringify({
                            type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
                            data: {
                                flags: InteractionResponseFlags.EPHEMERAL
                            }
                        })
                    })
                    if ((message.member?.user.id || message.user.id) != "604339998312890379") {
                        return response.send({
                            content: await fetch(`https://discord.com/api/v10/webhooks/${process.env.ID}/${message.token}`, {
                                method: "POST",
                                headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    content: "❌ You can't do this",
                                    flags: InteractionResponseFlags.EPHEMERAL
                                })
                            })
                        })
                    }
                    return response.send({
                        content: await fetch(`https://discord.com/api/v10/webhooks/${process.env.ID}/${message.token}`, {
                            method: "POST",
                            headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                            body: JSON.stringify({
                                embeds: [
                                    {
                                        color: 0x607387,
                                        title: "Bot info",
                                        fields: [
                                            { name: "Total RAM:", value: "```" + (process.memoryUsage().heapTotal / (1024 * 1024)).toFixed(3) + " MB" + "```", inline: false },
                                            { name: "Used RAM:", value: "```" + (process.memoryUsage().heapUsed / (1024 * 1024)).toFixed(3) + " MB" + "```", inline: false },
                                            { name: "Used RAM Percentage:", value: "```" + ((process.memoryUsage().heapUsed / (1024 * 1024)).toFixed(3) * 100 / (process.memoryUsage().heapTotal / (1024 * 1024)).toFixed(3)).toFixed(2) + " %" + "```", inline: false },
                                            { name: "I am running on:", value: "```" + process.platform + " – " + version() + " – " + process.cwd() + "```", inline: false },
                                            { name: "Versions", value: "```" + JSON.stringify(process.versions, null, 2) + "```", inline: false }
                                        ]
                                    }
                                ]
                            })
                        })
                    })
                }
                case CONVERT_CMD.name: {
                    await fetch(`https://discord.com/api/v10/interactions/${message.id}/${message.token}/callback`, {
                        method: "POST",
                        headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                        body: JSON.stringify({
                            type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
                            data: {
                                flags: InteractionResponseFlags.EPHEMERAL
                            }
                        })
                    })
                    let number = message.data.options[1].value
                    switch (message.data.options[0].value) {
                        case "Decimal to Binary": {
                            number = message.data.options[1].value.toString(2)
                            break
                        }
                        case "Binary to Decimal": {
                            if (message.data.options[1].value.toString().includes("2") || message.data.options[1].value.toString().includes("3") || message.data.options[1].value.toString().includes("4") || message.data.options[1].value.toString().includes("5") || message.data.options[1].value.toString().includes("6") || message.data.options[1].value.toString().includes("7") || message.data.options[1].value.toString().includes("8") || message.data.options[1].value.toString().includes("9")) {
                                return response.send({
                                    content: await fetch(`https://discord.com/api/v10/webhooks/${process.env.ID}/${message.token}`, {
                                        method: "POST",
                                        headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                            content: "❌ The binary number isn't valid",
                                            flags: InteractionResponseFlags.EPHEMERAL
                                        })
                                    })
                                })
                            }
                            number = parseInt(message.data.options[1].value, 2)
                            break
                        }
                    }
                    return response.send({
                        content: await fetch(`https://discord.com/api/v10/webhooks/${process.env.ID}/${message.token}`, {
                            method: "POST",
                            headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                            body: JSON.stringify({
                                content: `The number \`${message.data.options[1].value}\` converted using the \`${message.data.options[0].value}\` system is \`${number}\``,
                                data: {
                                    flags: InteractionResponseFlags.EPHEMERAL
                                }
                            })
                        })
                    })
                }
            }
        }
        else if (message.type === InteractionType.MESSAGE_COMPONENT) {
            switch (message.data.custom_id) {
                case "next1": {
                    await fetch(`https://discord.com/api/v10/interactions/${message.id}/${message.token}/callback`, {
                        method: "POST",
                        headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                        body: JSON.stringify({
                            type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE,
                            data: {
                                flags: InteractionResponseFlags.EPHEMERAL
                            }
                        })
                    })
                    let languages = []
                    for (let c = 0; c < runtimes.length; c++) {
                        languages.push({ name: `Language: ${runtimes[c].language}`, value: `Version: ${runtimes[c].version}`, inline: true })
                    }
                    return response.send({
                        content: await fetch(`https://discord.com/api/v10/webhooks/${process.env.ID}/${message.token}/messages/${message.message.id}`, {
                            method: "PATCH",
                            headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                            body: JSON.stringify({
                                embeds: [
                                    {
                                        color: 0x607387,
                                        title: "Supported Languages",
                                        description: `Total languages: ${runtimes.length}`,
                                        fields: languages.slice(25, 50)
                                    }
                                ],
                                components: [
                                    {
                                        type: 1,
                                        components: [
                                            {
                                                type: 2,
                                                label: "Previous",
                                                style: ButtonStyleTypes.PRIMARY,
                                                custom_id: "previous2"
                                            },
                                            {
                                                type: 2,
                                                label: "Next",
                                                style: ButtonStyleTypes.PRIMARY,
                                                custom_id: "next2"
                                            }
                                        ]
                                    }
                                ]
                            })
                        })
                    })
                }
                case "next2": {
                    await fetch(`https://discord.com/api/v10/interactions/${message.id}/${message.token}/callback`, {
                        method: "POST",
                        headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                        body: JSON.stringify({
                            type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE,
                            data: {
                                flags: InteractionResponseFlags.EPHEMERAL
                            }
                        })
                    })
                    let languages = []
                    for (let c = 0; c < runtimes.length; c++) {
                        languages.push({ name: `Language: ${runtimes[c].language}`, value: `Version: ${runtimes[c].version}`, inline: true })
                    }
                    return response.send({
                        content: await fetch(`https://discord.com/api/v10/webhooks/${process.env.ID}/${message.token}/messages/${message.message.id}`, {
                            method: "PATCH",
                            headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                            body: JSON.stringify({
                                embeds: [
                                    {
                                        color: 0x607387,
                                        title: "Supported Languages",
                                        description: `Total languages: ${runtimes.length}`,
                                        fields: languages.slice(50, 75)
                                    }
                                ],
                                components: [
                                    {
                                        type: 1,
                                        components: [
                                            {
                                                type: 2,
                                                label: "Previous",
                                                style: ButtonStyleTypes.PRIMARY,
                                                custom_id: "previous3"
                                            },
                                            {
                                                type: 2,
                                                label: "Next",
                                                style: ButtonStyleTypes.PRIMARY,
                                                custom_id: "next3"
                                            }
                                        ]
                                    }
                                ]
                            })
                        })
                    })
                }
                case "next3": {
                    await fetch(`https://discord.com/api/v10/interactions/${message.id}/${message.token}/callback`, {
                        method: "POST",
                        headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                        body: JSON.stringify({
                            type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE,
                            data: {
                                flags: InteractionResponseFlags.EPHEMERAL
                            }
                        })
                    })
                    let languages = []
                    for (let c = 0; c < runtimes.length; c++) {
                        languages.push({ name: `Language: ${runtimes[c].language}`, value: `Version: ${runtimes[c].version}`, inline: true })
                    }
                    return response.send({
                        content: await fetch(`https://discord.com/api/v10/webhooks/${process.env.ID}/${message.token}/messages/${message.message.id}`, {
                            method: "PATCH",
                            headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                            body: JSON.stringify({
                                embeds: [
                                    {
                                        color: 0x607387,
                                        title: "Supported Languages",
                                        description: `Total languages: ${runtimes.length}`,
                                        fields: languages.slice(75)
                                    }
                                ],
                                components: [
                                    {
                                        type: 1,
                                        components: [
                                            {
                                                type: 2,
                                                label: "Previous",
                                                style: ButtonStyleTypes.PRIMARY,
                                                custom_id: "previous4"
                                            },
                                            {
                                                type: 2,
                                                label: "Next",
                                                style: ButtonStyleTypes.PRIMARY,
                                                custom_id: "next4",
                                                disabled: true
                                            }
                                        ]
                                    }
                                ]
                            })
                        })
                    })
                }
                case "previous2": {
                    await fetch(`https://discord.com/api/v10/interactions/${message.id}/${message.token}/callback`, {
                        method: "POST",
                        headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                        body: JSON.stringify({
                            type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE,
                            data: {
                                flags: InteractionResponseFlags.EPHEMERAL
                            }
                        })
                    })
                    let languages = []
                    for (let c = 0; c < runtimes.length; c++) {
                        languages.push({ name: `Language: ${runtimes[c].language}`, value: `Version: ${runtimes[c].version}`, inline: true })
                    }
                    return response.send({
                        content: await fetch(`https://discord.com/api/v10/webhooks/${process.env.ID}/${message.token}/messages/${message.message.id}`, {
                            method: "PATCH",
                            headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                            body: JSON.stringify({
                                embeds: [
                                    {
                                        color: 0x607387,
                                        title: "Supported Languages",
                                        description: `Total languages: ${runtimes.length}`,
                                        fields: languages.slice(0, 25)
                                    }
                                ],
                                components: [
                                    {
                                        type: 1,
                                        components: [
                                            {
                                                type: 2,
                                                label: "Previous",
                                                style: ButtonStyleTypes.PRIMARY,
                                                custom_id: "previous1",
                                                disabled: true
                                            },
                                            {
                                                type: 2,
                                                label: "Next",
                                                style: ButtonStyleTypes.PRIMARY,
                                                custom_id: "next1"
                                            }
                                        ]
                                    }
                                ]
                            })
                        })
                    })
                }
                case "previous3": {
                    await fetch(`https://discord.com/api/v10/interactions/${message.id}/${message.token}/callback`, {
                        method: "POST",
                        headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                        body: JSON.stringify({
                            type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE,
                            data: {
                                flags: InteractionResponseFlags.EPHEMERAL
                            }
                        })
                    })
                    let languages = []
                    for (let c = 0; c < runtimes.length; c++) {
                        languages.push({ name: `Language: ${runtimes[c].language}`, value: `Version: ${runtimes[c].version}`, inline: true })
                    }
                    return response.send({
                        content: await fetch(`https://discord.com/api/v10/webhooks/${process.env.ID}/${message.token}/messages/${message.message.id}`, {
                            method: "PATCH",
                            headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                            body: JSON.stringify({
                                embeds: [
                                    {
                                        color: 0x607387,
                                        title: "Supported Languages",
                                        description: `Total languages: ${runtimes.length}`,
                                        fields: languages.slice(25, 50)
                                    }
                                ],
                                components: [
                                    {
                                        type: 1,
                                        components: [
                                            {
                                                type: 2,
                                                label: "Previous",
                                                style: ButtonStyleTypes.PRIMARY,
                                                custom_id: "previous2"
                                            },
                                            {
                                                type: 2,
                                                label: "Next",
                                                style: ButtonStyleTypes.PRIMARY,
                                                custom_id: "next2"
                                            }
                                        ]
                                    }
                                ]
                            })
                        })
                    })
                }
                case "previous4": {
                    await fetch(`https://discord.com/api/v10/interactions/${message.id}/${message.token}/callback`, {
                        method: "POST",
                        headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                        body: JSON.stringify({
                            type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE,
                            data: {
                                flags: InteractionResponseFlags.EPHEMERAL
                            }
                        })
                    })
                    let languages = []
                    for (let c = 0; c < runtimes.length; c++) {
                        languages.push({ name: `Language: ${runtimes[c].language}`, value: `Version: ${runtimes[c].version}`, inline: true })
                    }
                    return response.send({
                        content: await fetch(`https://discord.com/api/v10/webhooks/${process.env.ID}/${message.token}/messages/${message.message.id}`, {
                            method: "PATCH",
                            headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                            body: JSON.stringify({
                                embeds: [
                                    {
                                        color: 0x607387,
                                        title: "Supported Languages",
                                        description: `Total languages: ${runtimes.length}`,
                                        fields: languages.slice(50, 75)
                                    }
                                ],
                                components: [
                                    {
                                        type: 1,
                                        components: [
                                            {
                                                type: 2,
                                                label: "Previous",
                                                style: ButtonStyleTypes.PRIMARY,
                                                custom_id: "previous3"
                                            },
                                            {
                                                type: 2,
                                                label: "Next",
                                                style: ButtonStyleTypes.PRIMARY,
                                                custom_id: "next3"
                                            }
                                        ]
                                    }
                                ]
                            })
                        })
                    })
                }
            }
            if (message.data.custom_id.split(" - ")[0] === "edit") {
                if ((message.member?.user.id || message.user.id) != message.data.custom_id.split(" - ")[1]) {
                    return response.send({
                        content: await fetch(`https://discord.com/api/v10/interactions/${message.id}/${message.token}/callback`, {
                            method: "POST",
                            headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                            body: JSON.stringify({
                                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                                data: {
                                    content: "❌ You can't do this",
                                    flags: InteractionResponseFlags.EPHEMERAL
                                }
                            })
                        })
                    })
                }
                return response.send({
                    content: await fetch(`https://discord.com/api/v10/interactions/${message.id}/${message.token}/callback`, {
                        method: "POST",
                        headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                        body: JSON.stringify({
                            type: InteractionResponseType.MODAL,
                            data: {
                                title: "Run Code",
                                custom_id: "runedit",
                                components: [
                                    {
                                        type: 1,
                                        components: [
                                            {
                                                type: 4,
                                                label: "Language",
                                                style: TextStyleTypes.SHORT,
                                                custom_id: "language",
                                                required: true,
                                                min_length: 1,
                                                max_length: 10
                                            }
                                        ]
                                    },
                                    {
                                        type: 1,
                                        components: [
                                            {
                                                type: 4,
                                                label: "Code",
                                                style: TextStyleTypes.PARAGRAPH,
                                                custom_id: "code",
                                                required: true,
                                                min_length: 5
                                            }
                                        ]
                                    },
                                    {
                                        type: 1,
                                        components: [
                                            {
                                                type: 4,
                                                label: "Input",
                                                style: TextStyleTypes.PARAGRAPH,
                                                custom_id: "input",
                                                required: false,
                                                placeholder: "(separate with a new line)"
                                            }
                                        ]
                                    },
                                    {
                                        type: 1,
                                        components: [
                                            {
                                                type: 4,
                                                label: "Packages (python only)",
                                                style: TextStyleTypes.PARAGRAPH,
                                                custom_id: "packages",
                                                required: false,
                                                placeholder: "(separate with a new line)"
                                            }
                                        ]
                                    }
                                ]
                            }
                        })
                    })
                })
            }
            else if (message.data.custom_id.split(" - ")[0] === "delete") {
                if ((message.member?.user.id || message.user.id) != message.data.custom_id.split(" - ")[1]) {
                    return response.send({
                        content: await fetch(`https://discord.com/api/v10/interactions/${message.id}/${message.token}/callback`, {
                            method: "POST",
                            headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                            body: JSON.stringify({
                                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                                data: {
                                    content: "❌ You can't do this",
                                    flags: InteractionResponseFlags.EPHEMERAL
                                }
                            })
                        })
                    })
                }
                await fetch(`https://discord.com/api/v10/interactions/${message.id}/${message.token}/callback`, {
                    method: "POST",
                    headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                    body: JSON.stringify({
                        type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE
                    })
                })
                return response.send({
                    content: await fetch(`https://discord.com/api/v10/channels/${message.channel_id}/messages/${message.message.id}`, {
                        method: "DELETE",
                        headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" }
                    })
                })
            }
        }
        else if (message.type === InteractionType.MODAL_SUBMIT) {
            switch (message.data.custom_id) {
                case "run": {
                    await fetch(`https://discord.com/api/v10/interactions/${message.id}/${message.token}/callback`, {
                        method: "POST",
                        headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                        body: JSON.stringify({
                            type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE
                        })
                    })
                    let language = message.data.components[0].components[0].value.toLowerCase()
                    let code = message.data.components[1].components[0].value
                    let input = "" || message.data.components[2].components[0].value
                    let packages = "" || message.data.components[3].components[0].value
                    let version
                    let index
                    for (let i = 0; i < runtimes.length; i++) {
                        if (runtimes[i].aliases.length != 0) {
                            for (let c = 0; c < runtimes[i].aliases.length; c++) {
                                if (language == runtimes[i].language || language == runtimes[i].aliases[c]) {
                                    version = runtimes[i].version
                                    index = i
                                }
                            }
                        }
                        else {
                            if (language == runtimes[i].language) {
                                version = runtimes[i].version
                                index = i
                            }
                        }
                    }
                    if (version == undefined) {
                        return response.send({
                            content: await fetch(`https://discord.com/api/v10/webhooks/${process.env.ID}/${message.token}`, {
                                method: "POST",
                                headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    content: "Unknown Language!",
                                    flags: InteractionResponseFlags.EPHEMERAL
                                })
                            })
                        })
                    }
                    if (runtimes[index].language == "python") {
                        packages = packages.split("\n")
                        let imports = []
                        for (let i = 0; i < packages.length; i++) {
                            imports.push(`import ${packages[i]}`)
                        }
                        code = imports.join("\n") + "\n" + code
                    }
                    else if (runtimes[index].language == "go") {
                        if (code.includes("func main() {")) code = code
                        else {
                            code = "package main" + "\n" + "import \"fmt\"" + "\n" + "func main() {" + "\n" + "  " + code.replace(/\n/g, "\n  ") + "\n" + "}"
                        }
                    }
                    else if (runtimes[index].language == "rust") {
                        if (code.includes("fn main() {")) code = code
                        else {
                            code = "use std::io;" + "\n" + "fn main() {" + "\n" + "  " + code.replace(/\n/g, "\n  ") + "\n" + "}"
                        }
                    }
                    else if (runtimes[index].language == "c") {
                        if (code.includes("int main() {")) code = code
                        else {
                            code = "#include <stdio.h>" + "\n" + "int main() {" + "\n" + "  " + code.replace(/\n/g, "\n  ") + "\n" + "}"
                        }
                    }
                    else if (runtimes[index].language == "c++") {
                        if (code.includes("int main() {")) code = code
                        else {
                            code = "#include <iostream>" + "\n" + "using namespace std;" + "\n" + "int main() {" + "\n" + "  " + code.replace(/\n/g, "\n  ") + "\n" + "}"
                        }
                    }
                    else if (runtimes[index].language == "csharp") {
                        if (code.includes("static void Main(string[] args) {")) code = code
                        else {
                            code = "using System;" + "\n" + "class Program {" + "\n" + "  static void Main(string[] args) {" + "\n" + "    " + code.replace(/\n/g, "\n    ") + "\n" + "  }" + "\n" + "}"
                        }
                    }
                    else if (runtimes[index].language == "java") {
                        if (code.includes("public static void Main(string[] args) {")) code = code
                        else {
                            code = "public class Main {" + "\n" + "  public static void main(String[] args) {" + "\n" + "    " + code.replace(/\n/g, "\n    ") + "\n" + "  }" + "\n" + "}"
                        }
                    }
                    else if (runtimes[index].language == "kotlin") {
                        if (code.includes("fun main() {")) code = code
                        else {
                            code = "fun main() {" + "\n" + "  " + code.replace(/\n/g, "\n  ") + "\n" + "}"
                        }
                    }
                    let start = Date.now()
                    let result = await fetch("https://emkc.org/api/v2/piston/execute", {
                        method: "POST",
                        body: JSON.stringify({
                            "language": language,
                            "version": "*",
                            "files": [{
                                "content": code
                            }],
                            "stdin": input,
                            "args": input.split("\n")
                        })
                    })
                    result = await result.json()
                    let end = Date.now()
                    let runembed = {
                        color: 0x607387,
                        title: "Evaluation Result",
                        fields: [
                            { name: "Language", value: "```" + "\n" + runtimes[index].language + "\n" + "```", inline: false },
                            { name: "Version", value: "```" + "\n" + version + "\n" + "```", inline: false },
                            { name: "Input", value: "```" + runtimes[index].language + "\n" + code.slice(0, 925).replace(/`/g, "`\u200b") + "\n" + "```", inline: false },
                            { name: "Output", value: "```" + runtimes[index].language + "\n" + result.run.output.slice(0, 925).replace(/`/g, "`\u200b") + "\n" + "```", inline: false },
                            { name: "Output code", value: "```" + "\n" + result.run.code + "\n" + "```", inline: false }
                        ],
                        footer: {
                            text: `The code took ${parseFloat(end - start).toFixed(0)}ms to be executed`
                        }
                    }
                    if (input) {
                        runembed.fields.push({ name: "Input from user", value: "```" + "\n" + input + "\n" + "```", inline: false })
                    }
                    if (packages && runtimes[index].language == "python") {
                        runembed.fields.push({ name: "Packages", value: "```" + "\n" + packages.toString().replace(/,/g, "\n") + "\n" + "```", inline: false })
                    }
                    if (code.length > 925) {
                        runembed = {
                            color: 0x607387,
                            title: "Evaluation Result",
                            fields: [
                                { name: "Language", value: "```" + "\n" + runtimes[index].language + "\n" + "```", inline: false },
                                { name: "Version", value: "```" + "\n" + version + "\n" + "```", inline: false },
                                { name: "Input", value: "```" + runtimes[index].language + "\n" + code.slice(0, 925).replace(/`/g, "`\u200b") + "\n" + "```" + "**__TOO LONG__**", inline: false },
                                { name: "Output", value: "```" + runtimes[index].language + "\n" + result.run.output.slice(0, 925).replace(/`/g, "`\u200b") + "\n" + "```", inline: false },
                                { name: "Output code", value: "```" + "\n" + result.run.code + "\n" + "```", inline: false }
                            ],
                            footer: {
                                text: `The code took ${parseFloat(end - start).toFixed(0)}ms to be executed`
                            }
                        }
                    }
                    if (result.run.output.length > 925) {
                        let url = await fetch("https://dpaste.com/api/v2/", {
                            method: "POST",
                            headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "EvalBot" },
                            body: `title=Evaluation%20Result&content=${result.run.output}&expiry_days=365`
                        })
                        url = await url.text()
                        runembed = {
                            color: 0x607387,
                            title: "Evaluation Result",
                            fields: [
                                { name: "Language", value: "```" + "\n" + runtimes[index].language + "\n" + "```", inline: false },
                                { name: "Version", value: "```" + "\n" + version + "\n" + "```", inline: false },
                                { name: "Input", value: "```" + runtimes[index].language + "\n" + code.slice(0, 925).replace(/`/g, "`\u200b") + "\n" + "```", inline: false },
                                { name: "Output", value: "```" + runtimes[index].language + "\n" + result.run.output.slice(0, 925).replace(/`/g, "`\u200b") + "\n" + "```" + "**__TOO LONG__**" + "\n" + `view the entire output [here](${url})`, inline: false },
                                { name: "Output code", value: "```" + "\n" + result.run.code + "\n" + "```", inline: false }
                            ],
                            footer: {
                                text: `The code took ${parseFloat(end - start).toFixed(0)}ms to be executed`
                            }
                        }
                    }
                    if (code.length > 925 && result.run.output.length > 925) {
                        let url = await fetch("https://dpaste.com/api/v2/", {
                            method: "POST",
                            headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "EvalBot" },
                            body: `title=Evaluation%20Result&content=${result.run.output}&expiry_days=365`
                        })
                        url = await url.text()
                        runembed = {
                            color: 0x607387,
                            title: "Evaluation Result",
                            fields: [
                                { name: "Language", value: "```" + "\n" + runtimes[index].language + "\n" + "```", inline: false },
                                { name: "Version", value: "```" + "\n" + version + "\n" + "```", inline: false },
                                { name: "Input", value: "```" + runtimes[index].language + "\n" + code.slice(0, 925).replace(/`/g, "`\u200b") + "\n" + "```" + "**__TOO LONG__**", inline: false },
                                { name: "Output", value: "```" + runtimes[index].language + "\n" + result.run.output.slice(0, 925).replace(/`/g, "`\u200b") + "\n" + "```" + "**__TOO LONG__**" + "\n" + `view the entire output [here](${url})`, inline: false },
                                { name: "Output code", value: "```" + "\n" + result.run.code + "\n" + "```", inline: false }
                            ],
                            footer: {
                                text: `The code took ${parseFloat(end - start).toFixed(0)}ms to be executed`
                            }
                        }
                    }
                    if (result.run.output.length == 0 || result.run.output == "\n") {
                        runembed = {
                            color: 0x607387,
                            title: "Evaluation Result",
                            fields: [
                                { name: "Language", value: "```" + "\n" + runtimes[index].language + "\n" + "```", inline: false },
                                { name: "Version", value: "```" + "\n" + version + "\n" + "```", inline: false },
                                { name: "Input", value: "```" + runtimes[index].language + "\n" + code.slice(0, 925).replace(/`/g, "`\u200b") + "\n" + "```", inline: false },
                                { name: "Output", value: "No output!", inline: false },
                            ],
                            footer: {
                                text: `The code took ${parseFloat(end - start).toFixed(0)}ms to be executed`
                            }
                        }
                    }
                    if ((result.run.output.length == 0 || result.run.output == "\n") && code.length > 925) {
                        runembed = {
                            color: 0x607387,
                            title: "Evaluation Result",
                            fields: [
                                { name: "Language", value: "```" + "\n" + language + "\n" + "```", inline: false },
                                { name: "Version", value: "```" + "\n" + version + "\n" + "```", inline: false },
                                { name: "Input", value: "```" + language + "\n" + code.slice(0, 925).replace(/`/g, "`\u200b") + "\n" + "```" + "**__TOO LONG__**", inline: false },
                                { name: "Output", value: "No output!", inline: false },
                            ],
                            footer: {
                                text: `The code took ${parseFloat(end - start).toFixed(0)}ms to be executed`
                            }
                        }
                    }
                    return response.send({
                        content: await fetch(`https://discord.com/api/v10/webhooks/${process.env.ID}/${message.token}`, {
                            method: "POST",
                            headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                            body: JSON.stringify({
                                embeds: [runembed],
                                components: [
                                    {
                                        type: 1,
                                        components: [
                                            {
                                                type: 2,
                                                label: "Edit",
                                                style: ButtonStyleTypes.PRIMARY,
                                                custom_id: `edit - ${message.member?.user.id || message.user.id}`
                                            },
                                            {
                                                type: 2,
                                                label: "Delete",
                                                style: ButtonStyleTypes.DANGER,
                                                custom_id: `delete - ${message.member?.user.id || message.user.id}`
                                            }
                                        ]
                                    }
                                ]
                            })
                        })
                    })
                }
                case "runedit": {
                    await fetch(`https://discord.com/api/v10/interactions/${message.id}/${message.token}/callback`, {
                        method: "POST",
                        headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                        body: JSON.stringify({
                            type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE
                        })
                    })
                    let language = message.data.components[0].components[0].value.toLowerCase()
                    let code = message.data.components[1].components[0].value
                    let input = "" || message.data.components[2].components[0].value
                    let packages = "" || message.data.components[3].components[0].value
                    let version
                    let index
                    for (let i = 0; i < runtimes.length; i++) {
                        if (runtimes[i].aliases.length != 0) {
                            for (let c = 0; c < runtimes[i].aliases.length; c++) {
                                if (language == runtimes[i].language || language == runtimes[i].aliases[c]) {
                                    version = runtimes[i].version
                                    index = i
                                }
                            }
                        }
                        else {
                            if (language == runtimes[i].language) {
                                version = runtimes[i].version
                                index = i
                            }
                        }
                    }
                    if (version == undefined) {
                        return response.send({
                            content: await fetch(`https://discord.com/api/v10/webhooks/${process.env.ID}/${message.token}`, {
                                method: "POST",
                                headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    content: "Unknown Language!",
                                    flags: InteractionResponseFlags.EPHEMERAL
                                })
                            })
                        })
                    }
                    if (runtimes[index].language == "python") {
                        packages = packages.split("\n")
                        let imports = []
                        for (let i = 0; i < packages.length; i++) {
                            imports.push(`import ${packages[i]}`)
                        }
                        code = imports.join("\n") + "\n" + code
                    }
                    else if (runtimes[index].language == "go") {
                        if (code.includes("func main() {")) code = code
                        else {
                            code = "package main" + "\n" + "import \"fmt\"" + "\n" + "func main() {" + "\n" + "  " + code.replace(/\n/g, "\n  ") + "\n" + "}"
                        }
                    }
                    else if (runtimes[index].language == "rust") {
                        if (code.includes("fn main() {")) code = code
                        else {
                            code = "use std::io;" + "\n" + "fn main() {" + "\n" + "  " + code.replace(/\n/g, "\n  ") + "\n" + "}"
                        }
                    }
                    else if (runtimes[index].language == "c") {
                        if (code.includes("int main() {")) code = code
                        else {
                            code = "#include <stdio.h>" + "\n" + "int main() {" + "\n" + "  " + code.replace(/\n/g, "\n  ") + "\n" + "}"
                        }
                    }
                    else if (runtimes[index].language == "c++") {
                        if (code.includes("int main() {")) code = code
                        else {
                            code = "#include <iostream>" + "\n" + "using namespace std;" + "\n" + "int main() {" + "\n" + "  " + code.replace(/\n/g, "\n  ") + "\n" + "}"
                        }
                    }
                    else if (runtimes[index].language == "csharp") {
                        if (code.includes("static void Main(string[] args) {")) code = code
                        else {
                            code = "using System;" + "\n" + "class Program {" + "\n" + "  static void Main(string[] args) {" + "\n" + "    " + code.replace(/\n/g, "\n    ") + "\n" + "  }" + "\n" + "}"
                        }
                    }
                    else if (runtimes[index].language == "java") {
                        if (code.includes("public static void Main(string[] args) {")) code = code
                        else {
                            code = "public class Main {" + "\n" + "  public static void main(String[] args) {" + "\n" + "    " + code.replace(/\n/g, "\n    ") + "\n" + "  }" + "\n" + "}"
                        }
                    }
                    else if (runtimes[index].language == "kotlin") {
                        if (code.includes("fun main() {")) code = code
                        else {
                            code = "fun main() {" + "\n" + "  " + code.replace(/\n/g, "\n  ") + "\n" + "}"
                        }
                    }
                    let start = Date.now()
                    let result = await fetch("https://emkc.org/api/v2/piston/execute", {
                        method: "POST",
                        body: JSON.stringify({
                            "language": language,
                            "version": "*",
                            "files": [{
                                "content": code
                            }],
                            "stdin": input,
                            "args": input.split("\n")
                        })
                    })
                    result = await result.json()
                    let end = Date.now()
                    let runembed = {
                        color: 0x607387,
                        title: "Evaluation Result",
                        fields: [
                            { name: "Language", value: "```" + "\n" + runtimes[index].language + "\n" + "```", inline: false },
                            { name: "Version", value: "```" + "\n" + version + "\n" + "```", inline: false },
                            { name: "Input", value: "```" + runtimes[index].language + "\n" + code.slice(0, 925).replace(/`/g, "`\u200b") + "\n" + "```", inline: false },
                            { name: "Output", value: "```" + runtimes[index].language + "\n" + result.run.output.slice(0, 925).replace(/`/g, "`\u200b") + "\n" + "```", inline: false },
                            { name: "Output code", value: "```" + "\n" + result.run.code + "\n" + "```", inline: false }
                        ],
                        footer: {
                            text: `The code took ${parseFloat(end - start).toFixed(0)}ms to be executed`
                        }
                    }
                    if (input) {
                        runembed.fields.push({ name: "Input from user", value: "```" + "\n" + input + "\n" + "```", inline: false })
                    }
                    if (packages && runtimes[index].language == "python") {
                        runembed.fields.push({ name: "Packages", value: "```" + "\n" + packages.toString().replace(/,/g, "\n") + "\n" + "```", inline: false })
                    }
                    if (code.length > 925) {
                        runembed = {
                            color: 0x607387,
                            title: "Evaluation Result",
                            fields: [
                                { name: "Language", value: "```" + "\n" + runtimes[index].language + "\n" + "```", inline: false },
                                { name: "Version", value: "```" + "\n" + version + "\n" + "```", inline: false },
                                { name: "Input", value: "```" + runtimes[index].language + "\n" + code.slice(0, 925).replace(/`/g, "`\u200b") + "\n" + "```" + "**__TOO LONG__**", inline: false },
                                { name: "Output", value: "```" + runtimes[index].language + "\n" + result.run.output.slice(0, 925).replace(/`/g, "`\u200b") + "\n" + "```", inline: false },
                                { name: "Output code", value: "```" + "\n" + result.run.code + "\n" + "```", inline: false }
                            ],
                            footer: {
                                text: `The code took ${parseFloat(end - start).toFixed(0)}ms to be executed`
                            }
                        }
                    }
                    if (result.run.output.length > 925) {
                        let url = await fetch("https://dpaste.com/api/v2/", {
                            method: "POST",
                            headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "EvalBot" },
                            body: `title=Evaluation%20Result&content=${result.run.output}&expiry_days=365`
                        })
                        url = await url.text()
                        runembed = {
                            color: 0x607387,
                            title: "Evaluation Result",
                            fields: [
                                { name: "Language", value: "```" + "\n" + runtimes[index].language + "\n" + "```", inline: false },
                                { name: "Version", value: "```" + "\n" + version + "\n" + "```", inline: false },
                                { name: "Input", value: "```" + runtimes[index].language + "\n" + code.slice(0, 925).replace(/`/g, "`\u200b") + "\n" + "```", inline: false },
                                { name: "Output", value: "```" + runtimes[index].language + "\n" + result.run.output.slice(0, 925).replace(/`/g, "`\u200b") + "\n" + "```" + "**__TOO LONG__**" + "\n" + `view the entire output [here](${url})`, inline: false },
                                { name: "Output code", value: "```" + "\n" + result.run.code + "\n" + "```", inline: false }
                            ],
                            footer: {
                                text: `The code took ${parseFloat(end - start).toFixed(0)}ms to be executed`
                            }
                        }
                    }
                    if (code.length > 925 && result.run.output.length > 925) {
                        let url = await fetch("https://dpaste.com/api/v2/", {
                            method: "POST",
                            headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "EvalBot" },
                            body: `title=Evaluation%20Result&content=${result.run.output}&expiry_days=365`
                        })
                        url = await url.text()
                        runembed = {
                            color: 0x607387,
                            title: "Evaluation Result",
                            fields: [
                                { name: "Language", value: "```" + "\n" + runtimes[index].language + "\n" + "```", inline: false },
                                { name: "Version", value: "```" + "\n" + version + "\n" + "```", inline: false },
                                { name: "Input", value: "```" + runtimes[index].language + "\n" + code.slice(0, 925).replace(/`/g, "`\u200b") + "\n" + "```" + "**__TOO LONG__**", inline: false },
                                { name: "Output", value: "```" + runtimes[index].language + "\n" + result.run.output.slice(0, 925).replace(/`/g, "`\u200b") + "\n" + "```" + "**__TOO LONG__**" + "\n" + `view the entire output [here](${url})`, inline: false },
                                { name: "Output code", value: "```" + "\n" + result.run.code + "\n" + "```", inline: false }
                            ],
                            footer: {
                                text: `The code took ${parseFloat(end - start).toFixed(0)}ms to be executed`
                            }
                        }
                    }
                    if (result.run.output.length == 0 || result.run.output == "\n") {
                        runembed = {
                            color: 0x607387,
                            title: "Evaluation Result",
                            fields: [
                                { name: "Language", value: "```" + "\n" + runtimes[index].language + "\n" + "```", inline: false },
                                { name: "Version", value: "```" + "\n" + version + "\n" + "```", inline: false },
                                { name: "Input", value: "```" + runtimes[index].language + "\n" + code.slice(0, 925).replace(/`/g, "`\u200b") + "\n" + "```", inline: false },
                                { name: "Output", value: "No output!", inline: false },
                            ],
                            footer: {
                                text: `The code took ${parseFloat(end - start).toFixed(0)}ms to be executed`
                            }
                        }
                    }
                    if ((result.run.output.length == 0 || result.run.output == "\n") && code.length > 925) {
                        runembed = {
                            color: 0x607387,
                            title: "Evaluation Result",
                            fields: [
                                { name: "Language", value: "```" + "\n" + language + "\n" + "```", inline: false },
                                { name: "Version", value: "```" + "\n" + version + "\n" + "```", inline: false },
                                { name: "Input", value: "```" + language + "\n" + code.slice(0, 925).replace(/`/g, "`\u200b") + "\n" + "```" + "**__TOO LONG__**", inline: false },
                                { name: "Output", value: "No output!", inline: false },
                            ],
                            footer: {
                                text: `The code took ${parseFloat(end - start).toFixed(0)}ms to be executed`
                            }
                        }
                    }
                    return response.send({
                        content: await fetch(`https://discord.com/api/v10/webhooks/${process.env.ID}/${message.token}/messages/${message.message.id}`, {
                            method: "PATCH",
                            headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                            body: JSON.stringify({
                                embeds: [runembed],
                                components: [
                                    {
                                        type: 1,
                                        components: [
                                            {
                                                type: 2,
                                                label: "Edit",
                                                style: ButtonStyleTypes.PRIMARY,
                                                custom_id: `edit - ${message.member?.user.id || message.user.id}`
                                            },
                                            {
                                                type: 2,
                                                label: "Delete",
                                                style: ButtonStyleTypes.DANGER,
                                                custom_id: `delete - ${message.member?.user.id || message.user.id}`
                                            }
                                        ]
                                    }
                                ]
                            })
                        })
                    })
                }
            }
        }
    }
}