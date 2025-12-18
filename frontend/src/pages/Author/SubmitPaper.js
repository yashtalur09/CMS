import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import api from '../../utils/api';

const SubmitPaper = () => {
  const { conferenceId } = useParams();
  const navigate = useNavigate();
  const [conference, setConference] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    abstract: ''
  });

  useEffect(() => {
    fetchConferenceDetails();
  }, [conferenceId]);

  const fetchConferenceDetails = async () => {
    try {
      const response = await api.get(`/author/conferences/${conferenceId}`);
      setConference(response.data.data.conference);
      
      if (response.data.data.hasSubmitted) {
        navigate(`/author/conference/${conferenceId}`);
      }
    } catch (error) {
      console.error('Error fetching conference:', error);
      setError('Failed to load conference details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are allowed');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Paper title is required');
      return;
    }

    if (!formData.abstract.trim()) {
      setError('Abstract is required');
      return;
    }

    if (!selectedFile) {
      setError('Paper file is required');
      return;
    }

    setSubmitting(true);

    try {
      const submitFormData = new FormData();
      submitFormData.append('conferenceId', conferenceId);
      submitFormData.append('title', formData.title);
      submitFormData.append('abstract', formData.abstract);
      submitFormData.append('paper', selectedFile);

      await api.post('/author/submissions', submitFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate('/author/submissions');
    } catch (error) {
      setError(error.response?.data?.message || 'Error submitting paper');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Loading fullScreen message="Loading..." />
      </>
    );
  }

  if (!conference) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/author/conference/${conferenceId}`)}
          className="mb-6"
        >
          ← Back
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Submit Paper</h1>
          <p className="text-gray-600 mt-1">Submitting to: {conference.name}</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Title */}
            <Input
              label="Paper Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter your paper title"
              required
              maxLength="300"
            />

            {/* Abstract */}
            <Textarea
              label="Abstract"
              name="abstract"
              value={formData.abstract}
              onChange={handleInputChange}
              placeholder="Provide a brief abstract of your paper (max 5000 characters)"
              rows={6}
              required
              maxLength="5000"
            />

            {/* File Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paper (PDF File) <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required
                />
                {selectedFile ? (
                  <div>
                    <div className="text-4xl mb-2">✓</div>
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-600">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Click to change file</p>
                  </div>
                ) : (
                  <div>
                    <div className="text-4xl mb-2">📄</div>
                    <p className="font-medium text-gray-900">Drop your PDF here</p>
                    <p className="text-sm text-gray-600">or click to browse</p>
                    <p className="text-xs text-gray-500 mt-2">Maximum file size: 10 MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <Card className="bg-blue-50 border border-blue-200 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">✓ Submission Guidelines</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Only PDF files are accepted</li>
                <li>• Maximum file size: 10 MB</li>
                <li>• Your submission will be reviewed by our panel</li>
                <li>• You'll receive updates via email</li>
              </ul>
            </Card>

            {/* Buttons */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/author/conference/${conferenceId}`)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? 'Submitting...' : 'Submit Paper'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
};

export default SubmitPaper;
