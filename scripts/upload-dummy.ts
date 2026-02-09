import fs from 'fs';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const TEST_EMAIL = process.env.TEST_USER_EMAIL || 'test_device@example.com';
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || 'password123';

async function uploadFile(filepath: string) {
    const filename = path.basename(filepath);
    const content = fs.readFileSync(filepath, 'utf8');

    console.log(`Uploading ${filename} to ${API_URL}/api/device/sync...`);

    try {
        const response = await axios.post(`${API_URL}/api/device/sync`, {
            filename,
            content
        }, {
            auth: {
                username: TEST_EMAIL,
                password: TEST_PASSWORD
            }
        });

        if (response.data.success) {
            console.log(`✅ Successfully uploaded ${filename}`);
            console.log(`Session ID: ${response.data.sessionId}`);
        } else {
            console.error(`❌ Failed to upload ${filename}:`, response.data.message);
        }
    } catch (error: any) {
        if (error.code === 'ECONNREFUSED') {
            console.error(`❌ Error uploading ${filename}: Gagal terhubung ke ${API_URL}. Pastikan server Next.js Anda sudah berjalan (npm run dev).`);
        } else {
            console.error(`❌ Error uploading ${filename}:`, error.response?.data || error.message);
        }
    }
}

async function run() {
    const testDataDir = path.join(process.cwd(), 'public', 'test_data');
    const files = ['Sentul_Device_Dummy.csv', 'Drag_Device_Dummy.csv'];

    for (const file of files) {
        const fullPath = path.join(testDataDir, file);
        if (fs.existsSync(fullPath)) {
            await uploadFile(fullPath);
        } else {
            console.warn(`⚠️ File not found: ${fullPath}`);
        }
    }
}

run().catch(console.error);
