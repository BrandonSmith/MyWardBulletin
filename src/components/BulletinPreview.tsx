import React from 'react';
import { BulletinData } from '../types/bulletin';
import { getHymnUrl, getHymnTitle } from '../data/hymns';

interface BulletinPreviewProps {
  data: BulletinData;
}

export default function BulletinPreview({ data }: BulletinPreviewProps) {
  const formatDate = (dateString: string) => {
    // Fix timezone issue by creating date in local timezone
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const DottedLine = ({ children, rightAlign }: { children: React.ReactNode; rightAlign?: string }) => (
    <div className="flex items-center justify-between py-1">
      <span className="flex-1 flex items-center">
        {children}
        <span className="flex-1 mx-2 border-b border-dotted border-gray-400"></span>
      </span>
      {rightAlign && <span className="text-right font-medium">{rightAlign}</span>}
    </div>
  );

  const youthSpeakers = data.speakers.filter(s => s.type === 'youth');
  const adultSpeakers = data.speakers.filter(s => s.type === 'adult');

  return (
    <div className="bulletin bg-white shadow-lg rounded-lg overflow-hidden max-w-2xl mx-auto font-serif">
      {/* Header */}
      <div className="bg-gray-100 border-b-2 border-gray-300 text-center relative overflow-hidden">
        <div className="relative z-10 p-6">
          {/* Ward Name */}
          {data.wardName && (
            <h1 className="text-xl font-bold text-gray-900 mb-1">
              {data.wardName}
            </h1>
          )}
          
          {/* Meeting Type */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Sacrament Meeting
          </h2>
          
          {/* Date */}
          <p className="text-lg text-gray-700 italic">
            {data.date ? formatDate(data.date) : 'Date'}
          </p>
        </div>
      </div>

      <div className="p-6 space-y-4 text-sm leading-relaxed">
        {/* Leadership */}
        <div className="space-y-1">
          <DottedLine rightAlign={data.leadership.presiding}>
            <span>Presiding</span>
          </DottedLine>
          {data.leadership.conducting && (
            <DottedLine rightAlign={data.leadership.conducting}>
              <span>Conducting</span>
            </DottedLine>
          )}
          <DottedLine rightAlign={data.leadership.musicDirector}>
            <span>Music Director</span>
          </DottedLine>
          <DottedLine rightAlign={data.leadership.organist}>
            <span>Organist</span>
          </DottedLine>
          {data.musicProgram.prelude && (
            <DottedLine rightAlign={data.musicProgram.prelude}>
              <span>Prelude</span>
            </DottedLine>
          )}
        </div>

        {/* Theme */}
        {data.theme && (
          <div className="text-center py-2">
            <p className="italic text-gray-700">{data.theme}</p>
          </div>
        )}

        {/* Opening Hymn */}
        {(data.musicProgram.openingHymnNumber || data.musicProgram.openingHymnTitle) && (
          <div className="space-y-1">
            <DottedLine rightAlign={data.musicProgram.openingHymnNumber}>
              <span>Opening Hymn</span>
            </DottedLine>
            {(data.musicProgram.openingHymnNumber || data.musicProgram.openingHymnTitle) && (
              <div className="text-center py-1">
                <p className="italic">
                  <a
                    href={getHymnUrl(Number(data.musicProgram.openingHymnNumber))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 underline hover:text-blue-900"
                  >
                    {data.musicProgram.openingHymnTitle || getHymnTitle(Number(data.musicProgram.openingHymnNumber))}
                  </a>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Opening Prayer */}
        {data.prayers.opening && (
          <DottedLine rightAlign={data.prayers.opening}>
            <span>Opening Prayer</span>
          </DottedLine>
        )}

        {/* Sacrament Hymn */}
        {(data.musicProgram.sacramentHymnNumber || data.musicProgram.sacramentHymnTitle) && (
          <div className="space-y-1">
            <DottedLine rightAlign={data.musicProgram.sacramentHymnNumber}>
              <span>Sacrament Hymn</span>
            </DottedLine>
            {(data.musicProgram.sacramentHymnNumber || data.musicProgram.sacramentHymnTitle) && (
              <div className="text-center py-1">
                <p className="italic">
                  <a
                    href={getHymnUrl(Number(data.musicProgram.sacramentHymnNumber))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 underline hover:text-blue-900"
                  >
                    {data.musicProgram.sacramentHymnTitle || getHymnTitle(Number(data.musicProgram.sacramentHymnNumber))}
                  </a>
                </p>
              </div>
            )}
          </div>
        )}

        {/* The Sacrament */}
        <div className="text-center py-3">
          <h2 className="text-lg font-bold">The Sacrament</h2>
        </div>

        {/* Youth Speakers */}
        {youthSpeakers.map((speaker) => (
          <DottedLine key={speaker.id} rightAlign={speaker.name}>
            <span>Youth Speaker</span>
          </DottedLine>
        ))}

        {/* Musical Number */}
        {data.musicProgram.specialMusical && (
          <div className="space-y-1">
            <DottedLine rightAlign={data.musicProgram.specialMusical}>
              <span>Musical Number</span>
            </DottedLine>
            {data.musicProgram.musicalPerformers && (
              <div className="text-center py-1">
                <p className="text-xs">{data.musicProgram.musicalPerformers}</p>
              </div>
            )}
          </div>
        )}

        {/* Adult Speakers */}
        {adultSpeakers.map((speaker) => (
          <DottedLine key={speaker.id} rightAlign={speaker.name}>
            <span>Speaker</span>
          </DottedLine>
        ))}

        {/* Closing Hymn */}
        {(data.musicProgram.closingHymnNumber || data.musicProgram.closingHymnTitle) && (
          <div className="space-y-1">
            <DottedLine rightAlign={data.musicProgram.closingHymnNumber}>
              <span>Closing Hymn</span>
            </DottedLine>
            {(data.musicProgram.closingHymnNumber || data.musicProgram.closingHymnTitle) && (
              <div className="text-center py-1">
                <p className="italic">
                  <a
                    href={getHymnUrl(Number(data.musicProgram.closingHymnNumber))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 underline hover:text-blue-900"
                  >
                    {data.musicProgram.closingHymnTitle || getHymnTitle(Number(data.musicProgram.closingHymnNumber))}
                  </a>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Closing Prayer */}
        {data.prayers.closing && (
          <DottedLine rightAlign={data.prayers.closing}>
            <span>Closing Prayer</span>
          </DottedLine>
        )}

        {/* Announcements */}
        {data.announcements.length > 0 && (
          <div className="mt-8 pt-4 border-t border-gray-300">
            <h3 className="text-base font-bold mb-3 text-center">Announcements</h3>
            <div className="space-y-3">
              {data.announcements.map((announcement) => (
                <div key={announcement.id} className="text-xs">
                  <h4 className="font-semibold">{announcement.title}</h4>
                  <p className="text-gray-700">{announcement.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meetings */}
        {data.meetings.length > 0 && (
          <div className="mt-6">
            <h3 className="text-base font-bold mb-3 text-center">Meetings This Week</h3>
            <div className="space-y-2">
              {data.meetings.map((meeting) => (
                <div key={meeting.id} className="text-xs flex justify-between">
                  <span>{meeting.title} - {meeting.location}</span>
                  <span>{meeting.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Special Events */}
        {data.specialEvents.length > 0 && (
          <div className="mt-6">
            <h3 className="text-base font-bold mb-3 text-center">Special Events</h3>
            <div className="space-y-3">
              {data.specialEvents.map((event) => (
                <div key={event.id} className="text-xs">
                  <div className="flex justify-between font-semibold">
                    <span>{event.title}</span>
                    <span>{new Date(event.date).toLocaleDateString()} - {event.time}</span>
                  </div>
                  <p className="text-gray-700">{event.description}</p>
                  <p className="text-gray-600">Location: {event.location}</p>
                  {event.contact && <p className="text-gray-600">Contact: {event.contact}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-100 text-center border-t border-gray-300 p-3">
        <p className="text-xs text-gray-500">
          {data.wardName}
        </p>
      </div>
    </div>
  );
}