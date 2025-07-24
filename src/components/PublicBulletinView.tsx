import React from 'react';
import { ArrowLeft, Home } from 'lucide-react';
import BulletinPreview from './BulletinPreview';
import { BulletinData } from '../types/bulletin';

interface PublicBulletinViewProps {
  bulletinData: BulletinData | null;
  loading: boolean;
  error: string;
  onBackToEditor: () => void;
}

export default function PublicBulletinView({ 
  bulletinData, 
  loading, 
  error, 
  onBackToEditor 
}: PublicBulletinViewProps) {
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bulletin...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Bulletin Not Found</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={onBackToEditor}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to MyWardBulletin
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!bulletinData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Bulletin Available</h2>
            <p className="text-gray-600 mb-6">This ward hasn't published a bulletin yet.</p>
            <button
              onClick={onBackToEditor}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to MyWardBulletin
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Bulletin Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-8">
        <BulletinPreview data={bulletinData} />
        
        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-600 text-sm">
            Built with MyWardBulletin.com
          </p>
          <button
            onClick={onBackToEditor}
            className="mt-2 text-blue-600 hover:text-blue-700 text-sm underline"
          >
            Create your own bulletin
          </button>
        </div>
      </main>
    </div>
  );
}