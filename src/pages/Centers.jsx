import { useEffect, useRef } from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import './Centers.css';

const GARDEN_CENTERS = [
  {
    name: 'Viveros Guzmán Alhaurín',
    type: 'garden',
    lat: 36.6549673,
    lng: -4.573451,
    location: 'Alhaurín de la Torre, Málaga',
    desc: 'Garden Center con mercado gastronómico, restaurante, floristería, bricojardinería, muebles, cerámica.',
    mapsUrl: 'https://maps.google.com/?q=36.6549673,-4.573451',
  },
  {
    name: 'Viveros Marbella',
    type: 'garden',
    lat: 36.5100,
    lng: -4.8830,
    location: 'Marbella, Málaga',
    desc: 'Garden Center especializado en palmeras con cerámica, mármol, floristería y muebles de jardín.',
    mapsUrl: 'https://maps.google.com/?q=36.5100,-4.8830',
  },
  {
    name: 'Viveros Floracanaria',
    type: 'garden',
    lat: 28.4800,
    lng: -16.4200,
    location: 'Tacoronte, Canarias',
    desc: 'Garden Center con amplio surtido de plantas y cerámica en las Islas Canarias.',
    mapsUrl: 'https://maps.google.com/?q=28.4800,-16.4200',
  },
];

const PRODUCTION_CENTERS = [
  { name: 'Nuevo Espacio', lat: 36.6550, lng: -4.5650, location: 'Alhaurín de la Torre, Málaga', desc: 'Aromáticas, aloe vera, Poinsettias, ficus de copa, claveles, Crisantemo. Cash & Carry.', mapsUrl: 'https://maps.google.com/?q=36.6550,-4.5650' },
  { name: 'Finca Lagar de las Pitas', lat: 36.6600, lng: -4.5750, location: 'Alhaurín de la Torre, Málaga', desc: 'Geranios, gitanillas, Buganvilla, frutales, Ficus, Echinocactus, Aloe Vera.', mapsUrl: 'https://maps.google.com/?q=36.6600,-4.5750' },
  { name: 'Cortijo Blanco', lat: 36.6744291, lng: -4.5295366, location: 'Alhaurín de la Torre, Málaga', desc: 'Olivos grandes, Palmáceas, Chorisias, bahuinias.', mapsUrl: 'https://maps.google.com/?q=36.6744291,-4.5295366' },
  { name: 'Europlantas', lat: 36.6600, lng: -4.7600, location: 'Coín, Málaga', desc: 'Rosales, Cyclamen, Ponsettias, Begonias.', mapsUrl: 'https://maps.google.com/?q=36.6600,-4.7600' },
  { name: 'La Estación', lat: 36.6500, lng: -4.5550, location: 'Alhaurín de la Torre, Málaga', desc: 'Phoenix canadiensis, phoenix datilífera, arecastrum y olivos bonsáis.', mapsUrl: 'https://maps.google.com/?q=36.6500,-4.5550' },
  { name: 'El Ejido', lat: 36.7800, lng: -2.8200, location: 'El Ejido, Almería', desc: 'Ficus de tutor, Pothos de tutor, Croton, scheflera de tutor.', mapsUrl: 'https://maps.google.com/?q=36.7800,-2.8200' },
  { name: 'La Gamera', lat: 36.6700, lng: -4.5400, location: 'Alhaurín de la Torre, Málaga', desc: 'Olivos pequeños y aguacates.', mapsUrl: 'https://maps.google.com/?q=36.6700,-4.5400' },
  { name: 'Bahía Málaga', lat: 36.6650, lng: -4.5500, location: 'Alhaurín de la Torre, Málaga', desc: 'Cítricos, Hibiscus, ficus variedades, eugenias.', mapsUrl: 'https://maps.google.com/?q=36.6650,-4.5500' },
  { name: 'Piamonte', lat: 36.6450, lng: -4.5700, location: 'Alhaurín de la Torre, Málaga', desc: 'Buxus, Washingtonia robusta, cycas revolutas.', mapsUrl: 'https://maps.google.com/?q=36.6450,-4.5700' },
  { name: 'San Francisco', lat: 36.6600, lng: -4.5350, location: 'Alhaurín de la Torre, Málaga', desc: 'Cítricos, aguacates.', mapsUrl: 'https://maps.google.com/?q=36.6600,-4.5350' },
  { name: 'Fahala', lat: 36.6680, lng: -4.5600, location: 'Alhaurín de la Torre, Málaga', desc: 'Palmeras, phoenix canadiensis, phoenix datilífera, arecastrum.', mapsUrl: 'https://maps.google.com/?q=36.6680,-4.5600' },
  { name: 'Arroyo Hondo', lat: 36.6550, lng: -4.5450, location: 'Alhaurín de la Torre, Málaga', desc: 'Eugenias, metrosideros, Calistemun, carisa.', mapsUrl: 'https://maps.google.com/?q=36.6550,-4.5450' },
  { name: 'Costa Rica', lat: 10.0000, lng: -84.0000, location: 'Costa Rica', desc: 'Phoenix rubelinis.', mapsUrl: 'https://maps.google.com/?q=10.0000,-84.0000' },
  { name: 'San Martín', lat: 36.6580, lng: -4.5380, location: 'Alhaurín de la Torre, Málaga', desc: 'Naranjos, mandarinos y limones.', mapsUrl: 'https://maps.google.com/?q=36.6580,-4.5380' },
  { name: 'Bollullos', lat: 37.3333, lng: -6.1833, location: 'Bollullos, Sevilla', desc: 'Palmeras Washingtonia.', mapsUrl: 'https://maps.google.com/?q=37.3333,-6.1833' },
];

const L = window.L;

const gardenSvg = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-100 0 120 95"><circle cx="-47" cy="40" r="42" fill="white" stroke="#d9000d" stroke-width="3"/><style>.g{fill:#d9000d}</style><g class="g"><path d="M-39.7,43.3c-2-1.3-2,0-1.5-2,.2-1,0-.4.5-.6,1.4-.7-3.9-9-3.6-5.1-2.6,1.1-3.9,2.9-3.1,6.1.4,1.5-1.4,0-1.5,2,0,1.1,1.5-1.7,9.1.3,0-.8,0-.7,0-.8ZM-42.4,42.4h-3.6c-.3-1.1-.3-2.3,0-3.3.4.2.8.3,1.2.2,1,0,1.8-1,1.9-2.5l1.2,2.6-.8,2.9Z"/><path d="M-91.8,16.3c0,6.4,5.2,15.8,15.8,15.8s15.7-10.9,15.7-15.6c0-7.8-6-9-8.3-9-4.8,0-10.2,3.5-10.2,7.1-.1,1.3.8,2.4,2.1,2.5h.3c1.5,0,2.7-1,3.1-2.5-.5.6-1.2,1-2,1-.3,0-.6-.2-.6-.5,0-1.8,1.9-3.7,4.6-3.7,2.1-.1,3.9,1.5,4,3.5v.5c0,1.1-.6,8.3-9,8.3s-10.6-4.9-10.6-10.8,4.9-10,9.2-10c2.4,0,4.6,1.4,5.5,3.7,1.6-.7,3.3-1.1,5-1.1,1.3,0,2.5.2,3.7.5C-63.3,6.1-66.5,0-75.7,0c-14.4,0-16.1,14.1-16.1,16.3Z"/><path d="M-79.6,44c1,.2,2,.3,3,.3-.4-3.1-1-6.2-2-7.8-1.8-3.2-4.1-5-8.6-6.1-1.5-.3-3-.6-4.6-.7,0,.6.2,1.1.4,1.7.5,1.3,1,2.6,1.6,3.8,1.8,3.5,4.9,7.6,10.1,8.8Z"/></g></svg>`);

const prodSvg = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 0 90 95"><circle cx="32" cy="40" r="42" fill="white" stroke="#34812a" stroke-width="3"/><style>.p{fill:#34812a}</style><g class="p"><path d="M52.2,43.3c-2-1.3-2,0-1.5-2,.2-1,0-.4.5-.6,1.4-.7-3.9-9-3.6-5.1-2.6,1.1-3.9,2.9-3.1,6.1.4,1.5-1.4,0-1.5,2,0,1.1,1.5-1.7,9.1.3,0-.8,0-.7,0-.8ZM49.4,42.4h-3.6c-.3-1.1-.3-2.3,0-3.3.4.2.8.3,1.2.2,1,0,1.8-1,1.9-2.5l1.2,2.6-.8,2.9Z"/><path d="M0,16.3c0,6.4,5.2,15.8,15.8,15.8s15.7-10.9,15.7-15.6c0-7.8-6-9-8.3-9-4.8,0-10.2,3.5-10.2,7.1-.1,1.3.8,2.4,2.1,2.5h.3c1.5,0,2.7-1,3.1-2.5-.5.6-1.2,1-2,1-.3,0-.6-.2-.6-.5,0-1.8,1.9-3.7,4.6-3.7,2.1-.1,3.9,1.5,4,3.5v.5c0,1.1-.6,8.3-9,8.3s-10.6-4.9-10.6-10.8S9.8,2.9,14.2,2.9c2.4,0,4.6,1.4,5.5,3.7,1.6-.7,3.3-1.1,5-1.1,1.3,0,2.5.2,3.7.5C28.5,6.1,25.3,0,16.2,0,1.7,0,0,14.1,0,16.3Z"/><path d="M12.2,44c1,.2,2,.3,3,.3-.4-3.1-1-6.2-2-7.8-1.8-3.2-4.1-5-8.6-6.1-1.5-.3-3-.6-4.6-.7,0,.6.2,1.1.4,1.7.5,1.3,1,2.6,1.6,3.8,1.8,3.5,4.9,7.6,10.1,8.8Z"/></g></svg>`);

const createGardenIcon = () => L.icon({
  iconUrl: `data:image/svg+xml,${gardenSvg}`,
  iconSize: [120, 120],
  iconAnchor: [60, 120],
  popupAnchor: [0, -110],
});

const createProdIcon = () => L.icon({
  iconUrl: `data:image/svg+xml,${prodSvg}`,
  iconSize: [120, 120],
  iconAnchor: [60, 120],
  popupAnchor: [0, -110],
});

export default function Centers() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current && L) {
      const map = L.map(mapRef.current).setView([36.65, -4.56], 10);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© <a href="https://carto.com/">CARTO</a> © <a href="https://www.openstreetmap.org/">OSM</a>',
      }).addTo(map);

      const gardenIcon = createGardenIcon();
      const prodIcon = createProdIcon();

      [...GARDEN_CENTERS, ...PRODUCTION_CENTERS].forEach(center => {
        const icon = center.type === 'garden' ? gardenIcon : prodIcon;
        L.marker([center.lat, center.lng], { icon })
          .addTo(map)
          .bindPopup(`<strong>${center.name}</strong><br>${center.location}<br><a href="${center.mapsUrl}" target="_blank">Ver en Google Maps</a>`);
      });

      const observer = new IntersectionObserver(() => map.invalidateSize());
      observer.observe(mapRef.current);

      mapInstanceRef.current = map;
    }
  }, []);

  const flyTo = (lat, lng) => {
    mapInstanceRef.current?.flyTo([lat, lng], 15);
  };

  return (
    <div className="centers-page">
      <div className="centers-header">
        <h1>Centros de Producción</h1>
        <p>Viveros Guzmán cuenta con 250 hectáreas de producción repartidas en 18 centros</p>
      </div>
      <div className="centers-map-wrapper">
        <div ref={mapRef} className="centers-map" />
      </div>
      <div className="centers-list">
        <h2>🟢 Garden Centers</h2>
        <div className="centers-grid">
          {GARDEN_CENTERS.map(c => (
            <div key={c.name} className="center-card" onClick={() => flyTo(c.lat, c.lng)}>
              <h3>{c.name}</h3>
              <p className="center-location"><MapPin size={14} /> {c.location}</p>
              <p className="center-desc">{c.desc}</p>
              <a href={c.mapsUrl} target="_blank" className="center-link" rel="noopener noreferrer"><ExternalLink size={14} /> Google Maps</a>
            </div>
          ))}
        </div>
        <h2>🔵 Centros de Producción</h2>
        <div className="centers-grid">
          {PRODUCTION_CENTERS.map(c => (
            <div key={c.name} className="center-card" onClick={() => flyTo(c.lat, c.lng)}>
              <h3>{c.name}</h3>
              <p className="center-location"><MapPin size={14} /> {c.location}</p>
              <p className="center-desc">{c.desc}</p>
              <a href={c.mapsUrl} target="_blank" className="center-link" rel="noopener noreferrer"><ExternalLink size={14} /> Google Maps</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
