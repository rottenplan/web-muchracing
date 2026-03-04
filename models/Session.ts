import mongoose, { Document } from 'mongoose';

export interface ISession extends Document {
    userId: mongoose.Types.ObjectId;
    deviceId?: string;
    name?: string;
    originalFilename?: string;
    startTime: Date;
    endTime?: Date;
    trackId?: mongoose.Types.ObjectId;
    sessionType: 'TRACK' | 'DRAG';
    stats: {
        totalDistance?: number;
        maxSpeed?: number;
        avgSpeed?: number;
        maxRpm?: number;
        totalTime?: number;
        lapCount?: number;
        bestLap?: number;
        time0to60?: number;
        time0to100?: number;
        time100to200?: number;
        time400m?: number;
    };
    laps: Array<{
        lapNumber: number;
        lapTime: number;
        pointIndex?: number;
        S1?: number;
        S2?: number;
        S3?: number;
        valid?: boolean;
    }>;
    videoUrl?: string;
    createdAt: Date;
}

const SessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    deviceId: {
        type: String, // Optional: if we want to track specific devices
    },
    name: {
        type: String, // e.g. "Sentul Session 1"
    },
    originalFilename: {
        type: String,
    },
    startTime: {
        type: Date,
        default: Date.now,
    },
    endTime: {
        type: Date,
    },
    trackId: {
        type: mongoose.Schema.Types.ObjectId, // Future use: link to a Track
        ref: 'Track',
    },
    sessionType: {
        type: String,
        enum: ['TRACK', 'DRAG'],
        default: 'TRACK',
    },
    stats: {
        totalDistance: Number, // km
        maxSpeed: Number,
        avgSpeed: Number,
        maxRpm: Number,
        totalTime: Number, // seconds
        lapCount: Number,
        bestLap: Number, // seconds
        // Drag Metrics
        time0to60: Number,
        time0to100: Number,
        time100to200: Number,
        time400m: Number,
    },
    laps: [{
        lapNumber: Number,
        lapTime: Number, // seconds
        pointIndex: Number, // Still kept for backward/metadata mapping
        S1: Number,
        S2: Number,
        S3: Number,
        valid: Boolean,
    }],
    videoUrl: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Session || mongoose.model('Session', SessionSchema);
