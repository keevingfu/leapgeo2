import React, { useState } from 'react';
import { Home } from 'lucide-react';

const PortalSimple: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard');

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
        <h1 style={{ color: 'blue', marginBottom: '20px' }}>🔵 Portal Simple Test</h1>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={() => setActivePage('dashboard')}
            style={{
              padding: '10px 20px',
              backgroundColor: activePage === 'dashboard' ? 'blue' : 'gray',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            <Home style={{ width: '16px', height: '16px', display: 'inline-block' }} />
            {' '}Dashboard
          </button>
          <button
            onClick={() => setActivePage('test')}
            style={{
              padding: '10px 20px',
              backgroundColor: activePage === 'test' ? 'blue' : 'gray',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Test Page
          </button>
        </div>

        <div style={{ padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
          {activePage === 'dashboard' ? (
            <div>
              <h2>Dashboard Page</h2>
              <p>This is a simple dashboard</p>
            </div>
          ) : (
            <div>
              <h2>Test Page</h2>
              <p>This is a test page</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortalSimple;
