import React from 'react';
import CropScanner from '@/components/scanner/CropScanner';

const Scan = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <CropScanner 
        cropType="maize"
        location={{ lat: -1.2921, lng: 36.8219, country: 'Kenya' }}
        onScanComplete={(result) => {
          console.log('Scan completed:', result);
        }}
      />
    </div>
  );
};

export default Scan;