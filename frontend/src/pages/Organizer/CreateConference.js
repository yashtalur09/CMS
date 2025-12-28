import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import Button from '../../components/Button';
import api from '../../utils/api';

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
    domains: '',
    fee: 0
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate description length
    if (formData.description.length > 5000) {
      setError('Description cannot exceed 5000 characters');
      setLoading(false);
      return;
    }

    try {
      const data = {
        ...formData,
        domains: formData.domains.split(',').map(d => d.trim()).filter(Boolean),
        fee: Number(formData.fee)
      };

      await api.post('/organizer/conferences', data);
      navigate('/organizer/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create conference');
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Conference</h1>
          <p className="text-gray-600 mt-1">Fill in the details for your new conference</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <Input
              label="Conference Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="International Conference on AI 2025"
              required
            />

            <div className="mb-4">
              <Textarea
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your conference..."
                rows={6}
                required
              />
              <p className={`text-sm mt-1 ${formData.description.length > 5000 ? 'text-red-600' : 'text-gray-500'}`}>
                {formData.description.length} / 5000 characters
              </p>
            </div>

            <Input
              label="Venue"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              placeholder="City, Country or Virtual"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />

              <Input
                label="End Date"
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>

            <Input
              label="Submission Deadline"
              type="date"
              name="submissionDeadline"
              value={formData.submissionDeadline}
              onChange={handleChange}
              required
            />

            <Input
              label="Domains (comma-separated)"
              name="domains"
              value={formData.domains}
              onChange={handleChange}
              placeholder="AI, Machine Learning, Data Science"
            />

            <Input
              label="Registration Fee"
              type="number"
              name="fee"
              value={formData.fee}
              onChange={handleChange}
              placeholder="0"
              min="0"
            />

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/organizer/dashboard')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
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
