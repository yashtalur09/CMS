import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import Loading from '../../components/Loading';
import Modal from '../../components/Modal';
import {
  getConferenceDetailsOrganizer,
  updateConference,
  getTracks,
  createTrack,
  updateTrack,
  deleteTrack
} from '../../utils/api';

const ManageConference = () => {
  const { id, conferenceId: confId } = useParams();
  const conferenceId = id || confId; // Handle both route param names
  const navigate = useNavigate();

  const [conference, setConference] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Track modal state
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [editingTrack, setEditingTrack] = useState(null);
  const [trackForm, setTrackForm] = useState({ name: '', description: '' });
  const [trackSaving, setTrackSaving] = useState(false);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Conference form
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    venue: '',
    startDate: '',
    endDate: '',
    submissionDeadline: ''
  });

  useEffect(() => {
    fetchData();
  }, [conferenceId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [confRes, tracksRes] = await Promise.all([
        getConferenceDetailsOrganizer(conferenceId),
        getTracks(conferenceId)
      ]);

      const confData = confRes.data || confRes;
      setConference(confData);
      setTracks(tracksRes.data || tracksRes || []);

      // Initialize form
      setFormData({
        name: confData.name || '',
        description: confData.description || '',
        venue: confData.venue || '',
        startDate: confData.startDate ? confData.startDate.split('T')[0] : '',
        endDate: confData.endDate ? confData.endDate.split('T')[0] : '',
        submissionDeadline: confData.submissionDeadline ? confData.submissionDeadline.split('T')[0] : ''
      });
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Failed to load conference');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSuccess(null);
  };

  const handleSaveConference = async () => {
    try {
      setSaving(true);
      setError(null);
      await updateConference(conferenceId, formData);
      setSuccess('Conference updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving conference:', err);
      setError(err.response?.data?.message || 'Failed to save conference');
    } finally {
      setSaving(false);
    }
  };

  // Track CRUD
  const openAddTrack = () => {
    setEditingTrack(null);
    setTrackForm({ name: '', description: '' });
    setShowTrackModal(true);
  };

  const openEditTrack = (track) => {
    setEditingTrack(track);
    setTrackForm({ name: track.name, description: track.description || '' });
    setShowTrackModal(true);
  };

  const handleSaveTrack = async () => {
    if (!trackForm.name.trim()) {
      setError('Track name is required');
      return;
    }

    try {
      setTrackSaving(true);
      setError(null);

      if (editingTrack) {
        await updateTrack(editingTrack._id, trackForm);
      } else {
        await createTrack(conferenceId, trackForm);
      }

      // Refresh tracks
      const tracksRes = await getTracks(conferenceId);
      setTracks(tracksRes.data || tracksRes || []);
      setShowTrackModal(false);
      setSuccess(editingTrack ? 'Track updated!' : 'Track added!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving track:', err);
      setError(err.response?.data?.message || 'Failed to save track');
    } finally {
      setTrackSaving(false);
    }
  };

  const handleDeleteTrack = async (trackId) => {
    try {
      setError(null);
      await deleteTrack(trackId);
      setTracks(tracks.filter(t => t._id !== trackId));
      setDeleteConfirm(null);
      setSuccess('Track deleted!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting track:', err);
      setError(err.response?.data?.message || 'Failed to delete track');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Loading fullScreen message="Loading conference..." />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate('/organizer/dashboard')}>
            ← Back to Dashboard
          </Button>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Conference</h1>
            <p className="text-gray-600 mt-1">Edit conference details and manage tracks</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => navigate(`/organizer/submissions/${conferenceId}`)}>
              📄 Submissions
            </Button>
            <Button variant="secondary" onClick={() => navigate(`/organizer/conferences/${conferenceId}/bids`)}>
              📋 Manage Bids
            </Button>
            <Button variant="secondary" onClick={() => navigate(`/organizer/conferences/${conferenceId}/assignments`)}>
              👥 Assignments
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Conference Details Form */}
        <Card className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Conference Details</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conference Name
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter conference name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter conference description"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Venue
              </label>
              <Input
                value={formData.venue}
                onChange={(e) => handleInputChange('venue', e.target.value)}
                placeholder="Enter venue location"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Submission Deadline
                </label>
                <Input
                  type="date"
                  value={formData.submissionDeadline}
                  onChange={(e) => handleInputChange('submissionDeadline', e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4">
              <Button
                onClick={handleSaveConference}
                disabled={saving}
                className={saving ? 'opacity-50 cursor-not-allowed' : ''}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Track Management */}
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Tracks</h2>
            <Button onClick={openAddTrack}>
              + Add Track
            </Button>
          </div>

          {tracks.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📂</div>
              <p className="text-gray-600 mb-4">No tracks created yet</p>
              <Button onClick={openAddTrack}>
                Create First Track
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {tracks.map((track) => (
                <div
                  key={track._id}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{track.name}</h3>
                    {track.description && (
                      <p className="text-sm text-gray-600 mt-1">{track.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditTrack(track)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                      onClick={() => setDeleteConfirm(track)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Track Modal */}
      <Modal
        isOpen={showTrackModal}
        onClose={() => setShowTrackModal(false)}
        title={editingTrack ? 'Edit Track' : 'Add Track'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Track Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={trackForm.name}
              onChange={(e) => setTrackForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Machine Learning, Web Technologies"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <Textarea
              value={trackForm.description}
              onChange={(e) => setTrackForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this track covers"
              rows={3}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleSaveTrack}
              fullWidth
              disabled={trackSaving}
            >
              {trackSaving ? 'Saving...' : (editingTrack ? 'Update Track' : 'Add Track')}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowTrackModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Delete Track?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{deleteConfirm.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={() => handleDeleteTrack(deleteConfirm._id)}
              >
                Delete
              </Button>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ManageConference;
