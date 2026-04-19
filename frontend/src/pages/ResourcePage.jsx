import { useState, useEffect } from 'react';
import { searchResources } from '../services/api';
import { SearchIcon, FilterIcon, BuildingIcon, UsersIcon, CheckCircleIcon, XCircleIcon, MonitorIcon } from '../components/Icons';
import './ResourcePage.css';

const ResourcePage = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    keyword: '',
    type: '',
    minCapacity: '',
    bookable: '',
  });

  const [selectedResource, setSelectedResource] = useState(null);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const payload = { ...filters };
      if (payload.minCapacity === '') delete payload.minCapacity;
      if (payload.type === '') delete payload.type;
      if (payload.bookable === '') delete payload.bookable;
      else payload.bookable = payload.bookable === 'true';

      const res = await searchResources(payload);
      setResources(res.data);
    } catch (err) {
      console.error('Failed to load resources', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const getFallbackImage = (type) => {
    switch (type) {
      case 'LECTURE_HALL': return 'https://images.unsplash.com/photo-1577415124269-b9140d10b214?auto=format&fit=crop&q=80&w=800';
      case 'LAB': return 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800';
      case 'MEETING_ROOM': return 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800';
      default: return 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'LAB': return <MonitorIcon size={16} />;
      default: return <BuildingIcon size={16} />;
    }
  };

  return (
    <div className="resources-container">
      <div className="resources-header-banner">
        <h1>Facilities Catalogue</h1>
        <p>Explore and discover available campus resources, lecture halls, and specialized equipment.</p>
      </div>

      <div className="resources-layout">
        {/* Sidebar Filters */}
        <aside className="resources-sidebar">
          <div className="filter-card glass-panel">
            <div className="filter-header">
              <FilterIcon size={18} />
              <h2>Smart Filter</h2>
            </div>
            
            <div className="filter-group">
              <label>Search Keyword</label>
              <div className="search-input-wrapper">
                <SearchIcon size={16} />
                <input
                  type="text"
                  name="keyword"
                  placeholder="name, code, building..."
                  value={filters.keyword}
                  onChange={handleFilterChange}
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Resource Type</label>
              <select name="type" value={filters.type} onChange={handleFilterChange}>
                <option value="">All Types</option>
                <option value="LECTURE_HALL">Lecture Hall</option>
                <option value="LAB">Laboratory</option>
                <option value="MEETING_ROOM">Meeting Room</option>
                <option value="PROJECTOR">Projector</option>
                <option value="CAMERA">Camera</option>
                <option value="MICROPHONE">Microphone</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Minimum Capacity</label>
              <input
                type="number"
                name="minCapacity"
                placeholder="e.g. 50"
                value={filters.minCapacity}
                onChange={handleFilterChange}
                min="0"
              />
            </div>

            <div className="filter-group">
              <label>Availability</label>
              <select name="bookable" value={filters.bookable} onChange={handleFilterChange}>
                <option value="">Any Status</option>
                <option value="true">Bookable Only</option>
                <option value="false">View Only</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Main Grid */}
        <main className="resources-grid-wrapper">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Scanning facilities catalogue...</p>
            </div>
          ) : resources.length > 0 ? (
            <div className="resources-grid">
              {resources.map((res) => (
                <div 
                  className="resource-card glass-panel" 
                  key={res.id}
                  onClick={() => setSelectedResource(res)}
                >
                  <div className="card-image-wrapper">
                    <img 
                      src={res.imageUrl || getFallbackImage(res.type)} 
                      alt={res.name} 
                      loading="lazy"
                    />
                    <div className="card-badge">{res.code}</div>
                  </div>
                  <div className="card-content">
                    <h3>{res.name}</h3>
                    <div className="card-meta">
                      <span className="meta-tag">
                        {getTypeIcon(res.type)} {res.type.replace('_', ' ')}
                      </span>
                      {res.capacity > 0 && (
                        <span className="meta-tag capacity">
                          <UsersIcon size={14} /> {res.capacity} Seats
                        </span>
                      )}
                    </div>
                    
                    <div className="card-footer">
                      <span className="location-text">
                        <BuildingIcon size={14} /> {res.building} - {res.floor}
                      </span>
                      {res.bookable ? (
                         <span className="status-indicator active"><CheckCircleIcon size={14} /> Bookable</span>
                      ) : (
                         <span className="status-indicator inactive"><XCircleIcon size={14} /> Read-only</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state glass-panel">
              <SearchIcon size={48} color="#64748b" />
              <h3>No resources found</h3>
              <p>Try adjusting your smart filters to discover more facilities.</p>
              <button 
                className="btn-clear" 
                onClick={() => setFilters({ keyword: '', type: '', minCapacity: '', bookable: '' })}
              >
                Clear all filters
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Resource Details Modal */}
      {selectedResource && (
        <div className="modal-overlay" onClick={() => setSelectedResource(null)}>
          <div className="resource-modal glass-panel" onClick={e => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setSelectedResource(null)}>&times;</button>
            
            <div className="modal-header-image" style={{ backgroundImage: `url(${selectedResource.imageUrl || getFallbackImage(selectedResource.type)})` }}>
              <div className="modal-badge">{selectedResource.code}</div>
            </div>
            
            <div className="modal-body">
              <h2>{selectedResource.name}</h2>
              <p className="modal-desc">{selectedResource.description || 'No detailed description provided.'}</p>
              
              <div className="modal-grid">
                <div className="info-block">
                  <h4>Location Details</h4>
                  <p><strong>Building:</strong> {selectedResource.building}</p>
                  <p><strong>Floor:</strong> {selectedResource.floor}</p>
                  <p><strong>Specific:</strong> {selectedResource.location}</p>
                </div>
                <div className="info-block">
                  <h4>Specifications</h4>
                  <p><strong>Type:</strong> {selectedResource.type.replace('_', ' ')}</p>
                  <p><strong>Capacity:</strong> {selectedResource.capacity || 'N/A'}</p>
                  <p><strong>Status:</strong> <span className={`status-badge ${selectedResource.status.toLowerCase()}`}>{selectedResource.status}</span></p>
                </div>
              </div>

              {selectedResource.amenities && selectedResource.amenities.length > 0 && (
                <div className="amenities-section">
                  <h4>Available Amenities</h4>
                  <div className="amenities-tags">
                    {selectedResource.amenities.map(am => <span key={am} className="am-tag">{am}</span>)}
                  </div>
                </div>
              )}

              {selectedResource.availabilityWindows && selectedResource.availabilityWindows.length > 0 && (
                <div className="windows-section">
                  <h4>Standard Availability</h4>
                  <table className="windows-table">
                    <thead><tr><th>Day</th><th>Time Window</th></tr></thead>
                    <tbody>
                      {selectedResource.availabilityWindows.map((w, i) => (
                        <tr key={i}>
                          <td className="day-cell">{w.day}</td>
                          <td>{w.startTime} — {w.endTime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcePage;
