import React from 'react';

const AppDebug: React.FC = () => {
  return (
    <div style={{ padding: '50px', fontFamily: 'Arial' }}>
      <h1 style={{ color: 'green' }}>✅ React 正常工作!</h1>
      <p>如果你能看到这个页面，说明：</p>
      <ul>
        <li>✅ HTML 正常加载</li>
        <li>✅ Vite 正常编译</li>
        <li>✅ React 正常渲染</li>
      </ul>
      <hr />
      <h2>当前时间: {new Date().toLocaleString()}</h2>
    </div>
  );
};

export default AppDebug;
