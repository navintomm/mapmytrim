'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Crosshair } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { useMap, useMapEvents } from 'react-leaflet';

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
    addressQuery?: string;
}

// Component to handle map view updates
function FlyToLocation({ coords }: { coords: [number, number] | null }) {
    const map = useMap();
    useEffect(() => {
        if (coords) {
            map.flyTo(coords, 16, {
                duration: 1.5
            });
        }
    }, [coords, map]);
    return null;
}

// Component to handle clicks
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
    addressQuery
}: LocationPickerProps) {
    const [position, setPosition] = useState<[number, number] | null>(
        initialLat && initialLng ? [initialLat, initialLng] : null
    );
    const [isMounted, setIsMounted] = useState(false);
    const markerRef = useRef(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const customMarkerIcon = useMemo(() => {
        if (typeof window === 'undefined') return null;
        const L = require('leaflet');
        return L.divIcon({
            html: `
                <div class="relative flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 30 40" class="drop-shadow-lg">
                        <path fill="#7c3aed" stroke="#ffffff" stroke-width="2" d="M15,0 C6.7,0 0,6.7 0,15 C0,26.2 15,40 15,40 S30,26.2 30,15 C30,6.7 23.3,0 15,0 Z" />
                        <circle cx="15" cy="15" r="5" fill="#ffffff" />
                    </svg>
                </div>
            `,
            className: 'custom-location-pin',
            iconSize: [30, 40],
            iconAnchor: [15, 40],
        });
    }, []);

    // Sync internal state if props change (e.g. manual input)
    useEffect(() => {
        if (initialLat && initialLng) {
            setPosition([initialLat, initialLng]);
        }
    }, [initialLat, initialLng]);

    // Geocoding Effect (Address -> Map)
    useEffect(() => {
        if (!addressQuery || addressQuery.length < 5) return;

        const delayDebounceFn = setTimeout(async () => {
            try {
                // Use OpenStreetMap Nominatim for free geocoding
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressQuery)}`);
                const data = await response.json();

                if (data && data.length > 0) {
                    const lat = parseFloat(data[0].lat);
                    const lon = parseFloat(data[0].lon);
                    handleParams(lat, lon);
                }
            } catch (error) {
                console.error("Geocoding failed:", error);
            }
        }, 1500); // 1.5s debounce

        return () => clearTimeout(delayDebounceFn);
    }, [addressQuery]);

    const handleParams = (lat: number, lng: number) => {
        setPosition([lat, lng]);
        onLocationSelect(lat, lng);
    };

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker: any = markerRef.current;
                if (marker != null) {
                    const { lat, lng } = marker.getLatLng();
                    handleParams(lat, lng);
                }
            },
        }),
        []
    );

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
                <div className="flex gap-4">
                    <span className="text-xs text-gray-400 italic">Drag pin or click to adjust</span>
                    <button
                        type="button"
                        onClick={handleCurrentLocation}
                        className="text-xs flex items-center gap-1 text-purple-600 font-medium hover:text-purple-800 transition-colors"
                    >
                        <Crosshair size={14} />
                        Use My Current Location
                    </button>
                </div>
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
                    <FlyToLocation coords={position} />

                    {position && (
                        <Marker
                            position={position}
                            draggable={true}
                            eventHandlers={eventHandlers}
                            ref={markerRef}
                            icon={customMarkerIcon || undefined}
                        >
                            <Popup>Salon Location</Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>
            <p className="text-xs text-gray-500">
                * Location will automatically update when you type the address above. You can also fine-tune it by dragging the pin.
            </p>
        </div>
    );
}
