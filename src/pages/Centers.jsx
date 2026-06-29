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

const createGardenIcon = () => L.divIcon({
  className: 'custom-marker',
  html: `<div class="custom-marker-circle custom-marker--garden">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 75.533 91.189">
      <g transform="translate(-472.979 -180.503) scale(0.35)" fill="#dc2626">
        <path d="M473.008,196.794c0,6.35,5.17,15.8,15.815,15.8,12.275,0,15.708-10.933,15.708-15.6,0-7.773-6-9.037-8.256-9.037-4.774,0-10.153,3.513-10.153,7.112a2.277,2.277,0,0,0,2.348,2.483A3.369,3.369,0,0,0,491.6,195.1a3.219,3.219,0,0,1-2.022,1.049.528.528,0,0,1-.6-.583c0-1.784,1.935-3.693,4.6-3.693a3.789,3.789,0,0,1,4.011,4.075c0,1.071-.624,8.278-9.031,8.278-6.439,0-10.62-4.87-10.62-10.753,0-5.9,4.9-10.034,9.239-10.034a5.9,5.9,0,0,1,5.546,3.7,11.474,11.474,0,0,1,5.029-1.053,13.958,13.958,0,0,1,3.74.517s-3.221-6.095-12.345-6.095C474.719,180.5,473.008,194.6,473.008,196.794Z" transform="translate(-0.014 0)"/>
        <path d="M485.146,250.689a10.86,10.86,0,0,0,2.962.275c-.422-3.14-1.05-6.185-1.982-7.81-1.794-3.152-4.115-5.03-8.56-6.072a35.484,35.484,0,0,0-4.587-.724,11.264,11.264,0,0,0,.4,1.705,31.9,31.9,0,0,0,1.632,3.828C476.787,245.361,479.87,249.454,485.146,250.689Z" transform="translate(0 -26.185)"/>
        <path d="M516.863,246.818c-8.123-.268-10.8,2.924-11.757,8.791C509.791,254.6,514.332,253.34,516.863,246.818Z" transform="translate(-15.061 -31.082)"/>
        <path d="M586.5,267.757c-.26.826.674,1.089.939.428a18.6,18.6,0,0,1,4.211-5.785c.721.587.273,2.575-.37,3.725-.356.627.387.98.688.4.741-1.345,1.341-3.4.365-4.559-.388-.4,1.922-1.413,1.683-1.8C593.507,259.321,588.192,262.4,586.5,267.757Z" transform="translate(-53.2 -37.279)"/>
      </g>
    </svg>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const createProdIcon = () => L.divIcon({
  className: 'custom-marker',
  html: `<div class="custom-marker-circle custom-marker--prod">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 75.533 91.189">
      <g transform="translate(-472.979 -180.503) scale(0.35)" fill="#16a34a">
        <path d="M473.008,196.794c0,6.35,5.17,15.8,15.815,15.8,12.275,0,15.708-10.933,15.708-15.6,0-7.773-6-9.037-8.256-9.037-4.774,0-10.153,3.513-10.153,7.112a2.277,2.277,0,0,0,2.348,2.483A3.369,3.369,0,0,0,491.6,195.1a3.219,3.219,0,0,1-2.022,1.049.528.528,0,0,1-.6-.583c0-1.784,1.935-3.693,4.6-3.693a3.789,3.789,0,0,1,4.011,4.075c0,1.071-.624,8.278-9.031,8.278-6.439,0-10.62-4.87-10.62-10.753,0-5.9,4.9-10.034,9.239-10.034a5.9,5.9,0,0,1,5.546,3.7,11.474,11.474,0,0,1,5.029-1.053,13.958,13.958,0,0,1,3.74.517s-3.221-6.095-12.345-6.095C474.719,180.5,473.008,194.6,473.008,196.794Z" transform="translate(-0.014 0)"/>
        <path d="M485.146,250.689a10.86,10.86,0,0,0,2.962.275c-.422-3.14-1.05-6.185-1.982-7.81-1.794-3.152-4.115-5.03-8.56-6.072a35.484,35.484,0,0,0-4.587-.724,11.264,11.264,0,0,0,.4,1.705,31.9,31.9,0,0,0,1.632,3.828C476.787,245.361,479.87,249.454,485.146,250.689Z" transform="translate(0 -26.185)"/>
        <path d="M516.863,246.818c-8.123-.268-10.8,2.924-11.757,8.791C509.791,254.6,514.332,253.34,516.863,246.818Z" transform="translate(-15.061 -31.082)"/>
        <path d="M586.5,267.757c-.26.826.674,1.089.939.428a18.6,18.6,0,0,1,4.211-5.785c.721.587.273,2.575-.37,3.725-.356.627.387.98.688.4.741-1.345,1.341-3.4.365-4.559-.388-.4,1.922-1.413,1.683-1.8C593.507,259.321,588.192,262.4,586.5,267.757Z" transform="translate(-53.2 -37.279)"/>
      </g>
    </svg>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
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
