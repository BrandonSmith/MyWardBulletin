import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PublicBulletinView from '../components/PublicBulletinView';
import { bulletinService } from '../lib/supabase';

export default function PublicBulletinPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const {
    data: publicBulletin,
    isLoading,
    error
  } = useQuery({
    queryKey: ['public-bulletin', slug],
    queryFn: () => slug ? bulletinService.getLatestBulletinByProfileSlug(slug) : Promise.resolve(null),
    enabled: !!slug
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bulletin...</p>
        </div>
      </div>
    );
  }

  return (
    <PublicBulletinView
      bulletinData={publicBulletin ? {
        wardName: publicBulletin.ward_name || '',
        date: publicBulletin.date || '',
        meetingType: publicBulletin.meeting_type || '',
        theme: publicBulletin.theme || '',
        bishopricMessage: publicBulletin.bishopric_message || '',
        announcements: publicBulletin.announcements || [],
        meetings: publicBulletin.meetings || [],
        specialEvents: publicBulletin.special_events || [],
        agenda: publicBulletin.agenda || [],
        prayers: publicBulletin.prayers || { opening: '', closing: '', invocation: '', benediction: '' },
        musicProgram: publicBulletin.music_program || {
          openingHymn: '',
          openingHymnNumber: '',
          openingHymnTitle: '',
          sacramentHymn: '',
          sacramentHymnNumber: '',
          sacramentHymnTitle: '',
          closingHymn: '',
          closingHymnNumber: '',
          closingHymnTitle: ''
        },
        leadership: publicBulletin.leadership || { presiding: '', conducting: '', chorister: '', organist: '' },
        wardLeadership: publicBulletin.wardLeadership || (publicBulletin.leadership && publicBulletin.leadership.wardLeadership) || [],
        missionaries: publicBulletin.missionaries || (publicBulletin.leadership && publicBulletin.leadership.missionaries) || []
      } : null}
      loading={isLoading}
      error={error ? (error as Error).message || 'Bulletin not found' : ''}
      onBackToEditor={() => navigate('/')}
    />
  );
}
