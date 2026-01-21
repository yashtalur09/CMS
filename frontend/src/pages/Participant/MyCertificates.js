import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import { useToast } from '../../context/ToastContext';
import { getParticipantCertificates, downloadParticipantCertificate } from '../../utils/api';

const MyCertificates = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getParticipantCertificates();
      const data =
        response?.data?.certificates ||
        response?.data?.data?.certificates ||
        response?.data?.data ||
        response?.data ||
        [];
      setCertificates(data);
    } catch (err) {
      console.error('Error fetching certificates:', err);
      setError(err.response?.data?.message || 'Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownload = async (certificate) => {
    try {
      setDownloading(certificate._id);

      const blob = await downloadParticipantCertificate(certificate._id);
      const certificateId = certificate.uniqueCertificateId || certificate.uniqueId || certificate._id;

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Certificate_${certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Certificate downloaded successfully!');
    } catch (err) {
      console.error('Error downloading certificate:', err);
      toast.error('Failed to download certificate');
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Loading fullScreen message="Loading your certificates..." />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Certificates</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Download certificates from conferences you attended</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
            <button
              onClick={fetchCertificates}
              className="text-red-600 hover:text-red-800 font-medium mt-2"
            >
              Try Again
            </button>
          </div>
        )}

        {certificates.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Certificates Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Certificates are issued after you attend conferences. Register and attend events to earn certificates!
            </p>
            <Button onClick={() => navigate('/participant/events')}>
              Browse Conferences
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((certificate) => (
              <Card key={certificate._id} className="relative overflow-hidden">
                {/* Certificate Preview Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 -mx-4 -mt-4 px-4 py-6 mb-4">
                  <div className="text-center">
                    <div className="text-white text-4xl mb-2">🎓</div>
                    <h3 className="text-white font-bold text-lg">
                      Certificate of Participation
                    </h3>
                  </div>
                </div>

                {/* Certificate Details */}
                <div className="space-y-3">
                  <div>
                    <h4 className="font-bold text-gray-900 line-clamp-2">
                      {certificate.conferenceId?.name || certificate.conferenceName || 'Conference'}
                    </h4>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Issued</span>
                    <span className="font-medium text-gray-900">
                      {formatDate(certificate.issuedAt || certificate.createdAt)}
                    </span>
                  </div>

                  {certificate.conferenceId?.venue && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Venue</span>
                      <span className="font-medium text-gray-900">
                        {certificate.conferenceId.venue}
                      </span>
                    </div>
                  )}

                  {(certificate.uniqueCertificateId || certificate.uniqueId) && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Certificate ID</span>
                      <Badge variant="info">
                        {certificate.uniqueCertificateId || certificate.uniqueId}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Download Button */}
                <div className="mt-6 pt-4 border-t">
                  <Button
                    fullWidth
                    onClick={() => handleDownload(certificate)}
                    disabled={downloading === certificate._id}
                    className="flex items-center justify-center gap-2"
                  >
                    {downloading === certificate._id ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download Certificate
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Stats Section */}
        {certificates.length > 0 && (
          <div className="mt-8">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Your Achievements</h3>
                  <p className="text-gray-600 text-sm">
                    You have earned {certificates.length} certificate{certificates.length !== 1 ? 's' : ''} from attended conferences
                  </p>
                </div>
                <div className="text-4xl font-bold text-blue-600">
                  {certificates.length}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </>
  );
};

export default MyCertificates;

