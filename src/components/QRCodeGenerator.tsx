import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import QRCode from 'qrcode';
import { BulletinData } from '../types/bulletin';
import { userService } from '../lib/supabase';
import BulletinSelector from './BulletinSelector';
import { toast } from 'react-toastify';
import { FULL_DOMAIN, SHORT_DOMAIN } from '../lib/config';

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
  user: any;
  currentActiveBulletinId?: string | null;
  onActiveBulletinSelect?: (bulletinId: string | null) => void;
  onProfileSlugUpdate?: (slug: string) => void;
  isOpen?: boolean;
}

export interface QRCodeGeneratorRef {
  loadUserProfile: () => Promise<void>;
}

const QRCodeGenerator = forwardRef<QRCodeGeneratorRef, QRCodeGeneratorProps>(function QRCodeGenerator({
  user,
  currentActiveBulletinId,
  onActiveBulletinSelect,
  onProfileSlugUpdate,
  isOpen
}, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [profileSlug, setProfileSlug] = React.useState('');
  const [isEditing, setIsEditing] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [useShortDomain, setUseShortDomain] = React.useState(true);


  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(LAST_USER_ID, user.id);
    }
    loadUserProfile();
  }, [user]);

  useEffect(() => {
    generateQRCode();
  }, [profileSlug, useShortDomain]);

  useEffect(() => {
    const id = user?.id || localStorage.getItem(LAST_USER_ID);
    if (id) {
      localStorage.setItem(`profile_slug_${id}`, profileSlug);
    }
  }, [profileSlug, user]);

  React.useEffect(() => {
    if (isOpen) {
      loadUserProfile();
    }
  }, [isOpen]);

  const loadUserProfile = async () => {
    const id = user?.id || localStorage.getItem(LAST_USER_ID);
    if (!id) return;

    try {
      const profile = await userService.getUserProfile(id);
      console.log('Fetched profile from Supabase:', profile);
      if (profile && profile.length > 0) {
        const slug = profile[0].profile_slug || '';
        setProfileSlug(slug);
        localStorage.setItem(`profile_slug_${id}`, slug);
        return;
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }

    const cached = localStorage.getItem(`profile_slug_${id}`);
    if (cached) {
      setProfileSlug(cached);
    }
  };

  useImperativeHandle(ref, () => ({
    loadUserProfile,
  }));

  const generateQRCode = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const domain = useShortDomain ? SHORT_DOMAIN : FULL_DOMAIN;
    const baseUrl = `https://${domain}`;

    const qrData = profileSlug
      ? `${baseUrl}/${profileSlug}`
      : `${baseUrl}/your-profile-slug`;
    
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
      await loadUserProfile(); // Still fetch from backend to ensure sync
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
                  onChange={(e) => setProfileSlug(formatProfileSlug(e.target.value))}
                  placeholder="e.g., sunset-hills-ward"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <p className="text-xs text-gray-500">
                  Allowed: letters, numbers, hyphens and underscores. Spaces will
                  be replaced with hyphens.
                </p>
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
          <div className="flex items-center space-x-2 mt-2">
            <label className="text-sm">Domain:</label>
            <select
              value={useShortDomain ? 'short' : 'full'}
              onChange={(e) => setUseShortDomain(e.target.value === 'short')}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="full">{FULL_DOMAIN}</option>
              <option value="short">{SHORT_DOMAIN}</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded space-y-2">
          <p className="font-medium">🔗 Your Permanent QR Code</p>
          <p>This QR code always shows your latest bulletin</p>
          {profileSlug && (
            <>
              <div className="flex items-center space-x-2">
                <p className="font-mono text-xs break-all bg-white p-1 rounded border flex-1">
                  https://{FULL_DOMAIN}/{profileSlug}
                </p>
                <button
                  onClick={() => handleCopyUrl(false)}
                  className="px-2 py-1 bg-gray-600 text-white rounded text-xs"
                >
                  Copy
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <p className="font-mono text-xs break-all bg-white p-1 rounded border flex-1">
                  https://{SHORT_DOMAIN}/{profileSlug}
                </p>
                <button
                  onClick={() => handleCopyUrl(true)}
                  className="px-2 py-1 bg-gray-600 text-white rounded text-xs"
                >
                  Copy
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:justify-center sm:space-x-3 items-center mt-4">
        <button
          onClick={downloadQRCode}
          disabled={!profileSlug}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-2 sm:mb-0"
        >
          Download QR Code
        </button>
        <button
          onClick={() => handleCopyUrl(useShortDomain)}
          disabled={!profileSlug}
          className="w-full sm:w-auto px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Copy Selected URL
        </button>
      </div>

      
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
});

export default QRCodeGenerator;