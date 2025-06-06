import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

const GuideList = () => {
  const [guides, setGuides] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    rank: 'All',
    language: [],
    experience: 'All',
    specialty: [],
    region: [],
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
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFilters(prev => {
        const currentValues = prev[name];
        if (checked) {
          return {
            ...prev,
            [name]: [...currentValues, value]
          };
        } else {
          return {
            ...prev,
            [name]: currentValues.filter(item => item !== value)
          };
        }
      });
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const fetchGuides = async () => {
    setIsLoading(true);
    try {
      const params = {};
      for (const key in filters) {
        if (filters[key] !== 'All' && filters[key] !== '' && filters[key].length !== 0) {
          params[key] = filters[key];
        }
      }

      const baseUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:5000'
        : process.env.REACT_APP_API_BASE_URL;

      const response = await axios.get(`${baseUrl}/guides/verified/sort`, { params });
      let data = response.data;

      if (filters.experience === '10+') {
        data = data.filter(g => g.professionalDetails?.experienceYears >= 10);
      }

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        data = data.filter(guide =>
          guide.fullName.toLowerCase().includes(query) ||
          guide.professionalDetails?.tourRegions?.some(region =>
            region.toLowerCase().includes(query)
          )
        );
      }

      // Apply multiple selection filters
      if (filters.language.length > 0) {
        data = data.filter(guide => {
          const guideLanguages = guide.professionalDetails?.languagesSpoken || [];
          console.log('Guide Languages:', guideLanguages);
          console.log('Selected Languages:', filters.language);
          return filters.language.some(selectedLang => 
            guideLanguages.some(guideLang => 
              guideLang.toLowerCase() === selectedLang.toLowerCase()
            )
          );
        });
      }

      if (filters.region.length > 0) {
        data = data.filter(guide => {
          const guideRegions = guide.professionalDetails?.tourRegions || [];
          return filters.region.some(selectedRegion => 
            guideRegions.some(guideRegion => 
              guideRegion.toLowerCase() === selectedRegion.toLowerCase()
            )
          );
        });
      }

      if (filters.specialty.length > 0) {
        data = data.filter(guide => {
          const guideSpecialties = guide.professionalDetails?.specialties || [];
          return filters.specialty.some(selectedSpecialty => 
            guideSpecialties.some(guideSpecialty => 
              guideSpecialty.toLowerCase() === selectedSpecialty.toLowerCase()
            )
          );
        });
      }

      data.sort((a, b) => b.averageRating - a.averageRating);
      setGuides(data);
    } catch (err) {
      console.error('Error fetching guides:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, [filters, searchQuery]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const guideRanks = ['All', 'National Guide', 'Provincial Guide', 'Chauffer Guide', 'Driver Guide', 'Unregistered Guide'];
  const languages = ['All', 'English', 'Spanish', 'French', 'German', 'Chinese', 'Tamil', 'Sinhala'];
  const experienceOptions = ['All', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'];
  const specialtyOptions = ['All', 'Cultural Tours', 'Wildlife Tours', 'Hiking', 'Adventure Travel', 'Historical Sites', 'Photography'];
  const tourRegions = ['All', 'All Island', 'Colombo', 'Kandy', 'Galle', 'Sigiriya', 'Ella', 'Jaffna', 'Anuradhapura'];
  const availableDays = ['All', 'Full-time', 'Part-time', 'Weekends Only', 'On-Request'];

  const getCloudinaryUrl = (imagePath, width = 200, height = 200, crop = 'fill') => {
    if (!imagePath) return '/default-profile.png';
    if (imagePath.startsWith('http')) return imagePath;

    const baseUrl = process.env.NODE_ENV === 'development'
      ? 'http://localhost:5000'
      : `https://res.cloudinary.com/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`;

    return `${baseUrl}/w_${width},h_${height},c_${crop}/${imagePath}`;
  };

  return (
    <>
      <Header />
      <div className="flex flex-col md:flex-row gap-4 p-4 md:p-6 lg:p-8 bg-[#f8f8f8] min-h-screen font-['Helvetica','Arial',sans-serif]">
        <div className={`w-full md:w-[280px] lg:w-[300px] bg-white rounded-lg shadow-md border border-[#e0e0e0] p-0 md:p-5 lg:p-6 md:sticky md:top-20 md:h-[calc(100vh-100px)] md:overflow-y-auto relative ${isFiltersExpanded ? 'block' : 'block md:block'}`}>
          <button
            className={`w-full bg-pureWhite text-white border-none py-3 rounded-t-lg md:rounded-md mb-0 md:mb-4 font-semibold cursor-pointer relative transition-all duration-300 hover:bg-pureWhite md:hidden ${isFiltersExpanded ? 'after:content-["▲"]' : 'after:content-["▼"]'} after:absolute after:right-4 after:top-1/2 after:-translate-y-1/2 after:text-sm`}
            onClick={toggleFilters}
          >
            {isFiltersExpanded ? 'Hide Filters' : 'Show Filters'}
          </button>

          <div className={`${isFiltersExpanded ? 'block p-4' : 'hidden'} md:block md:p-0`}>
            <div className="mb-6 w-full">
              <input
                type="text"
                placeholder="Search by guide name or region..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full p-2 border border-[#e0e0e0] rounded-md focus:outline-none focus:ring-1 focus:ring-primaryGreen text-sm"
              />
            </div>
            <h3 className="text-primaryGreen text-lg mb-4 pb-2 border-b-2 border-[#e0e0e0]">Filter By</h3>
            
            {/* Filter Groups */}
            <div className="space-y-6">
              {/* Rank Filter */}
              <div className="bg-[#f9f9f9] p-4 rounded-md border border-[#e0e0e0]">
                <label className="block font-semibold mb-2 text-sm text-gray-700">Rank</label>
                {guideRanks.map(rank => (
                  <div key={rank} className="mb-1 text-sm">
                    <input
                      type="radio"
                      name="rank"
                      value={rank}
                      onChange={handleChange}
                      checked={filters.rank === rank}
                      className="mr-2 accent-primaryGreen"
                    /> {rank}
                  </div>
                ))}
              </div>

              {/* Language Filter */}
              <div className="bg-[#f9f9f9] p-4 rounded-md border border-[#e0e0e0]">
                <label className="block font-semibold mb-2 text-sm text-gray-700">Language</label>
                {languages.filter(lang => lang !== 'All').map(lang => (
                  <div key={lang} className="mb-1 text-sm">
                    <input
                      type="checkbox"
                      name="language"
                      value={lang}
                      onChange={handleChange}
                      checked={filters.language.includes(lang)}
                      className="mr-2 accent-primaryGreen"
                    /> {lang}
                  </div>
                ))}
              </div>

              {/* Experience Filter */}
              <div className="bg-[#f9f9f9] p-4 rounded-md border border-[#e0e0e0]">
                <label className="block font-semibold mb-2 text-sm text-gray-700">Experience</label>
                <select 
                  name="experience" 
                  value={filters.experience} 
                  onChange={handleChange}
                  className="w-full p-2 rounded-md border border-[#ddd] text-sm focus:outline-none focus:border-primaryGreen focus:ring-1 focus:ring-primaryGreen"
                >
                  {experienceOptions.map(exp => (
                    <option key={exp} value={exp}>
                      {exp === '10+' ? '10+ years' : `${exp} years`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Specialty Filter */}
              <div className="bg-[#f9f9f9] p-4 rounded-md border border-[#e0e0e0]">
                <label className="block font-semibold mb-2 text-sm text-gray-700">Specialty</label>
                {specialtyOptions.filter(opt => opt !== 'All').map(opt => (
                  <div key={opt} className="mb-1 text-sm">
                    <input
                      type="checkbox"
                      name="specialty"
                      value={opt}
                      onChange={handleChange}
                      checked={filters.specialty.includes(opt)}
                      className="mr-2 accent-primaryGreen"
                    /> {opt}
                  </div>
                ))}
              </div>

              {/* Region Filter */}
              <div className="bg-[#f9f9f9] p-4 rounded-md border border-[#e0e0e0]">
                <label className="block font-semibold mb-2 text-sm text-gray-700">Region</label>
                {tourRegions.filter(region => region !== 'All').map(r => (
                  <div key={r} className="mb-1 text-sm">
                    <input
                      type="checkbox"
                      name="region"
                      value={r}
                      onChange={handleChange}
                      checked={filters.region.includes(r)}
                      className="mr-2 accent-primaryGreen"
                    /> {r}
                  </div>
                ))}
              </div>

              {/* Availability Filter */}
              <div className="bg-[#f9f9f9] p-4 rounded-md border border-[#e0e0e0]">
                <label className="block font-semibold mb-2 text-sm text-gray-700">Availability</label>
                <select 
                  name="availability" 
                  value={filters.availability} 
                  onChange={handleChange}
                  className="w-full p-2 rounded-md border border-[#ddd] text-sm focus:outline-none focus:border-primaryGreen focus:ring-1 focus:ring-primaryGreen"
                >
                  {availableDays.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              {/* Hourly Rate Filter */}
              <div className="bg-[#f9f9f9] p-4 rounded-md border border-[#e0e0e0]">
                <label className="block font-semibold mb-2 text-sm text-gray-700">Hourly Rate (Max)</label>
                <input
                  type="number"
                  name="maxHourlyRate"
                  value={filters.maxHourlyRate}
                  onChange={handleChange}
                  placeholder="Enter max rate"
                  className="w-full p-2 rounded-md border border-[#ddd] text-sm focus:outline-none focus:border-primaryGreen focus:ring-1 focus:ring-primaryGreen"
                />
              </div>

              {/* Daily Rate Filter */}
              <div className="bg-[#f9f9f9] p-4 rounded-md border border-[#e0e0e0]">
                <label className="block font-semibold mb-2 text-sm text-gray-700">Daily Rate (Max)</label>
                <input
                  type="number"
                  name="maxDailyRate"
                  value={filters.maxDailyRate}
                  onChange={handleChange}
                  placeholder="Enter max rate"
                  className="w-full p-2 rounded-md border border-[#ddd] text-sm focus:outline-none focus:border-primaryGreen focus:ring-1 focus:ring-primaryGreen"
                />
              </div>

              {/* Payment Method Filter */}
              <div className="bg-[#f9f9f9] p-4 rounded-md border border-[#e0e0e0]">
                <label className="block font-semibold mb-2 text-sm text-gray-700">Payment Method</label>
                <select 
                  name="paymentMethod" 
                  value={filters.paymentMethod} 
                  onChange={handleChange}
                  className="w-full p-2 rounded-md border border-[#ddd] text-sm focus:outline-none focus:border-primaryGreen focus:ring-1 focus:ring-primaryGreen"
                >
                  <option value="All">All</option>
                  <option value="Cash">Cash</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading ? (
              // Loading skeleton cards
              Array(8).fill().map((_, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-lg p-6 shadow-md border border-[#e0e0e0] flex flex-col min-h-[600px] md:min-h-[550px] animate-pulse"
                >
                  <div className="flex justify-center">
                    <div className="w-[200px] h-[200px] rounded-full bg-gray-200" />
                  </div>
                  <div className="text-center mt-5 space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-5/6 mx-auto" />
                      <div className="h-3 bg-gray-200 rounded w-4/6 mx-auto" />
                      <div className="h-3 bg-gray-200 rounded w-5/6 mx-auto" />
                      <div className="h-3 bg-gray-200 rounded w-4/6 mx-auto" />
                      <div className="h-3 bg-gray-200 rounded w-3/6 mx-auto" />
                      <div className="h-3 bg-gray-200 rounded w-4/6 mx-auto" />
                    </div>
                    <div className="h-10 bg-gray-200 rounded w-2/3 mx-auto mt-6" />
                  </div>
                </div>
              ))
            ) : guides.length > 0 ? (
              guides.map(guide => (
                <div 
                  key={guide._id} 
                  className="bg-default-gradient rounded-lg p-6 shadow-md hover:-translate-y-1 transition-all duration-300 border border-[#e0e0e0] flex flex-col min-h-[600px] md:min-h-[550px]"
                >
                  <div className="flex justify-center">
                    <img
                      className="w-[200px] h-[200px] object-cover rounded-full border border-primaryGreen shadow-md"
                      src={getCloudinaryUrl(guide.profilePhoto)}
                      alt={guide.fullName}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/default-profile.png';
                      }}
                    />
                  </div>
                  <div className="text-center mt-5">
                    <h4 className="text-lg font-semibold text-primaryGreen mb-2">{guide.fullName}</h4>
                    <p className="text-sm text-gray-600 mb-4">Rating: {(Number(guide.averageRating) || 0).toFixed(2) ?? 'No rating yet'}</p>
                    <div className="text-xs text-gray-600 space-y-2">
                      <p>Languages: {guide.professionalDetails?.languagesSpoken?.join(', ')}</p>
                      <p>Experience: {guide.professionalDetails?.experienceYears} yrs</p>
                      <p>Specialty: {guide.professionalDetails?.specialties?.join(', ')}</p>
                      <p>Region: {guide.professionalDetails?.tourRegions?.join(', ')}</p>
                      <p>Hourly: ${guide.pricing?.hourlyRate}</p>
                      <p>Daily: ${guide.pricing?.dailyRate}</p>
                    </div>
                    <Link 
                      to={`/guides/${guide._id}`}
                      className="inline-block mt-6 bg-primaryGreen shadow-lg text-pureWhite font-semibold px-4 py-2 rounded-md hover:bg-pureWhite hover:border-[1px] hover:border-primaryGreen hover:text-primaryGreen transition-colors duration-300"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No guides found</h3>
                <p className="text-gray-500">Try adjusting your filters to find more guides</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default GuideList;