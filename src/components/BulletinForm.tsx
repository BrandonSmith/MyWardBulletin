import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { BulletinData, Announcement, Meeting, SpecialEvent, AgendaItem } from '../types/bulletin';
import { getHymnTitle, isValidHymnNumber } from '../data/hymns';
import { toast } from 'react-toastify';

interface BulletinFormProps {
  data: BulletinData;
  onChange: (data: BulletinData) => void;
}

export default function BulletinForm({ data, onChange }: BulletinFormProps) {
  const [activeTab, setActiveTab] = useState<'program' | 'announcements' | 'wardinfo'>('program');
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
    conducting: 'default_conducting',
    chorister: 'default_chorister',
    organist: 'default_organist',
    wardLeadership: 'default_wardLeadership',
    missionaries: 'default_missionaries',
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
    if (!data.leadership.conducting && localStorage.getItem(DEFAULT_KEYS.conducting)) {
      newData.leadership = { ...newData.leadership, conducting: localStorage.getItem(DEFAULT_KEYS.conducting) || '' };
      changed = true;
    }
    if (!data.leadership.chorister && localStorage.getItem(DEFAULT_KEYS.chorister)) {
      newData.leadership = { ...newData.leadership, chorister: localStorage.getItem(DEFAULT_KEYS.chorister) || '' };
      changed = true;
    }
    if (!data.leadership.organist && localStorage.getItem(DEFAULT_KEYS.organist)) {
      newData.leadership = { ...newData.leadership, organist: localStorage.getItem(DEFAULT_KEYS.organist) || '' };
      changed = true;
    }
    // Ward Leadership
    if ((!data.wardLeadership || data.wardLeadership.length === 0) && localStorage.getItem(DEFAULT_KEYS.wardLeadership)) {
      try {
        newData.wardLeadership = JSON.parse(localStorage.getItem(DEFAULT_KEYS.wardLeadership) || '[]');
        changed = true;
      } catch {}
    }
    // Missionaries
    if ((!data.missionaries || data.missionaries.length === 0) && localStorage.getItem(DEFAULT_KEYS.missionaries)) {
      try {
        newData.missionaries = JSON.parse(localStorage.getItem(DEFAULT_KEYS.missionaries) || '[]');
        changed = true;
      } catch {}
    }
    if (changed) onChange(newData);
    // eslint-disable-next-line
  }, []);

  // Save default handlers (to localStorage)
  const saveDefault = (key: keyof typeof DEFAULT_KEYS, value: any) => {
    if (key === 'wardLeadership' || key === 'missionaries') {
      localStorage.setItem(DEFAULT_KEYS[key], JSON.stringify(value));
    } else {
      localStorage.setItem(DEFAULT_KEYS[key], value);
    }
    toast.success('Default saved!');
  };

  // Move agenda item up or down
  const moveAgendaItem = (idx: number, direction: -1 | 1) => {
    const newAgenda = [...data.agenda];
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= newAgenda.length) return;
    [newAgenda[idx], newAgenda[targetIdx]] = [newAgenda[targetIdx], newAgenda[idx]];
    updateField('agenda', newAgenda);
  };

  // Update agenda item and auto-populate hymn title if needed
  const updateAgendaItem = (id: string, changes: Partial<AgendaItem>) => {
    updateField('agenda', data.agenda.map(item => {
      if (item.id !== id) return item;
      if (item.type === 'musical' && 'hymnNumber' in changes) {
        const hymnNumber = changes.hymnNumber;
        const number = parseInt(hymnNumber || '');
        if (hymnNumber && isValidHymnNumber(number)) {
          return { ...item, ...changes, hymnTitle: getHymnTitle(number) };
        } else {
          return { ...item, ...changes, hymnTitle: '' };
        }
      }
      return { ...item, ...changes };
    }));
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Tab Navigation */}
      <nav className="flex justify-center mb-4" aria-label="Main tabs">
        <ul className="flex flex-col gap-2 sm:flex-row sm:gap-2 w-full max-w-xs sm:max-w-none mx-auto">
          {['program', 'announcements', 'wardinfo'].map(tab => (
            <li key={tab} role="presentation" className="w-full sm:w-auto">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                aria-controls={`tab-panel-${tab}`}
                className={`w-full sm:w-auto px-4 sm:px-6 py-2 rounded-full font-semibold transition-all duration-150 shadow-sm focus:outline-none
                  ${activeTab === tab
                    ? 'bg-white text-gray-900 shadow-card'
                    : 'bg-muted text-gray-600 hover:bg-background hover:text-gray-900'}
                `}
                onClick={() => setActiveTab(tab as typeof activeTab)}
              >
                {tab === 'program' ? 'Program' : tab === 'announcements' ? 'Announcements' : 'Ward Info'}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      {/* Tab Content */}
      {activeTab === 'program' && (
        <>
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
                <div className="flex gap-2 md:flex-col md:gap-0">
                  <input
                    type="text"
                    value={data.leadership.conducting || ''}
                    onChange={(e) => updateField('leadership', { ...data.leadership, conducting: e.target.value })}
                    placeholder="e.g., 1st Counselor John Smith"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => saveDefault('conducting', data.leadership.conducting || '')}
                    className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 border border-gray-300 md:mt-2"
                    title="Save as default"
                  >
                    Save as default
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chorister</label>
                <div className="flex gap-2 md:flex-col md:gap-0">
                  <input
                    type="text"
                    value={data.leadership.chorister}
                    onChange={(e) => updateField('leadership', { ...data.leadership, chorister: e.target.value })}
                    placeholder="e.g., Debbie Hanes (Chorister)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => saveDefault('chorister', data.leadership.chorister)}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opening Hymn Number</label>
                <input
                  type="text"
                  value={data.musicProgram.openingHymnNumber}
                  onChange={(e) => handleHymnNumberChange('openingHymnNumber', e.target.value)}
                  placeholder="e.g., 9"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    Boolean(data.musicProgram.openingHymnNumber) && isValidHymnNumber(parseInt(data.musicProgram.openingHymnNumber)) === false
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                  }`}
                />
                {Boolean(data.musicProgram.openingHymnNumber) && isValidHymnNumber(parseInt(data.musicProgram.openingHymnNumber)) === false && (
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
                  readOnly={!!data.musicProgram.openingHymnNumber && isValidHymnNumber(parseInt(data.musicProgram.openingHymnNumber))}
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
                    Boolean(data.musicProgram.sacramentHymnNumber) && isValidHymnNumber(parseInt(data.musicProgram.sacramentHymnNumber)) === false
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                  }`}
                />
                {Boolean(data.musicProgram.sacramentHymnNumber) && isValidHymnNumber(parseInt(data.musicProgram.sacramentHymnNumber)) === false && (
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
                  readOnly={!!data.musicProgram.sacramentHymnNumber && isValidHymnNumber(parseInt(data.musicProgram.sacramentHymnNumber))}
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
                    Boolean(data.musicProgram.closingHymnNumber) && isValidHymnNumber(parseInt(data.musicProgram.closingHymnNumber)) === false
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                  }`}
                />
                {Boolean(data.musicProgram.closingHymnNumber) && isValidHymnNumber(parseInt(data.musicProgram.closingHymnNumber)) === false && (
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
                  readOnly={!!data.musicProgram.closingHymnNumber && isValidHymnNumber(parseInt(data.musicProgram.closingHymnNumber))}
                />
              </div>
            </div>
          </section>

          {/* Prayers */}
          <section className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Prayers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invocation</label>
                <input
                  type="text"
                  value={data.prayers.opening}
                  onChange={(e) => updateField('prayers', { ...data.prayers, opening: e.target.value })}
                  placeholder="Invocation name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Benediction</label>
                <input
                  type="text"
                  value={data.prayers.closing}
                  onChange={(e) => updateField('prayers', { ...data.prayers, closing: e.target.value })}
                  placeholder="Benediction name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </section>

          {/* Agenda (After Sacrament) */}
          <section className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Agenda (After Sacrament)</h3>
            <div className="space-y-3">
            {data.agenda.map((item, idx) => (
              <div key={item.id} className="bg-gray-50 p-4 rounded-lg flex flex-wrap gap-2 items-center">
                {item.type === 'testimony' ? (
                  <div className="w-full flex items-center justify-center">
                    <span className="block w-full text-center font-bold text-lg text-gray-700 py-2">Bearing of Testimonies</span>
                  </div>
                ) : item.type === 'speaker' ? (
                  <>
                    <input type="text" value={item.name} onChange={e => updateAgendaItem(item.id, { name: e.target.value })} placeholder="Speaker name" className="flex-1 min-w-[120px] max-w-xs px-3 py-2 border border-gray-300 rounded-lg" />
                    <select value={item.speakerType} onChange={e => updateAgendaItem(item.id, { speakerType: e.target.value as 'youth' | 'adult' })} className="px-2 py-1 border rounded-lg min-w-[120px]">
                      <option value="youth">Youth Speaker</option>
                      <option value="adult">Speaker</option>
                    </select>
                  </>
                ) : (
                  <>
                    <input type="text" value={item.hymnNumber || ''} onChange={e => updateAgendaItem(item.id, { hymnNumber: e.target.value })} placeholder="Hymn # (optional)" className="min-w-[80px] max-w-[100px] px-3 py-2 border border-gray-300 rounded-lg" />
                    <input type="text" value={item.hymnTitle || ''} onChange={e => updateAgendaItem(item.id, { hymnTitle: e.target.value })} placeholder="Hymn Title (auto)" className="flex-1 min-w-[120px] max-w-xs px-3 py-2 border border-gray-300 rounded-lg" readOnly={!!item.hymnNumber} />
                    <input type="text" value={item.songName || ''} onChange={e => updateAgendaItem(item.id, { songName: e.target.value })} placeholder="Song Name (if not hymn)" className="flex-1 min-w-[120px] max-w-xs px-3 py-2 border border-gray-300 rounded-lg" />
                    <input type="text" value={item.performers || ''} onChange={e => updateAgendaItem(item.id, { performers: e.target.value })} placeholder="Performers (optional)" className="flex-1 min-w-[120px] max-w-xs px-3 py-2 border border-gray-300 rounded-lg" />
                  </>
                )}
                <div className="flex flex-row items-center space-x-1">
                  <button onClick={() => moveAgendaItem(idx, -1)} disabled={idx === 0} className="px-2 py-1 text-gray-600 hover:text-black disabled:opacity-30">↑</button>
                  <button onClick={() => moveAgendaItem(idx, 1)} disabled={idx === data.agenda.length - 1} className="px-2 py-1 text-gray-600 hover:text-black disabled:opacity-30">↓</button>
                  <button onClick={() => updateField('agenda', data.agenda.filter(ag => ag.id !== item.id))} className="ml-2 p-2 text-red-600 hover:bg-red-100 rounded-lg">Remove</button>
                </div>
              </div>
            ))}
            </div>
            <div className="flex gap-2 mt-2">
              <button onClick={() => updateField('agenda', [...data.agenda, { id: Date.now().toString(), type: 'speaker', name: '', speakerType: 'adult' }])} className="px-3 py-1 bg-blue-600 text-white rounded-lg">Add Speaker</button>
              <button onClick={() => updateField('agenda', [...data.agenda, { id: Date.now().toString(), type: 'musical', hymnNumber: '', hymnTitle: '', songName: '', performers: '' }])} className="px-3 py-1 bg-green-600 text-white rounded-lg">Add Musical Number</button>
              <button onClick={() => updateField('agenda', [...data.agenda, { id: Date.now().toString(), type: 'testimony' }])} className="px-3 py-1 bg-yellow-500 text-white rounded-lg">Bearing of Testimonies</button>
            </div>
          </section>
        </>
      )}
      {activeTab === 'announcements' && (
        <>
          {/* Announcements Section */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Announcements</h3>
              <button
                onClick={addAnnouncement}
                className="inline-flex items-center justify-center w-full sm:w-auto px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
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

          {/* Meetings Section */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Meetings This Week</h3>
              <button
                onClick={addMeeting}
                className="inline-flex items-center justify-center w-full sm:w-auto px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
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

          {/* Special Events Section */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Special Events</h3>
              <button
                onClick={addSpecialEvent}
                className="inline-flex items-center justify-center w-full sm:w-auto px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
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
        </>
      )}
      {activeTab === 'wardinfo' && (
        <section className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 flex items-center justify-between">Ward Leadership
            <div className="flex flex-col items-end ml-2">
              <button
                type="button"
                onClick={() => saveDefault('wardLeadership', data.wardLeadership)}
                className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 border border-gray-300"
                title="Save as default"
              >
                Save as default
              </button>
              <span className="text-xs text-gray-500 mt-1">Saves title, name, and phone for each row as your template.</span>
            </div>
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm rounded-lg overflow-hidden bg-white shadow-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-2 py-1 border-b">Title</th>
                  <th className="px-2 py-1 border-b">Name</th>
                  <th className="px-2 py-1 border-b">Phone</th>
                  <th className="px-2 py-1 border-b"></th>
                </tr>
              </thead>
              <tbody>
                {data.wardLeadership.map((entry, idx) => (
                  <tr key={idx} className="hover:bg-blue-50 transition">
                    <td className="border-b px-2 py-1">
                      <input
                        type="text"
                        value={entry.title}
                        onChange={e => {
                          const updated = [...data.wardLeadership];
                          updated[idx] = { ...updated[idx], title: e.target.value };
                          updateField('wardLeadership', updated);
                        }}
                        className="w-full px-1 py-1 border rounded bg-gray-50 focus:bg-white"
                      />
                    </td>
                    <td className="border-b px-2 py-1">
                      <input
                        type="text"
                        value={entry.name}
                        onChange={e => {
                          const updated = [...data.wardLeadership];
                          updated[idx] = { ...updated[idx], name: e.target.value };
                          updateField('wardLeadership', updated);
                        }}
                        className="w-full px-1 py-1 border rounded bg-gray-50 focus:bg-white"
                      />
                    </td>
                    <td className="border-b px-2 py-1">
                      <input
                        type="text"
                        value={entry.phone || ''}
                        onChange={e => {
                          const updated = [...data.wardLeadership];
                          updated[idx] = { ...updated[idx], phone: e.target.value };
                          updateField('wardLeadership', updated);
                        }}
                        className="w-full px-1 py-1 border rounded bg-gray-50 focus:bg-white"
                      />
                    </td>
                    <td className="border-b px-2 py-1 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = data.wardLeadership.filter((_, i) => i !== idx);
                          updateField('wardLeadership', updated);
                        }}
                        className="text-red-600 hover:underline"
                        title="Remove"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              type="button"
              onClick={() => updateField('wardLeadership', [...data.wardLeadership, { title: '', name: '', phone: '' }])}
              className="mt-2 px-3 py-1 bg-blue-600 text-white rounded-lg"
            >
              Add Leadership Position
            </button>
          </div>

          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mt-8 flex items-center justify-between">Missionaries
            <div className="flex flex-col items-end ml-2">
              <button
                type="button"
                onClick={() => saveDefault('missionaries', data.missionaries)}
                className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 border border-gray-300"
                title="Save as default"
              >
                Save as default
              </button>
              <span className="text-xs text-gray-500 mt-1">Saves name, phone, and email for each missionary as your template.</span>
            </div>
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm rounded-lg overflow-hidden bg-white shadow-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-2 py-1 border-b">Name</th>
                  <th className="px-2 py-1 border-b">Phone</th>
                  <th className="px-2 py-1 border-b">Email</th>
                  <th className="px-2 py-1 border-b"></th>
                </tr>
              </thead>
              <tbody>
                {data.missionaries.map((entry, idx) => (
                  <tr key={idx} className="hover:bg-blue-50 transition">
                    <td className="border-b px-2 py-1">
                      <input
                        type="text"
                        value={entry.name}
                        onChange={e => {
                          const updated = [...data.missionaries];
                          updated[idx] = { ...updated[idx], name: e.target.value };
                          updateField('missionaries', updated);
                        }}
                        className="w-full px-1 py-1 border rounded bg-gray-50 focus:bg-white"
                      />
                    </td>
                    <td className="border-b px-2 py-1">
                      <input
                        type="text"
                        value={entry.phone || ''}
                        onChange={e => {
                          const updated = [...data.missionaries];
                          updated[idx] = { ...updated[idx], phone: e.target.value };
                          updateField('missionaries', updated);
                        }}
                        className="w-full px-1 py-1 border rounded bg-gray-50 focus:bg-white"
                      />
                    </td>
                    <td className="border-b px-2 py-1">
                      <input
                        type="email"
                        value={entry.email || ''}
                        onChange={e => {
                          const updated = [...data.missionaries];
                          updated[idx] = { ...updated[idx], email: e.target.value };
                          updateField('missionaries', updated);
                        }}
                        className="w-full px-1 py-1 border rounded bg-gray-50 focus:bg-white"
                      />
                    </td>
                    <td className="border-b px-2 py-1 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = data.missionaries.filter((_, i) => i !== idx);
                          updateField('missionaries', updated);
                        }}
                        className="text-red-600 hover:underline"
                        title="Remove"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              type="button"
              onClick={() => updateField('missionaries', [...data.missionaries, { name: '', phone: '', email: '' }])}
              className="mt-2 px-3 py-1 bg-blue-600 text-white rounded-lg"
            >
              Add Missionary
            </button>
          </div>
        </section>
      )}
    </div>
  );
}