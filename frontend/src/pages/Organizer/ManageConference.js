import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import Select from '../../components/Select';
import Badge from '../../components/Badge';
import Loading from '../../components/Loading';
import Modal from '../../components/Modal';
import api from '../../utils/api';

const ManageConference = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [conference, setConference] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    fetchConference();
  }, [id]);

  const fetchConference = async () => {
    try {
      const response = await api.get(`/organizer/conferences/${id}`);
      setConference(response.data.data);
      setEditData(response.data.data);
    } catch (error) {
      console.error('Error fetching conference:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaveLoading(true);
      await api.put(`/organizer/conferences/${id}`, editData);
      setConference(editData);
      setIsEditing(false);
      alert('Conference updated successfully!');
    } catch (error) {
      console.error('Error updating conference:', error);
      alert('Failed to update conference');
    } finally {
      setSaveLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Loading fullScreen message="Loading conference..." />
      </>
    );
  }

  if (!conference) {
    return (
      <>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card className="text-center py-12">
            <p className="text-gray-600 mb-4">Conference not found</p>
            <Button onClick={() => navigate('/organizer/dashboard')}>Back to Dashboard</Button>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Conference</h1>
            <p className="text-gray-600 mt-1">{conference.name}</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/organizer/dashboard')}>
            Back to Dashboard
          </Button>
        </div>

        {isEditing ? (
          <Card className="max-w-2xl">
            <div className="space-y-4">
              <Input
                label="Conference Name"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              />

              <Textarea
                label="Description"
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                rows={5}
              />

              <Input
                label="Venue"
                value={editData.venue}
                onChange={(e) => setEditData({ ...editData, venue: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="datetime-local"
                  value={new Date(editData.startDate).toISOString().slice(0, 16)}
                  onChange={(e) => setEditData({ ...editData, startDate: new Date(e.target.value) })}
                />
                <Input
                  label="End Date"
                  type="datetime-local"
                  value={new Date(editData.endDate).toISOString().slice(0, 16)}
                  onChange={(e) => setEditData({ ...editData, endDate: new Date(e.target.value) })}
                />
              </div>

              <Input
                label="Submission Deadline"
                type="datetime-local"
                value={new Date(editData.submissionDeadline).toISOString().slice(0, 16)}
                onChange={(e) =>
                  setEditData({ ...editData, submissionDeadline: new Date(e.target.value) })
                }
              />

              <Input
                label="Registration Fee"
                type="number"
                value={editData.fee}
                onChange={(e) => setEditData({ ...editData, fee: e.target.value })}
              />

              <Select
                label="Domains"
                value={editData.domainsOfInterest?.[0] || ''}
                onChange={(e) => setEditData({ ...editData, domainsOfInterest: [e.target.value] })}
                options={[
                  'AI & Machine Learning',
                  'Cloud Computing',
                  'Cybersecurity',
                  'Data Science',
                  'Web Development'
                ]}
              />

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} disabled={saveLoading}>
                  {saveLoading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2">
              <Card>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{conference.name}</h2>
                  <Badge>{conference.status || 'Active'}</Badge>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Description</h4>
                    <p className="text-gray-600">{conference.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Venue</h4>
                      <p className="text-gray-600">{conference.venue}</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Fee</h4>
                      <p className="text-gray-600">${conference.fee}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Important Dates</h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-600">
                        <span className="font-medium">Submission Deadline:</span>{' '}
                        {formatDate(conference.submissionDeadline)}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Start Date:</span> {formatDate(conference.startDate)}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">End Date:</span> {formatDate(conference.endDate)}
                      </p>
                    </div>
                  </div>

                  {conference.domainsOfInterest && conference.domainsOfInterest.length > 0 && (
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">Domains</h4>
                      <div className="flex flex-wrap gap-2">
                        {conference.domainsOfInterest.map((domain) => (
                          <Badge key={domain} variant="info">
                            {domain}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Button onClick={() => setIsEditing(true)} fullWidth>
                  Edit Conference
                </Button>
              </Card>

              {/* Statistics */}
              <Card className="mt-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Statistics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {conference.submissions?.length || 0}
                    </p>
                    <p className="text-sm text-gray-600">Total Submissions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {conference.submissions?.filter((s) => s.status === 'accepted').length || 0}
                    </p>
                    <p className="text-sm text-gray-600">Accepted</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {conference.submissions?.filter((s) => s.status === 'rejected').length || 0}
                    </p>
                    <p className="text-sm text-gray-600">Rejected</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Actions Sidebar */}
            <div>
              <Card>
                <h3 className="font-bold text-gray-900 mb-4">Actions</h3>
                <div className="space-y-2">
                  <Button
                    fullWidth
                    onClick={() => navigate(`/organizer/submissions/${id}`)}
                  >
                    View Submissions
                  </Button>
                  <Button
                    fullWidth
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Details
                  </Button>
                  <Button
                    fullWidth
                    variant="outline"
                    onClick={() => navigate(`/organizer/certificates/${id}`)}
                  >
                    Generate Certificates
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ManageConference;
