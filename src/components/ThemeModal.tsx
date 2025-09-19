import React from 'react';
import { themes } from '../data/themes';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTheme: (theme: { name: string; fontFamily: string }) => void;
  currentUserTheme: string;
}

export default function ThemeModal({ isOpen, onClose, onSelectTheme, currentUserTheme }: ThemeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Select a Theme</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
        </div>
        <div className="space-y-2">
          {themes.map((theme) => (
            <button
              key={theme.name}
              onClick={() => onSelectTheme(theme)}
              className={`w-full text-left px-4 py-2 rounded-lg ${currentUserTheme === theme.name ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
              style={{ fontFamily: theme.fontFamily }}
            >
              {theme.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
