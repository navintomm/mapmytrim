'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Create a custom marker icon using SVG to avoid external asset blocking
const createMarkerIcon = () => {
    if (typeof window === 'undefined') return undefined;

    return L.divIcon({
        html: `
            <div class="relative flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 30 40" class="drop-shadow-lg">
                    <path fill="#4f46e5" stroke="#ffffff" stroke-width="2" d="M15,0 C6.7,0 0,6.7 0,15 C0,26.2 15,40 15,40 S30,26.2 30,15 C30,6.7 23.3,0 15,0 Z" />
                    <circle cx="15" cy="15" r="5" fill="#ffffff" />
                </svg>
            </div>
        `,
        className: 'custom-map-pin',
        iconSize: [30, 40],
        iconAnchor: [15, 40],
    });
};

const customIcon = createMarkerIcon();

interface MapProps {
    latitude: number;
    longitude: number;
    address?: string;
    className?: string;
}

// Component to update map center when props change
function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

export default function Map({ latitude, longitude, address, className = "h-64 w-full rounded-xl" }: MapProps) {
    const position: [number, number] = [latitude, longitude];

    return (
        <div className={`${className} overflow-hidden z-0`}>
            <MapContainer
                center={position}
                zoom={15}
                scrollWheelZoom={false}
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position} icon={customIcon}>
                    {address && <Popup>{address}</Popup>}
                </Marker>
                <MapUpdater center={position} />
            </MapContainer>
        </div>
    );
}
