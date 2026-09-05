import React from 'react';
import { TronGameCanvas } from './components/TronGameCanvas';

export const TronApp: React.FC = () => {
  return (
    <div className="w-full h-screen bg-[#020617] overflow-hidden flex flex-col">
      <TronGameCanvas />
    </div>
  );
};

export default TronApp;
