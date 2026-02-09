'use client';

import dynamic from "next/dynamic";

const TrackCreatorMap = dynamic(() => import("./TrackCreatorMap"), {
    ssr: false,
});

interface TrackCreatorMapProps {
    points: { lat: number; lng: number }[];
    sectors: { lat: number; lng: number }[];
    onPointAdd: (lat: number, lng: number) => void;
}

export default function TrackCreatorMapWrapper(props: TrackCreatorMapProps) {
    return <TrackCreatorMap {...props} />;
}
