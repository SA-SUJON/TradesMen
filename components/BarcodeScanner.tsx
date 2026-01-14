import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface BarcodeScannerProps {
    onScan: (decodedText: string) => void;
    onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onClose }) => {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Initialize scanner
        const scannerId = "reader";
        
        // Wait for DOM to be ready
        const timer = setTimeout(() => {
            setIsLoading(false);
            if (!scannerRef.current) {
                const scanner = new Html5QrcodeScanner(
                    scannerId,
                    { 
                        fps: 10, 
                        qrbox: { width: 250, height: 250 },
                        formatsToSupport: [ 
                            Html5QrcodeSupportedFormats.QR_CODE,
                            Html5QrcodeSupportedFormats.EAN_13,
                            Html5QrcodeSupportedFormats.EAN_8,
                            Html5QrcodeSupportedFormats.UPC_A,
                            Html5QrcodeSupportedFormats.UPC_E
                        ]
                    },
                    /* verbose= */ false
                );

                scanner.render(
                    (decodedText) => {
                        onScan(decodedText);
                        // Don't close immediately to allow multiple scans or confirmation
                        // For now, let's play a beep sound logic if we could, but we'll just callback
                        scanner.clear();
                        onClose();
                    },
                    (error) => {
                        // ignore failures, scanning in progress
                    }
                );
                scannerRef.current = scanner;
            }
        }, 500);

        return () => {
            clearTimeout(timer);
            if (scannerRef.current) {
                try {
                    scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
                } catch (e) {
                    console.error("Scanner cleanup error", e);
                }
            }
        };
    }, [onScan, onClose]);

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
            <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden w-full max-w-sm relative shadow-2xl">
                <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-800">
                    <h3 className="font-bold text-lg">Scan Barcode</h3>
                    <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-4 bg-black relative min-h-[300px] flex items-center justify-center">
                     <div id="reader" className="w-full text-white"></div>
                     {isLoading && (
                         <div className="absolute inset-0 flex items-center justify-center text-white gap-2">
                             <Loader2 className="w-6 h-6 animate-spin" /> Starting Camera...
                         </div>
                     )}
                </div>
                
                <div className="p-4 text-center text-sm opacity-60">
                    Point camera at a barcode or QR code.
                </div>
            </div>
        </motion.div>
    );
};

export default BarcodeScanner;
