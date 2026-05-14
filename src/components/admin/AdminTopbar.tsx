'use client';

import React, { useEffect, useState } from 'react';

interface Props {
  title: string;
  sub: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const AdminTopbar = ({ title, sub, action }: Props) => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="topbar">
      <div>
        <div className="topbar-title">{title}</div>
        <div className="topbar-sub">{sub}</div>
      </div>
      <div className="topbar-right">
        <div className="tb-badge">🟢 Live</div>
        <div className="tb-time">{time}</div>
        {action && (
          <button className="btn-primary" onClick={action.onClick}>
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminTopbar;
