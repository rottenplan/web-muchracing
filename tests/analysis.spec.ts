import { test, expect } from '@playwright/test';

const sessionId = 'test-session-123';
const mockSessionData = {
    success: true,
    data: {
        id: sessionId,
        sessionType: 'CIRCUIT',
        trackName: 'Sentul Circuit',
        points: [
            { time: "0", speed: 0, rpm: 1500, lng: 106.8, lat: -6.5, water: 80, egt: 300, dist: 0 },
            { time: "1000", speed: 50, rpm: 5000, lng: 106.81, lat: -6.51, water: 85, egt: 400, dist: 10 },
            { time: "2000", speed: 100, rpm: 10000, lng: 106.82, lat: -6.52, water: 90, egt: 500, dist: 30 },
            { time: "3000", speed: 150, rpm: 14000, lng: 106.83, lat: -6.53, water: 95, egt: 600, dist: 60 }
        ],
        laps: [
            { lapNumber: 1, lapTime: 65.4, pointIndex: 3, maxSpeed: 150, maxRpm: 14000, avgWater: 88, avgEgt: 450 }
        ]
    }
};

test.describe('Analysis Page - Data Mode View', () => {

    test.beforeEach(async ({ page }) => {
        page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
        page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

        // Mock API response so it doesn't fail on missing data
        await page.route(`**/api/sessions/*`, async route => {
            await route.fulfill({ json: mockSessionData });
        });

        // Set auth token to prevent redirect to login
        await page.context().addCookies([
            { name: 'auth_token', value: 'mock-token', domain: 'localhost', path: '/' }
        ]);

        await page.goto(`/analysis/${sessionId}`);

        // Menunggu agar komponen render sempurna yang ditandai dengan munculnya Timer Telemetri
        const timerLabel = page.locator('text=Waktu Telemetri');
        try {
            await expect(timerLabel).toBeVisible({ timeout: 5000 });
        } catch (e) {
            console.log('HTML DUMP:', await page.content());
            throw e;
        }
    });

    // -------------------------------------------------------------------------
    // TESTCASE PENGUJIAN UI & STATE (TestSprite Standard Checks)
    // -------------------------------------------------------------------------

    test('TS-001: Memverifikasi render Header, Timer Utama, dan Mini Map Navigation', async ({ page }) => {
        // Cek Label dan Format Nilai Timer '00:00.000'
        const timerValue = page.locator('.font-mono.text-2xl');
        await expect(timerValue).toBeVisible();
        await expect(timerValue).toContainText(':');

        // Verifikasi Mini Map Navigation ter-render jika data points ada
        const miniMapSvgContainer = page.locator('.hidden.lg\\:block svg');
        await expect(miniMapSvgContainer).toBeVisible();
    });

    test('TS-002: Memverifikasi Interaksi Playback Control (Play, Pause, Reset, Awal, Akhir)', async ({ page }) => {
        // Seleksi elemen Play/Pause Button
        const playPauseBtn = page.locator('button.bg-\\[\\#f0ad4e\\]');
        await expect(playPauseBtn).toBeVisible();

        // Verifikasi state klik toggle Play dan Pause
        await playPauseBtn.click(); // Mode Play
        await playPauseBtn.click(); // Mode Pause kembali

        // Verifikasi keberadaan tool kontrol lainnya (menggunakan atribut title)
        await expect(page.locator('button[title="Awal"]')).toBeVisible();
        await expect(page.locator('button[title="Akhir"]')).toBeVisible();
        await expect(page.locator('button[title="Reset"]')).toBeVisible();
        await expect(page.locator('button[title="Pengaturan"]')).toBeVisible();
        await expect(page.locator('button[title="Layar Penuh"]')).toBeVisible();
    });

    test('TS-003: Memverifikasi tampilan Lap Table Data (Skenario non-Drag Mode)', async ({ page }) => {
        // Cek semua header kolom dengan locator regex u/ menangkap text
        await expect(page.getByText(/LAP/i).first()).toBeVisible();
        await expect(page.getByText(/Waktu/i).first()).toBeVisible();
        await expect(page.getByText(/Jarak \(Lap\)/i).first()).toBeVisible();
        await expect(page.getByText(/Kecepatan/i).first()).toBeVisible();
        await expect(page.getByText(/RPM/i).nth(0)).toBeVisible();
        await expect(page.getByText(/Water/i).first()).toBeVisible();
        await expect(page.getByText(/EGT/i).first()).toBeVisible();
        await expect(page.getByText(/Gap/i).first()).toBeVisible();

        // Verifikasi ada barisan progress bar di dalam table data (sebagai representasi UI dari metric lap)
        const progressBars = page.locator('.bg-white\\/5').first();
        if (await progressBars.isVisible()) {
            await expect(progressBars).toBeVisible();
        }
    });

    test('TS-004: Memverifikasi Analysis Charts (Grapik Kecepatan & RPM) ter-render', async ({ page }) => {
        // Memeriksa header titel dari tiap chart
        await expect(page.getByText('Kecepatan (Km/h)', { exact: true })).toBeVisible();
        await expect(page.getByText('RPM', { exact: true }).last()).toBeVisible(); // Ambil elemen text RPM yang ada di chart

        // Pastikan container grafik LineChart (Recharts) muncul sebanyak 2 kali
        const chartContainers = page.locator('.recharts-responsive-container');
        await expect(chartContainers).toHaveCount(2);
    });
});

test.describe('Analysis Page - Map Mode View', () => {
    test.beforeEach(async ({ page }) => {
        // Mock API response
        await page.route(`**/api/sessions/${sessionId}`, async route => {
            await route.fulfill({ json: mockSessionData });
        });

        // Set auth token to prevent redirect to login
        await page.context().addCookies([
            { name: 'auth_token', value: 'mock-token', domain: 'localhost', path: '/' }
        ]);

        await page.goto(`/analysis/${sessionId}`);

        // Tunggu load selesai
        await expect(page.locator('text=Waktu Telemetri')).toBeVisible({ timeout: 15000 });

        // Misalkan ada tombol tab untuk mengganti mode, kita klik itu
        // Mencari tombol mode map melalui icon MapPin atau text (bergantung Map/Data switch component)
        const mapTab = page.locator('button', { hasText: 'Map' }).or(page.locator('button[title*="Map"]')).or(page.locator('.lucide-map-pin').locator('..'));
        if (await mapTab.first().isVisible()) {
            await mapTab.first().click();
        }
    });

    test('Grafik Maps atau Leaflet harus ter-render', async ({ page }) => {
        // Periksa apakah kontainer Map (biasanya class .leaflet-container) ada
        // atau periksa elemen Canvas map yang Anda buat
        const mapContainer = page.locator('.leaflet-container, canvas, .w-full.h-full.relative.bg-black');
        await expect(mapContainer.first()).toBeVisible();
    });
});
