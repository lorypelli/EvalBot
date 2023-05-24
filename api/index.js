const { InteractionResponseType, InteractionType, verifyKey, MessageComponentTypes, ButtonStyleTypes, TextStyleTypes } = require("discord-interactions")
const getRawBody = require("raw-body")
const { version } = require("os")
const { ApplicationCommandTypes, ApplicationCommandOptionTypes, deferReply, updateDefer, showModal, followup, editFollowup, get } = require("serverless_bots_addons")
const mongoose = require("mongoose")
const snippets = require("./schemas/Snippet")
let url = `mongodb+srv://EvalBot:${process.env.PASSWORD}@evalbot.crs0qn4.mongodb.net/EvalBot?retryWrites=true&w=majority`
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
    }),
    type: ApplicationCommandTypes.CHAT_INPUT
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
    type: ApplicationCommandTypes.CHAT_INPUT
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
    type: ApplicationCommandTypes.CHAT_INPUT
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
    }),
    type: ApplicationCommandTypes.CHAT_INPUT
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
    type: ApplicationCommandTypes.CHAT_INPUT,
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
            type: ApplicationCommandOptionTypes.STRING,
            required: true
        }
    ]
}
const EVAL_CMD = {
    name: "eval",
    description: "Eval code (only developer)",
    type: ApplicationCommandTypes.CHAT_INPUT,
    options: [
        {
            name: "code",
            description: "The code to evaluate",
            type: ApplicationCommandOptionTypes.STRING,
            required: true
        }
    ]
}
const REGISTER_CMD = {
    name: "register",
    description: "Register slash commands (only developer)",
    type: ApplicationCommandTypes.CHAT_INPUT
}
const INFO_CMD = {
    name: "info",
    description: "Get bot info (only developer)",
    type: ApplicationCommandTypes.CHAT_INPUT
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
    type: ApplicationCommandTypes.CHAT_INPUT,
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
            type: ApplicationCommandOptionTypes.STRING,
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
            type: ApplicationCommandOptionTypes.NUMBER,
            required: true
        }
    ]
}
const SNIPPETS_CMD = {
    name: "snippets",
    name_localizations: ({
        it: "snippets",
        pl: "snippets"
    }),
    description: "View your snippets or another user snippets",
    description_localizations: ({
        it: "Visualizza i tuoi snippets o quelli di un altro utente",
        pl: "Zobacz snippets lub snippets innego użytkownika"
    }),
    type: ApplicationCommandTypes.CHAT_INPUT,
    options: [
        {
            name: "user",
            name_localizations: ({
                it: "utente",
                pl: "użytkownik"
            }),
            description: "The user of which you want to see snippets",
            description_localizations: ({
                it: "L'utente di cui vuoi vedere gli snippets",
                pl: "Użytkownik, którego chcesz zobaczyć snippets"
            }),
            type: ApplicationCommandOptionTypes.USER,
            required: false
        },
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
        let id = (process.env.TOKEN)?.split(".")[0]
        id = Buffer.from(id, "base64")
        if (id == "1077228141531123852" && (message.member?.user.id || message.user.id) != "604339998312890379") {
            await deferReply(message, { ephemeral: true })
            return response.send({
                content: await followup(message, {
                    content: "❌ You can't use <@1077228141531123852>, use <@1076200668810985634> instead"
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
                    await deferReply(message, { ephemeral: true })
                    let guilds = await fetch("https://discord.com/api/v10/users/@me/guilds", {
                        headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" }
                    })
                    guilds = await guilds.json()
                    return response.send({
                        content: await followup(message, {
                            content: `The bot is currently on **${guilds.length} servers**. Click the button below to invite the bot!`,
                            components: [
                                {
                                    type: MessageComponentTypes.ACTION_ROW,
                                    components: [
                                        {
                                            type: MessageComponentTypes.BUTTON,
                                            label: "Invite",
                                            style: ButtonStyleTypes.LINK,
                                            url: "https://discord.com/api/oauth2/authorize?client_id=1076200668810985634&permissions=274877975552&scope=bot%20applications.commands"
                                        }
                                    ]
                                }
                            ]
                        })
                    })
                }
                case VOTE_CMD.name: {
                    await deferReply(message, { ephemeral: true })
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
                        body: JSON.stringify([RUN_CMD, LANGS_CMD, INVITE_CMD, VOTE_CMD, SIZE_CMD, CONVERT_CMD, SNIPPETS_CMD])
                    })
                    return response.send({
                        content: await followup(message, {
                            components: [
                                {
                                    type: MessageComponentTypes.ACTION_ROW,
                                    components: [
                                        {
                                            type: MessageComponentTypes.BUTTON,
                                            label: "Vote",
                                            style: ButtonStyleTypes.LINK,
                                            url: "https://top.gg/bot/1076200668810985634/vote"
                                        }
                                    ]
                                }
                            ]
                        })
                    })
                }
                case LANGS_CMD.name: {
                    await deferReply(message, { ephemeral: true })
                    let languages = []
                    for (let c = 0; c < runtimes.length; c++) {
                        languages.push({ name: `Language: ${runtimes[c].language}`, value: `Version: ${runtimes[c].version}`, inline: true })
                    }
                    return response.send({
                        content: await followup(message, {
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
                                    type: MessageComponentTypes.ACTION_ROW,
                                    components: [
                                        {
                                            type: MessageComponentTypes.BUTTON,
                                            label: "",
                                            style: ButtonStyleTypes.PRIMARY,
                                            custom_id: "previous1",
                                            disabled: true,
                                            emoji: { name: "Arrow_Left", id: "1104480446076690493" }
                                        },
                                        {
                                            type: MessageComponentTypes.BUTTON,
                                            label: "",
                                            style: ButtonStyleTypes.PRIMARY,
                                            custom_id: "next1",
                                            emoji: { name: "Arrow_Right", id: "1104480448232570881" }
                                        }
                                    ]
                                }
                            ]
                        })
                    })
                }
                case RUN_CMD.name: {
                    return response.send({
                        content: await showModal(message, {
                            title: "Run Code",
                            custom_id: "run",
                            components: [
                                {
                                    type: MessageComponentTypes.ACTION_ROW,
                                    components: [
                                        {
                                            type: MessageComponentTypes.INPUT_TEXT,
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
                                    type: MessageComponentTypes.ACTION_ROW,
                                    components: [
                                        {
                                            type: MessageComponentTypes.INPUT_TEXT,
                                            label: "Code",
                                            style: TextStyleTypes.PARAGRAPH,
                                            custom_id: "code",
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
                                            label: "Input",
                                            style: TextStyleTypes.PARAGRAPH,
                                            custom_id: "input",
                                            required: false,
                                            placeholder: "(separate with a new line)"
                                        }
                                    ]
                                },
                                {
                                    type: MessageComponentTypes.ACTION_ROW,
                                    components: [
                                        {
                                            type: MessageComponentTypes.INPUT_TEXT,
                                            label: "Packages (python only)",
                                            style: TextStyleTypes.PARAGRAPH,
                                            custom_id: "packages",
                                            required: false,
                                            placeholder: "(separate with a new line)"
                                        }
                                    ]
                                }
                            ]
                        })
                    })
                }
                case SIZE_CMD.name: {
                    await deferReply(message, { ephemeral: false })
                    let package = get(message, "name")
                    let result = await fetch(`https://packagephobia.com/v2/api.json?p=${package}`)
                    if (result.status != 200) {
                        return response.send({
                            content: await followup(message, {
                                content: "There was an error, try again!",
                            })
                        })
                    }
                    result = await result.json()
                    return response.send({
                        content: await followup(message, {
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
                            ],
                            components: [
                                {
                                    type: MessageComponentTypes.ACTION_ROW,
                                    components: [
                                        {
                                            type: MessageComponentTypes.BUTTON,
                                            label: "",
                                            style: ButtonStyleTypes.PRIMARY,
                                            custom_id: `reload - ${package}`,
                                            emoji: { name: "Reload", id: "1104736112049659995" }
                                        }
                                    ]
                                }
                            ]
                        })
                    })
                }
                case EVAL_CMD.name: {
                    await deferReply(message, { ephemeral: true })
                    if ((message.member?.user.id || message.user.id) != "604339998312890379") {
                        return response.send({
                            content: await followup(message, {
                                content: "❌ You can't do this",
                            })
                        })
                    }
                    try {
                        let code = eval(get(message, "code").slice(0, 950))
                        return response.send({
                            content: await followup(message, {
                                content: "```js" + "\n" + JSON.stringify(code, null, 2) + "\n" + "```"
                            })
                        })
                    }
                    catch (e) {
                        return response.send({
                            content: await followup(message, {
                                content: "```js" + "\n" + e + "\n" + "```"
                            })
                        })
                    }
                }
                case REGISTER_CMD.name: {
                    await deferReply(message, { ephemeral: true })
                    if ((message.member?.user.id || message.user.id) != "604339998312890379") {
                        return response.send({
                            content: await followup(message, {
                                content: "❌ You can't do this",
                            })
                        })
                    }
                    await fetch(`https://discord.com/api/v10/applications/${process.env.ID}/commands`, {
                        method: "PUT",
                        headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                        body: JSON.stringify([RUN_CMD, LANGS_CMD, INVITE_CMD, VOTE_CMD, SIZE_CMD, CONVERT_CMD, SNIPPETS_CMD])
                    })
                    await fetch(`https://discord.com/api/v10/applications/${process.env.ID}/guilds/818058268978315286/commands`, {
                        method: "PUT",
                        headers: { "Authorization": `Bot ${process.env.TOKEN}`, "Content-Type": "application/json" },
                        body: JSON.stringify([EVAL_CMD, REGISTER_CMD, INFO_CMD])
                    })
                    return response.send({
                        content: await followup(message, {
                            content: "Done!"
                        })
                    })
                }
                case INFO_CMD.name: {
                    await deferReply(message, { ephemeral: true })
                    if ((message.member?.user.id || message.user.id) != "604339998312890379") {
                        return response.send({
                            content: await followup(message, {
                                content: "❌ You can't do this",
                            })
                        })
                    }
                    return response.send({
                        content: await followup(message, {
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
                }
                case CONVERT_CMD.name: {
                    await deferReply(message, { ephemeral: true })
                    let originalNumber = get(message, "number")
                    let system = get(message, "system")
                    let number
                    switch (system) {
                        case "Decimal to Binary": {
                            number = originalNumber.toString(2)
                            break
                        }
                        case "Binary to Decimal": {
                            if (originalNumber.toString().includes("2") || originalNumber.toString().includes("3") || originalNumber.toString().includes("4") || originalNumber.toString().includes("5") || originalNumber.toString().includes("6") || originalNumber.toString().includes("7") || originalNumber.toString().includes("8") || originalNumber.toString().includes("9")) {
                                return response.send({
                                    content: await followup(message, {
                                        content: "❌ The binary number isn't valid",
                                    })
                                })
                            }
                            number = parseInt(originalNumber, 2)
                            break
                        }
                    }
                    return response.send({
                        content: await followup(message, {
                            content: `The number \`${originalNumber}\` converted using the \`${system}\` system is \`${number}\``,
                        })
                    })
                }
                case SNIPPETS_CMD.name: {
                    await deferReply(message, { ephemeral: false })
                    let user = get(message, "user") || (message.member?.user.id || message.user.id)
                    await mongoose.connect(url)
                    let totalSnippets = await snippets.find({ userId: user })
                    let snippetsembed = {
                        color: 0x607387,
                        title: "Snippets",
                        description: `Total snippets: ${totalSnippets.length}`,
                        fields: [],
                        footer: {
                            text: "Only the latest snippet is showed because this command is still in beta"
                        }
                    }
                    for (let i = 0; i < totalSnippets.length; i++) {
                        snippetsembed.fields.push({ name: `Language: ${totalSnippets[i].language}`, value: "```" + totalSnippets[i].language + "\n" + totalSnippets[i].code.slice(0, 1024) + "\n" + "```", inline: false })
                    }
                    return response.send({
                        content: await followup(message, {
                            embeds: [snippetsembed]
                        })
                    })
                }
            }
        }
        else if (message.type === InteractionType.MESSAGE_COMPONENT) {
            switch (message.data.custom_id) {
                case "next1": {
                    await updateDefer(message, { ephemeral: true })
                    let languages = []
                    for (let c = 0; c < runtimes.length; c++) {
                        languages.push({ name: `Language: ${runtimes[c].language}`, value: `Version: ${runtimes[c].version}`, inline: true })
                    }
                    return response.send({
                        content: await editFollowup(message, {
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
                                    type: MessageComponentTypes.ACTION_ROW,
                                    components: [
                                        {
                                            type: MessageComponentTypes.BUTTON,
                                            label: "",
                                            style: ButtonStyleTypes.PRIMARY,
                                            custom_id: "previous2",
                                            emoji: { name: "Arrow_Left", id: "1104480446076690493" }
                                        },
                                        {
                                            type: MessageComponentTypes.BUTTON,
                                            label: "",
                                            style: ButtonStyleTypes.PRIMARY,
                                            custom_id: "next2",
                                            emoji: { name: "Arrow_Right", id: "1104480448232570881" }
                                        }
                                    ]
                                }
                            ]
                        })
                    })
                }
                case "next2": {
                    await updateDefer(message, { ephemeral: true })
                    let languages = []
                    for (let c = 0; c < runtimes.length; c++) {
                        languages.push({ name: `Language: ${runtimes[c].language}`, value: `Version: ${runtimes[c].version}`, inline: true })
                    }
                    return response.send({
                        content: await editFollowup(message, {
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
                                    type: MessageComponentTypes.ACTION_ROW,
                                    components: [
                                        {
                                            type: MessageComponentTypes.BUTTON,
                                            label: "",
                                            style: ButtonStyleTypes.PRIMARY,
                                            custom_id: "previous3",
                                            emoji: { name: "Arrow_Left", id: "1104480446076690493" }
                                        },
                                        {
                                            type: MessageComponentTypes.BUTTON,
                                            label: "",
                                            style: ButtonStyleTypes.PRIMARY,
                                            custom_id: "next3",
                                            emoji: { name: "Arrow_Right", id: "1104480448232570881" }
                                        }
                                    ]
                                }
                            ]
                        })
                    })
                }
                case "next3": {
                    await updateDefer(message, { ephemeral: true })
                    let languages = []
                    for (let c = 0; c < runtimes.length; c++) {
                        languages.push({ name: `Language: ${runtimes[c].language}`, value: `Version: ${runtimes[c].version}`, inline: true })
                    }
                    return response.send({
                        content: await editFollowup(message, {
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
                                    type: MessageComponentTypes.ACTION_ROW,
                                    components: [
                                        {
                                            type: MessageComponentTypes.BUTTON,
                                            label: "",
                                            style: ButtonStyleTypes.PRIMARY,
                                            custom_id: "previous4",
                                            emoji: { name: "Arrow_Left", id: "1104480446076690493" }
                                        },
                                        {
                                            type: MessageComponentTypes.BUTTON,
                                            label: "",
                                            style: ButtonStyleTypes.PRIMARY,
                                            custom_id: "next4",
                                            disabled: true,
                                            emoji: { name: "Arrow_Right", id: "1104480448232570881" }
                                        }
                                    ]
                                }
                            ]
                        })
                    })
                }
                case "previous2": {
                    await updateDefer(message, { ephemeral: true })
                    let languages = []
                    for (let c = 0; c < runtimes.length; c++) {
                        languages.push({ name: `Language: ${runtimes[c].language}`, value: `Version: ${runtimes[c].version}`, inline: true })
                    }
                    return response.send({
                        content: await editFollowup(message, {
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
                                    type: MessageComponentTypes.ACTION_ROW,
                                    components: [
                                        {
                                            type: MessageComponentTypes.BUTTON,
                                            label: "",
                                            style: ButtonStyleTypes.PRIMARY,
                                            custom_id: "previous1",
                                            disabled: true,
                                            emoji: { name: "Arrow_Left", id: "1104480446076690493" }
                                        },
                                        {
                                            type: MessageComponentTypes.BUTTON,
                                            label: "",
                                            style: ButtonStyleTypes.PRIMARY,
                                            custom_id: "next1",
                                            emoji: { name: "Arrow_Right", id: "1104480448232570881" }
                                        }
                                    ]
                                }
                            ]
                        })
                    })
                }
                case "previous3": {
                    await updateDefer(message, { ephemeral: true })
                    let languages = []
                    for (let c = 0; c < runtimes.length; c++) {
                        languages.push({ name: `Language: ${runtimes[c].language}`, value: `Version: ${runtimes[c].version}`, inline: true })
                    }
                    return response.send({
                        content: await editFollowup(message, {
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
                                    type: MessageComponentTypes.ACTION_ROW,
                                    components: [
                                        {
                                            type: MessageComponentTypes.BUTTON,
                                            label: "",
                                            style: ButtonStyleTypes.PRIMARY,
                                            custom_id: "previous2",
                                            emoji: { name: "Arrow_Left", id: "1104480446076690493" }
                                        },
                                        {
                                            type: MessageComponentTypes.BUTTON,
                                            label: "",
                                            style: ButtonStyleTypes.PRIMARY,
                                            custom_id: "next2",
                                            emoji: { name: "Arrow_Right", id: "1104480448232570881" }
                                        }
                                    ]
                                }
                            ]
                        })
                    })
                }
                case "previous4": {
                    await updateDefer(message, { ephemeral: true })
                    let languages = []
                    for (let c = 0; c < runtimes.length; c++) {
                        languages.push({ name: `Language: ${runtimes[c].language}`, value: `Version: ${runtimes[c].version}`, inline: true })
                    }
                    return response.send({
                        content: await editFollowup(message, {
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
                                    type: MessageComponentTypes.ACTION_ROW,
                                    components: [
                                        {
                                            type: MessageComponentTypes.BUTTON,
                                            label: "",
                                            style: ButtonStyleTypes.PRIMARY,
                                            custom_id: "previous3",
                                            emoji: { name: "Arrow_Left", id: "1104480446076690493" }
                                        },
                                        {
                                            type: MessageComponentTypes.BUTTON,
                                            label: "",
                                            style: ButtonStyleTypes.PRIMARY,
                                            custom_id: "next3",
                                            emoji: { name: "Arrow_Right", id: "1104480448232570881" }
                                        }
                                    ]
                                }
                            ]
                        })
                    })
                }
            }
            if (message.data.custom_id.split(" - ")[0] === "reload") {
                await updateDefer(message, { ephemeral: true })
                let result = await fetch(`https://packagephobia.com/v2/api.json?p=${message.data.custom_id.split(" - ")[1]}`)
                if (result.status != 200) {
                    return response.send({
                        content: await followup(message, {
                            content: "There was an error, try again!",
                        })
                    })
                }
                result = await result.json()
                return response.send({
                    content: await editFollowup(message, {
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
                        ],
                        components: [
                            {
                                type: MessageComponentTypes.ACTION_ROW,
                                components: [
                                    {
                                        type: MessageComponentTypes.BUTTON,
                                        label: "",
                                        style: ButtonStyleTypes.PRIMARY,
                                        custom_id: `reload - ${message.data.custom_id.split(" - ")[1]}`,
                                        emoji: { name: "Reload", id: "1104736112049659995" }
                                    }
                                ]
                            }
                        ]
                    })
                })
            }
            if (message.data.custom_id.split(" - ")[0] === "edit") {
                if ((message.member?.user.id || message.user.id) != message.data.custom_id.split(" - ")[1]) {
                    await deferReply(message, { ephemeral: true })
                    return response.send({
                        content: await followup(message, {
                            content: "❌ You can't do this",
                        })
                    })
                }
                await mongoose.connect(url)
                let originalSnippet = await snippets.findOne({ userId: message.member?.user.id || message.user.id })
                return response.send({
                    content: await showModal(message, {
                        title: "Run Code",
                        custom_id: "runedit",
                        components: [
                            {
                                type: MessageComponentTypes.ACTION_ROW,
                                components: [
                                    {
                                        type: MessageComponentTypes.INPUT_TEXT,
                                        label: "Language",
                                        style: TextStyleTypes.SHORT,
                                        custom_id: "language",
                                        required: true,
                                        min_length: 1,
                                        max_length: 10,
                                        value: "" || originalSnippet?.language
                                    }
                                ]
                            },
                            {
                                type: MessageComponentTypes.ACTION_ROW,
                                components: [
                                    {
                                        type: MessageComponentTypes.INPUT_TEXT,
                                        label: "Code",
                                        style: TextStyleTypes.PARAGRAPH,
                                        custom_id: "code",
                                        required: true,
                                        min_length: 5,
                                        value: "" || originalSnippet?.code
                                    }
                                ]
                            },
                            {
                                type: MessageComponentTypes.ACTION_ROW,
                                components: [
                                    {
                                        type: MessageComponentTypes.INPUT_TEXT,
                                        label: "Input",
                                        style: TextStyleTypes.PARAGRAPH,
                                        custom_id: "input",
                                        required: false,
                                        placeholder: "(separate with a new line)"
                                    }
                                ]
                            },
                            {
                                type: MessageComponentTypes.ACTION_ROW,
                                components: [
                                    {
                                        type: MessageComponentTypes.INPUT_TEXT,
                                        label: "Packages (python only)",
                                        style: TextStyleTypes.PARAGRAPH,
                                        custom_id: "packages",
                                        required: false,
                                        placeholder: "(separate with a new line)"
                                    }
                                ]
                            }
                        ]
                    })
                })
            }
            else if (message.data.custom_id.split(" - ")[0] === "delete") {
                if ((message.member?.user.id || message.user.id) != message.data.custom_id.split(" - ")[1]) {
                    await deferReply(message, { ephemeral: true })
                    return response.send({
                        content: await followup(message, {
                            content: "❌ You can't do this",
                        })
                    })
                }
                await updateDefer(message, { ephemeral: true })
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
                    await deferReply(message, { ephemeral: false })
                    let language = get(message, "language").toLowerCase()
                    let code = get(message, "code")
                    let input = "" || get(message, "input")
                    let packages = "" || get(message, "packages")
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
                            content: await followup(message, {
                                content: "Unknown Language!",
                            })
                        })
                    }
                    if (packages && runtimes[index].language == "python") {
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
                    if (input) {
                        runembed.fields.push({ name: "Input from user", value: "```" + "\n" + input + "\n" + "```", inline: false })
                    }
                    if (packages && runtimes[index].language == "python") {
                        runembed.fields.push({ name: "Packages", value: "```" + "\n" + packages.toString().replace(/,/g, "\n") + "\n" + "```", inline: false })
                    }
                    await mongoose.connect(url)
                    let userSnippets = snippets.find({ userId: message.member?.user.id || message.user.id })
                    if ((await userSnippets).length == 0) {
                        await snippets.create({ userId: message.member?.user.id || message.user.id, language: runtimes[index].language, code: code })
                    }
                    else {
                        await snippets.updateOne({ userId: message.member?.user.id || message.user.id }, { $set: { language: runtimes[index].language, code: code } })
                    }
                    return response.send({
                        content: await followup(message, {
                            embeds: [runembed],
                            components: [
                                {
                                    type: MessageComponentTypes.ACTION_ROW,
                                    components: [
                                        {
                                            type: MessageComponentTypes.BUTTON,
                                            label: "",
                                            style: ButtonStyleTypes.PRIMARY,
                                            custom_id: `edit - ${message.member?.user.id || message.user.id}`,
                                            emoji: { name: "Edit", id: "1104464874744074370" }
                                        },
                                        {
                                            type: MessageComponentTypes.BUTTON,
                                            label: "",
                                            style: ButtonStyleTypes.DANGER,
                                            custom_id: `delete - ${message.member?.user.id || message.user.id}`,
                                            emoji: { name: "Delete", id: "1104477832308068352" }
                                        }
                                    ]
                                }
                            ]
                        })
                    })
                }
                case "runedit": {
                    await updateDefer(message, { ephemeral: true })
                    let language = get(message, "language").toLowerCase()
                    let code = get(message, "code")
                    let input = "" || get(message, "input")
                    let packages = "" || get(message, "packages")
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
                            content: await followup(message, {
                                content: "Unknown Language!",
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
                    if (input) {
                        runembed.fields.push({ name: "Input from user", value: "```" + "\n" + input + "\n" + "```", inline: false })
                    }
                    if (packages && runtimes[index].language == "python") {
                        runembed.fields.push({ name: "Packages", value: "```" + "\n" + packages.toString().replace(/,/g, "\n") + "\n" + "```", inline: false })
                    }
                    await mongoose.connect(url)
                    await snippets.updateOne({ userId: message.member?.user.id || message.user.id }, { $set: { language: runtimes[index].language, code: code } })
                    return response.send({
                        content: await editFollowup(message, {
                            embeds: [runembed],
                            components: [
                                {
                                    type: MessageComponentTypes.ACTION_ROW,
                                    components: [
                                        {
                                            type: MessageComponentTypes.BUTTON,
                                            label: "",
                                            style: ButtonStyleTypes.PRIMARY,
                                            custom_id: `edit - ${message.member?.user.id || message.user.id}`,
                                            emoji: { name: "Edit", id: "1104464874744074370" }
                                        },
                                        {
                                            type: MessageComponentTypes.BUTTON,
                                            label: "",
                                            style: ButtonStyleTypes.DANGER,
                                            custom_id: `delete - ${message.member?.user.id || message.user.id}`,
                                            emoji: { name: "Delete", id: "1104477832308068352" }
                                        }
                                    ]
                                }
                            ]
                        })
                    })
                }
            }
        }
    }
}