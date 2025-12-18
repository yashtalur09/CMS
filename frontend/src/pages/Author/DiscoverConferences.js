import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Loading from '../../components/Loading';
import api from '../../utils/api';

const DiscoverConferences = () => {
  const navigate = useNavigate();
  const [conferences, setConferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: '',
    domain: '',
    minFee: '',
    maxFee: '',
    sortBy: 'deadline'
  });

  useEffect(() => {
    fetchConferences();
  }, [filters]);

  const fetchConferences = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (filters.location) query.append('location', filters.location);
      if (filters.domain) query.append('domain', filters.domain);
      if (filters.minFee) query.append('minFee', filters.minFee);
      if (filters.maxFee) query.append('maxFee', filters.maxFee);
      query.append('sortBy', filters.sortBy);

      const response = await api.get(`/author/conferences?${query.toString()}`);
      setConferences(response.data.data.conferences);
    } catch (error) {
      console.error('Error fetching conferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isDeadlinePassed = (deadline) => {
    return new Date(deadline) < new Date();
  };

  if (loading && conferences.length === 0) {
    return (
      <>
        <Navbar />
        <Loading fullScreen message="Loading conferences..." />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Discover Conferences</h1>
          <p className="text-gray-600 mt-1">Find and submit papers to conferences</p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Input
              label="Location"
              name="location"
              type="text"
              value={filters.location}
              onChange={handleFilterChange}
              placeholder="Search by venue..."
            />

            <Input
              label="Domain"
              name="domain"
              type="text"
              value={filters.domain}
              onChange={handleFilterChange}
              placeholder="e.g., AI, ML"
            />

            <Input
              label="Min Fee"
              name="minFee"
              type="number"
              value={filters.minFee}
              onChange={handleFilterChange}
              placeholder="0"
              min="0"
            />

            <Input
              label="Max Fee"
              name="maxFee"
              type="number"
              value={filters.maxFee}
              onChange={handleFilterChange}
              placeholder="Any"
              min="0"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                name="sortBy"
                value={filters.sortBy}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="deadline">Deadline</option>
                <option value="newest">Newest</option>
                <option value="startDate">Start Date</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Conferences Grid */}
        {conferences.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Conferences Found
            </h3>
            <p className="text-gray-600">
              Try adjusting your filters or check back later
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {conferences.map((conference) => (
              <Card
                key={conference._id}
                hoverable
                onClick={() => navigate(`/author/conference/${conference._id}`)}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-2 flex-1">
                    {conference.name}
                  </h3>
                  <Badge
                    variant={isDeadlinePassed(conference.submissionDeadline) ? 'danger' : 'success'}
                    className="ml-2 flex-shrink-0"
                  >
                    {isDeadlinePassed(conference.submissionDeadline) ? 'Closed' : 'Open'}
                  </Badge>
                </div>

                <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                  {conference.description}
                </p>

                {/* Details */}
                <div className="space-y-2 text-sm mb-4 pb-4 border-b">
                  <div className="flex items-center text-gray-700">
                    <span className="text-gray-500 mr-2">📍</span>
                    <span className="line-clamp-1">{conference.venue}</span>
                  </div>

                  <div className="flex items-center text-gray-700">
                    <span className="text-gray-500 mr-2">📅</span>
                    <span>
                      {formatDate(conference.startDate)} - {formatDate(conference.endDate)}
                    </span>
                  </div>

                  <div className="flex items-center text-gray-700">
                    <span className="text-gray-500 mr-2">⏰</span>
                    <span>Deadline: {formatDate(conference.submissionDeadline)}</span>
                  </div>

                  {conference.fee > 0 && (
                    <div className="flex items-center text-gray-700">
                      <span className="text-gray-500 mr-2">💰</span>
                      <span>Fee: ${conference.fee}</span>
                    </div>
                  )}

                  {conference.domains && conference.domains.length > 0 && (
                    <div className="flex items-center text-gray-700 gap-2 flex-wrap">
                      <span className="text-gray-500">🏷️</span>
                      {conference.domains.map((domain, idx) => (
                        <Badge key={idx} variant="info" size="sm">
                          {domain}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Organizer Info */}
                {conference.organizerId && (
                  <div className="mb-4 pb-4 border-b">
                    <p className="text-xs text-gray-600">
                      Organized by <span className="font-medium">{conference.organizerId.name}</span>
                    </p>
                  </div>
                )}

                {/* Action Button */}
                <Button
                  variant={isDeadlinePassed(conference.submissionDeadline) ? 'outline' : 'primary'}
                  size="sm"
                  fullWidth
                  disabled={isDeadlinePassed(conference.submissionDeadline)}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/author/conference/${conference._id}`);
                  }}
                >
                  {isDeadlinePassed(conference.submissionDeadline) ? 'Submissions Closed' : 'View Details'}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default DiscoverConferences;
