import React from 'react';

interface SalonMarkerProps {
  name: string;
  queueCount: number;
  isSelected?: boolean;
}

export const SalonMarkerIcon: React.FC<SalonMarkerProps> = ({
  name,
  queueCount,
  isSelected = false,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="50"
      viewBox="0 0 40 50"
    >
      <path
        fill={isSelected ? '#3b82f6' : '#ef4444'}
        stroke="#ffffff"
        strokeWidth="2"
        d="M20,0 C9,0 0,9 0,20 C0,31 20,50 20,50 S40,31 40,20 C40,9 31,0 20,0 Z"
      />
      <circle cx="20" cy="20" r="10" fill="#ffffff" />
      <text
        x="20"
        y="25"
        textAnchor="middle"
        fontSize="14"
        fill={isSelected ? '#3b82f6' : '#ef4444'}
        fontWeight="bold"
      >
        {queueCount}
      </text>
    </svg>
  );
};