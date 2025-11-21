
import React from 'react';

const iconProps = {
    className: "h-6 w-6",
    strokeWidth: 2,
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as "round",
    strokeLinejoin: "round" as "round",
};

export const SumaLogo: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        viewBox="0 0 100 85" 
        className={className} 
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M0 45 H25 L35 25 L45 65 L55 35 L65 55 L75 45 H100" stroke="#4CAF50" fill="none" strokeWidth="5" />
        <path d="M50 75.35 C 20 -10, -30 35, 50 75.35 Z" fill="#D32F2F" transform="rotate(10 50 50)" />
        <path d="M50 75.35 C 80 -10, 130 35, 50 75.35 Z" fill="#D32F2F" transform="rotate(10 50 50)" />
        <text x="50" y="58" fontFamily="sans-serif" fontSize="40" fill="white" textAnchor="middle" fontWeight="bold">S</text>
    </svg>
);


export const EmergencyIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" {...iconProps}>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
);

export const ReportIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" {...iconProps}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
);

export const ShareIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" {...iconProps}>
        <circle cx="18" cy="5" r="3"></circle>
        <circle cx="6" cy="12" r="3"></circle>
        <circle cx="18" cy="19" r="3"></circle>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
    </svg>
);

export const HistoryIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" {...iconProps}>
        <path d="M1 4v6h6"></path>
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
    </svg>
);

export const BackIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" {...iconProps}>
        <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
);

export const SendIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-white">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
);

export const NewCaseIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" {...iconProps}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="18" x2="12" y2="12" />
        <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
);
