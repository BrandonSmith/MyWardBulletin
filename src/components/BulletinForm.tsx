import React, { useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { BulletinData, Announcement, Meeting, SpecialEvent, Speaker } from '../types/bulletin';
import { getHymnTitle, isValidHymnNumber } from '../data/hymns';

interface BulletinFormProps {
  data: BulletinData;
  onChange: (data: BulletinData) => void;
}

export default function BulletinForm({ data, onChange }: BulletinFormProps) {
  const updateField = (field: keyof BulletinData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const addAnnouncement = () => {
    const newAnnouncement: Announcement = {
      id: Date.now().toString(),
      title: '',
      content: '',
      category: 'general'
    };
    updateField('announcements', [...data.announcements, newAnnouncement]);
  };

  const updateAnnouncement = (id: string, field: keyof Announcement, value: any) => {
    const updated = data.announcements.map(ann => 
      ann.id === id ? { ...ann, [field]: value } : ann
    );
    updateField('announcements', updated);
  };

  const removeAnnouncement = (id: string) => {
    updateField('announcements', data.announcements.filter(ann => ann.id !== id));
  };

  const addSpeaker = () => {
    const newSpeaker: Speaker = {
      id: Date.now().toString(),
      name: '',
      type: 'adult'
    };
    updateField('speakers', [...data.speakers, newSpeaker]);
  };

  const updateSpeaker = (id: string, field: keyof Speaker, value: any) => {
    const updated = data.speakers.map(speaker => 
      speaker.id === id ? { ...speaker, [field]: value } : speaker
    );
    updateField('speakers', updated);
  };

  const removeSpeaker = (id: string) => {
    updateField('speakers', data.speakers.filter(speaker => speaker.id !== id));
  };

  const handleHymnNumberChange = (field: string, value: string) => {
    const number = parseInt(value);
    const hymnData = { ...data.musicProgram };
    
    if (field === 'openingHymnNumber') {
      hymnData.openingHymnNumber = value;
      if (isValidHymnNumber(number)) {
        hymnData.openingHymnTitle = getHymnTitle(number);
      }
    } else if (field === 'sacramentHymnNumber') {
      hymnData.sacramentHymnNumber = value;
      if (isValidHymnNumber(number)) {
        hymnData.sacramentHymnTitle = getHymnTitle(number);
      }
    } else if (field === 'closingHymnNumber') {
      hymnData.closingHymnNumber = value;
      if (isValidHymnNumber(number)) {
        hymnData.closingHymnTitle = getHymnTitle(number);
      }
    }
    
    updateField('musicProgram', hymnData);
  };

  const addMeeting = () => {
    const newMeeting: Meeting = {
      id: Date.now().toString(),
      title: '',
      time: '',
      location: ''
    };
    updateField('meetings', [...data.meetings, newMeeting]);
  };

  const updateMeeting = (id: string, field: keyof Meeting, value: any) => {
    const updated = data.meetings.map(meeting => 
      meeting.id === id ? { ...meeting, [field]: value } : meeting
    );
    updateField('meetings', updated);
  };

  const removeMeeting = (id: string) => {
    updateField('meetings', data.meetings.filter(meeting => meeting.id !== id));
  };

  const addSpecialEvent = () => {
    const newEvent: SpecialEvent = {
      id: Date.now().toString(),
      title: '',
      date: '',
      time: '',
      location: '',
      description: ''
    };
    updateField('specialEvents', [...data.specialEvents, newEvent]);
  };

  const updateSpecialEvent = (id: string, field: keyof SpecialEvent, value: any) => {
    const updated = data.specialEvents.map(event => 
      event.id === id ? { ...event, [field]: value } : event
    );
    updateField('specialEvents', updated);
  };

  const removeSpecialEvent = (id: string) => {
    updateField('specialEvents', data.specialEvents.filter(event => event.id !== id));
  };

  // Default value keys
  const DEFAULT_KEYS = {
    wardName: 'default_wardName',
    presiding: 'default_presiding',
    musicDirector: 'default_musicDirector',
    organist: 'default_organist',
  };

  // Load defaults from localStorage on mount
  useEffect(() => {
    const newData = { ...data };
    let changed = false;
    if (!data.wardName && localStorage.getItem(DEFAULT_KEYS.wardName)) {
      newData.wardName = localStorage.getItem(DEFAULT_KEYS.wardName) || '';
      changed = true;
    }
    if (!data.leadership.presiding && localStorage.getItem(DEFAULT_KEYS.presiding)) {
      newData.leadership = { ...newData.leadership, presiding: localStorage.getItem(DEFAULT_KEYS.presiding) || '' };
      changed = true;
    }
    if (!data.leadership.musicDirector && localStorage.getItem(DEFAULT_KEYS.musicDirector)) {
      newData.leadership = { ...newData.leadership, musicDirector: localStorage.getItem(DEFAULT_KEYS.musicDirector) || '' };
      changed = true;
    }
    if (!data.leadership.organist && localStorage.getItem(DEFAULT_KEYS.organist)) {
      newData.leadership = { ...newData.leadership, organist: localStorage.getItem(DEFAULT_KEYS.organist) || '' };
      changed = true;
    }
    if (changed) onChange(newData);
    // eslint-disable-next-line
  }, []);

  // Save default handlers (to localStorage)
  const saveDefault = (key: keyof typeof DEFAULT_KEYS, value: string) => {
    localStorage.setItem(DEFAULT_KEYS[key], value);
  };

  return (
    <div className="space-y-8">
      {/* Basic Information */}
      <section className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ward Name</label>
            <div className="flex gap-2 md:flex-col md:gap-0">
              <input
                type="text"
                value={data.wardName}
                onChange={(e) => updateField('wardName', e.target.value)}
                placeholder="e.g., Sunset Hills Ward"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => saveDefault('wardName', data.wardName)}
                className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 border border-gray-300 md:mt-2"
                title="Save as default"
              >
                Save as default
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={data.date}
              onChange={(e) => updateField('date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Theme/Scripture</label>
            <input
              type="text"
              value={data.theme}
              onChange={(e) => updateField('theme', e.target.value)}
              placeholder="Weekly theme or scripture reference"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Leadership</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Presiding</label>
            <div className="flex gap-2 md:flex-col md:gap-0">
              <input
                type="text"
                value={data.leadership.presiding}
                onChange={(e) => updateField('leadership', { ...data.leadership, presiding: e.target.value })}
                placeholder="e.g., Bishop Dave Stratham"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => saveDefault('presiding', data.leadership.presiding)}
                className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 border border-gray-300 md:mt-2"
                title="Save as default"
              >
                Save as default
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Conducting</label>
            <input
              type="text"
              value={data.leadership.conducting || ''}
              onChange={(e) => updateField('leadership', { ...data.leadership, conducting: e.target.value })}
              placeholder="e.g., 1st Counselor John Smith"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Music Director</label>
            <div className="flex gap-2 md:flex-col md:gap-0">
              <input
                type="text"
                value={data.leadership.musicDirector}
                onChange={(e) => updateField('leadership', { ...data.leadership, musicDirector: e.target.value })}
                placeholder="e.g., Debbie Hanes"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => saveDefault('musicDirector', data.leadership.musicDirector)}
                className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 border border-gray-300 md:mt-2"
                title="Save as default"
              >
                Save as default
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Organist</label>
            <div className="flex gap-2 md:flex-col md:gap-0">
              <input
                type="text"
                value={data.leadership.organist}
                onChange={(e) => updateField('leadership', { ...data.leadership, organist: e.target.value })}
                placeholder="e.g., Tom Webster"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => saveDefault('organist', data.leadership.organist)}
                className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 border border-gray-300 md:mt-2"
                title="Save as default"
              >
                Save as default
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Music Program */}
      <section className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Music Program</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prelude</label>
          <input
            type="text"
            value={data.musicProgram.prelude}
            onChange={(e) => updateField('musicProgram', { ...data.musicProgram, prelude: e.target.value })}
            placeholder="e.g., Ward Choir"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Opening Hymn Number</label>
            <input
              type="text"
              value={data.musicProgram.openingHymnNumber}
              onChange={(e) => handleHymnNumberChange('openingHymnNumber', e.target.value)}
              placeholder="e.g., 9"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                data.musicProgram.openingHymnNumber && !isValidHymnNumber(parseInt(data.musicProgram.openingHymnNumber)) 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-300'
              }`}
            />
            {data.musicProgram.openingHymnNumber && !isValidHymnNumber(parseInt(data.musicProgram.openingHymnNumber)) && (
              <p className="text-xs text-red-600 mt-1">Invalid hymn number</p>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Opening Hymn Title</label>
            <input
              type="text"
              value={data.musicProgram.openingHymnTitle}
              onChange={(e) => updateField('musicProgram', { ...data.musicProgram, openingHymnTitle: e.target.value })}
              placeholder="e.g., Come, Rejoice"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                data.musicProgram.openingHymnNumber && isValidHymnNumber(parseInt(data.musicProgram.openingHymnNumber))
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300'
              }`}
              readOnly={data.musicProgram.openingHymnNumber && isValidHymnNumber(parseInt(data.musicProgram.openingHymnNumber))}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sacrament Hymn Number</label>
            <input
              type="text"
              value={data.musicProgram.sacramentHymnNumber}
              onChange={(e) => handleHymnNumberChange('sacramentHymnNumber', e.target.value)}
              placeholder="e.g., 181"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                data.musicProgram.sacramentHymnNumber && !isValidHymnNumber(parseInt(data.musicProgram.sacramentHymnNumber)) 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-300'
              }`}
            />
            {data.musicProgram.sacramentHymnNumber && !isValidHymnNumber(parseInt(data.musicProgram.sacramentHymnNumber)) && (
              <p className="text-xs text-red-600 mt-1">Invalid hymn number</p>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Sacrament Hymn Title</label>
            <input
              type="text"
              value={data.musicProgram.sacramentHymnTitle}
              onChange={(e) => updateField('musicProgram', { ...data.musicProgram, sacramentHymnTitle: e.target.value })}
              placeholder="e.g., We'll Sing All Hail to Jesus' Name"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                data.musicProgram.sacramentHymnNumber && isValidHymnNumber(parseInt(data.musicProgram.sacramentHymnNumber))
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300'
              }`}
              readOnly={data.musicProgram.sacramentHymnNumber && isValidHymnNumber(parseInt(data.musicProgram.sacramentHymnNumber))}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Musical Number</label>
            <input
              type="text"
              value={data.musicProgram.specialMusical}
              onChange={(e) => updateField('musicProgram', { ...data.musicProgram, specialMusical: e.target.value })}
              placeholder="e.g., CTR 8 Class"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Performers (optional)</label>
            <input
              type="text"
              value={data.musicProgram.musicalPerformers}
              onChange={(e) => updateField('musicProgram', { ...data.musicProgram, musicalPerformers: e.target.value })}
              placeholder="Names of performers"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Closing Hymn Number</label>
            <input
              type="text"
              value={data.musicProgram.closingHymnNumber}
              onChange={(e) => handleHymnNumberChange('closingHymnNumber', e.target.value)}
              placeholder="e.g., 89"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                data.musicProgram.closingHymnNumber && !isValidHymnNumber(parseInt(data.musicProgram.closingHymnNumber)) 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-300'
              }`}
            />
            {data.musicProgram.closingHymnNumber && !isValidHymnNumber(parseInt(data.musicProgram.closingHymnNumber)) && (
              <p className="text-xs text-red-600 mt-1">Invalid hymn number</p>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Closing Hymn Title</label>
            <input
              type="text"
              value={data.musicProgram.closingHymnTitle}
              onChange={(e) => updateField('musicProgram', { ...data.musicProgram, closingHymnTitle: e.target.value })}
              placeholder="e.g., The Lord Is My Light"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                data.musicProgram.closingHymnNumber && isValidHymnNumber(parseInt(data.musicProgram.closingHymnNumber))
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300'
              }`}
              readOnly={data.musicProgram.closingHymnNumber && isValidHymnNumber(parseInt(data.musicProgram.closingHymnNumber))}
            />
          </div>
        </div>
      </section>

      {/* Prayers */}
      <section className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Prayers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Opening Prayer</label>
            <input
              type="text"
              value={data.prayers.opening}
              onChange={(e) => updateField('prayers', { ...data.prayers, opening: e.target.value })}
              placeholder="Name of person giving opening prayer"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Closing Prayer</label>
            <input
              type="text"
              value={data.prayers.closing}
              onChange={(e) => updateField('prayers', { ...data.prayers, closing: e.target.value })}
              placeholder="Name of person giving closing prayer"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </section>

      {/* Speakers */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Speakers</h3>
          <button
            onClick={addSpeaker}
            className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Speaker
          </button>
        </div>
        
        {data.speakers.map((speaker) => (
          <div key={speaker.id} className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={speaker.name}
                    onChange={(e) => updateSpeaker(speaker.id, 'name', e.target.value)}
                    placeholder="Speaker name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={speaker.type}
                    onChange={(e) => updateSpeaker(speaker.id, 'type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="youth">Youth Speaker</option>
                    <option value="adult">Speaker</option>
                  </select>
                </div>
              </div>
              <button
                onClick={() => removeSpeaker(speaker.id)}
                className="ml-3 p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Announcements */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Announcements</h3>
          <button
            onClick={addAnnouncement}
            className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Announcement
          </button>
        </div>
        
        {data.announcements.map((announcement) => (
          <div key={announcement.id} className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={announcement.title}
                    onChange={(e) => updateAnnouncement(announcement.id, 'title', e.target.value)}
                    placeholder="Announcement title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={announcement.category}
                    onChange={(e) => updateAnnouncement(announcement.id, 'category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="general">General</option>
                    <option value="baptism">Baptism</option>
                    <option value="birthday">Birthday</option>
                    <option value="calling">New Calling</option>
                    <option value="activity">Activity</option>
                    <option value="service">Service Opportunity</option>
                  </select>
                </div>
                <textarea
                  value={announcement.content}
                  onChange={(e) => updateAnnouncement(announcement.id, 'content', e.target.value)}
                  placeholder="Announcement content..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => removeAnnouncement(announcement.id)}
                className="ml-3 p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Meetings */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Meetings This Week</h3>
          <button
            onClick={addMeeting}
            className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Meeting
          </button>
        </div>
        
        {data.meetings.map((meeting) => (
          <div key={meeting.id} className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={meeting.title}
                    onChange={(e) => updateMeeting(meeting.id, 'title', e.target.value)}
                    placeholder="Meeting title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={meeting.time}
                    onChange={(e) => updateMeeting(meeting.id, 'time', e.target.value)}
                    placeholder="Time (e.g., 7:00 PM)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={meeting.location}
                    onChange={(e) => updateMeeting(meeting.id, 'location', e.target.value)}
                    placeholder="Location"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <textarea
                  value={meeting.description || ''}
                  onChange={(e) => updateMeeting(meeting.id, 'description', e.target.value)}
                  placeholder="Meeting description (optional)"
                  rows={1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => removeMeeting(meeting.id)}
                className="ml-3 p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Special Events */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Special Events</h3>
          <button
            onClick={addSpecialEvent}
            className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Event
          </button>
        </div>
        
        {data.specialEvents.map((event) => (
          <div key={event.id} className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={event.title}
                    onChange={(e) => updateSpecialEvent(event.id, 'title', e.target.value)}
                    placeholder="Event title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="date"
                    value={event.date}
                    onChange={(e) => updateSpecialEvent(event.id, 'date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={event.time}
                    onChange={(e) => updateSpecialEvent(event.id, 'time', e.target.value)}
                    placeholder="Time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={event.location}
                    onChange={(e) => updateSpecialEvent(event.id, 'location', e.target.value)}
                    placeholder="Location"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <textarea
                  value={event.description}
                  onChange={(e) => updateSpecialEvent(event.id, 'description', e.target.value)}
                  placeholder="Event description"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  value={event.contact || ''}
                  onChange={(e) => updateSpecialEvent(event.id, 'contact', e.target.value)}
                  placeholder="Contact person (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => removeSpecialEvent(event.id)}
                className="ml-3 p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}