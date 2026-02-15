import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        maxlength: [60, 'Name cannot be more than 60 characters'],
    },
    username: {
        type: String,
        required: [true, 'Please provide a username'],
        unique: true,
        trim: true,
        maxlength: [30, 'Username cannot be more than 30 characters'],
        validate: {
            validator: function (v: string) {
                return /^[a-zA-Z0-9_.]+$/.test(v);
            },
            message: 'Username can only contain letters, numbers, underscores, and dots.'
        }
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        maxlength: [100, 'Email cannot be more than 100 characters'],
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationCode: {
        type: String,
    },
    codeExpires: {
        type: Number, // Timestamp
    },
    authToken: {
        type: String, // For session persistence
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    // Device Settings (Synced from ESP32)
    settings: {
        units: { type: String, default: 'kmh' },
        temperature: { type: String, default: 'celsius' },
        gnss: { type: String, default: 'gps' },
        brightness: { type: Number, default: 50 },
        powerSave: { type: Number, default: 5 },
        contrast: { type: Number, default: 50 }
    },
    tracks: {
        countries: { type: [String], default: ['Indonesia'] },
        trackCount: { type: Number, default: 0 }
    },
    engines: [{
        id: Number,
        name: String,
        hours: Number
    }],
    activeEngine: { type: Number, default: 1 },
    liveStatus: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 },
        speed: { type: Number, default: 0 },
        rpm: { type: Number, default: 0 },
        sats: { type: Number, default: 0 },
        bat_v: { type: Number, default: 0 },
        bat_p: { type: Number, default: 0 },
        is_live: { type: Boolean, default: false },
        lastUpdate: { type: Date }
    }
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
