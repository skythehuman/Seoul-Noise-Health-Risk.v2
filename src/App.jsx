import React, { useState } from 'react';
import Header from './components/Layout/Header';
import TabNavigation from './components/Layout/TabNavigation';
import EBDCalculator from './components/Calculator/EBDCalculator';
import SeoulMap from './components/Map/SeoulMap';
import About from './components/About';

export default function App() {
  const [tab, setTab] = useState('calculator');

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <TabNavigation activeTab={tab} onTabChange={setTab} />
        {tab === 'calculator' && <EBDCalculator />}
        {tab === 'map' && <SeoulMap />}
        {tab === 'about' && <About />}
      </main>
    </div>
  );
}
