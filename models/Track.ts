import mongoose, { Schema, Document } from 'mongoose';

export interface ITrack extends Document {
    name: string;
    country: string;
    type: string;
    startLine: {
        lat: number;
        lng: number;
        bearing: number;
        width: number;
    };
    points: {
        lat: number;
        lng: number;
    }[];
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
}

const TrackSchema = new Schema<ITrack>({
    name: { type: String, required: true },
    country: { type: String, default: 'Unknown' },
    type: { type: String, default: 'Circuit' },
    startLine: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        bearing: { type: Number, required: true },
        width: { type: Number, required: true },
    },
    points: [{
        lat: Number,
        lng: Number
    }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.models.Track || mongoose.model<ITrack>('Track', TrackSchema);
