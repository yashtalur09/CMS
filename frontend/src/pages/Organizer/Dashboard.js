import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Loading from '../../components/Loading';
import api from '../../utils/api';

const OrganizerDashboard = () => {
  const navigate = useNavigate();
  const [conferences, setConferences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConferences();
  }, []);

  const fetchConferences = async () => {
    try {
      const response = await api.get('/organizer/conferences');
      setConferences(response.data.data.conferences);
    } catch (error) {
      console.error('Error fetching conferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Loading fullScreen message="Loading dashboard..." />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Organizer Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your conferences and submissions</p>
          </div>
          <Button onClick={() => navigate('/organizer/create-conference')}>
            + Create Conference
          </Button>
        </div>

        {/* Conferences Grid */}
        {conferences.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Conferences Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first conference to get started
            </p>
            <Button onClick={() => navigate('/organizer/create-conference')}>
              Create Conference
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {conferences.map((conference) => (
              <Card
                key={conference._id}
                hoverable
                onClick={() => navigate(`/organizer/manage-conference/${conference._id}`)}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
                    {conference.name}
                  </h3>
                  <Badge variant={conference.status === 'active' ? 'success' : 'default'}>
                    {conference.status}
                  </Badge>
                </div>

                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                  {conference.description}
                </p>

                <div className="space-y-2 text-sm text-gray-700 mb-4">
                  <div className="flex items-center">
                    <span className="font-medium w-24">Venue:</span>
                    <span>{conference.venue}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium w-24">Date:</span>
                    <span>
                      {formatDate(conference.startDate)} - {formatDate(conference.endDate)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium w-24">Deadline:</span>
                    <span>{formatDate(conference.submissionDeadline)}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">
                      {conference.stats?.submissions || 0}
                    </div>
                    <div className="text-xs text-gray-600">Submissions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {conference.stats?.accepted || 0}
                    </div>
                    <div className="text-xs text-gray-600">Accepted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {conference.stats?.pending || 0}
                    </div>
                    <div className="text-xs text-gray-600">Pending</div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t space-y-2">
                  <Button
                    size="sm"
                    fullWidth
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/organizer/manage-conference/${conference._id}`);
                    }}
                  >
                    Manage
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/organizer/submissions/${conference._id}`);
                    }}
                  >
                    View Submissions
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default OrganizerDashboard;
