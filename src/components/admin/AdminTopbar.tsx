'use client';

import React, { useEffect, useState } from 'react';
import { API_BASE } from '@/lib/api';

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
  const [health, setHealth] = useState<'UP' | 'DOWN'>('DOWN');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${API_BASE}/health`);
        const data = await res.json();
        if (data.success) setHealth('UP');
      } catch (e) {
        setHealth('DOWN');
      }
    };
    checkHealth();
    const hInt = setInterval(checkHealth, 30000);

    const updateTime = () => {
      setTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => {
      clearInterval(interval);
      clearInterval(hInt);
    };
  }, []);

  return (
    <div className="topbar">
      <button className="mobile-menu-trigger" onClick={() => {
        const sidebar = document.getElementById('admin-sidebar');
        if (sidebar) sidebar.classList.toggle('mobile-show');
      }}>
        ☰
      </button>
      <div>
        <div className="topbar-title">{title}</div>
        <div className="topbar-sub">{sub}</div>
      </div>
      <div className="topbar-right">
        <div className={`tb-badge ${health === 'UP' ? 'b-grn' : 'b-red'}`}>
          {health === 'UP' ? '🟢 API Online' : '🔴 API Offline'}
        </div>
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
