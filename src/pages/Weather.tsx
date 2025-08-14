import React, { useState } from 'react';
import WeatherDashboard from '@/components/weather/WeatherDashboard';
import { Field } from '@/types/field';

const Weather = () => {
  const [selectedField, setSelectedField] = useState<Field | null>(null);

  return (
    <div 
      className="min-h-screen"
      style={{
        background: 'url("https://images.unsplash.com/photo-1590867286251-8e26d9f255c0?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA==") center / cover no-repeat',
      }}
    >
      <WeatherDashboard 
        selectedField={selectedField} 
        onFieldChange={setSelectedField}
      />
    </div>
  );
};

export default Weather;