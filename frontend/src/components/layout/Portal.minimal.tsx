import React, { useState } from 'react';

const PortalMinimal: React.FC = () => {
  const [test, setTest] = useState('Testing Tailwind CSS');

  return (
    <div className="w-screen h-screen bg-gray-200 flex items-center justify-center">
      <div className="bg-white p-10 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-5">
          ✅ {test}
        </h1>
        <p className="text-gray-600 mb-3">
          Time: {new Date().toLocaleTimeString()}
        </p>
        <button
          onClick={() => setTest('Tailwind CSS Works!')}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Click Me
        </button>
        <p className="mt-4 text-sm text-gray-500">
          If you see styled elements, Tailwind CSS is working!
        </p>
      </div>
    </div>
  );
};

export default PortalMinimal;
