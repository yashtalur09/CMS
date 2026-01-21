import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createConference } from '../../utils/api';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import Button from '../../components/Button';

const CreateConference = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    venue: '',
    startDate: '',
    endDate: '',
    submissionDeadline: '',
    tracks: [],
  });
  const [currentTrack, setCurrentTrack] = useState({ name: '', description: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleTrackChange = (e) => {
    setCurrentTrack({
      ...currentTrack,
      [e.target.name]: e.target.value,
    });
  };

  const addTrack = () => {
    if (!currentTrack.name.trim()) {
      setError('Please enter a track name');
      return;
    }
    setFormData({
      ...formData,
      tracks: [...formData.tracks, { ...currentTrack }],
    });
    setCurrentTrack({ name: '', description: '' });
    setError('');
  };

  const removeTrack = (index) => {
    setFormData({
      ...formData,
      tracks: formData.tracks.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Please enter conference name');
      return;
    }
    if (!formData.description.trim()) {
      setError('Please enter description');
      return;
    }
    if (!formData.venue.trim()) {
      setError('Please enter venue');
      return;
    }
    if (!formData.startDate) {
      setError('Please select start date');
      return;
    }
    if (!formData.endDate) {
      setError('Please select end date');
      return;
    }
    if (!formData.submissionDeadline) {
      setError('Please select submission deadline');
      return;
    }
    if (formData.tracks.length === 0) {
      setError('Please add at least one track');
      return;
    }

    setLoading(true);
    try {
      await createConference(formData);
      navigate('/organizer/dashboard');
    } catch (err) {
      console.error('Error creating conference:', err);
      setError(err.response?.data?.message || 'Failed to create conference');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create Conference</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">Fill in the details for your new conference</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Conference Name */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Conference Name <span className="text-red-600">*</span>
              </label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="International Conference on AI 2025"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Description <span className="text-red-600">*</span>
              </label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your conference..."
                rows="4"
                required
              />
            </div>

            {/* Venue */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Venue <span className="text-red-600">*</span>
              </label>
              <Input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                placeholder="City, Country or Virtual"
                required
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Start Date <span className="text-red-600">*</span>
                </label>
                <Input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  End Date <span className="text-red-600">*</span>
                </label>
                <Input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Submission Deadline <span className="text-red-600">*</span>
                </label>
                <Input
                  type="date"
                  name="submissionDeadline"
                  value={formData.submissionDeadline}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Tracks Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Tracks <span className="text-red-600">*</span></h3>

              {/* Add Track Form */}
              <Card className="p-4 mb-4 bg-gray-50">
                <div className="space-y-3">
                  <Input
                    type="text"
                    name="name"
                    value={currentTrack.name}
                    onChange={handleTrackChange}
                    placeholder="Track name (e.g., Machine Learning)"
                  />
                  <Textarea
                    name="description"
                    value={currentTrack.description}
                    onChange={handleTrackChange}
                    placeholder="Track description (optional)"
                    rows="2"
                  />
                  <Button
                    type="button"
                    onClick={addTrack}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    + Add Track
                  </Button>
                </div>
              </Card>

              {/* Tracks List */}
              {formData.tracks.length > 0 && (
                <div className="space-y-2">
                  {formData.tracks.map((track, index) => (
                    <div key={index} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{track.name}</p>
                        {track.description && (
                          <p className="text-sm text-gray-600">{track.description}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTrack(index)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6 border-t">
              <Button
                type="button"
                onClick={() => navigate('/organizer/dashboard')}
                className="flex-1 bg-gray-600 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Creating...' : 'Create Conference'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
};

export default CreateConference;
