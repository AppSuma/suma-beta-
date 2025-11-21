
const getEmergencyNumber = (): string => {
    const lang = navigator.language.toLowerCase();
    
    // Country specific numbers
    if (lang.includes('es-pe')) return '105'; // Perú
    if (lang.includes('es-co')) return '123'; // Colombia
    if (lang.includes('es-ve')) return '171'; // Venezuela
    if (lang.includes('es-mx')) return '911'; // México
    if (lang.includes('es-es')) return '112'; // España
    if (lang.includes('es-ar')) return '107'; // Argentina
    if (lang.includes('es-cl')) return '131'; // Chile
    if (lang.includes('es-bo')) return '110'; // Bolivia
    if (lang.includes('es-ec')) return '911'; // Ecuador

    // Default for other regions as requested
    return '112';
}

const getGeolocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser.'));
        } else {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            });
        }
    });
};

export const handleEmergency = async (): Promise<void> => {
    const emergencyNumber = getEmergencyNumber();
    
    // First, open the dialer immediately.
    window.open(`tel:${emergencyNumber}`, '_self');

    try {
        const position = await getGeolocation();
        const { latitude, longitude } = position.coords;
        const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
        
        const shareData = {
            text: `EMERGENCIA SUMA - Ubicación exacta: ${mapsLink}`,
            title: 'Emergencia Suma',
        };

        // If navigator.share is available, use it. This is best for mobile.
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            // Fallback for desktop or unsupported browsers
            alert(`Ubicación para compartir manualmente:\n${mapsLink}`);
        }

    } catch (error) {
        console.error("Geolocation/Share error:", error);
        alert(`No se pudo obtener la ubicación. Llamando al número de emergencia: ${emergencyNumber}.`);
    }
};
