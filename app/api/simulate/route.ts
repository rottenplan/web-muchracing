import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET() {
    try {
        await dbConnect();

        // Find the first user
        const user = await User.findOne({});
        if (!user) {
            return NextResponse.json({ error: 'No user found' }, { status: 404 });
        }

        console.log(`Starting simulation for user: ${user.email}`);

        // Simulation parameters
        const duration = 60000; // 60 seconds
        const interval = 1000; // 1 second
        const steps = duration / interval;

        let counter = 0;

        // Run simulation in background (fire and forget from request perspective)
        (async () => {
            for (let i = 0; i < steps; i++) {
                try {
                    // Sine wave simulation
                    const time = Date.now() / 1000;
                    const speed = 50 + Math.sin(time) * 30; // 20-80 km/h
                    const rpm = 8000 + Math.sin(time * 2) * 3000; // 5000-11000 RPM
                    const lat = -6.200000 + (Math.sin(time / 10) * 0.001);
                    const lon = 106.816666 + (Math.cos(time / 10) * 0.001);

                    user.liveStatus = {
                        lat: lat,
                        lng: lon,
                        speed: Math.max(0, speed),
                        rpm: Math.max(0, Math.floor(rpm)),
                        sats: 8,
                        bat_v: 4.1,
                        bat_p: 95,
                        is_live: true,
                        lastUpdate: new Date()
                    };

                    await user.save();
                    // console.log(`Simulated step ${i}: ${speed.toFixed(1)} km/h`);

                    await new Promise(resolve => setTimeout(resolve, interval));
                } catch (e) {
                    console.error('Simulation step error:', e);
                    break;
                }
            }
            console.log('Simulation finished');
        })();

        return NextResponse.json({ message: 'Simulation started for 60 seconds' });

    } catch (error) {
        console.error('Simulation Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
