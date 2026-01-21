import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getReviewerBids, getReviewerReviews } from '../../utils/api';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Loading from '../../components/Loading';

const ReviewerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [bids, setBids] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const [bidsRes, reviewsRes] = await Promise.all([
        getReviewerBids(),
        getReviewerReviews(),
      ]);
      setBids(bidsRes.data || bidsRes);
      setReviews(reviewsRes.data || reviewsRes);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
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
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reviewer Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">Welcome, {user?.name || 'Reviewer'}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
            <button
              onClick={fetchDashboard}
              className="text-red-600 hover:text-red-800 font-medium mt-2"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">
                {bids.filter((b) => !b.status || b.status.toUpperCase() === 'PENDING').length}
              </div>
              <p className="text-gray-600 mt-2">Active Bids</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">
                {reviews.filter((r) => r.submissionId).length}
              </div>
              <p className="text-gray-600 mt-2">Completed Reviews</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600">
                {bids.length}
              </div>
              <p className="text-gray-600 mt-2">Total Bids</p>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => navigate('/reviewer/browse-conferences')}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Browse Conferences
            </Button>
            <Button
              onClick={() => navigate('/reviewer/bids')}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Manage Bids
            </Button>
            <Button
              onClick={() => navigate('/reviewer/reviews')}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              My Reviews
            </Button>
          </div>
        </div>

        {/* Recent Bids */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Bids</h2>
          {bids.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-gray-600 mb-4">No bids yet</p>
              <Button
                onClick={() => navigate('/reviewer/browse-conferences')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Start Bidding on Submissions
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bids.slice(0, 4).map((bid) => (
                <Card key={bid._id} hoverable>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 line-clamp-1 flex-1">
                      {bid.submissionId?.title || 'Unknown'}
                    </h3>
                    <Badge variant={bid.status === 'accepted' ? 'success' : 'info'}>
                      {bid.status || 'Pending'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Conference: {bid.submissionId?.conferenceId?.name || bid.trackId?.conferenceId?.name || bid.conferenceId?.name || 'View Details'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Bid Date: {new Date(bid.createdAt).toLocaleDateString()}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent Reviews */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Reviews</h2>
          {reviews.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-gray-600">No reviews submitted yet</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.slice(0, 4).map((review) => (
                <Card key={review._id} hoverable>
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">
                    {review.submissionId?.title || 'Unknown'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Recommendation: <span className="font-medium">{review.recommendation}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Submitted: {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ReviewerDashboard;
