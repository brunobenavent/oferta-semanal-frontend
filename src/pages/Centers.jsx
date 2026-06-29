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
  className: 'custom-icon',
  html: `<img src="/vigu-rojo.svg" style="width:35px;height:42px;display:block" />`,
  iconSize: [35, 42],
  iconAnchor: [17, 42],
  popupAnchor: [0, -40],
});

const createProdIcon = () => L.divIcon({
  className: 'custom-icon',
  html: `<img src="/corazon-verde.svg" style="width:28px;height:25px;display:block" />`,
  iconSize: [28, 25],
  iconAnchor: [14, 25],
  popupAnchor: [0, -22],
});

export default function Centers() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});

  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current && L) {
      const map = L.map(mapRef.current).setView([36.661, -4.563], 13);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© <a href="https://carto.com/">CARTO</a> © <a href="https://www.openstreetmap.org/">OSM</a>',
      }).addTo(map);

      const gardenIcon = createGardenIcon();
      const prodIcon = createProdIcon();

      [...GARDEN_CENTERS, ...PRODUCTION_CENTERS].forEach(center => {
        const icon = center.type === 'garden' ? gardenIcon : prodIcon;
        const marker = L.marker([center.lat, center.lng], { icon })
          .addTo(map)
          .bindPopup(`<strong>${center.name}</strong><br>${center.location}<br><a href="${center.mapsUrl}" target="_blank">Ver en Google Maps</a>`);
        markersRef.current[center.name] = marker;
      });


      const observer = new IntersectionObserver(() => map.invalidateSize());
      observer.observe(mapRef.current);

      mapInstanceRef.current = map;
    }
  }, []);

  const flyTo = (name, lat, lng) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo([lat, lng], 15);
    const marker = markersRef.current[name];
    if (marker) {
      setTimeout(() => marker.openPopup(), 800);
    }
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
        <h2 className="centers-legend-garden"><img src="/vigu-rojo.svg" alt="" style={{width: 28, height: 34, verticalAlign: 'middle', marginRight: 8}} /> Garden Centers <span className="legend-count">{GARDEN_CENTERS.length} centros</span></h2>
        <div className="centers-grid">
          {GARDEN_CENTERS.map(c => (
            <div key={c.name} className="center-card" onClick={() => flyTo(c.name, c.lat, c.lng)}>
              <h3>{c.name}</h3>
              <p className="center-location"><MapPin size={14} /> {c.location}</p>
              <p className="center-desc">{c.desc}</p>
              <a href={c.mapsUrl} target="_blank" className="center-link" rel="noopener noreferrer"><ExternalLink size={14} /> Google Maps</a>
            </div>
          ))}
        </div>
        <hr className="centers-divider" />
        <h2 className="centers-legend-prod"><img src="/corazon-verde.svg" alt="" style={{width: 28, height: 25, verticalAlign: 'middle', marginRight: 8}} /> Centros de Producción <span className="legend-count">{PRODUCTION_CENTERS.length} centros</span></h2>
        <div className="centers-grid">
          {PRODUCTION_CENTERS.map(c => (
            <div key={c.name} className="center-card" onClick={() => flyTo(c.name, c.lat, c.lng)}>
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
