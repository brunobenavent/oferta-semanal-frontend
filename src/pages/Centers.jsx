import { useEffect, useRef } from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import './Centers.css';

const GARDEN_CENTERS = [
  {
    name: 'Viveros Guzmán Alhaurín',
    code: '01 GAR',
    type: 'garden',
    lat: 36.654963,
    lng: -4.573451,
    location: 'Alhaurín de la Torre, Málaga',
    address: 'C/ Joaquín Blume sn, 29130 Alhaurín de la Torre - Málaga',
    phone: '952 411 351',
    desc: 'Garden Center con mercado gastronómico, restaurante, floristería, bricojardinería, muebles y cerámica.',
    mapsUrl: 'https://maps.google.com/?q=36.654963,-4.573451',
  },
  {
    name: 'Viveros Marbella',
    code: '07 VMV',
    type: 'garden',
    lat: 36.51325,
    lng: -4.864495,
    location: 'Marbella, Málaga',
    address: 'Finca la Paloma P.I. la Ermita | Ctra. Nac. 340 (A7), Km. 183, 29603 Marbella - Málaga',
    phone: '952 898 451',
    desc: 'Garden Center especializado en palmeras con cerámica, mármol, floristería y muebles de jardín.',
    mapsUrl: 'https://maps.google.com/?q=36.51325,-4.864495',
  },
  {
    name: 'Viveros Floracanaria',
    code: '16 FLO',
    type: 'garden',
    lat: 28.50993,
    lng: -16.40838,
    location: 'Tacoronte, Santa Cruz de Tenerife',
    address: 'Calle Tagoro, 54, 38350 Santa Cruz de Tenerife',
    phone: '922 077 021',
    desc: 'Garden Center con amplio surtido de plantas y cerámica en las Islas Canarias.',
    mapsUrl: 'https://maps.google.com/?q=28.50993,-16.40838',
  },
];

const PRODUCTION_CENTERS = [
  { name: 'Cortijo Blanco', code: '02 COR', lat: 36.674461, lng: -4.529531, location: 'Alhaurín de la Torre, Málaga', address: 'Ctra. Coín A-404 km 25, 29130 Alhaurín de la Torre - Málaga', phone: '952 118 015', desc: 'Olivos grandes, Palmáceas, Chorisias, bahuinias.', mapsUrl: 'https://maps.google.com/?q=36.674461,-4.529531' },
  { name: 'Finca Lagar de las Pitas', code: '03 FLP', lat: 36.682729, lng: -4.579319, location: 'Alhaurín de la Torre, Málaga', address: 'Ctra. El Romeral - Torrealquería s/n, 29130 Alhaurín de la Torre', phone: '952 411 351', desc: 'Geranios, gitanillas, Buganvilla, frutales, Ficus, Echinocactus, Aloe Vera.', mapsUrl: 'https://maps.google.com/?q=36.682729,-4.579319' },
  { name: 'Jardines de la Gamera', code: '04 JAR', lat: 36.664021, lng: -4.514277, location: 'Alhaurín de la Torre, Málaga', address: 'Hacienda la Gamera | C/ Camerun sn, 29140 Churriana - Málaga', phone: '952 410 150', desc: 'Olivos pequeños y aguacates.', mapsUrl: 'https://maps.google.com/?q=36.664021,-4.514277' },
  { name: 'Europlantas', code: '05 EUR', lat: 36.692127, lng: -4.754255, location: 'Coín, Málaga', address: 'Hacienda la Moreta | Partido Lagar de Rueda, 29100 Coín - Málaga', phone: '952 112 106', desc: 'Rosales, Cyclamen, Ponsettias, Begonias.', mapsUrl: 'https://maps.google.com/?q=36.692127,-4.754255' },
  { name: 'El Guincho', code: '06 GUI', lat: 28.537511, lng: -16.390816, location: 'Tacoronte, Santa Cruz de Tenerife', address: 'Camino el Guincho sn, 38458 Santa Cruz de Tenerife', phone: '', desc: 'Producción en Canarias.', mapsUrl: 'https://maps.google.com/?q=28.537511,-16.390816' },
  { name: 'Lebrija', code: '08 LEB', lat: 36.931925, lng: -6.139545, location: 'Lebrija, Sevilla', address: 'Lebrija, 41740 Sevilla', phone: '952 411 351', desc: 'Centro de producción en Sevilla.', mapsUrl: 'https://maps.google.com/?q=36.931925,-6.139545' },
  { name: 'Fahala', code: '09 FAH', lat: 36.69879, lng: -4.67628, location: 'Alhaurín de la Torre, Málaga', address: 'Ctra. Cártama - Coín, Km 4,500, 29570 Cártama - Málaga', phone: '952 411 351', desc: 'Palmeras, phoenix canadiensis, phoenix datilífera, arecastrum.', mapsUrl: 'https://maps.google.com/?q=36.69879,-4.67628' },
  { name: 'Arroyo Hondo', code: '10 AHO', lat: 36.663163, lng: -4.604336, location: 'Alhaurín de la Torre, Málaga', address: 'Camino del Comendador, sn, 29130 Alhaurín de la Torre - Málaga', phone: '610 118 886', desc: 'Eugenias, metrosideros, Calistemun, carisa.', mapsUrl: 'https://maps.google.com/?q=36.663163,-4.604336' },
  { name: 'Nuevo Espacio', code: '11 NE', lat: 36.676792, lng: -4.540122, location: 'Alhaurín de la Torre, Málaga', address: 'Ctra. Churriana-Cártama A-7052 Km 0,6, 29130 Alhaurín de la Torre - Málaga', phone: '952 410 150', desc: 'Aromáticas, aloe vera, Poinsettias, ficus de copa, claveles, Crisantemo. Cash & Carry.', mapsUrl: 'https://maps.google.com/?q=36.676792,-4.540122' },
  { name: 'Finca La Estación', code: '12 EST', lat: 36.679128, lng: -4.62502, location: 'Alhaurín de la Torre, Málaga', address: 'Carretera A-366 (Frente a Venta Purguine) La Alquería, 29130 Alhaurín de la Torre - Málaga', phone: '952 411 351', desc: 'Phoenix canadiensis, phoenix datilífera, arecastrum y olivos bonsáis.', mapsUrl: 'https://maps.google.com/?q=36.679128,-4.62502' },
  { name: 'Piamonte', code: '13 PIA', lat: 36.680449, lng: -4.553511, location: 'Alhaurín de la Torre, Málaga', address: 'Camino Piamonte sn, 29130 Alhaurín de la Torre - Málaga', phone: '952 411 351', desc: 'Buxus, Washingtonia robusta, cycas revolutas.', mapsUrl: 'https://maps.google.com/?q=36.680449,-4.553511' },
  { name: 'Bahía Málaga', code: '14 BAH', lat: 36.659365, lng: -4.479527, location: 'Alhaurín de la Torre, Málaga', address: 'Camino de la Loma sn (Junto a C.C. Plaza Mayor), 29004 Málaga', phone: '952 411 351', desc: 'Cítricos, Hibiscus, ficus variedades, eugenias.', mapsUrl: 'https://maps.google.com/?q=36.659365,-4.479527' },
  { name: 'Sevilla', code: '15 SEV', lat: 37.363583, lng: -6.129275, location: 'Bollullos, Sevilla', address: 'Autopista del V Centenario (A49), Bollullos, Sevilla', phone: '952 411 351', desc: 'Palmeras Washingtonia.', mapsUrl: 'https://maps.google.com/?q=37.363583,-6.129275' },
  { name: 'Expopalm', code: '17 EXP', lat: 10.176438, lng: -83.616698, location: 'Costa Rica', address: 'Costa Rica', phone: '952 411 351', desc: 'Phoenix rubelinis. Producción en Costa Rica.', mapsUrl: 'https://maps.google.com/?q=10.176438,-83.616698' },
  { name: 'El Ejido', code: '18 EJI', lat: 36.77144, lng: -2.83699, location: 'El Ejido, Almería', address: 'Barrio Fuente Nueva (frente semillero Fuente Nueva), 04700 El Ejido - Almería', phone: '952 411 351', desc: 'Ficus de tutor, Pothos de tutor, Croton, scheflera de tutor.', mapsUrl: 'https://maps.google.com/?q=36.77144,-2.83699' },
  { name: 'San Martín', code: '19 SMA', lat: 36.338483, lng: -5.320734, location: 'San Martín del Tesorillo, Cádiz', address: 'Calle San Roque, 42-44, 11340 San Martín del Tesorillo - Cádiz', phone: '952 411 351', desc: 'Naranjos, mandarinos y limones.', mapsUrl: 'https://maps.google.com/?q=36.338483,-5.320734' },
  { name: 'San Francisco', code: '20 SFR', lat: 36.677215, lng: -4.539438, location: 'Alhaurín de la Torre, Málaga', address: 'Ctra. Churriana-Cártama A-7052 Km 0,6, 29130 Alhaurín de la Torre - Málaga', phone: '952 410 150', desc: 'Cítricos, aguacates.', mapsUrl: 'https://maps.google.com/?q=36.677215,-4.539438' },
  { name: 'Laboratorio Guzmán Biotech', code: '21 GBI', lat: 36.676792, lng: -4.540122, location: 'Alhaurín de la Torre, Málaga', address: 'Ctra. Churriana-Cártama A-7052 Km 0,6, 29130 Alhaurín de la Torre - Málaga', phone: '952 411 351', desc: 'Laboratorio de biotecnología vegetal. Cultivo in vitro y micropropagación.', mapsUrl: 'https://maps.google.com/?q=36.676792,-4.540122' },
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
          .bindPopup(`<strong>[${center.code}] ${center.name}</strong><br>${center.address || center.location}<br>${center.phone ? '📞 ' + center.phone : ''}${center.phone ? '<br>' : ''}<a href="${center.mapsUrl}" target="_blank">Ver en Google Maps</a>`);
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
              <span className="center-code">{c.code}</span>
              <h3>{c.name}</h3>
              <p className="center-location"><MapPin size={14} /> {c.address || c.location}</p>
              {c.phone && <p className="center-phone">📞 {c.phone}</p>}
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
              <span className="center-code">{c.code}</span>
              <h3>{c.name}</h3>
              <p className="center-location"><MapPin size={14} /> {c.address || c.location}</p>
              {c.phone && <p className="center-phone">📞 {c.phone}</p>}
              <p className="center-desc">{c.desc}</p>
              <a href={c.mapsUrl} target="_blank" className="center-link" rel="noopener noreferrer"><ExternalLink size={14} /> Google Maps</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
