import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import { useToast } from '../../context/ToastContext';
import { getConferenceAssignments, runAutoAssign, updateAssignment, deleteAssignment, getAssignmentAnalytics } from '../../utils/api';

const ManageAssignments = () => {
    const { conferenceId } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const [assignments, setAssignments] = useState([]);
    const [stats, setStats] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [running, setRunning] = useState(false);
    const [showConfig, setShowConfig] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [previewStats, setPreviewStats] = useState(null);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [config, setConfig] = useState({
        reviewersPerPaper: 3,
        maxPapersPerReviewer: 4,
        clearExisting: false,
        dryRun: false
    });

    const fetchAssignments = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getConferenceAssignments(conferenceId);
            setAssignments(response.data?.assignments || []);
            setStats(response.data?.stats || null);
        } catch (err) {
            console.error('Error fetching assignments:', err);
            setError(err.response?.data?.message || 'Failed to load assignments');
        } finally {
            setLoading(false);
        }
    }, [conferenceId]);

    const fetchAnalytics = useCallback(async () => {
        try {
            const response = await getAssignmentAnalytics(conferenceId);
            setAnalytics(response.data);
        } catch (err) {
            console.error('Error fetching analytics:', err);
        }
    }, [conferenceId]);

    useEffect(() => {
        fetchAssignments();
    }, [fetchAssignments]);

    const handleAutoAssign = async () => {
        try {
            setRunning(true);
            const result = await runAutoAssign(conferenceId, config);

            if (config.dryRun) {
                setPreviewStats(result.stats);
                setShowConfig(false);
                setShowPreview(true);
            } else {
                const s = result.stats || result.data || {};
                toast.success(`Auto-assignment completed! Total: ${s.totalAssignments || s.assigned || 0} | Bid: ${s.bidCoveredCount || 0} | Domain: ${s.noBidCount || 0} | Fallback: ${s.fallbackCount || 0}`);
                setShowConfig(false);
                await fetchAssignments();
            }
        } catch (err) {
            console.error('Auto-assign error:', err);
            toast.error(err.response?.data?.message || 'Failed to run auto-assignment');
        } finally {
            setRunning(false);
        }
    };

    const handleConfirmPreview = async () => {
        try {
            setRunning(true);
            const result = await runAutoAssign(conferenceId, { ...config, dryRun: false });
            const s = result.stats || result.data || {};
            toast.success(`Assignment applied! Total: ${s.totalAssignments || s.assigned || 0}`);
            setShowPreview(false);
            setPreviewStats(null);
            await fetchAssignments();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to apply assignments');
        } finally {
            setRunning(false);
        }
    };

    const handleToggleLock = async (assignmentId, currentLocked) => {
        try {
            await updateAssignment(assignmentId, { locked: !currentLocked });
            await fetchAssignments();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update assignment');
        }
    };

    const handleDelete = async (assignmentId) => {
        if (!window.confirm('Are you sure you want to delete this assignment?')) return;
        try {
            await deleteAssignment(assignmentId);
            await fetchAssignments();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete assignment');
        }
    };

    const handleShowAnalytics = async () => {
        await fetchAnalytics();
        setShowAnalytics(true);
    };

    const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    const getSourceBadge = (source) => {
        const variants = {
            MANUAL: { variant: 'primary', label: 'Manual' },
            BID: { variant: 'info', label: 'Bid' },
            DOMAIN_MATCH: { variant: 'success', label: 'Domain' },
            DOMAIN_TOP_K: { variant: 'warning', label: 'Top-K' },
            FALLBACK: { variant: 'danger', label: 'Fallback' },
            AUTO: { variant: 'info', label: 'Auto' },
        };
        const cfg = variants[source] || variants.AUTO;
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
    };

    const groupedAssignments = useMemo(() => {
        const groups = {};
        assignments.forEach(assignment => {
            const paperId = assignment.submissionId?._id || 'unknown';
            if (!groups[paperId]) {
                groups[paperId] = { paper: assignment.submissionId, track: assignment.trackId, reviewers: [] };
            }
            groups[paperId].reviewers.push(assignment);
        });
        return Object.values(groups);
    }, [assignments]);

    if (loading && assignments.length === 0) {
        return (<><Navbar /><Loading fullScreen message="Loading assignments..." /></>);
    }

    return (
        <>
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 sm:mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manage Assignments</h1>
                        <p className="text-sm sm:text-base text-gray-600 mt-1">Reviewer-paper assignments</p>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                        <Button variant="secondary" onClick={() => navigate(`/organizer/conferences/${conferenceId}/bids`)}>
                            Manage Bids
                        </Button>
                        <Button variant="secondary" onClick={handleShowAnalytics}>
                            📊 Analytics
                        </Button>
                        <Button onClick={() => setShowConfig(true)}>
                            Run Auto-Assign
                        </Button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800">{error}</p>
                        <button onClick={fetchAssignments} className="text-red-600 hover:text-red-800 font-medium mt-2">Try Again</button>
                    </div>
                )}

                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                        <Card><div className="text-center"><div className="text-3xl font-bold text-blue-600">{stats.total}</div><p className="text-gray-600 mt-1">Total</p></div></Card>
                        <Card><div className="text-center"><div className="text-3xl font-bold text-green-600">{stats.active}</div><p className="text-gray-600 mt-1">Active</p></div></Card>
                        <Card><div className="text-center"><div className="text-3xl font-bold text-purple-600">{stats.completed}</div><p className="text-gray-600 mt-1">Completed</p></div></Card>
                        <Card><div className="text-center"><div className="text-3xl font-bold text-cyan-600">{stats.autoAssigned}</div><p className="text-gray-600 mt-1">Auto-Assigned</p></div></Card>
                        <Card><div className="text-center"><div className="text-3xl font-bold text-orange-600">{Math.round(stats.avgScore || 0)}%</div><p className="text-gray-600 mt-1">Avg Score</p></div></Card>
                    </div>
                )}

                {/* Auto-Assign Config Modal */}
                {showConfig && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <Card className="w-full max-w-md">
                            <h2 className="text-xl font-bold mb-4">Auto-Assignment Configuration</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Reviewers per Paper</label>
                                    <input type="number" min="1" max="10" value={config.reviewersPerPaper}
                                        onChange={(e) => setConfig({ ...config, reviewersPerPaper: parseInt(e.target.value) || 3 })}
                                        className="w-full border rounded-lg px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Papers per Reviewer</label>
                                    <input type="number" min="1" max="50" value={config.maxPapersPerReviewer}
                                        onChange={(e) => setConfig({ ...config, maxPapersPerReviewer: parseInt(e.target.value) || 4 })}
                                        className="w-full border rounded-lg px-3 py-2" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="clearExisting" checked={config.clearExisting}
                                        onChange={(e) => setConfig({ ...config, clearExisting: e.target.checked })}
                                        className="h-4 w-4 rounded border-gray-300" />
                                    <label htmlFor="clearExisting" className="text-sm text-gray-700">Clear existing non-locked assignments</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="dryRun" checked={config.dryRun}
                                        onChange={(e) => setConfig({ ...config, dryRun: e.target.checked })}
                                        className="h-4 w-4 rounded border-gray-300" />
                                    <label htmlFor="dryRun" className="text-sm text-gray-700">
                                        <span className="font-medium">Dry Run</span> — Preview results without saving
                                    </label>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <Button variant="secondary" onClick={() => setShowConfig(false)}>Cancel</Button>
                                <Button onClick={handleAutoAssign} disabled={running}>
                                    {running ? 'Running...' : config.dryRun ? '🔍 Preview Assignment' : 'Run Assignment'}
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Dry-Run Preview Modal */}
                {showPreview && previewStats && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <Card className="w-full max-w-lg">
                            <h2 className="text-xl font-bold mb-4">🔍 Assignment Preview (Dry Run)</h2>
                            <p className="text-sm text-gray-500 mb-4">No data was saved. Review the results below.</p>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-blue-50 rounded-lg p-3 text-center">
                                    <div className="text-2xl font-bold text-blue-700">{previewStats.totalAssignments}</div>
                                    <div className="text-xs text-blue-600">Total Assignments</div>
                                </div>
                                <div className="bg-green-50 rounded-lg p-3 text-center">
                                    <div className="text-2xl font-bold text-green-700">{previewStats.averageScore}%</div>
                                    <div className="text-xs text-green-600">Average Score</div>
                                </div>
                                <div className="bg-cyan-50 rounded-lg p-3 text-center">
                                    <div className="text-2xl font-bold text-cyan-700">{previewStats.bidCoveredCount}</div>
                                    <div className="text-xs text-cyan-600">From Bids</div>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-3 text-center">
                                    <div className="text-2xl font-bold text-purple-700">{previewStats.noBidCount}</div>
                                    <div className="text-xs text-purple-600">Domain Matched</div>
                                </div>
                            </div>
                            {previewStats.fallbackCount > 0 && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                                    <p className="text-yellow-800 text-sm font-medium">⚠️ {previewStats.fallbackCount} assignment(s) used fallback matching (low confidence)</p>
                                </div>
                            )}
                            <div className="text-sm text-gray-600 mb-4 space-y-1">
                                <p>Papers fully assigned: <strong>{previewStats.papersFullyAssigned}</strong> / {previewStats.totalSubmissions}</p>
                                <p>Under-assigned: <strong>{previewStats.papersUnderAssigned}</strong></p>
                                <p>Reviewers used: <strong>{previewStats.reviewersUsed}</strong></p>
                                <p>Duration: <strong>{previewStats.duration}</strong></p>
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button variant="secondary" onClick={() => { setShowPreview(false); setPreviewStats(null); }}>Discard</Button>
                                <Button onClick={handleConfirmPreview} disabled={running}>
                                    {running ? 'Applying...' : '✅ Confirm & Apply'}
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Analytics Modal */}
                {showAnalytics && analytics && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
                        <Card className="w-full max-w-2xl my-8">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">📊 Assignment Analytics</h2>
                                <button onClick={() => setShowAnalytics(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                            </div>

                            <div className="grid grid-cols-3 gap-3 mb-6">
                                <div className="bg-blue-50 rounded-lg p-3 text-center">
                                    <div className="text-2xl font-bold text-blue-700">{analytics.averageScore}%</div>
                                    <div className="text-xs text-blue-600">Avg Score</div>
                                </div>
                                <div className="bg-green-50 rounded-lg p-3 text-center">
                                    <div className="text-2xl font-bold text-green-700">{analytics.bidCoverage}%</div>
                                    <div className="text-xs text-green-600">Bid Coverage</div>
                                </div>
                                <div className="bg-orange-50 rounded-lg p-3 text-center">
                                    <div className="text-2xl font-bold text-orange-700">{analytics.fallbackPercentage}%</div>
                                    <div className="text-xs text-orange-600">Fallback Rate</div>
                                </div>
                            </div>

                            {/* Score Distribution */}
                            <h3 className="font-semibold text-gray-800 mb-2">Score Distribution</h3>
                            <div className="space-y-2 mb-6">
                                {Object.entries(analytics.scoreDistribution || {}).map(([range, count]) => (
                                    <div key={range} className="flex items-center gap-3">
                                        <span className="text-sm text-gray-600 w-16">{range}</span>
                                        <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                                            <div className={`h-full rounded-full ${range === '76-100' ? 'bg-green-500' : range === '51-75' ? 'bg-blue-500' : range === '26-50' ? 'bg-yellow-500' : 'bg-red-400'}`}
                                                style={{ width: `${analytics.totalAssignments > 0 ? (count / analytics.totalAssignments) * 100 : 0}%` }} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 w-8 text-right">{count}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Source Breakdown */}
                            <h3 className="font-semibold text-gray-800 mb-2">Assignment Sources</h3>
                            <div className="flex flex-wrap gap-2 mb-6">
                                {Object.entries(analytics.sourceBreakdown || {}).map(([source, count]) => (
                                    <div key={source} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                                        {getSourceBadge(source)}
                                        <span className="font-semibold">{count}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Reviewer Load */}
                            {analytics.reviewerLoad && analytics.reviewerLoad.length > 0 && (
                                <>
                                    <h3 className="font-semibold text-gray-800 mb-2">Reviewer Load Distribution</h3>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {analytics.reviewerLoad.map((r, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <span className="text-sm text-gray-600 w-32 truncate">{r.name}</span>
                                                <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                                                    <div className={`h-full rounded-full ${r.count >= r.max ? 'bg-red-500' : r.count >= r.max * 0.75 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                                        style={{ width: `${(r.count / r.max) * 100}%` }} />
                                                </div>
                                                <span className="text-sm text-gray-700 w-12 text-right">{r.count}/{r.max}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </Card>
                    </div>
                )}

                {/* Assignments List */}
                {assignments.length === 0 ? (
                    <Card className="text-center py-12">
                        <div className="text-6xl mb-4">📝</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Assignments Yet</h3>
                        <p className="text-gray-600 mb-6">Run the auto-assignment algorithm or create manual assignments.</p>
                        <Button onClick={() => setShowConfig(true)}>Run Auto-Assign</Button>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {groupedAssignments.map((group) => (
                            <Card key={group.paper?._id || 'unknown'} className="overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 -mx-4 -mt-4 px-4 py-4 mb-4 border-b border-blue-100">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-gray-900 mb-1">
                                                <span className="text-gray-600 font-medium">Paper Title:</span> {group.paper?.title || 'Untitled Paper'}
                                            </h3>
                                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                                {group.track?.name && (<span className="flex items-center gap-1"><Badge variant="info">{group.track.name}</Badge></span>)}
                                                <span className="flex items-center gap-1">
                                                    <span className="text-blue-600 font-semibold">{group.reviewers.length}</span> Reviewer{group.reviewers.length !== 1 ? 's' : ''} Assigned
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Assigned Reviewers:</p>
                                    {group.reviewers.map((assignment) => (
                                        <div key={assignment._id}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-gray-900">{assignment.reviewerId?.name || 'Unknown Reviewer'}</div>
                                                    <div className="text-sm text-gray-500 truncate">{assignment.reviewerId?.email || 'No email'}</div>
                                                    {assignment.matchReason && (
                                                        <div className="text-xs text-gray-400 mt-1 truncate" title={assignment.matchReason}>
                                                            {assignment.matchReason}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-center px-3">
                                                    <div className={`text-lg font-bold ${assignment.matchScore >= 80 ? 'text-green-600' : assignment.matchScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                        {assignment.matchScore}%
                                                    </div>
                                                    <div className="text-xs text-gray-500">Match</div>
                                                </div>
                                                <div className="text-center">{getSourceBadge(assignment.source)}</div>
                                                <div className="text-center hidden md:block">
                                                    <div className="text-sm text-gray-600">{formatDate(assignment.assignedAt)}</div>
                                                    <div className="text-xs text-gray-500">Assigned</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 ml-4">
                                                <button onClick={() => handleToggleLock(assignment._id, assignment.locked)}
                                                    className={`p-2 rounded-lg transition-colors ${assignment.locked ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100' : 'text-gray-400 hover:bg-gray-200'}`}
                                                    title={assignment.locked ? 'Unlock assignment' : 'Lock assignment'}>
                                                    {assignment.locked ? '🔒' : '🔓'}
                                                </button>
                                                <button onClick={() => handleDelete(assignment._id)}
                                                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                                                    disabled={assignment.locked} title="Delete assignment">
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default ManageAssignments;
