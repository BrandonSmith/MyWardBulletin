import React from 'react';
import OpenHymnLink from './OpenHymnLink';

export default function HymnLinkExample() {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Hymn Link Examples</h2>
      
      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          These links will attempt to open the Gospel Library app if installed, 
          otherwise fall back to the web version.
        </p>
        
        <div className="space-y-2">
          <OpenHymnLink number={85}>
            How Firm a Foundation
          </OpenHymnLink>
          
          <OpenHymnLink number={1}>
            The Morning Breaks
          </OpenHymnLink>
          
          <OpenHymnLink number={30}>
            Come, Come, Ye Saints
          </OpenHymnLink>
          
          <OpenHymnLink number={1010}>
            Amazing Grace
          </OpenHymnLink>
        </div>
      </div>
    </div>
  );
} 