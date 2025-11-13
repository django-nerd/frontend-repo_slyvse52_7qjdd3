import React, { useMemo } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useData } from '../App'

export default function MapPage() {
  const { filteredRows } = useData()
  const points = useMemo(() => filteredRows.filter(r => r.latitude && r.longitude).map(r => ({
    lat: parseFloat(r.latitude),
    lng: parseFloat(r.longitude),
    village: r.village,
    crop: r.crop,
    rainfall: parseFloat(r.rainfall || 0)
  })), [filteredRows])

  const center = points[0] ? [points[0].lat, points[0].lng] : [20.5937, 78.9629]

  return (
    <div className="bg-white/80 border rounded p-4">
      <div className="flex items-center justify-between mb-2"><h3 className="font-semibold">Panchayat Map</h3><span className="text-xs text-gray-500">Villages plotted by location</span></div>
      <div className="h-[70vh] rounded overflow-hidden">
        <MapContainer center={center} zoom={5} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {points.map((p, idx) => (
            <CircleMarker key={idx} center={[p.lat, p.lng]} radius={6} pathOptions={{ color: p.rainfall > 800 ? '#2563eb' : '#10b981' }}>
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold">{p.village}</div>
                  <div>Crop: {p.crop}</div>
                  <div>Rainfall: {p.rainfall} mm</div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
