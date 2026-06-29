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
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="26" viewBox="-100 0 120 95">
      <style>.garden{fill:#d9000d}</style>
      <g class="garden">
        <path d="M-39.7,43.3c-2-1.3-2,0-1.5-2,.2-1,0-.4.5-.6,1.4-.7-3.9-9-3.6-5.1-2.6,1.1-3.9,2.9-3.1,6.1.4,1.5-1.4,0-1.5,2,0,1.1,1.5-1.7,9.1.3,0-.8,0-.7,0-.8ZM-42.4,42.4h-3.6c-.3-1.1-.3-2.3,0-3.3.4.2.8.3,1.2.2,1,0,1.8-1,1.9-2.5l1.2,2.6-.8,2.9Z"/>
        <path d="M-63.4,40.1c-5.5,6.7-18.5,7.9-24.8.5-3.3,10.4-1.7,21.8,4.4,30.9,10.6,16.3,27,16.3,27.1,16.3,1.2,0-.3.5,2.3-7.1,1.8-5.3,3.5-6.3,1.8-6.3s-2.2,1.6-3.1,3.4c-2.2,4.2-1.6,5.1-3.4,4,1.9-2.4,1.5-11.2,1.3-10.8,11.4,0,11-5.6,11.8-5.1,7.1,4.2,9.1-1.9,9.8.4.6,2.2-1,1.8,2.8,6.4,4.9,5.9,5.2,2.8-3.6,6.2-5.7,2.2-1.4,2.4-4.8-1.9-1.3-1.6-1.3,2.3.9,6.8,2,4.2,8.9,11.5,4.5,4-.9-1.5-1.7-3-2.4-4.6.3,0,1.3-1,3.2-2.1,4.7-2.8,2.8-1.9,5,3.2,1.7,3.8,3,3.4,3,2.3s-.6-1.8-1.1-3.4c-1.5-4.3-1.3-2.6,3.2-6.8,1.3-1.1,2.6-2.4,3.7-3.7,9.5-.2,4.2-5.7,4.2-10.5s1.1-6.4,1.1-11c.1-8.5-2.3-8.2-1-13.6,2.6-10.3-8.2-20.6-15.7-17-7.5-4.5-16.2-6.3-24.9-5.2,0,11.6-7.8,19.2-16.1,19.2s-2.2-2.2-.6,5.3c2.2-7.4,8.2-6.8,14.8-6.8-.2,0,.4,2.3-3.3,6.8ZM-47,30.4c0-9,3.9-6.3,6.5-4.5,3.1,2,5.3,5.2,6.1,8.8,1.4,5.7.8,3.3,3.7,8.9-2.9.8-5.9-6-6.3-9.3-.2-3.4-3-6.1-6.4-6.2-2.3,0-3.6,4.3-3.6,2.5ZM-52.9,28.4c-1.2,1.1-1.3.9-.5,4.4-5.7-2.4-3.8-8.6.8-8.6s4.8,5.6,4.6,5.6c-.5,0-2.3-2.5-3.3-2.5s-1.1.6-1.6,1.1ZM-75.6,47.1c6.5,0,7.7-2.3,7,3.5-.2.9-11.7.6-11.7-.4-1-4.3,0-3.1,4.7-3.1ZM-72.3,52.4c3.7,0,3.1-2.2,2.8,5.2-.5,1-5.4,2.6-11.1-.3,1.3-8.7-2.6-4.9,8.3-4.9ZM-60.6,81.7c-7.2,0-15.3-6.9-15.8-11.9-.2-.7-1-6-1-6-2-1.7-9-7-9-9.8,0-.6.3-1.1.9-1.3,1.1,0,2.2,5.6,3.9,3.4-3.8-7.2-1.3-6.8-.6-6.5,1.2.4.6,3.7.6,8.4,2.1,1.2,4.4,1.9,6.7,2.1,9,0,5.2-5.8,8.8-5.8s.9,2.5,0,4c-1.3,1.6-3.5,4-3.4,4.5-.9,5.1,5.5,9.3,8.9,9.3,2.1,0,1.4,9.6,0,9.6ZM-38.8,61.9c-1.1,3.1.7,4.1-3.8,4.1-.9,0-1.7-.3-2.6-.6-.3-2.7-.4-3.5.3-3.5,1.3,0,2.5-.5,3.2-1.5,0-.1-8.6.7-8.6-.3s3.7-2.4,7.5-8.9c3.2,3.1,3.5,1.3,3.1,1.3-2.7-1.8-4.4-5.5-6.3-4.3-.3.3-.6.9-.2.9,5.7.2-3.2,9.6-7.3,9.6s-5.1-6.3-7-8.5c3.4-.2,3.7-4.7,2.9-4.7s-.5,3.4-2.8,3.4-6-7.5-1.7-8.2c5.4-.9,12.7-2.3,14.9-7.5.9-2,3.2-3.7,4-3.7,7.4,0,2.7,8.8,10.1,14.6.3.8-1.2,1.8-1.2,2.4s1.5.3,2,0c3.1-1.2,9.4-8.5,9.4-5.2,0,16.6-13.4,14.1-15.8,20.9ZM-21.7,70.7c-5.2,0-12.4-8-12.4-11.1s2.3-1.4,7-5.1c5.4-4.3,5.1-12.3,5.4-13.7,1-4.6-4.5-1.2-8,2-6-9-2.2-11.4-8.9-17-.1-.1-.2-.3-.3-.4.5-.3.8-.7.9-1.1,1-3.3-3.8-4.8-5.8-4.8-5.9,0-6.5,8.7-6.5,8.7,0,2.3-1.1,4.1-2.1,5.7,1.1,1.1,2.1,2.2,2.9,3.5,3.6,5.7,8.3,10.7,10.6,11.7,3.7,1.7,3.3.6,6.2,7.4,4.2-10.2-4.8-8.3,1.8-8.3,2.5,0,6.2.5,8.6,6.5,1.2-1.4,2.6-2.3,4.1-2.9,2.6-1,3.5-.8,4-1.7,1.3-2.4-1.5-2.2-4.8-2.4Z"/>
        <path d="M-91.8,16.3c0,6.4,5.2,15.8,15.8,15.8s15.7-10.9,15.7-15.6c0-7.8-6-9-8.3-9-4.8,0-10.2,3.5-10.2,7.1-.1,1.3.8,2.4,2.1,2.5h.3c1.5,0,2.7-1,3.1-2.5-.5.6-1.2,1-2,1-.3,0-.6-.2-.6-.5,0-1.8,1.9-3.7,4.6-3.7,2.1-.1,3.9,1.5,4,3.5v.5c0,1.1-.6,8.3-9,8.3s-10.6-4.9-10.6-10.8,4.9-10,9.2-10c2.4,0,4.6,1.4,5.5,3.7,1.6-.7,3.3-1.1,5-1.1,1.3,0,2.5.2,3.7.5C-63.3,6.1-66.5,0-75.7,0c-14.4,0-16.1,14.1-16.1,16.3Z"/>
        <path d="M-79.6,44c1,.2,2,.3,3,.3-.4-3.1-1-6.2-2-7.8-1.8-3.2-4.1-5-8.6-6.1-1.5-.3-3-.6-4.6-.7,0,.6.2,1.1.4,1.7.5,1.3,1,2.6,1.6,3.8,1.8,3.5,4.9,7.6,10.1,8.8Z"/>
        <path d="M-63,35.2c-8.1-.3-10.8,2.9-11.8,8.8,4.7-1,9.2-2.3,11.8-8.8Z"/>
        <path d="M-31.5,50c-.3.8.7,1.1.9.4,1-2.2,2.4-4.1,4.2-5.8.7.6.3,2.6-.4,3.7-.4.6.4,1,.7.4.7-1.3,1.3-3.4.4-4.6-.4-.4,1.9-1.4,1.7-1.8-.5-.8-5.8,2.2-7.5,7.6Z"/>
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
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="26" viewBox="-10 0 90 95">
      <style>.prod{fill:#34812a}</style>
      <g class="prod">
        <path d="M52.2,43.3c-2-1.3-2,0-1.5-2,.2-1,0-.4.5-.6,1.4-.7-3.9-9-3.6-5.1-2.6,1.1-3.9,2.9-3.1,6.1.4,1.5-1.4,0-1.5,2,0,1.1,1.5-1.7,9.1.3,0-.8,0-.7,0-.8ZM49.4,42.4h-3.6c-.3-1.1-.3-2.3,0-3.3.4.2.8.3,1.2.2,1,0,1.8-1,1.9-2.5l1.2,2.6-.8,2.9Z"/>
        <path d="M28.4,40.1c-5.5,6.7-18.5,7.9-24.8.5-3.3,10.4-1.7,21.8,4.4,30.9,10.6,16.3,27,16.3,27.1,16.3,1.2,0-.3.5,2.3-7.1,1.8-5.3,3.5-6.3,1.8-6.3s-2.2,1.6-3.1,3.4c-2.2,4.2-1.6,5.1-3.4,4,1.9-2.4,1.5-11.2,1.3-10.8,11.4,0,11-5.6,11.8-5.1,7.1,4.2,9.1-1.9,9.8.4.6,2.2-1,1.8,2.8,6.4,4.9,5.9,5.2,2.8-3.6,6.2-5.7,2.2-1.4,2.4-4.8-1.9-1.3-1.6-1.3,2.3.9,6.8,2,4.2,8.9,11.5,4.5,4-.9-1.5-1.7-3-2.4-4.6.3,0,1.3-1,3.2-2.1,4.7-2.8,2.8-1.9,5,3.2,1.7,3.8,3,3.4,3,2.3s-.6-1.8-1.1-3.4c-1.5-4.3-1.3-2.6,3.2-6.8,1.3-1.1,2.6-2.4,3.7-3.7,9.5-.2,4.2-5.7,4.2-10.5s1.1-6.4,1.1-11c.1-8.5-2.3-8.2-1-13.6,2.6-10.3-8.2-20.6-15.7-17-7.5-4.5-16.2-6.3-24.9-5.2,0,11.6-7.8,19.2-16.1,19.2s-2.2-2.2-.6,5.3c2.2-7.4,8.2-6.8,14.8-6.8-.2,0,.4,2.3-3.3,6.8ZM44.8,30.4c0-9,3.9-6.3,6.5-4.5,3.1,2,5.3,5.2,6.1,8.8,1.4,5.7.8,3.3,3.7,8.9-2.9.8-5.9-6-6.3-9.3-.2-3.4-3-6.1-6.4-6.2-2.3,0-3.6,4.3-3.6,2.5ZM38.9,28.4c-1.2,1.1-1.3.9-.5,4.4-5.7-2.4-3.8-8.6.8-8.6s4.8,5.6,4.6,5.6c-.5,0-2.3-2.5-3.3-2.5s-1.1.6-1.6,1.1ZM16.2,47.1c6.5,0,7.7-2.3,7,3.5-.2.9-11.7.6-11.7-.4-1-4.3,0-3.1,4.7-3.1ZM19.6,52.4c3.7,0,3.1-2.2,2.8,5.2-.5,1-5.4,2.6-11.1-.3,1.3-8.7-2.6-4.9,8.3-4.9ZM31.2,81.7c-7.2,0-15.3-6.9-15.8-11.9-.2-.7-1-6-1-6-2-1.7-9-7-9-9.8,0-.6.3-1.1.9-1.3,1.1,0,2.2,5.6,3.9,3.4-3.8-7.2-1.3-6.8-.6-6.5,1.2.4.6,3.7.6,8.4,2.1,1.2,4.4,1.9,6.7,2.1,9,0,5.2-5.8,8.8-5.8s.9,2.5,0,4c-1.3,1.6-3.5,4-3.4,4.5-.9,5.1,5.5,9.3,8.9,9.3,2.1,0,1.4,9.6,0,9.6ZM53,61.9c-1.1,3.1.7,4.1-3.8,4.1-.9,0-1.7-.3-2.6-.6-.3-2.7-.4-3.5.3-3.5,1.3,0,2.5-.5,3.2-1.5,0-.1-8.6.7-8.6-.3s3.7-2.4,7.5-8.9c3.2,3.1,3.5,1.3,3.1,1.3-2.7-1.8-4.4-5.5-6.3-4.3-.3.3-.6.9-.2.9,5.7.2-3.2,9.6-7.3,9.6s-5.1-6.3-7-8.5c3.4-.2,3.7-4.7,2.9-4.7s-.5,3.4-2.8,3.4-6-7.5-1.7-8.2c5.4-.9,12.7-2.3,14.9-7.5.9-2,3.2-3.7,4-3.7,7.4,0,2.7,8.8,10.1,14.6.3.8-1.2,1.8-1.2,2.4s1.5.3,2,0c3.1-1.2,9.4-8.5,9.4-5.2,0,16.6-13.4,14.1-15.8,20.9ZM70.1,70.7c-5.2,0-12.4-8-12.4-11.1s2.3-1.4,7-5.1c5.4-4.3,5.1-12.3,5.4-13.7,1-4.6-4.5-1.2-8,2-6-9-2.2-11.4-8.9-17-.1-.1-.2-.3-.3-.4.5-.3.8-.7.9-1.1,1-3.3-3.8-4.8-5.8-4.8-5.9,0-6.5,8.7-6.5,8.7,0,2.3-1.1,4.1-2.1,5.7,1.1,1.1,2.1,2.2,2.9,3.5,3.6,5.7,8.3,10.7,10.6,11.7,3.7,1.7,3.3.6,6.2,7.4,4.2-10.2-4.8-8.3,1.8-8.3,2.5,0,6.2.5,8.6,6.5,1.2-1.4,2.6-2.3,4.1-2.9,2.6-1,3.5-.8,4-1.7,1.3-2.4-1.5-2.2-4.8-2.4Z"/>
        <path d="M0,16.3c0,6.4,5.2,15.8,15.8,15.8s15.7-10.9,15.7-15.6c0-7.8-6-9-8.3-9-4.8,0-10.2,3.5-10.2,7.1-.1,1.3.8,2.4,2.1,2.5h.3c1.5,0,2.7-1,3.1-2.5-.5.6-1.2,1-2,1-.3,0-.6-.2-.6-.5,0-1.8,1.9-3.7,4.6-3.7,2.1-.1,3.9,1.5,4,3.5v.5c0,1.1-.6,8.3-9,8.3s-10.6-4.9-10.6-10.8S9.8,2.9,14.2,2.9c2.4,0,4.6,1.4,5.5,3.7,1.6-.7,3.3-1.1,5-1.1,1.3,0,2.5.2,3.7.5C28.5,6.1,25.3,0,16.2,0,1.7,0,0,14.1,0,16.3Z"/>
        <path d="M12.2,44c1,.2,2,.3,3,.3-.4-3.1-1-6.2-2-7.8-1.8-3.2-4.1-5-8.6-6.1-1.5-.3-3-.6-4.6-.7,0,.6.2,1.1.4,1.7.5,1.3,1,2.6,1.6,3.8,1.8,3.5,4.9,7.6,10.1,8.8Z"/>
        <path d="M28.8,35.2c-8.1-.3-10.8,2.9-11.8,8.8,4.7-1,9.2-2.3,11.8-8.8Z"/>
        <path d="M60.3,50c-.3.8.7,1.1.9.4,1-2.2,2.4-4.1,4.2-5.8.7.6.3,2.6-.4,3.7-.4.6.4,1,.7.4.7-1.3,1.3-3.4.4-4.6-.4-.4,1.9-1.4,1.7-1.8-.5-.8-5.8,2.2-7.5,7.6Z"/>
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
