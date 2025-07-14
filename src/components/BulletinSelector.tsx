import React, { useState, useEffect } from 'react';
import { Check, Calendar, FileText } from 'lucide-react';
import { bulletinService } from '../lib/supabase';
import { useQuery } from '@tanstack/react-query';

interface BulletinSelectorProps {
  user: any;
  currentActiveBulletinId?: string;
  onBulletinSelect: (bulletinId: string) => void;
}

export default function BulletinSelector({ 
  user, 
  currentActiveBulletinId, 
  onBulletinSelect 
}: BulletinSelectorProps) {
  const { data: bulletins = [], isLoading: loading, error } = useQuery({
    queryKey: ['user-bulletins', user?.id],
    queryFn: () => bulletinService.getUserBulletins(user.id),
    enabled: !!user
  });

  const formatDate = (dateString: string) => {
    // Fix timezone issue by creating date in local timezone
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading bulletins...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (bulletins.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600">No saved bulletins found</p>
        <p className="text-sm text-gray-500">Create and save a bulletin first</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-900">Select Active Bulletin for QR Code</h4>
      <p className="text-sm text-gray-600">
        Choose which bulletin people will see when they scan your QR code
      </p>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {bulletins.map((bulletin) => (
          <div
            key={bulletin.id}
            onClick={() => onBulletinSelect(bulletin.id)}
            className={`p-3 border rounded-lg cursor-pointer transition-all ${
              currentActiveBulletinId === bulletin.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h5 className="font-medium text-gray-900">
                    {bulletin.ward_name || 'Unnamed Ward'}
                  </h5>
                  {currentActiveBulletinId === bulletin.id && (
                    <div className="flex items-center space-x-1">
                      <Check className="w-4 h-4 text-blue-600" />
                      <span className="text-xs text-blue-600 font-medium">Active</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-3 text-sm text-gray-600 mt-1">
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>{formatDate(bulletin.date)}</span>
                  </div>
                  <span>{bulletin.meeting_type}</span>
                </div>

                {bulletin.theme && (
                  <p className="text-xs text-gray-500 italic mt-1">
                    {bulletin.theme}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
        <p>💡 <strong>Tip:</strong> The selected bulletin will be shown when people scan your QR code. You can change this anytime without updating the QR code itself.</p>
      </div>
    </div>
  );
}