import React from 'react';

const TABS = [
  { id: 'calculator', label: 'EBD Calculator' },
  { id: 'map',        label: 'Risk Map' },
  { id: 'about',      label: 'About' },
];

export default function TabNavigation({ activeTab, onTabChange }) {
  return (
    <nav className="tab-nav">
      {TABS.map((t) => (
        <button key={t.id}
          className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
          onClick={() => onTabChange(t.id)}>
          {t.label}
        </button>
      ))}
    </nav>
  );
}
