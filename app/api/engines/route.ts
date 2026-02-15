import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

// Helper to get user via Basic Auth (for device/internal access)
async function getAuthUser(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Basic ')) {
        const base64Credentials = authHeader.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [username, password] = credentials.split(':');

        const user = await User.findOne({
            $or: [
                { email: username.toLowerCase() },
                { username: username.toLowerCase() }
            ]
        });

        if (user) {
            let isMatch = false;
            try {
                isMatch = await bcrypt.compare(password, user.password);
            } catch (e) { }

            if (isMatch || user.password === password) return user;
        }
    }
    return null;
}

export async function GET(request: Request) {
    try {
        await dbConnect();

        // Try to authenticate
        const user = await getAuthUser(request) || await User.findOne({}); // Fallback for demo/dashboard

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        return NextResponse.json({
            success: true,
            engines: user.engines || [],
            activeEngine: user.activeEngine
        });

    } catch (error) {
        console.error('Engines GET error:', error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();

        const user = await getAuthUser(request) || await User.findOne({}); // Fallback
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const body = await request.json();

        // Action: ADD, UPDATE, DELETE, SET_ACTIVE
        const { action, id, name, hours } = body;

        if (action === 'ADD') {
            const newId = user.engines.length > 0 ? Math.max(...user.engines.map((e: any) => e.id)) + 1 : 1;
            user.engines.push({ id: newId, name, hours: parseFloat(hours) || 0 });
        } else if (action === 'UPDATE') {
            const engine = user.engines.find((e: any) => e.id === id);
            if (engine) {
                if (name) engine.name = name;
                if (hours !== undefined) engine.hours = parseFloat(hours);
            }
        } else if (action === 'DELETE') {
            user.engines = user.engines.filter((e: any) => e.id !== id);
        } else if (action === 'SET_ACTIVE') {
            user.activeEngine = id;
        }

        await user.save();

        return NextResponse.json({
            success: true,
            engines: user.engines,
            activeEngine: user.activeEngine
        });

    } catch (error) {
        console.error('Engines POST error:', error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
