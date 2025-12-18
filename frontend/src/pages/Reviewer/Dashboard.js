import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import api from '../../utils/api';

const ReviewerDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    conferences: [],
    recentBids: [],
    pendingReviews: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/reviewer/dashboard');
      setData(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reviewer Dashboard</h1>
          <p className="text-gray-600 mt-1">Review papers and manage your bidding</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card
            hoverable
            onClick={() => navigate('/reviewer/browse-conferences')}
            className="cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Browse Conferences</h3>
                <p className="text-sm text-gray-600">Find papers to review</p>
              </div>
            </div>
          </Card>

          <Card
            hoverable
            onClick={() => navigate('/reviewer/assigned-papers')}
            className="cursor-pointer bg-gradient-to-br from-green-50 to-green-100 border-green-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">My Assigned Papers</h3>
                <p className="text-sm text-gray-600">Papers you're reviewing</p>
              </div>
            </div>
          </Card>

          <Card
            hoverable
            onClick={() => navigate('/reviewer/reviews')}
            className="cursor-pointer bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">My Reviews</h3>
                <p className="text-sm text-gray-600">View your submissions</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Pending Reviews */}
        {data.pendingReviews.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Pending Reviews</h2>
              <Badge variant="danger">{data.pendingReviews.length}</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.pendingReviews.map((item) => (
                <Card
                  key={item._id}
                  hoverable
                  onClick={() => navigate(`/reviewer/submission/${item.submissionId._id}/review`)}
                >
                  <h3 className="font-bold text-gray-900 line-clamp-2 mb-2">
                    {item.submissionId?.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Conference: {item.conferenceId?.name}
                  </p>
                  <Button
                    size="sm"
                    fullWidth
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/reviewer/submission/${item.submissionId._id}/review`);
                    }}
                  >
                    Review Now
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Active Conferences */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Active Conferences</h2>
            <Button variant="outline" size="sm" onClick={() => navigate('/reviewer/browse-conferences')}>
              View All
            </Button>
          </div>

          {data.conferences.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-gray-600">No matching conferences at the moment</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.conferences.map((conference) => (
                <Card
                  key={conference._id}
                  hoverable
                  onClick={() => navigate(`/reviewer/conferences/${conference._id}/submissions`)}
                >
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                    {conference.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{conference.venue}</p>
                  <p className="text-xs text-gray-500 mb-3">
                    Deadline: {formatDate(conference.submissionDeadline)}
                  </p>
                  <Button
                    size="sm"
                    fullWidth
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/reviewer/conferences/${conference._id}/submissions`);
                    }}
                  >
                    View Papers
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bids */}
        {data.recentBids.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Bids</h2>
            <div className="space-y-2">
              {data.recentBids.slice(0, 5).map((bid) => (
                <Card key={bid._id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">
                      {bid.submissionId?.conferenceId?.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {bid.bidValue === 1 ? '✓ Interested' : '✗ Not Interested'}
                    </p>
                  </div>
                  <Badge variant={bid.bidValue === 1 ? 'success' : 'default'}>
                    {bid.bidValue === 1 ? 'Interested' : 'Not Interested'}
                  </Badge>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ReviewerDashboard;
