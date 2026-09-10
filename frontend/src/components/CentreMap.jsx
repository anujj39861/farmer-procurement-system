import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin, CloudSun, Users, Clock } from 'lucide-react';
import L from 'leaflet';

// Fix Leaflet Default Marker Icon issue in React Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function CentreMap({ centres = [] }) {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    // Open-Meteo Free Weather API call for Karnal/Ludhiana region context
    fetch('https://api.open-meteo.com/v1/forecast?latitude=29.6857&longitude=76.9905&current_weather=true')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.current_weather) {
          setWeather(data.current_weather);
        }
      })
      .catch(() => {});
  }, []);

  const defaultCenter = [29.6857, 76.9905]; // Karnal

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-gray-900 text-sm">Nearby Procurement Centres</h3>
        </div>

        {weather && (
          <div className="flex items-center gap-2 text-xs bg-amber-50 text-amber-800 px-3 py-1 rounded-full border border-amber-200">
            <CloudSun className="w-4 h-4 text-amber-600" />
            <span>Temp: {weather.temperature}°C</span>
            <span className="text-gray-400">|</span>
            <span>Wind: {weather.windspeed} km/h</span>
          </div>
        )}
      </div>

      <div className="rounded-xl overflow-hidden border border-gray-200 shadow-inner">
        <MapContainer center={defaultCenter} zoom={7} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {centres.map((c) => (
            <Marker key={c.id} position={[c.lat, c.lng]}>
              <Popup>
                <div className="p-1 space-y-1 text-xs">
                  <h4 className="font-bold text-gray-900">{c.name}</h4>
                  <p className="text-gray-500">{c.address}</p>
                  <div className="pt-1 flex items-center justify-between text-[11px] font-semibold text-emerald-700">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" /> Counters: {c.active_counters}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {c.open_time} - {c.close_time}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
