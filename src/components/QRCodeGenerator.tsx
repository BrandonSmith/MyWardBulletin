import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { userService } from '../lib/supabase';
import BulletinSelector from './BulletinSelector';
import { toast } from 'react-toastify';
import { FULL_DOMAIN, SHORT_DOMAIN } from '../lib/config';
import { useSession } from '../lib/SessionContext';
import ShareButton from './ShareButton';

const LAST_USER_ID = 'last_user_id';

function formatProfileSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

interface QRCodeGeneratorProps {
  currentActiveBulletinId?: string | null;
  onActiveBulletinSelect?: (bulletinId: string | null) => void;
  onProfileSlugUpdate?: (slug: string) => void;
  isOpen?: boolean;
  bulletinData?: {
    wardName: string;
    date: string;
    meetingType: string;
    theme?: string;
    bishopricMessage?: string;
    announcements?: string[];
    specialEvents?: string[];
  } | null;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  currentActiveBulletinId,
  onActiveBulletinSelect,
  onProfileSlugUpdate,
  isOpen,
  bulletinData
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [profileSlug, setProfileSlug] = React.useState('');
  const [isEditing, setIsEditing] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [useShortDomain, setUseShortDomain] = React.useState(true);
  const { user, profile } = useSession();

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(LAST_USER_ID, user.id);
    }
    if (profile?.profile_slug) {
      setProfileSlug(profile.profile_slug);
      localStorage.setItem(`profile_slug_${user?.id || ''}`, profile.profile_slug);
    } else if (!profile) {
      const cached = localStorage.getItem(`profile_slug_${user?.id || localStorage.getItem(LAST_USER_ID) || ''}`);
      if (cached) {
        setProfileSlug(cached);
      }
    }
  }, [user, profile]);

  useEffect(() => {
    generateQRCode();
  }, [profileSlug, useShortDomain]);

  useEffect(() => {
    const id = user?.id || localStorage.getItem(LAST_USER_ID);
    if (id) {
      localStorage.setItem(`profile_slug_${id}`, profileSlug);
    }
  }, [profileSlug, user]);

  const generateQRCode = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const domain = useShortDomain ? SHORT_DOMAIN : FULL_DOMAIN;
    const baseUrl = `https://${domain}`;

    // Use shorter URL format for better mobile QR code scanning
    const qrData = profileSlug
      ? `${baseUrl}/${profileSlug}`
      : `${baseUrl}/your-profile-slug`;
    
    QRCode.toCanvas(canvas, qrData, {
      width: 300, // Increased size for better mobile scanning
      margin: 4, // Increased margin for better contrast
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H' // Highest error correction for better mobile scanning
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
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    const sanitized = formatProfileSlug(profileSlug);
    if (!sanitized) {
      setError('Profile slug cannot be empty');
      return;
    }
    setProfileSlug(sanitized);

    setLoading(true);
    setError('');

    try {
      await userService.updateProfileSlug(user.id, sanitized);
      setProfileSlug(sanitized); // Set local state immediately
      setIsEditing(false);
      if (onProfileSlugUpdate) {
        onProfileSlugUpdate(sanitized);
      }
      // Refresh profile slug from backend
      const refreshed = await userService.getUserProfile(user.id);
      if (refreshed && refreshed.length > 0) {
        setProfileSlug(refreshed[0].profile_slug || '');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to update profile slug');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (profile?.profile_slug) {
      setProfileSlug(profile.profile_slug);
    }
  };

  const downloadQRCode = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${profileSlug || 'mywardbulletin'}-qr.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const getPermanentUrl = (short = false) => {
    const domain = short ? SHORT_DOMAIN : FULL_DOMAIN;
    const baseUrl = `https://${domain}`;
    return profileSlug ? `${baseUrl}/${profileSlug}` : '';
  };

  const handleCopyUrl = async (short = false) => {
    const url = getPermanentUrl(short);
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('URL copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy URL to clipboard');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* QR Code Section */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-6">
        <div className="text-center">
          <canvas
            ref={canvasRef}
            width={300}
            height={300}
            className="border-2 border-gray-200 rounded-xl mx-auto shadow-sm"
          />
        </div>
      </div>

      {/* Custom Link Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Custom Link</h3>
        
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={profileSlug}
                onChange={(e) => setProfileSlug(formatProfileSlug(e.target.value))}
                placeholder="e.g., sunset-hills-ward"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
              />
              <p className="text-xs text-gray-500 mt-2">
                Allowed: letters, numbers, hyphens and underscores. Spaces will be replaced with hyphens.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSaveProfileSlug}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                <span className="text-sm font-medium text-gray-900">
                  {profileSlug || 'Not set'}
                </span>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-3 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                Edit
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Domain:</label>
              <select
                value={useShortDomain ? 'short' : 'full'}
                onChange={(e) => setUseShortDomain(e.target.value === 'short')}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="full">{FULL_DOMAIN}</option>
                <option value="short">{SHORT_DOMAIN}</option>
              </select>
            </div>
          </div>
        )}
        
        {error && (
          <p className="text-sm text-red-600 mt-2">{error}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={downloadQRCode}
            disabled={!profileSlug}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Download QR Code
          </button>
          
          {profileSlug && (
            <button
              onClick={() => {
                const shareUrl = `https://${useShortDomain ? SHORT_DOMAIN : FULL_DOMAIN}/${profileSlug}`;
                if (navigator.share) {
                  navigator.share({
                    title: 'Ward Bulletin',
                    text: 'Check out our ward bulletin!',
                    url: shareUrl
                  });
                } else {
                  navigator.clipboard.writeText(shareUrl);
                  toast.success('Share link copied to clipboard!');
                }
              }}
              className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Share
            </button>
          )}
          
          {profileSlug && (
            <button
              onClick={() => {
                const submissionsUrl = `https://${useShortDomain ? SHORT_DOMAIN : FULL_DOMAIN}/submit/${profileSlug}`;
                navigator.clipboard.writeText(submissionsUrl);
                toast.success('Submissions link copied to clipboard!');
              }}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Copy Submissions Link
            </button>
          )}
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 mb-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Use</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• Print this QR code and place it on physical bulletins</p>
          <p>• Members can scan to access your latest digital bulletin</p>
          <p>• QR code stays the same - just update your bulletins</p>
          <p className="flex items-center gap-2 mt-3 pt-3 border-t border-blue-200">
            <span className="text-yellow-600">💡</span>
            <span><strong>Mobile tip:</strong> Ensure good lighting and hold phone steady when scanning</span>
          </p>
        </div>
      </div>
      
      {/* Bulletin Selector */}
      {onActiveBulletinSelect && user && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <BulletinSelector
            user={user}
            currentActiveBulletinId={currentActiveBulletinId || undefined}
            onBulletinSelect={onActiveBulletinSelect}
          />
        </div>
      )}
    </div>
  );
};

export default QRCodeGenerator;