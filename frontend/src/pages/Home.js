import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // If user is logged in, redirect to their dashboard
    if (user) {
      navigate(`/${user.role}/dashboard`);
    }
  }, [user, navigate]);

  const roles = [
    {
      name: 'Organizer',
      role: 'organizer',
      description: 'Create and manage conferences, review submissions, and handle all organizational tasks.',
      icon: '🎯',
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Author',
      role: 'author',
      description: 'Discover conferences, submit research papers, and track your submission status.',
      icon: '✍️',
      color: 'from-green-500 to-green-600'
    },
    {
      name: 'Reviewer',
      role: 'reviewer',
      description: 'Review papers, provide feedback, and help maintain academic quality.',
      icon: '📝',
      color: 'from-purple-500 to-purple-600'
    },
    {
      name: 'Participant',
      role: 'participant',
      description: 'Register for conferences, attend sessions, and receive certificates.',
      icon: '👥',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const handleRoleClick = (role) => {
    navigate(`/login?role=${role}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Conference Management System
          </h1>
          <p className="mt-2 text-gray-600">
            Your complete platform for academic and professional conference management
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Role
          </h2>
          <p className="text-xl text-gray-600">
            Select your role to get started with conference management
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((roleItem) => (
            <Card
              key={roleItem.role}
              hoverable
              onClick={() => handleRoleClick(roleItem.role)}
              className="group"
            >
              <div className="flex flex-col items-center text-center h-full">
                {/* Icon with gradient background */}
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${roleItem.color} flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  {roleItem.icon}
                </div>

                {/* Role Name */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {roleItem.name}
                </h3>

                {/* Description */}
                <p className="text-gray-600 flex-grow">
                  {roleItem.description}
                </p>

                {/* CTA */}
                <div className={`mt-6 px-4 py-2 rounded-lg bg-gradient-to-r ${roleItem.color} text-white font-medium group-hover:shadow-lg transition-shadow duration-200`}>
                  Get Started →
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-10">
            Platform Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-3">🚀</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Easy to Use
              </h4>
              <p className="text-gray-600">
                Intuitive card-based interface for seamless navigation and management
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🔒</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Secure & Reliable
              </h4>
              <p className="text-gray-600">
                Role-based access control and JWT authentication for data security
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Full Lifecycle
              </h4>
              <p className="text-gray-600">
                Complete conference management from submission to certification
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600">
            © 2025 Conference Management System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
