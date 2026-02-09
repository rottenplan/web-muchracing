
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const EMAIL = 'test@example.com';
const PASSWORD = 'password123';

async function test() {
    console.log('--- Starting Web Session Test ---');

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
        // Try registering?
        console.log('Attempting to register...');
        const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: EMAIL, password: PASSWORD, name: 'Test User' })
        });
        const regData = await regRes.json();
        console.log('Register Response:', regData);
        if (!regData.success) return;

        // Login again
        const loginRes2 = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: EMAIL, password: PASSWORD })
        });
        const loginData2 = await loginRes2.json();
        if (!loginData2.success) { console.error('Login Failed again'); return; }
        Object.assign(loginData, loginData2);
    }

    const token = loginData.token;
    console.log('Login Success. Token:', token);
    const cookieHeader = `auth_token=${token}`;

    // 2. Upload GPX
    console.log('2. Uploading GPX...');
    const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="TestScript">
  <trk>
    <name>Test Track via Script</name>
    <trkseg>
      <trkpt lat="-6.533" lon="106.85">
        <ele>200</ele>
        <time>2024-02-09T10:00:00Z</time>
        <extensions>
            <gpxtpx:TrackPointExtension>
                <gpxtpx:speed>10.5</gpxtpx:speed>
            </gpxtpx:TrackPointExtension>
        </extensions>
      </trkpt>
      <trkpt lat="-6.534" lon="106.851">
        <ele>201</ele>
        <time>2024-02-09T10:00:05Z</time>
        <extensions>
            <gpxtpx:TrackPointExtension>
                <gpxtpx:speed>12.5</gpxtpx:speed>
            </gpxtpx:TrackPointExtension>
        </extensions>
      </trkpt>
    </trkseg>
  </trk>
</gpx>`;

    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    let body = `--${boundary}\r\n`;
    body += 'Content-Disposition: form-data; name="file"; filename="test_script.gpx"\r\n';
    body += 'Content-Type: application/gpx+xml\r\n\r\n';
    body += gpxContent + '\r\n';
    body += `--${boundary}--\r\n`;

    const uploadRes = await fetch(`${BASE_URL}/api/upload/gpx`, {
        method: 'POST',
        headers: {
            'Cookie': cookieHeader,
            'Content-Type': `multipart/form-data; boundary=${boundary}`
        },
        body: body
    });

    if (uploadRes.status === 401) {
        console.error('Upload Failed: Unauthorized (Check cookie handling)');
    } else if (!uploadRes.ok) {
        console.error('Upload Failed:', uploadRes.status, await uploadRes.text());
    } else {
        const uploadData = await uploadRes.json();
        console.log('Upload Success:', uploadData);
    }

    // 3. List Sessions
    console.log('3. Fetching Sessions...');
    const sessionsRes = await fetch(`${BASE_URL}/api/sessions`, {
        method: 'GET',
        headers: {
            'Cookie': cookieHeader
        }
    });

    if (sessionsRes.ok) {
        const sessionData = await sessionsRes.json();
        console.log('Sessions Fetched:', sessionData.data.length);
        console.log('Latest Session:', sessionData.data[0]);
    } else {
        console.error('Fetch Sessions Failed:', sessionsRes.status, await sessionsRes.text());
    }

    console.log('--- Test Complete ---');
}

test().catch(console.error);
