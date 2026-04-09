const express = require('express');
const app = express();

app.get('/log', (req, res) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip || 'Unknown';
    
    const data = {
        time: new Date().toISOString(),
        userId: req.query.userId,
        playerName: req.query.playerName,
        placeId: req.query.placeId,
        ip: ip,
        userAgent: req.get('User-Agent')
    };
    
    console.log('PLAYER:', data);
    
    res.send('OK');
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on ${port}`));
