import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import api from '../../utils/api';

const ConferenceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [conference, setConference] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    fetchConferenceDetails();
  }, [id]);

  const fetchConferenceDetails = async () => {
    try {
      const response = await api.get(`/author/conferences/${id}`);
      setConference(response.data.data.conference);
      setHasSubmitted(response.data.data.hasSubmitted);
    } catch (error) {
      console.error('Error fetching conference:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isDeadlinePassed = (deadline) => {
    return new Date(deadline) < new Date();
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Loading fullScreen message="Loading conference details..." />
      </>
    );
  }

  if (!conference) {
    return (
      <>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card className="text-center py-12">
            <p className="text-gray-600">Conference not found</p>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/author/discover')}
          className="mb-6"
        >
          ← Back to Conferences
        </Button>

        <Card className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {conference.name}
              </h1>
              <p className="text-lg text-gray-600">
                Organized by <span className="font-semibold">{conference.organizerId?.name}</span>
              </p>
            </div>
            <div className="text-right">
              <Badge
                variant={isDeadlinePassed(conference.submissionDeadline) ? 'danger' : 'success'}
                size="lg"
              >
                {isDeadlinePassed(conference.submissionDeadline) ? 'Submissions Closed' : 'Open for Submissions'}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Left - Description and Details */}
          <div className="col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {conference.description}
              </p>
            </Card>

            {/* Key Dates */}
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Important Dates</h2>
              <div className="space-y-3">
                <div className="pb-3 border-b">
                  <p className="text-sm text-gray-600">Submission Deadline</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(conference.submissionDeadline)}
                  </p>
                </div>
                <div className="pb-3 border-b">
                  <p className="text-sm text-gray-600">Conference Start Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(conference.startDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Conference End Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(conference.endDate)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Venue & Contact */}
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Venue & Contact</h2>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="text-lg font-semibold text-gray-900">{conference.venue}</p>
                </div>
                {conference.organizerId?.email && (
                  <div>
                    <p className="text-sm text-gray-600">Contact</p>
                    <a
                      href={`mailto:${conference.organizerId.email}`}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      {conference.organizerId.email}
                    </a>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right - Sidebar */}
          <div className="col-span-1">
            {/* Submission Status */}
            <Card className="mb-4 sticky top-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Submission Status</h3>
              
              {hasSubmitted ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-green-800">✓ You have already submitted to this conference</p>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-blue-800 text-sm">Ready to submit your paper?</p>
                </div>
              )}

              {/* Details */}
              <div className="space-y-3 mb-4 pb-4 border-b">
                <div>
                  <p className="text-sm text-gray-600">Registration Fee</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {conference.fee > 0 ? `$${conference.fee}` : 'FREE'}
                  </p>
                </div>

                {conference.domains && conference.domains.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Research Areas</p>
                    <div className="flex flex-wrap gap-2">
                      {conference.domains.map((domain, idx) => (
                        <Badge key={idx} variant="primary" size="sm">
                          {domain}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              {!hasSubmitted && !isDeadlinePassed(conference.submissionDeadline) && (
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => navigate(`/author/submit/${conference._id}`)}
                >
                  Submit Paper
                </Button>
              )}

              {hasSubmitted && (
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => navigate('/author/submissions')}
                >
                  View Submission
                </Button>
              )}

              {isDeadlinePassed(conference.submissionDeadline) && !hasSubmitted && (
                <Button
                  variant="outline"
                  fullWidth
                  disabled
                >
                  Submissions Closed
                </Button>
              )}
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConferenceDetails;
