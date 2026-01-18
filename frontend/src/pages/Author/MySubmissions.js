import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthorSubmissions } from '../../utils/api';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import Select from '../../components/Select';

export default function MySubmissions() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  useEffect(() => {
    if (statusFilter) {
      setFilteredSubmissions(submissions.filter((s) => s.status === statusFilter));
    } else {
      setFilteredSubmissions(submissions);
    }
  }, [statusFilter, submissions]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAuthorSubmissions();
      setSubmissions(data.data || data);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError(err.response?.data?.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      under_review: 'warning',
      accepted: 'success',
      rejected: 'danger',
      pending: 'info',
      submitted: 'info',
      revision: 'warning'
    };
    const statusLabels = {
      under_review: 'Under Review',
      accepted: 'Accepted',
      rejected: 'Rejected',
      pending: 'Pending',
      submitted: 'Submitted',
      revision: '⚠️ Revision Needed'
    };
    return <Badge variant={variants[status] || 'default'}>{statusLabels[status] || status?.replace('_', ' ')}</Badge>;
  };

  if (loading) return <Loading />;

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="text-blue-600 hover:text-blue-800 mb-4"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">My Submissions</h1>
          </div>
          <Button
            onClick={() => navigate('/author/discover')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Submit New Paper
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
            <button
              onClick={fetchSubmissions}
              className="text-red-600 hover:text-red-800 font-medium mt-2"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Filter */}
        <div className="mb-6 flex gap-4 items-center">
          <label className="text-sm font-medium text-gray-900">Filter by Status:</label>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="max-w-xs"
          >
            <option value="">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="revision">Revision Needed</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </Select>
        </div>

        {/* Submissions List */}
        {filteredSubmissions.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-600 mb-4">No submissions found</p>
            <Button
              onClick={() => navigate('/author/discover')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Submit Your First Paper
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map((submission) => (
              <Card
                key={submission._id}
                className="hover:shadow-lg transition cursor-pointer"
                onClick={() => navigate(`/author/submissions/${submission._id}`)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {submission.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Conference: {submission.conferenceId?.name || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      Track: {submission.trackId?.name || 'Unknown'}
                    </p>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>Submitted: {new Date(submission.createdAt).toLocaleDateString()}</span>
                      {submission.feedback && (
                        <span className="text-gray-900 font-medium">Has Feedback</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(submission.status)}
                    <div className="flex gap-2">
                      {submission.status === 'revision' && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/author/submissions/${submission._id}`);
                          }}
                          className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium"
                        >
                          ✏️ Edit & Resubmit
                        </Button>
                      )}
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/author/submissions/${submission._id}`);
                        }}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-sm"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
