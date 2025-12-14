'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Crosshair } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { useMapEvents } from 'react-leaflet';

// Dynamically import Leaflet components
const MapContainer = dynamic(
    () => import('react-leaflet').then((mod) => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import('react-leaflet').then((mod) => mod.TileLayer),
    { ssr: false }
);
const Marker = dynamic(
    () => import('react-leaflet').then((mod) => mod.Marker),
    { ssr: false }
);
const Popup = dynamic(
    () => import('react-leaflet').then((mod) => mod.Popup),
    { ssr: false }
);

interface LocationPickerProps {
    initialLat?: number;
    initialLng?: number;
    onLocationSelect: (lat: number, lng: number) => void;
}



function MapEvents({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

export default function LocationPicker({
    initialLat,
    initialLng,
    onLocationSelect,
}: LocationPickerProps) {
    const [position, setPosition] = useState<[number, number] | null>(
        initialLat && initialLng ? [initialLat, initialLng] : null
    );
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        // Fix for Leaflet icon not showing
        import('leaflet').then((L) => {
            // @ts-ignore
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            });
        });
    }, []);

    // Sync internal state if props change (e.g. manual input)
    useEffect(() => {
        if (initialLat && initialLng) {
            setPosition([initialLat, initialLng]);
        }
    }, [initialLat, initialLng]);

    const handleParams = (lat: number, lng: number) => {
        setPosition([lat, lng]);
        onLocationSelect(lat, lng);
    };

    const handleCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    handleParams(latitude, longitude);
                },
                (err) => {
                    console.error("Error getting location:", err);
                    alert("Could not get your location. Please ensure permissions are allowed.");
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    const center: [number, number] = position || [9.9312, 76.2673]; // Default Kochi

    if (!isMounted) {
        return (
            <div className="h-64 w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400">
                Initializing Map...
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Pin Location on Map</label>
                <button
                    type="button"
                    onClick={handleCurrentLocation}
                    className="text-xs flex items-center gap-1 text-purple-600 font-medium hover:text-purple-800 transition-colors"
                >
                    <Crosshair size={14} />
                    Use My Current Location
                </button>
            </div>

            <div className="h-64 w-full rounded-xl overflow-hidden border border-gray-300 relative z-0">
                <MapContainer
                    center={center}
                    zoom={13}
                    scrollWheelZoom={true}
                    className="h-full w-full"
                    // @ts-ignore
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapEvents onLocationSelect={handleParams} />

                    {position && (
                        <Marker position={position}>
                            <Popup>Selected Location</Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>
            <p className="text-xs text-gray-500">Click anywhere on the map to set the salon location.</p>
        </div>
    );
}
