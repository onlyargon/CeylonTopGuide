import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './GuideList.css';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

const GuideList = () => {
  const [guides, setGuides] = useState([]);
  const [filters, setFilters] = useState({
    rank: 'All',
    language: 'All',
    experience: 'All',
    specialty: 'All',
    region: 'All',
    availability: 'All',
    paymentMethod: 'All',
    maxHourlyRate: '',
    maxDailyRate: '',
  });
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  const toggleFilters = () => {
    setIsFiltersExpanded(!isFiltersExpanded);
  };

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const fetchGuides = async () => {
    try {
      const params = {};
      for (const key in filters) {
        if (filters[key] !== 'All' && filters[key] !== '') {
          params[key] = filters[key];
        }
      }

      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/guides/verified/sort`, { params });
      let data = response.data;

      if (filters.experience === '10+') {
        data = data.filter(g => g.professionalDetails?.experienceYears >= 10);
      }

      data.sort((a, b) => b.averageRating - a.averageRating);
      setGuides(data);
    } catch (err) {
      console.error('Error fetching guides:', err);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, [filters]);

  const guideRanks = ['All','National Guide','Provincial Guide','Chauffer Guide','Driver Guide','Unregistered Guide'];
  const languages = ['All','English','Spanish','French','German','Chinese','Tamil','Sinhala'];
  const experienceOptions = ['All','1','2','3','4','5','6','7','8','9','10+'];
  const specialtyOptions = ['All','Cultural Tours','Wildlife Tours','Hiking','Adventure Travel','Historical Sites','Photography'];
  const tourRegions = ['All','Colombo','Kandy','Galle','Sigiriya','Ella','Jaffna','Anuradhapura'];
  const availableDays = ['All','Full-time','Part-time','Weekends Only','On-Request'];

  const getCloudinaryUrl = (imagePath, width = 200, height = 200, crop = 'fill') => {
    if (!imagePath) return '/default-profile.png';
    if (imagePath.startsWith('http')) return imagePath;
    return `https://res.cloudinary.com/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload/w_${width},h_${height},c_${crop}/${imagePath}`;
  };
  
  return (
    <>
      <Header/>
      <div className="guide-list-container">
        <div className={`sidebar ${isFiltersExpanded ? 'expanded' : 'collapsed'}`}>
          <button 
            className={`filter-toggle ${isFiltersExpanded ? 'expanded' : ''}`}
            onClick={toggleFilters}
          >
            {isFiltersExpanded ? 'Hide Filters' : 'Show Filters'}
          </button>

          <div className="filter-content">
            <h3>Filter By</h3>
            <div className="filter-group">
              <label>Rank</label>
              {guideRanks.map(rank => (
                <div key={rank}>
                  <input 
                    type="radio" 
                    name="rank" 
                    value={rank} 
                    onChange={handleChange} 
                    checked={filters.rank === rank}
                  /> {rank}
                </div>
              ))}
            </div>

            {/* Other filter groups remain the same */}
            <div className="filter-group">
              <label>Language</label>
              {languages.map(lang => (
                <div key={lang}>
                  <input 
                    type="radio" 
                    name="language" 
                    value={lang} 
                    onChange={handleChange} 
                    checked={filters.language === lang}
                  /> {lang}
                </div>
              ))}
            </div>

            <div className="filter-group">
              <label>Experience</label>
              <select name="experience" value={filters.experience} onChange={handleChange}>
                {experienceOptions.map(exp => (
                  <option key={exp} value={exp}>
                    {exp === '10+' ? '10+ years' : `${exp} years`}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Specialty</label>
              <select name="specialty" value={filters.specialty} onChange={handleChange}>
                {specialtyOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Region</label>
              <select name="region" value={filters.region} onChange={handleChange}>
                {tourRegions.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Availability</label>
              <select name="availability" value={filters.availability} onChange={handleChange}>
                {availableDays.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Hourly Rate (Max)</label>
              <input 
                type="number" 
                name="maxHourlyRate" 
                value={filters.maxHourlyRate} 
                onChange={handleChange} 
                placeholder="Enter max rate"
              />
            </div>

            <div className="filter-group">
              <label>Daily Rate (Max)</label>
              <input 
                type="number" 
                name="maxDailyRate" 
                value={filters.maxDailyRate} 
                onChange={handleChange} 
                placeholder="Enter max rate"
              />
            </div>

            <div className="filter-group">
              <label>Payment Method</label>
              <select name="paymentMethod" value={filters.paymentMethod} onChange={handleChange}>
                <option value="All">All</option>
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="PayPal">PayPal</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
          </div>
        </div>

        <div className="main-content">
          <div className="guide-grid">
            {guides.map(guide => (
              <div key={guide._id} className="guide-card">
                <img
                  src={getCloudinaryUrl(guide.profilePhoto)}
                  alt={guide.fullName}
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = '/default-profile.png';
                  }}
                />
                <div className="guide-card-content">
                  <h4>{guide.fullName}</h4>
                  <p>Rating: {(Number(guide.averageRating) || 0).toFixed(2) ?? 'No rating yet'}</p>
                  <p>Languages: {guide.professionalDetails?.languagesSpoken?.join(', ')}</p>
                  <p>Experience: {guide.professionalDetails?.experienceYears} yrs</p>
                  <p>Specialty: {guide.professionalDetails?.specialties?.join(', ')}</p>
                  <p>Region: {guide.professionalDetails?.tourRegions?.join(', ')}</p>
                  <p>Hourly: ${guide.pricing?.hourlyRate}</p>
                  <p>Daily: ${guide.pricing?.dailyRate}</p>
                  <Link to={`/guides/${guide._id}`}>View Details</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default GuideList;