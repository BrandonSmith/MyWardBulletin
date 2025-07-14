import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { BulletinData } from '../types/bulletin';
import { userService } from '../lib/supabase';
import BulletinSelector from './BulletinSelector';

interface QRCodeGeneratorProps {
  user: any;
  currentActiveBulletinId?: string | null;
  onActiveBulletinSelect?: (bulletinId: string | null) => void;
  onProfileSlugUpdate?: (slug: string) => void;
}

export default function QRCodeGenerator({ 
  user, 
  currentActiveBulletinId, 
  onActiveBulletinSelect, 
  onProfileSlugUpdate 
}: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [profileSlug, setProfileSlug] = React.useState('');
  const [isEditing, setIsEditing] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  useEffect(() => {
    generateQRCode();
  }, [profileSlug]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      const profile = await userService.getUserProfile(user.id);
      if (profile && profile.length > 0) {
        setProfileSlug(profile[0].profile_slug || '');
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const generateQRCode = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Generate QR code URL with proper domain
    const baseUrl = window.location.hostname === 'localhost' 
      ? 'https://zionboard.com' 
      : window.location.origin;
    
    const qrData = profileSlug 
      ? `${baseUrl}/u/${profileSlug}`
      : `${baseUrl}/u/your-profile-slug`;
    
    QRCode.toCanvas(canvas, qrData, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    }, (error) => {
      if (error) {
        console.error('QR Code generation error:', error);
        // Fallback to simple text display
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, 200, 200);
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, 200, 200);
          ctx.fillStyle = 'black';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('QR Code Error', 100, 100);
        }
      }
    });
  };

  const handleSaveProfileSlug = async () => {
    if (!profileSlug.trim()) {
      setError('Profile slug cannot be empty');
      return;
    }

    // Validate profile slug format
    if (!/^[a-zA-Z0-9_-]+$/.test(profileSlug)) {
      setError('Profile slug can only contain letters, numbers, hyphens, and underscores');
      return;
    }


    setLoading(true);
    setError('');

    try {
      await userService.updateProfileSlug(user.id, profileSlug);
      // Re-fetch the profile to ensure we have the latest data from the database
      await loadUserProfile();
      setIsEditing(false);
      if (onProfileSlugUpdate) {
        onProfileSlugUpdate(profileSlug);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to update profile slug');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    loadUserProfile(); // Reset to original value
  };

  const downloadQRCode = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${profileSlug || 'zionboard'}-qr.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="text-center space-y-4">
      <canvas
        ref={canvasRef}
        width={200}
        height={200}
        className="border border-gray-300 rounded-lg mx-auto"
      />
      
      <div className="space-y-2">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Custom Link
            </label>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={profileSlug}
                  onChange={(e) => setProfileSlug(e.target.value)}
                  placeholder="e.g., sunset-hills-ward"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveProfileSlug}
                    disabled={loading}
                    className="flex-1 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 px-3 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                  {profileSlug || 'Not set'}
                </span>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-2 bg-gray-600 text-white rounded-lg text-xs hover:bg-gray-700"
                >
                  Edit
                </button>
              </div>
            )}
            {error && (
              <p className="text-xs text-red-600 mt-1">{error}</p>
            )}
          </div>
        </div>
        
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <p className="font-medium mb-1">🔗 Your Permanent QR Code</p>
          <p className="mb-2">This QR code always shows your latest bulletin</p>
          {profileSlug && (
            <p className="font-mono text-xs break-all bg-white p-1 rounded border">
              {window.location.origin}/u/{profileSlug}
            </p>
          )}
        </div>
      </div>
      
      <button
        onClick={downloadQRCode}
        disabled={!profileSlug}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Download QR Code
      </button>
      
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Print this QR code and place it on physical bulletins</p>
        <p>• Members can scan to access your latest digital bulletin</p>
        <p>• QR code stays the same - just update your bulletins</p>
      </div>
      
      {onActiveBulletinSelect && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <BulletinSelector
            user={user}
            currentActiveBulletinId={currentActiveBulletinId || undefined}
            onBulletinSelect={onActiveBulletinSelect}
          />
        </div>
      )}
    </div>
  );
}