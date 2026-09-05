import React from 'react';
import { DatacenterViewport } from './components/DatacenterViewport';

export const DatacenterApp: React.FC = () => {
  return (
    <div className="w-full h-screen bg-[#030712] overflow-hidden flex flex-col">
      <DatacenterViewport />
    </div>
  );
};

export default DatacenterApp;
