import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import Select from '../../components/Select';
import Loading from '../../components/Loading';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import api from '../../utils/api';

const ReviewPaper = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [formData, setFormData] = useState({
    score: '',
    recommendation: '',
    comments: '',
    confidentialComments: ''
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

  useEffect(() => {
    fetchSubmission();
  }, [id]);

  const fetchSubmission = async () => {
    try {
      const response = await api.get(`/reviewer/assigned-submissions`);
      const submissions = response.data.data || [];
      const found = submissions.find(s => s._id === id);
      setSubmission(found);
    } catch (error) {
      console.error('Error fetching submission:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post(`/reviewer/review/${id}`, formData);
      alert('Review submitted successfully!');
      navigate('/reviewer/assigned-papers');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Loading fullScreen message="Loading submission..." />
      </>
    );
  }

  if (!submission) {
    return (
      <>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card className="text-center py-12">
            <p className="text-gray-600 mb-4">Submission not found or not assigned to you</p>
            <Button onClick={() => navigate('/reviewer/assigned-papers')}>Back to Assigned Papers</Button>
          </Card>
        </div>
      </>
    );
  }

  if (submission.hasReviewed) {
    return (
      <>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Review</h2>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Score:</span>{' '}
                <span className="text-gray-900">{submission.myReview?.score}/10</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Recommendation:</span>{' '}
                <Badge>{submission.myReview?.recommendation}</Badge>
              </div>
              <div>
                <span className="font-medium text-gray-700">Comments:</span>
                <p className="text-gray-600 mt-1">{submission.myReview?.comments}</p>
              </div>
            </div>
            <Button className="mt-6" onClick={() => navigate('/reviewer/assigned-papers')}>
              Back to Assigned Papers
            </Button>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="outline" onClick={() => navigate('/reviewer/assigned-papers')} className="mb-6">
          ← Back to Assigned Papers
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Paper Details */}
          <div className="lg:col-span-2">
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{submission.title}</h2>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Conference:</span> {submission.conferenceId?.name}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Author:</span> {submission.authorId?.name}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Email:</span> {submission.authorId?.email}
                </p>
                {submission.theme && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Theme:</span> {submission.theme}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <h3 className="font-bold text-gray-900 mb-2">Abstract</h3>
                <p className="text-gray-700">{submission.abstract}</p>
              </div>

              {/* Paper Document Section */}
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-3">Paper Document</h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      setPdfUrl(`${API_BASE_URL}${submission.fileUrl}`);
                      setShowPdfModal(true);
                    }}
                  >
                    Preview Paper
                  </Button>
                  <a
                    href={`${API_BASE_URL}${submission.fileUrl}`}
                    download
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    Download
                  </a>
                  <a
                    href={`${API_BASE_URL}${submission.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Open in New Tab
                  </a>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-bold text-gray-900 mb-2">Review Progress</h3>
                <p className="text-gray-600">{submission.progress}</p>
              </div>
            </Card>

            {/* Review Form */}
            <Card className="mt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Submit Your Review</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Score (1-10)"
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={formData.score}
                  onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                />

                <Select
                  label="Recommendation"
                  required
                  value={formData.recommendation}
                  onChange={(e) => setFormData({ ...formData, recommendation: e.target.value })}
                  options={[
                    { value: 'ACCEPT', label: 'Accept' },
                    { value: 'MINOR_REVISION', label: 'Minor Revision' },
                    { value: 'MAJOR_REVISION', label: 'Major Revision' },
                    { value: 'REJECT', label: 'Reject' }
                  ]}
                />

                <Textarea
                  label="Comments (visible to author)"
                  rows={6}
                  required
                  value={formData.comments}
                  onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                  placeholder="Provide detailed feedback for the author..."
                />

                <Textarea
                  label="Confidential Comments (for organizer only)"
                  rows={4}
                  value={formData.confidentialComments}
                  onChange={(e) => setFormData({ ...formData, confidentialComments: e.target.value })}
                  placeholder="Optional confidential comments..."
                />

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/reviewer/assigned-papers')}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Guidelines Sidebar */}
          <div>
            <Card>
              <h3 className="font-bold text-gray-900 mb-3">Review Guidelines</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Provide constructive feedback</li>
                <li>• Be objective and fair</li>
                <li>• Focus on technical merit</li>
                <li>• Check originality</li>
                <li>• Evaluate clarity</li>
                <li>• Consider significance</li>
              </ul>
            </Card>

            <Card className="mt-4">
              <h3 className="font-bold text-gray-900 mb-3">Scoring Guide</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p><span className="font-medium">9-10:</span> Excellent</p>
                <p><span className="font-medium">7-8:</span> Good</p>
                <p><span className="font-medium">5-6:</span> Average</p>
                <p><span className="font-medium">3-4:</span> Below Average</p>
                <p><span className="font-medium">1-2:</span> Poor</p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* PDF Preview Modal */}
      <Modal
        isOpen={showPdfModal}
        onClose={() => {
          setShowPdfModal(false);
          setPdfUrl('');
        }}
        title={`${submission.title} - ${submission.authorId?.name}`}
        size="large"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Author: {submission.authorId?.name}</p>
              <p className="text-xs text-gray-600">{submission.authorId?.email}</p>
              {submission.theme && (
                <p className="text-xs text-gray-600 mt-1">Theme: {submission.theme}</p>
              )}
            </div>
            <div className="flex gap-2">
              <a
                href={pdfUrl}
                download
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Download PDF
              </a>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Open in New Tab
              </a>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden" style={{ height: '70vh' }}>
            <iframe
              src={pdfUrl}
              className="w-full h-full"
              title="Paper Preview"
            />
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowPdfModal(false);
                setPdfUrl('');
              }}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ReviewPaper;
