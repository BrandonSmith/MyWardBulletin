export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'baptism' | 'birthday' | 'calling' | 'activity' | 'service';
  date?: string;
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
  prelude: string;
  openingHymn: string;
  openingHymnNumber: string;
  openingHymnTitle: string;
  sacramentHymn: string;
  sacramentHymnNumber: string;
  sacramentHymnTitle: string;
  closingHymn: string;
  closingHymnNumber: string;
  closingHymnTitle: string;
  specialMusical: string;
  musicalPerformers: string;
}

export interface Leadership {
  presiding: string;
  conducting?: string;
  musicDirector: string;
  organist: string;
}

export interface Speaker {
  id: string;
  name: string;
  type: 'youth' | 'adult';
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
  speakers: Speaker[];
  prayers: Prayers;
  musicProgram: MusicProgram;
  leadership: Leadership;
}