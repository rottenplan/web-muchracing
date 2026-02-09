
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const EMAIL = 'test@example.com';
const PASSWORD = 'password123';

async function test() {
    console.log('--- Starting GPX Download Test ---');

    // 1. Login
    console.log('1. Logging in...');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD })
    });

    const loginData = await loginRes.json();
    if (!loginData.success) {
        console.error('Login Failed:', loginData);
        return;
    }

    const token = loginData.token;
    console.log('Login Success. Token:', token);
    const cookieHeader = `auth_token=${token}`;

    // 2. List Sessions
    console.log('2. Fetching Sessions...');
    const sessionsRes = await fetch(`${BASE_URL}/api/sessions`, {
        method: 'GET',
        headers: {
            'Cookie': cookieHeader
        }
    });

    if (!sessionsRes.ok) {
        console.error('Fetch Sessions Failed:', sessionsRes.status);
        return;
    }

    const sessionData = await sessionsRes.json();
    const sessions = sessionData.data || [];

    if (sessions.length === 0) {
        console.error('No sessions found. Please upload a session first using test-web-session.js');
        return;
    }

    const sessionId = sessions[0]._id;
    console.log(`Found ${sessions.length} sessions. Testing download for session ID: ${sessionId}`);

    // 3. Download GPX
    console.log('3. Downloading GPX...');
    const downloadRes = await fetch(`${BASE_URL}/api/sessions/${sessionId}/gpx`, {
        method: 'GET',
        headers: {
            'Cookie': cookieHeader
        }
    });

    if (downloadRes.ok) {
        const contentType = downloadRes.headers.get('content-type');
        const contentDisposition = downloadRes.headers.get('content-disposition');
        console.log('Response Headers:', { contentType, contentDisposition });

        const text = await downloadRes.text();
        console.log('GPX Content Preview (first 200 chars):');
        console.log(text.substring(0, 200));

        if (text.includes('<gpx') && text.includes('<trkpt')) {
            console.log('✅ GPX Validation Passed: Contains valid XML tags.');
        } else {
            console.error('❌ GPX Validation Failed: Invalid content.');
        }

    } else {
        console.error('Download Failed:', downloadRes.status, await downloadRes.text());
    }

    console.log('--- Test Complete ---');
}

test().catch(console.error);
