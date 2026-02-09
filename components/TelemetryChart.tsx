'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = Array.from({ length: 100 }, (_, i) => ({
    distance: i * 50,
    speed: Math.sin(i / 10) * 50 + 100 + Math.random() * 10,
    rpm: Math.cos(i / 10) * 2000 + 6000 + Math.random() * 100,
}));

export default function TelemetryChart() {
    return (
        <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis
                        dataKey="distance"
                        stroke="#666"
                        tick={{ fill: '#666', fontSize: 10 }}
                        tickFormatter={(val) => `${(val / 1000).toFixed(1)}km`}
                    />
                    <YAxis
                        yAxisId="left"
                        stroke="#22c55e"
                        tick={{ fill: '#22c55e', fontSize: 10 }}
                        domain={[0, 250]}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#ef4444"
                        tick={{ fill: '#ef4444', fontSize: 10 }}
                        domain={[0, 10000]}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }}
                        itemStyle={{ fontSize: 12 }}
                        labelStyle={{ color: '#888', fontSize: 10, marginBottom: 5 }}
                    />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="speed"
                        stroke="#22c55e"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: '#fff' }}
                    />
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="rpm"
                        stroke="#ef4444"
                        strokeWidth={1.5}
                        dot={false}
                        opacity={0.7}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
