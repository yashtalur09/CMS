import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import { getConferenceBids, updateBidStatus, bulkUpdateBids } from '../../utils/api';

const ManageBids = () => {
    const { conferenceId } = useParams();
    const navigate = useNavigate();
    const [bids, setBids] = useState([]);
    const [stats, setStats] = useState({ PENDING: 0, APPROVED: 0, REJECTED: 0, WITHDRAWN: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('PENDING');
    const [selectedBids, setSelectedBids] = useState([]);
    const [updating, setUpdating] = useState(false);

    // Rejection modal state
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectingBid, setRejectingBid] = useState(null); // single bid or null for bulk
    const [rejectionReason, setRejectionReason] = useState('');
    const [reasonError, setReasonError] = useState('');

    useEffect(() => {
        fetchBids();
    }, [conferenceId, statusFilter]);

    const fetchBids = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getConferenceBids(conferenceId, { status: statusFilter !== 'all' ? statusFilter : undefined });
            setBids(response.data?.bids || []);
            if (response.data?.stats) {
                setStats(response.data.stats);
            }
        } catch (err) {
            console.error('Error fetching bids:', err);
            setError(err.response?.data?.message || 'Failed to load bids');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (bidId, status, reason = '') => {
        try {
            setUpdating(true);
            await updateBidStatus(bidId, status, reason);
            await fetchBids();
        } catch (err) {
            console.error('Error updating bid:', err);
            alert(err.response?.data?.message || 'Failed to update bid');
        } finally {
            setUpdating(false);
        }
    };

    const handleBulkUpdate = async (status) => {
        if (selectedBids.length === 0) {
            alert('Please select at least one bid');
            return;
        }

        // For rejections, open the modal instead of using prompt
        if (status === 'REJECTED') {
            setRejectingBid(null); // null indicates bulk rejection
            setRejectionReason('');
            setReasonError('');
            setShowRejectModal(true);
            return;
        }

        try {
            setUpdating(true);
            await bulkUpdateBids(selectedBids, status, '');
            setSelectedBids([]);
            await fetchBids();
        } catch (err) {
            console.error('Error bulk updating bids:', err);
            alert(err.response?.data?.message || 'Failed to update bids');
        } finally {
            setUpdating(false);
        }
    };

    // Open rejection modal for a single bid
    const openRejectModal = (bidId) => {
        setRejectingBid(bidId);
        setRejectionReason('');
        setReasonError('');
        setShowRejectModal(true);
    };

    // Handle the actual rejection (single or bulk)
    const handleConfirmReject = async () => {
        if (!rejectionReason.trim()) {
            setReasonError('Please provide a reason for rejection');
            return;
        }

        try {
            setUpdating(true);
            if (rejectingBid) {
                // Single bid rejection
                await updateBidStatus(rejectingBid, 'REJECTED', rejectionReason.trim());
            } else {
                // Bulk rejection
                await bulkUpdateBids(selectedBids, 'REJECTED', rejectionReason.trim());
                setSelectedBids([]);
            }
            setShowRejectModal(false);
            setRejectingBid(null);
            setRejectionReason('');
            await fetchBids();
        } catch (err) {
            console.error('Error rejecting bid(s):', err);
            alert(err.response?.data?.message || 'Failed to reject bid(s)');
        } finally {
            setUpdating(false);
        }
    };

    // Close rejection modal without action
    const closeRejectModal = () => {
        setShowRejectModal(false);
        setRejectingBid(null);
        setRejectionReason('');
        setReasonError('');
    };

    const toggleBidSelection = (bidId) => {
        setSelectedBids(prev =>
            prev.includes(bidId)
                ? prev.filter(id => id !== bidId)
                : [...prev, bidId]
        );
    };

    const selectAllVisible = () => {
        const visibleIds = bids.map(b => b._id);
        setSelectedBids(visibleIds);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        const variants = {
            PENDING: 'warning',
            APPROVED: 'success',
            REJECTED: 'danger',
            WITHDRAWN: 'secondary'
        };
        return <Badge variant={variants[status] || 'info'}>{status}</Badge>;
    };

    if (loading && bids.length === 0) {
        return (
            <>
                <Navbar />
                <Loading fullScreen message="Loading bids..." />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Manage Bids</h1>
                        <p className="text-gray-600 mt-1">Review and approve reviewer bids</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={() => navigate(`/organizer/conferences/${conferenceId}/assignments`)}>
                            View Assignments
                        </Button>
                        <Button onClick={() => navigate(`/organizer/conference/${conferenceId}`)}>
                            Back to Conference
                        </Button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800">{error}</p>
                        <button onClick={fetchBids} className="text-red-600 hover:text-red-800 font-medium mt-2">
                            Try Again
                        </button>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <Card className="cursor-pointer" onClick={() => setStatusFilter('PENDING')}>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-yellow-600">{stats.PENDING || 0}</div>
                            <p className="text-gray-600 mt-1">Pending</p>
                        </div>
                    </Card>
                    <Card className="cursor-pointer" onClick={() => setStatusFilter('APPROVED')}>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600">{stats.APPROVED || 0}</div>
                            <p className="text-gray-600 mt-1">Approved</p>
                        </div>
                    </Card>
                    <Card className="cursor-pointer" onClick={() => setStatusFilter('REJECTED')}>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-red-600">{stats.REJECTED || 0}</div>
                            <p className="text-gray-600 mt-1">Rejected</p>
                        </div>
                    </Card>
                    <Card className="cursor-pointer" onClick={() => setStatusFilter('WITHDRAWN')}>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-gray-600">{stats.WITHDRAWN || 0}</div>
                            <p className="text-gray-600 mt-1">Withdrawn</p>
                        </div>
                    </Card>
                </div>

                {/* Bulk Actions */}
                {statusFilter === 'PENDING' && bids.length > 0 && (
                    <div className="mb-6 flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <button onClick={selectAllVisible} className="text-blue-600 hover:underline text-sm">
                            Select All ({bids.length})
                        </button>
                        {selectedBids.length > 0 && (
                            <>
                                <span className="text-gray-500">|</span>
                                <span className="text-sm text-gray-600">{selectedBids.length} selected</span>
                                <Button
                                    size="sm"
                                    onClick={() => handleBulkUpdate('APPROVED')}
                                    disabled={updating}
                                >
                                    Approve Selected
                                </Button>
                                <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={() => handleBulkUpdate('REJECTED')}
                                    disabled={updating}
                                >
                                    Reject Selected
                                </Button>
                                <button onClick={() => setSelectedBids([])} className="text-gray-500 hover:underline text-sm">
                                    Clear Selection
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* Bids List */}
                {bids.length === 0 ? (
                    <Card className="text-center py-12">
                        <div className="text-6xl mb-4">📋</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No {statusFilter} Bids</h3>
                        <p className="text-gray-600">There are no bids with this status.</p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {bids.map((bid) => (
                            <Card key={bid._id}>
                                <div className="flex items-start gap-4">
                                    {statusFilter === 'PENDING' && (
                                        <input
                                            type="checkbox"
                                            checked={selectedBids.includes(bid._id)}
                                            onChange={() => toggleBidSelection(bid._id)}
                                            className="mt-1 h-5 w-5 rounded border-gray-300"
                                        />
                                    )}

                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-gray-900">
                                                {bid.submissionId?.title || 'Unknown Submission'}
                                            </h3>
                                            {getStatusBadge(bid.status)}
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                                            <div>
                                                <span className="font-medium">Reviewer:</span>{' '}
                                                {bid.reviewerId?.name || 'Unknown'}
                                            </div>
                                            <div>
                                                <span className="font-medium">Email:</span>{' '}
                                                {bid.reviewerId?.email || 'N/A'}
                                            </div>
                                            <div>
                                                <span className="font-medium">Confidence:</span>{' '}
                                                {bid.confidence}/10
                                            </div>
                                            <div>
                                                <span className="font-medium">Bid Date:</span>{' '}
                                                {formatDate(bid.createdAt)}
                                            </div>
                                        </div>

                                        {bid.reviewerId?.expertiseDomains?.length > 0 && (
                                            <div className="text-sm text-gray-600 mb-4">
                                                <span className="font-medium">Expertise:</span>{' '}
                                                {bid.reviewerId.expertiseDomains.join(', ')}
                                            </div>
                                        )}

                                        {bid.status === 'PENDING' && (
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleUpdateStatus(bid._id, 'APPROVED')}
                                                    disabled={updating}
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="danger"
                                                    onClick={() => openRejectModal(bid._id)}
                                                    disabled={updating}
                                                >
                                                    Reject
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Rejection Reason Modal */}
                {showRejectModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <Card className="w-full max-w-md mx-4">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                {rejectingBid ? 'Reject Bid' : `Reject ${selectedBids.length} Bid(s)`}
                            </h2>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Rejection Reason <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => {
                                        setRejectionReason(e.target.value);
                                        if (e.target.value.trim()) setReasonError('');
                                    }}
                                    placeholder="Please provide a reason for rejection..."
                                    rows={4}
                                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${reasonError ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                {reasonError && (
                                    <p className="text-red-500 text-sm mt-1">{reasonError}</p>
                                )}
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button
                                    variant="secondary"
                                    onClick={closeRejectModal}
                                    disabled={updating}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={handleConfirmReject}
                                    disabled={updating}
                                >
                                    {updating ? 'Rejecting...' : 'Confirm Rejection'}
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </>
    );
};

export default ManageBids;
