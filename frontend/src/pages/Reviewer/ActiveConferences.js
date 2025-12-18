import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import api from '../../utils/api';

const ActiveConferences = () => {
  const navigate = useNavigate();
  const [conferences, setConferences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConferences();
  }, []);

  const fetchConferences = async () => {
    try {
      const response = await api.get('/reviewer/conferences');
      setConferences(response.data.data.conferences || []);
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

  const isSubmissionOpen = (deadline) => {
    return new Date(deadline) > new Date();
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Loading fullScreen message="Loading active conferences..." />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Active Conferences</h1>
          <p className="text-gray-600 mt-1">Browse approved submissions and bid on papers to review</p>
        </div>

        {conferences.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-600 text-lg">No active conferences available</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {conferences.map((conference) => (
              <Card
                key={conference._id}
                hoverable
                onClick={() => navigate(`/reviewer/conferences/${conference._id}/submissions`)}
                className="cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-900">
                    {conference.name}
                  </h3>
                  <Badge variant={conference.status === 'active' ? 'success' : 'default'}>
                    {conference.status}
                  </Badge>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {conference.description}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-gray-700">{conference.venue}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-700">
                      {formatDate(conference.startDate)} - {formatDate(conference.endDate)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className={`font-medium ${isSubmissionOpen(conference.submissionDeadline) ? 'text-green-600' : 'text-red-600'}`}>
                      Deadline: {formatDate(conference.submissionDeadline)}
                    </span>
                  </div>

                  {conference.approvedSubmissionCount !== undefined && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="font-medium text-blue-600">
                        {conference.approvedSubmissionCount} approved paper{conference.approvedSubmissionCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}

                  {conference.domains && conference.domains.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {conference.domains.slice(0, 3).map((domain, idx) => (
                        <Badge key={idx} variant="info" className="text-xs">
                          {domain}
                        </Badge>
                      ))}
                      {conference.domains.length > 3 && (
                        <Badge variant="default" className="text-xs">
                          +{conference.domains.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t">
                  <Button
                    size="sm"
                    variant="primary"
                    fullWidth
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/reviewer/conferences/${conference._id}/submissions`);
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

export default ActiveConferences;
