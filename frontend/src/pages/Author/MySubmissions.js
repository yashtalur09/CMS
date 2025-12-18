import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import api from '../../utils/api';

const MySubmissions = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await api.get('/author/submissions');
      setSubmissions(Array.isArray(response.data.data) ? response.data.data : response.data.data.submissions || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
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

  const getStatusVariant = (status) => {
    const variants = {
      submitted: 'info',
      under_review: 'warning',
      review_completed: 'warning',
      accepted: 'success',
      rejected: 'danger',
      camera_ready_pending: 'warning',
      final_submitted: 'success'
    };
    return variants[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      submitted: 'Submitted',
      under_review: 'Under Review',
      review_completed: 'Review Completed',
      accepted: 'Accepted',
      rejected: 'Rejected',
      camera_ready_pending: 'Camera Ready Pending',
      final_submitted: 'Final Submitted'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Loading fullScreen message="Loading submissions..." />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Submissions</h1>
            <p className="text-gray-600 mt-1">Track all your paper submissions</p>
          </div>
          <Button onClick={() => navigate('/author/discover')}>
            + Submit New Paper
          </Button>
        </div>

        {submissions.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Submissions Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start submitting papers to conferences
            </p>
            <Button onClick={() => navigate('/author/discover')}>
              Discover Conferences
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <Card
                key={submission._id}
                hoverable
                onClick={() => navigate(`/author/submissions/${submission._id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {submission.title}
                      </h3>
                      <Badge variant={getStatusVariant(submission.status)}>
                        {getStatusLabel(submission.status)}
                      </Badge>
                    </div>

                    <p className="text-gray-600 mb-3">
                      Conference: <span className="font-medium">{submission.conferenceId?.name}</span>
                    </p>

                    <p className="text-gray-700 text-sm line-clamp-2 mb-3">
                      {submission.abstract}
                    </p>

                    {/* Review Progress Bar */}
                    {(submission.status === 'under_review' || submission.status === 'review_completed') && (
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-gray-700">Review Progress</span>
                          <span className="text-xs text-gray-600">{submission.progress || submission.reviewProgress?.percentage + '%'}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${submission.reviewProgress?.percentage || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-6 text-sm text-gray-600">
                      <div>
                        <span className="text-gray-500">Submitted:</span>{' '}
                        <span className="font-medium">{formatDate(submission.submittedAt || submission.createdAt)}</span>
                      </div>

                      {submission.reviewCount !== undefined && (
                        <div>
                          <span className="text-gray-500">Reviews:</span>{' '}
                          <span className="font-medium">{submission.reviewCount} / {submission.requiredReviews || 3}</span>
                        </div>
                      )}

                      {submission.status === 'accepted' && submission.presentationSlot && (
                        <div>
                          <span className="text-gray-500">Presentation:</span>{' '}
                          <span className="font-medium">
                            {formatDate(submission.presentationSlot.date)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/author/submissions/${submission._id}`);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>

                {/* Reviews Section */}
                {submission.status !== 'under_review' && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium text-gray-900 mb-2">Reviewer Feedback</p>
                    <p className="text-sm text-gray-600">
                      Click "View Details" to see reviews and feedback
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MySubmissions;
