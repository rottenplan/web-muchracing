const axios = require('axios');

const API_URL = 'http://localhost:3000/api/device/live';
const CREDENTIALS = Buffer.from('faisalmuchdas:yourpassword').toString('base64'); // Replace with actual password if testing local

async function simulate() {
    let lat = -6.535;
    let lng = 106.858;
    let speed = 0;
    let rpm = 1000;

    console.log('🚀 Starting Telemetry Simulation...');

    setInterval(async () => {
        // Mock some movement
        speed = 50 + Math.random() * 20;
        rpm = 3000 + Math.random() * 500;
        lat += 0.0001;
        lng += 0.0001;

        try {
            const res = await axios.post(API_URL, {
                lat,
                lng,
                speed,
                rpm,
                sats: 12,
                bat_v: 3.9,
                bat_p: 85
            }, {
                headers: {
                    'Authorization': `Basic ${CREDENTIALS}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log(`✅ Sent: Speed=${speed.toFixed(1)} KMH | RPM=${Math.round(rpm)} | Status=${res.status}`);
        } catch (err) {
            console.error('❌ Error sending telemetry:', err.message);
        }
    }, 1000);
}

// simulate();
console.log('Script created. Update CREDENTIALS and run with: node scripts/simulate-telemetry.js');
