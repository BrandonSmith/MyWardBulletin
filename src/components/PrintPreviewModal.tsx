import React from 'react';
import BulletinPrintLayout from './BulletinPrintLayout';
import { BulletinData } from '../types/bulletin';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bulletinData: BulletinData;
}

export default function PrintPreviewModal({ isOpen, onClose, bulletinData }: PrintPreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-6xl mx-4 h-full overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Print Preview</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
        </div>
        <BulletinPrintLayout data={bulletinData} />
      </div>
    </div>
  );
}
