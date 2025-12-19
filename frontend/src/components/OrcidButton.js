import React from 'react';

const OrcidButton = ({ role = null }) => {
  const handleOrcidLogin = () => {
    const clientId = process.env.REACT_APP_ORCID_CLIENT_ID;
    const redirectUri = encodeURIComponent(process.env.REACT_APP_ORCID_REDIRECT_URI);
    const state = role ? encodeURIComponent(JSON.stringify({ role })) : '';
    
    const orcidAuthUrl = `https://orcid.org/oauth/authorize?client_id=${clientId}&response_type=code&scope=/authenticate&redirect_uri=${redirectUri}${state ? `&state=${state}` : ''}`;
    
    window.location.href = orcidAuthUrl;
  };

  return (
    <button
      type="button"
      onClick={handleOrcidLogin}
      className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
    >
      {/* ORCID Logo */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 256 256"
        className="h-5 w-5 mr-2"
      >
        <path
          fill="#A6CE39"
          d="M256 128c0 70.7-57.3 128-128 128S0 198.7 0 128 57.3 0 128 0s128 57.3 128 128z"
        />
        <g fill="#FFF">
          <path d="M86.3 186.2H70.9V79.1h15.4v107.1zM108.9 79.1h41.6c39.6 0 57 28.3 57 53.6 0 27.5-21.5 53.6-56.8 53.6h-41.8V79.1zm15.4 93.3h24.5c34.9 0 42.9-26.5 42.9-39.7C191.7 111.2 178 93 148 93h-23.7v79.4zM88.7 56.8c0 5.5-4.5 10.1-10.1 10.1s-10.1-4.6-10.1-10.1c0-5.6 4.5-10.1 10.1-10.1s10.1 4.6 10.1 10.1z" />
        </g>
      </svg>
      <span className="text-sm font-medium text-gray-700">
        {role ? `Login with ORCID as ${role}` : 'Login with ORCID'}
      </span>
    </button>
  );
};

export default OrcidButton;
