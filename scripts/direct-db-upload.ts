import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Use same logic as API
function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3;
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Model Definitions (since we can't easily import from the app in a standalone script without more setup)
const pointSchema = new mongoose.Schema({
    time: String,
    lat: Number,
    lng: Number,
    speed: Number,
    rpm: Number
});

const sessionSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    name: String,
    originalFilename: String,
    startTime: Date,
    stats: {
        totalPoints: Number,
        maxSpeed: Number,
        avgSpeed: Number,
        maxRpm: Number,
        totalDistance: Number,
        lapCount: Number,
        bestLap: Number
    },
    points: [pointSchema],
    laps: [{
        lapNumber: Number,
        lapTime: Number,
        pointIndex: Number,
        valid: Boolean
    }]
});

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true },
    name: String
});

const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);

dotenv.config({ path: '.env.local' });

async function seed() {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGODB_URI is missing');

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const email = 'test_device@example.com';
    let user = await User.findOne({ email });
    if (!user) {
        console.log('Creating test user...');
        user = await User.create({ email, name: 'Test Device' });
    }

    const testDataDir = path.join(process.cwd(), 'public', 'test_data');
    const files = ['Sentul_Device_Dummy.csv', 'Drag_Device_Dummy.csv'];

    for (const filename of files) {
        const filePath = path.join(testDataDir, filename);
        if (!fs.existsSync(filePath)) {
            console.warn(`File not found: ${filePath}`);
            continue;
        }

        console.log(`Processing ${filename}...`);
        const csv_data = fs.readFileSync(filePath, 'utf8');
        const lines = csv_data.split('\n');
        const points: any[] = [];
        const laps: any[] = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line || line.startsWith('Time')) continue;

            const parts = line.split(',');
            if (line.startsWith('LAP,')) {
                laps.push({
                    lapNumber: parseInt(parts[1]),
                    lapTime: parseFloat(parts[2]) / 1000.0,
                    pointIndex: points.length - 1,
                    valid: true
                });
                continue;
            }

            if (parts.length >= 5 && !isNaN(parseFloat(parts[0]))) {
                points.push({
                    time: parts[0],
                    lat: parseFloat(parts[1]),
                    lng: parseFloat(parts[2]),
                    speed: parseFloat(parts[3]),
                    rpm: parseFloat(parts[4])
                });
            }
        }

        const maxSpeed = points.length > 0 ? Math.max(...points.map(p => p.speed)) : 0;
        const avgSpeed = points.length > 0 ? points.reduce((acc, p) => acc + p.speed, 0) / points.length : 0;
        const maxRpm = points.length > 0 ? Math.max(...points.map(p => p.rpm)) : 0;

        let totalDistance = 0;
        for (let j = 1; j < points.length; j++) {
            const p1 = points[j - 1];
            const p2 = points[j];
            const d = haversine(p1.lat, p1.lng, p2.lat, p2.lng);
            if (d < 1) totalDistance += d;
        }

        const bestLap = laps.length > 0 ? Math.min(...laps.map(l => l.lapTime)) : 0;

        await Session.create({
            userId: user._id,
            name: filename.replace('.csv', ''),
            originalFilename: filename,
            startTime: (() => {
                if (points.length === 0) return new Date();
                const ts = parseInt(points[0].time);
                if (isNaN(ts) || ts < 946684800000) return new Date();
                return new Date(ts);
            })(),
            stats: {
                totalPoints: points.length,
                maxSpeed,
                avgSpeed,
                maxRpm,
                totalDistance: totalDistance / 1000.0,
                lapCount: laps.length,
                bestLap
            },
            points,
            laps
        });

        console.log(`✅ Session ${filename} seeded!`);
    }

    await mongoose.disconnect();
    console.log('Done!');
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
