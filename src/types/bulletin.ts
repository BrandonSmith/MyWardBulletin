import { SongType } from '../lib/songService';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'baptism' | 'birthday' | 'calling' | 'activity' | 'service' | 'other';
  date?: string;
  audience?: 'ward' | 'relief_society' | 'elders_quorum' | 'youth' | 'primary' | 'stake' | 'other';
  imageId?: string; // Optional image for flyers/announcements
  hideImageOnPrint?: boolean; // Hide image when printing
}

export interface Meeting {
  id: string;
  title: string;
  time: string;
  location: string;
  description?: string;
}

export interface SpecialEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  contact?: string;
}

export interface Prayers {
  opening: string;
  closing: string;
  invocation: string;
  benediction: string;
}

export interface MusicProgram {
  openingHymn: string;
  openingHymnNumber: string;
  openingHymnTitle: string;
  openingHymnType?: SongType;
  sacramentHymn: string;
  sacramentHymnNumber: string;
  sacramentHymnTitle: string;
  sacramentHymnType?: SongType;
  closingHymn: string;
  closingHymnNumber: string;
  closingHymnTitle: string;
  closingHymnType?: SongType;
}

export interface Leadership {
  presiding: string;
  conducting?: string;
  chorister: string;
  organist: string;
  organistLabel?: 'Organist' | 'Pianist';
  preludeMusic?: string;
}

export interface Speaker {
  id: string;
  name: string;
  type: 'youth' | 'adult';
}

export type AgendaItem =
  | { type: 'speaker'; id: string; name: string; speakerType: 'youth' | 'adult' }
  | { type: 'musical'; id: string; label?: string; hymnNumber?: string; hymnTitle?: string; hymnType?: SongType; songName?: string; performers?: string }
  | { type: 'testimony'; id: string; note?: string }
  | { type: 'sacrament'; id: string };

export interface WardLeadershipEntry {
  title: string;
  name: string;
  phone?: string;
}

export interface MissionaryEntry {
  name: string;
  phone?: string;
}

export interface WardMissionaryEntry {
  name: string;
  mission?: string;
  missionAddress?: string;
  email?: string;
}

export interface BulletinData {
  wardName: string;
  date: string;
  meetingType: string;
  theme: string;
  bishopricMessage: string;
  announcements: Announcement[];
  meetings: Meeting[];
  specialEvents: SpecialEvent[];
  agenda: AgendaItem[];
  prayers: Prayers;
  musicProgram: MusicProgram;
  leadership: Leadership;
  wardLeadership: WardLeadershipEntry[];
  missionaries: MissionaryEntry[];
  wardMissionaries: WardMissionaryEntry[];
  imageId?: string; // ID of selected image from LDS_IMAGES or custom images
  imagePosition?: { x: number; y: number }; // Image positioning coordinates
}