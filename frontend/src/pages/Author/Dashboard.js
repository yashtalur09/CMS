import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import api from '../../utils/api';

const AuthorDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ submissions: [], activeConferences: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/author/dashboard');
      setData(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      under_review: 'warning',
      accepted: 'success',
      rejected: 'danger'
    };
    return <Badge variant={variants[status]}>{status.replace('_', ' ')}</Badge>;
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
          <h1 className="text-3xl font-bold text-gray-900">Author Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your submissions and discover conferences</p>
        </div>

        {/* My Submissions */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">My Submissions</h2>
            <Button variant="outline" size="sm" onClick={() => navigate('/author/submissions')}>
              View All
            </Button>
          </div>

          {data.submissions.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-gray-600">No submissions yet</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.submissions.map((submission) => (
                <Card key={submission._id} hoverable>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">
                      {submission.title}
                    </h3>
                    {getStatusBadge(submission.status)}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {submission.conferenceId?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Submitted: {new Date(submission.createdAt).toLocaleDateString()}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Active Conferences */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Active Conferences</h2>
            <Button onClick={() => navigate('/author/discover')}>
              Discover More
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.activeConferences.map((conference) => (
              <Card
                key={conference._id}
                hoverable
                onClick={() => navigate(`/author/conference/${conference._id}`)}
              >
                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                  {conference.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{conference.venue}</p>
                <p className="text-xs text-gray-500">
                  Deadline: {new Date(conference.submissionDeadline).toLocaleDateString()}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthorDashboard;
