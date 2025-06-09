import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

const LocationDetail = () => {
    const { id } = useParams();
    const [location, setLocation] = useState(null);
    const [guides, setGuides] = useState([]);

    useEffect(() => {
        fetch(`/locations/${id}`)
            .then(res => res.json())
            .then(data => {
                setLocation(data.location);
                setGuides(data.guides);
            });
    }, [id]);

    if (!location) return <p>Loading...</p>;

    return (
        <div>
            <h1>{location.name}</h1>
            <p>{location.description}</p>
            {location.image && <img src={location.image} alt={location.name} width="500" />}
            <h3>Guides available in {location.region}</h3>
            <ul>
                {guides.map(guide => (
                    <li key={guide._id}>
                        <strong>{guide.fullName}</strong> - {guide.professionalDetails.languagesSpoken.join(', ')}<br />
                        Experience: {guide.professionalDetails.experienceYears} years<br />
                        Rate: Rs. {guide.pricing.dailyRate}/day
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default LocationDetail;
