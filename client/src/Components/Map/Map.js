import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Optional custom marker
const icon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [32, 32],
});

const TouristMap = () => {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/locations')
      .then(res => res.json())
      .then(data => setLocations(data));
  }, []);

  return (
    <MapContainer center={[7.8731, 80.7718]} zoom={7} style={{ height: '600px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map(loc => (
        <Marker key={loc._id} position={[loc.coordinates.lat, loc.coordinates.lng]} icon={icon}>
          <Popup>
            <h3>{loc.name}</h3>
            <p>{loc.description}</p>
            <a href={`/locations/${loc._id}`}>View More</a>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default TouristMap;
