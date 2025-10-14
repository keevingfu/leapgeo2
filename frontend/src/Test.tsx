import React from 'react';

const Test: React.FC = () => {
  return (
    <div style={{ padding: '40px', fontSize: '24px', color: 'blue' }}>
      <h1>✅ React is Working!</h1>
      <p>If you see this, React renders correctly.</p>
      <p>Time: {new Date().toLocaleTimeString()}</p>
    </div>
  );
};

export default Test;
