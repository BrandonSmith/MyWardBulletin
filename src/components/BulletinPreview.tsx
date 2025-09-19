import React, { useState, useRef, useEffect, useMemo } from 'react';
import { BulletinData } from "../types/bulletin";
import { sanitizeHtml } from '../lib/sanitizeHtml';
import { decodeHtml } from '../lib/decodeHtml';
import { getSongUrl, getSongTitle } from '../lib/songService';
import { getImageById } from '../data/images';


import {
  getUnitLabel,
  getUnitLowercase,
  getHigherUnitLabel,
  getUnitLeadershipLabel,
  getUnitMissionariesLabel,
  getAudienceDisplayName
} from '../lib/terminology';

interface BulletinPreviewProps {
  data: BulletinData;
  hideTabs?: boolean;
  hideImageControls?: boolean;
  onImagePositionChange?: (position: { x: number; y: number }) => void;
}

/* ---------------------------------- Consts --------------------------------- */

// Dynamic audience labels based on terminology
const getAudienceLabel = (audience: string): string => {
  return getAudienceDisplayName(audience);
};

const imagePositions = {
  top: { x: 50, y: 25 },
  center: { x: 50, y: 50 },
  bottom: { x: 50, y: 75 }
} as const;

/* ------------------------------- Pure helpers ------------------------------ */

const hasUnitInfo = (data?: BulletinData): boolean => {
  if (!data) return false;
  const hasUnitLeadership =
    Array.isArray(data.wardLeadership) &&
    data.wardLeadership.some(e => e && (e.title || e.name || e.phone));

  const hasMissionaries =
    Array.isArray(data.missionaries) &&
    data.missionaries.some(e => e && (e.name || e.phone));

  const hasUnitMissionaries =
    Array.isArray(data.wardMissionaries) &&
    data.wardMissionaries.some(e => e && (e.name || e.mission || e.missionAddress || e.email));

  return hasUnitLeadership || hasMissionaries || hasUnitMissionaries;
};

// Legacy alias for compatibility
const hasWardInfo = hasUnitInfo;

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Date';
  const [y, m, d] = dateString.split('-').map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1); // local tz
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

/* ----------------------------- Reusable pieces ----------------------------- */

const DottedLine = ({
  children,
  rightAlign
}: {
  children: React.ReactNode;
  rightAlign?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between py-1">
    <span className="flex-1 flex items-center">
      {children}
      <span className="flex-1 mx-2 border-b border-dotted border-gray-400"></span>
    </span>
    {rightAlign ? <span className="text-right font-medium">{rightAlign}</span> : null}
  </div>
);

function BulletinHeader({
  wardName,
  dateLabel,
  heading, // e.g., "Sacrament Meeting" or "Announcements"
  image,
  imagePosition,
  children
}: {
  wardName?: string;
  dateLabel: string;
  heading: string;
  image?: { url?: string; name?: string } | null;
  imagePosition: { x: number; y: number };
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-gray-100 border-b-2 border-gray-300 text-center relative overflow-hidden min-h-56">
      {image?.url && (
        <img
          src={image.url}
          alt={image.name ?? ""}
          className="absolute inset-0 w-full h-full object-cover opacity-15 transition-all duration-300"
          style={{ objectPosition: `${imagePosition.x}% ${imagePosition.y}%` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-100/30" />
      <div className="relative z-10 p-12">
        {wardName && (
          <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-wide">
            {wardName}
          </h1>
        )}
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">{heading}</h2>
        <p className="text-lg text-gray-600 italic font-medium">{dateLabel}</p>
        {children}
      </div>
    </div>
  );
}

function ImagePositionControls({
  show,
  onToggle,
  positions,
  current,
  onChange
}: {
  show: boolean;
  onToggle: () => void;
  positions: Record<string, { x: number; y: number }>;
  current: { x: number; y: number };
  onChange: (p: { x: number; y: number }) => void;
}) {
  return (
    <div className="absolute top-2 right-2 z-20">
      <button
        onClick={onToggle}
        className="bg-white/90 hover:bg-white text-gray-700 px-2 py-1 rounded text-xs font-medium shadow-sm transition-all border"
      >
        {show ? '✕' : '⚙️'}
      </button>
      {show && (
        <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border p-3 min-w-32">
          <div className="space-y-1">
            {Object.entries(positions).map(([key, pos]) => (
              <button
                key={key}
                onClick={() => onChange(pos)}
                className={`px-3 py-2 text-xs rounded ${
                  current.x === pos.x && current.y === pos.y
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                title={key.charAt(0).toUpperCase() + key.slice(1)}
              >
                {key === 'center' ? '● Center' : key === 'top' ? '↑ Top' : '↓ Bottom'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AnnouncementItem({
  audience,
  category,
  title,
  html, // sanitized html string
  imageId,
  hideImageOnPrint = false,
  images
}: {
  audience: string;
  category?: string | null;
  title: string;
  html: string;
  imageId?: string;
  hideImageOnPrint?: boolean;
  images?: Array<{ imageId: string; hideImageOnPrint?: boolean }>;
}) {
  // H1 audience, H2 title, content styled as "H3-ish"
  return (
    <article className="border-l-4 border-[#edf4ff] pl-4">
      <h3 className="text-xl sm:text-2xl text-gray-900">{audience}</h3>

      {category && category !== 'general' && (
        <div className="mt-1">
          <span className="inline-block text-gray-700 text-xs bg-gray-100 px-2 py-1 rounded">
            {category}
          </span>
        </div>
      )}

      <h2 className="text-xl sm:text-xl text-gray-900 mt-3">{title}</h2>

      <div className="mt-2 text-gray-800 text-base leading-relaxed">
        <div
          className="mt-1"
          style={{
            '--tw-prose-bullets': 'disc',
            '--tw-prose-list-style': 'disc'
          } as React.CSSProperties}
          dangerouslySetInnerHTML={{ 
            __html: html.replace(
              /<ul>/g, 
              '<ul style="list-style-type: disc; list-style-position: inside; margin-left: 1rem;">'
            ).replace(
              /<ol>/g, 
              '<ol style="list-style-type: decimal; list-style-position: inside; margin-left: 1rem;">'
            ).replace(
              /<li>/g, 
              '<li style="margin-left: 0.5rem; display: list-item;">'
            )
          }}
        />
      </div>

      {/* Announcement Images */}
      {/* Legacy single image support */}
      {imageId && imageId !== 'none' && !images && (
        <div className={`mt-3 ${hideImageOnPrint ? 'print:hidden' : ''}`}>
          {(() => {
            const selectedImage = getImageById(imageId);
            return selectedImage?.url ? (
              <img
                src={selectedImage.url}
                alt={selectedImage.name}
                className="max-w-full h-auto rounded-lg shadow-sm w-full"
                style={{ maxHeight: '200px', objectFit: 'contain' }}
                loading="lazy"
              />
            ) : null;
          })()}
        </div>
      )}
      
      {/* Multiple images support */}
      {images && images.length > 0 && (
        <div className="mt-3 space-y-3">
          {images.map((img: any, index: number) => {
            const selectedImage = getImageById(img.imageId);
            return selectedImage?.url ? (
              <div key={index} className={`${img.hideImageOnPrint ? 'print:hidden' : ''}`}>
                <img
                  src={selectedImage.url}
                  alt={selectedImage.name}
                  className="max-w-full h-auto rounded-lg shadow-sm w-full"
                  style={{ maxHeight: '200px', objectFit: 'contain' }}
                  loading="lazy"
                />
              </div>
            ) : null;
          })}
        </div>
      )}
    </article>
  );
}

/* ------------------------------- Main export ------------------------------- */

export default function BulletinPreview({
  data,
  hideTabs = false,
  hideImageControls = false,
  onImagePositionChange,
  onThemeSelectClick,
}: BulletinPreviewProps) {
  const [activeTab, setActiveTab] = useState<'program' | 'announcements' | 'unitinfo'>('program');

  // Handle mobile viewport - switch away from wardinfo if on mobile and that tab is active and there's no ward info
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640 && activeTab === 'unitinfo' && !hasWardInfo(data)) { // 640px is sm breakpoint
        setActiveTab('program');
      }
    };

    handleResize(); // Check on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTab, data]);
  const initialPosRef = useRef<{ x: number; y: number }>(
    data.imagePosition &&
    typeof data.imagePosition.x === 'number' &&
    typeof data.imagePosition.y === 'number'
      ? data.imagePosition
      : imagePositions.center
  );
  const [imagePosition, setImagePosition] = useState<{ x: number; y: number }>(
    initialPosRef.current
  );
  const [showImageControls, setShowImageControls] = useState(false);

  // Only adopt parent updates when the prop is explicitly provided (no fallback to center here)
  useEffect(() => {
    const p = data.imagePosition;
    if (
      p &&
      typeof p.x === 'number' &&
      typeof p.y === 'number' &&
      (p.x !== imagePosition.x || p.y !== imagePosition.y)
    ) {
      setImagePosition(p);
    }
  }, [data.imagePosition?.x, data.imagePosition?.y, imagePosition.x, imagePosition.y]);

  const handleImagePositionChange = (pos: { x: number; y: number }) => {
    if (pos.x !== imagePosition.x || pos.y !== imagePosition.y) {
      setImagePosition(pos);
      onImagePositionChange?.(pos);
    }
  };

  /* ------------------------------- Memoized -------------------------------- */

  const selectedImage = useMemo(
    () => (data.imageId && data.imageId !== 'none' ? getImageById(data.imageId) : null),
    [data.imageId]
  );

  const formattedDate = useMemo(() => formatDate(data.date), [data.date]);

  const sanitizedAnnouncements = useMemo(() => {
    const arr = data?.announcements ?? [];
    return arr.map(a => ({
      ...a,
      audienceLabel: getAudienceLabel(a.audience || getUnitLowercase()),
      html: sanitizeHtml(decodeHtml(a.content ?? "")),
    }));
  }, [data?.announcements]);

  const [bulletinId, setBulletinId] = useState('');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBulletinId(window.location.pathname.split('/').pop() ?? '');
    }
  }, []);

  const qrUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.href)}`;
  }, []);

  /* --------------------------------- Render -------------------------------- */

  return (
    <div className="bulletin bg-white shadow-lg rounded-lg overflow-hidden max-w-2xl mx-auto font-sans">
      {/* Tabs */}
      {!hideTabs && (
        <nav className="flex justify-center print:hidden mb-4 mt-4" aria-label="Main tabs">
          <ul className="flex flex-col gap-3 sm:flex-row sm:gap-3 w-full max-w-xs sm:max-w-none mx-auto justify-center items-center">
            {(['program', 'announcements', 'unitinfo'] as const).map(tab => (
              <li key={tab} role="presentation" className={`w-full sm:w-auto ${tab === 'unitinfo' && !hasWardInfo(data) ? 'hidden sm:block' : ''}`}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  aria-controls={`tab-panel-${tab}`}
                  className={`w-full sm:w-auto px-6 sm:px-8 py-3 rounded-full font-semibold focus:outline-none border-2 transition-all duration-200 text-base
                    ${activeTab === tab
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900'}
                  `}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'program' ? 'Program' : tab === 'announcements' ? 'Announcements' : `${getUnitLabel()} Info`}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* ------------------------------- Program ------------------------------ */}
      {activeTab === 'program' && (
        <div className="p-6 space-y-4 text-sm leading-relaxed">
          <div className="relative">
            <BulletinHeader
              wardName={data?.wardName}
              dateLabel={formattedDate}
              heading="Sacrament Meeting"
              image={selectedImage}
              imagePosition={imagePosition}
            />
            {data?.imageId && data.imageId !== 'none' && !hideImageControls && (
              <ImagePositionControls
                show={showImageControls}
                onToggle={() => setShowImageControls(v => !v)}
                positions={imagePositions}
                current={imagePosition}
                onChange={handleImagePositionChange}
              />
            )}
          </div>

          {/* Leadership */}
          <div className="space-y-1">
            <DottedLine rightAlign={data?.leadership?.presiding}>
              <span>Presiding</span>
            </DottedLine>
            {data?.leadership?.conducting && (
              <DottedLine rightAlign={data.leadership.conducting}>
                <span>Conducting</span>
              </DottedLine>
            )}
            <DottedLine rightAlign={data?.leadership?.chorister}>
              <span>{data?.leadership?.choristerLabel || 'Chorister'}</span>
            </DottedLine>
            <DottedLine rightAlign={data?.leadership?.organist}>
              <span>{data?.leadership?.organistLabel || 'Organist'}</span>
            </DottedLine>
            {data?.leadership?.preludeMusic && (
              <DottedLine rightAlign={data.leadership.preludeMusic}>
                <span>Prelude Music</span>
              </DottedLine>
            )}
          </div>

          {/* Theme */}
          {data?.theme && (
            <div className="text-center py-2">
              <p className="italic text-gray-700">{data.theme}</p>
            </div>
          )}

          {/* Opening Hymn */}
          {(data?.musicProgram?.openingHymnNumber || data?.musicProgram?.openingHymnTitle) && (
            <div className="space-y-1">
              <DottedLine rightAlign={data?.musicProgram?.openingHymnNumber}>
                <span>Opening Hymn</span>
              </DottedLine>
              <div className="text-center py-1">
                <p className="italic">
                  <a
                    href={getSongUrl(
                      data?.musicProgram?.openingHymnNumber,
                      data?.musicProgram?.openingHymnType || 'hymn'
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 underline hover:text-blue-900"
                  >
                    {data?.musicProgram?.openingHymnTitle ||
                      getSongTitle(
                        data?.musicProgram?.openingHymnNumber,
                        data?.musicProgram?.openingHymnType || 'hymn'
                      )}
                  </a>
                </p>
              </div>
            </div>
          )}

          {/* Opening Prayer */}
          {data?.prayers?.opening && (
            <DottedLine rightAlign={data.prayers.opening}>
              <span>Invocation</span>
            </DottedLine>
          )}

          {/* Unit Business */}
          <div className="text-center">
            <p className="font-medium text-gray-900">{getUnitLabel()} Business</p>
          </div>


          {/* Agenda */}
          {Array.isArray(data?.agenda) && data.agenda.length > 0 && (
            <div className="space-y-1">
              <div className="text-center py-2">
              </div>
              {data.agenda.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  {item.type === 'speaker' && (
                    <DottedLine rightAlign={item.name}>
                      <span>{item.speakerType === 'youth' ? 'Youth Speaker' : 'Speaker'}</span>
                    </DottedLine>
                  )}
                  {item.type === 'musical' && (
                    <>
                      <DottedLine rightAlign={item.hymnNumber || item.songName}>
                        <span>{item.label || 'Musical Number'}</span>
                      </DottedLine>
                      {(item.hymnNumber || item.hymnTitle) && (
                        <div className="text-center py-1">
                          <p className="italic">
                            {item.hymnNumber ? (
                              <a
                                href={getSongUrl(item.hymnNumber, item.hymnType || 'hymn')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-700 underline hover:text-blue-900"
                              >
                                {item.hymnTitle || getSongTitle(item.hymnNumber, item.hymnType || 'hymn')}
                              </a>
                            ) : item.songName}
                          </p>
                        </div>
                      )}
                      {item.performers && (
                        <div className="text-center py-1">
                          <p className="text-sm">{item.performers}</p>
                        </div>
                      )}
                    </>
                  )}
                  {item.type === 'testimony' && (
                    <DottedLine rightAlign={item.note}>
                      <span>Testimony Meeting</span>
                    </DottedLine>
                  )}
                  {item.type === 'sacrament' && data.meetingType === 'sacrament' && (
                    <>
                      {(data?.musicProgram?.sacramentHymnNumber || data?.musicProgram?.sacramentHymnTitle) && (
                        <div className="space-y-1">
                          <DottedLine rightAlign={data?.musicProgram?.sacramentHymnNumber}>
                            <span>Sacrament Hymn</span>
                          </DottedLine>
                          <div className="text-center py-1">
                            <p className="italic">
                              <a
                                href={getSongUrl(
                                  data?.musicProgram?.sacramentHymnNumber,
                                  data?.musicProgram?.sacramentHymnType || 'hymn'
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-700 underline hover:text-blue-900"
                              >
                                {data?.musicProgram?.sacramentHymnTitle ||
                                  getSongTitle(
                                    data?.musicProgram?.sacramentHymnNumber,
                                    data?.musicProgram?.sacramentHymnType || 'hymn'
                                  )}
                              </a>
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">Administration of the Sacrament</p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Closing Hymn */}
          {(data?.musicProgram?.closingHymnNumber || data?.musicProgram?.closingHymnTitle) && (
            <div className="space-y-1">
              <DottedLine rightAlign={data?.musicProgram?.closingHymnNumber}>
                <span>Closing Hymn</span>
              </DottedLine>
              <div className="text-center py-1">
                <p className="italic">
                  <a
                    href={getSongUrl(
                      data?.musicProgram?.closingHymnNumber,
                      data?.musicProgram?.closingHymnType || 'hymn'
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 underline hover:text-blue-900"
                  >
                    {data?.musicProgram?.closingHymnTitle ||
                      getSongTitle(
                        data?.musicProgram?.closingHymnNumber,
                        data?.musicProgram?.closingHymnType || 'hymn'
                      )}
                  </a>
                </p>
              </div>
            </div>
          )}

          {/* Closing Prayer */}
          {data?.prayers?.closing && (
            <DottedLine rightAlign={data.prayers.closing}>
              <span>Benediction</span>
            </DottedLine>
          )}

          {/* Bishopric Message */}
          {data?.bishopricMessage && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-bold text-blue-900 mb-2">Bishopric Message</h3>
              <p className="text-blue-800 italic">{data.bishopricMessage}</p>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------- Announcements --------------------------- */}
      {activeTab === 'announcements' && (
        <div className="p-6 space-y-4 text-sm leading-relaxed">
          <div className="relative">
            <BulletinHeader
              wardName={data?.wardName}
              dateLabel={formattedDate}
              heading="Announcements"
              image={selectedImage}
              imagePosition={imagePosition}
            />
            {data?.imageId && data.imageId !== 'none' && !hideImageControls && (
              <ImagePositionControls
                show={showImageControls}
                onToggle={() => setShowImageControls(v => !v)}
                positions={imagePositions}
                current={imagePosition}
                onChange={handleImagePositionChange}
              />
            )}
          </div>

          {sanitizedAnnouncements.length > 0 ? (
            <div className="space-y-8">
              {sanitizedAnnouncements.map((a, i) => (
                <AnnouncementItem
                  key={i}
                  audience={a.audienceLabel}
                  category={a.category}
                  title={a.title}
                  html={a.html}
                  imageId={a.imageId}
                  hideImageOnPrint={a.hideImageOnPrint}
                  images={a.images}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No announcements for this week.</p>
            </div>
          )}

          {/* Meetings */}
          {Array.isArray(data?.meetings) && data.meetings.length > 0 && (
            <div className="mt-6">
              <h3 className="font-bold text-gray-900 mb-3">Meetings & Activities</h3>
              <div className="space-y-3">
                {data.meetings.map((m, i) => (
                  <div key={i} className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold text-gray-900">{m.title}</h4>
                    <p className="text-gray-700">{m.time} • {m.location}</p>
                    {m.description && (
                      <p className="text-gray-600 text-sm mt-1">{m.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Special Events */}
          {Array.isArray(data?.specialEvents) && data.specialEvents.length > 0 && (
            <div className="mt-6">
              <h3 className="font-bold text-gray-900 mb-3">Special Events</h3>
              <div className="space-y-3">
                {data.specialEvents.map((e, i) => (
                  <div key={i} className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-semibold text-gray-900">{e.title}</h4>
                    <p className="text-gray-700">{e.date} • {e.time} • {e.location}</p>
                    {e.description && <p className="text-gray-600 text-sm mt-1">{e.description}</p>}
                    {e.contact && <p className="text-gray-600 text-sm mt-1">Contact: {e.contact}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submission Link */}
          {!hideTabs && bulletinId && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg text-center">
              <p className="text-green-800 mb-2">Have an announcement to share?</p>
              <a
                href={`/submit/${bulletinId}`}
                className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
              >
                📝 Submit Announcement
              </a>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------- Ward Info ---------------------------- */}
      {activeTab === 'unitinfo' && (
        <div className="p-6 space-y-4 text-sm leading-relaxed">
          {/* Ward Leadership Section */}
          {Array.isArray(data.wardLeadership) && data.wardLeadership.some(e => e && (e.title || e.name || e.phone)) && (
            <>
              <h3 className="text-base font-bold mb-3 text-center">{getUnitLeadershipLabel()}</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-3 py-2 border">Title</th>
                      <th className="px-3 py-2 border text-center">Name</th>
                      <th className="px-3 py-2 border">Contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.wardLeadership || []).map((e, idx) => (
                      <tr key={idx}>
                        <td className="border px-3 py-2">{e.title}</td>
                        <td className="border px-3 py-2 text-center">{e.name}</td>
                        <td className="border px-3 py-2">{e.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Missionaries Section */}
          {Array.isArray(data.missionaries) && data.missionaries.some(e => e && (e.name || e.phone)) && (
            <>
              <h3 className="text-base font-bold mb-3 text-center mt-8">Missionaries</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-3 py-2 border text-center">Name</th>
                      <th className="px-3 py-2 border">Contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.missionaries || []).map((e, idx) => (
                      <tr key={idx}>
                        <td className="border px-3 py-2 text-center">{e.name}</td>
                        <td className="border px-3 py-2">{e.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Ward Missionaries Section */}
          {Array.isArray(data.wardMissionaries) && data.wardMissionaries.some(e => e && (e.name || e.mission || e.missionAddress || e.email)) && (
            <>
              <h3 className="text-base font-bold mb-3 text-center mt-8">{getUnitMissionariesLabel()}</h3>
              {(data?.wardMissionaries || []).length > 2 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(data?.wardMissionaries || []).map((e, idx) => (
                    <div key={idx} className="border border-gray-300 rounded-lg p-3">
                      <div className="font-semibold text-sm mb-2">{e.name}</div>
                      {e.mission && <div className="text-xs text-gray-600 mb-1">📍 {e.mission}</div>}
                      {e.missionAddress && <div className="text-xs text-gray-600 mb-1">📮 {e.missionAddress}</div>}
                      {e.email && <div className="text-xs text-gray-600">✉️ {e.email}</div>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full border text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-3 py-2 border">Name</th>
                        <th className="px-3 py-2 border">Mission</th>
                        <th className="px-3 py-2 border">Mission Address</th>
                        <th className="px-3 py-2 border">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data?.wardMissionaries || []).map((e, idx) => (
                        <tr key={idx}>
                          <td className="border px-3 py-2">{e.name}</td>
                          <td className="border px-3 py-2">{e.mission}</td>
                          <td className="border px-3 py-2">{e.missionAddress}</td>
                          <td className="border px-3 py-2">{e.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* No Ward Info Message */}
          {!hasWardInfo(data) && (
            <div className="text-center py-8">
              <div className="mb-4">
                <svg className="w-16 h-16 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">QR Code</h3>
              <p className="text-gray-600 mb-4">Scan this QR code to access the digital bulletin</p>
              <div className="flex justify-center">
                {qrUrl ? (
                  <img
                    src={qrUrl}
                    alt="QR Code for this bulletin"
                    className="border-2 border-gray-200 rounded-lg"
                  />
                ) : null}
              </div>
              <p className="text-xs text-gray-500 mt-4">
                No ward information available. Add ward leadership and missionary details in the editor to display them here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------- Print All ---------------------------- */}
      <div className="hidden print:block p-6 space-y-4 text-sm leading-relaxed">
        <BulletinHeader
          wardName={data?.wardName}
          dateLabel={formattedDate}
          heading="Sacrament Meeting"
          image={selectedImage}
          imagePosition={imagePosition}
        />

        {/* Leadership */}
        <div className="space-y-1">
          <DottedLine rightAlign={data?.leadership?.presiding}><span>Presiding</span></DottedLine>
          {data?.leadership?.conducting && (
            <DottedLine rightAlign={data.leadership.conducting}><span>Conducting</span></DottedLine>
          )}
          <DottedLine rightAlign={data?.leadership?.chorister}><span>{data?.leadership?.choristerLabel || 'Chorister'}</span></DottedLine>
          <DottedLine rightAlign={data?.leadership?.organist}><span>{data?.leadership?.organistLabel || 'Organist'}</span></DottedLine>
          {data?.leadership?.preludeMusic && (
            <DottedLine rightAlign={data.leadership.preludeMusic}><span>Prelude Music</span></DottedLine>
          )}
        </div>

        {/* Theme */}
        {data?.theme && (
          <div className="text-center py-2">
            <p className="italic text-gray-700">{data.theme}</p>
          </div>
        )}

        {/* Opening Hymn */}
        {(data?.musicProgram?.openingHymnNumber || data?.musicProgram?.openingHymnTitle) && (
          <div className="space-y-1">
            <DottedLine rightAlign={data?.musicProgram?.openingHymnNumber}><span>Opening Hymn</span></DottedLine>
            <div className="text-center py-1">
              <p className="italic">
                <a
                  href={getSongUrl(
                    data?.musicProgram?.openingHymnNumber,
                    data?.musicProgram?.openingHymnType || 'hymn'
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 underline hover:text-blue-900"
                >
                  {data?.musicProgram?.openingHymnTitle ||
                    getSongTitle(
                      data?.musicProgram?.openingHymnNumber,
                      data?.musicProgram?.openingHymnType || 'hymn'
                    )}
                </a>
              </p>
            </div>
          </div>
        )}

        {/* Opening Prayer */}
        {data?.prayers?.opening && (
          <DottedLine rightAlign={data.prayers.opening}><span>Invocation</span></DottedLine>
        )}

        {/* Unit Business */}
        <div className="text-center">
          <p className="font-medium text-gray-900">{getUnitLabel()} Business</p>
        </div>


        {/* Agenda */}
        {Array.isArray(data?.agenda) && data.agenda.length > 0 && (
          <div className="space-y-1">
            {data.agenda.map((item, idx) => (
              <div key={idx} className="space-y-1">
                {item.type === 'speaker' && (
                  <DottedLine rightAlign={item.name}>
                    <span>{item.speakerType === 'youth' ? 'Youth Speaker' : 'Speaker'}</span>
                  </DottedLine>
                )}
                {item.type === 'musical' && (
                  <>
                    <DottedLine rightAlign={item.hymnNumber || item.songName}>
                      <span>{item.label || 'Musical Number'}</span>
                    </DottedLine>
                    {(item.hymnNumber || item.hymnTitle) && (
                      <div className="text-center py-1">
                        <p className="italic">
                          {item.hymnNumber ? (
                            <a
                              href={getSongUrl(item.hymnNumber, item.hymnType || 'hymn')}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-700 underline hover:text-blue-900"
                            >
                              {item.hymnTitle || getSongTitle(item.hymnNumber, item.hymnType || 'hymn')}
                            </a>
                          ) : item.songName}
                        </p>
                      </div>
                    )}
                    {item.performers && (
                      <div className="text-center py-1">
                        <p className="text-sm">{item.performers}</p>
                      </div>
                    )}
                  </>
                )}
                {item.type === 'testimony' && (
                  <DottedLine rightAlign={item.note}>
                    <span>Testimony Meeting</span>
                  </DottedLine>
                )}
                {item.type === 'sacrament' && (
                  <>
                    {(data?.musicProgram?.sacramentHymnNumber || data?.musicProgram?.sacramentHymnTitle) && (
                      <div className="space-y-1">
                        <DottedLine rightAlign={data?.musicProgram?.sacramentHymnNumber}><span>Sacrament Hymn</span></DottedLine>
                        <div className="text-center py-1">
                          <p className="italic">
                            <a
                              href={getSongUrl(
                                data?.musicProgram?.sacramentHymnNumber,
                                data?.musicProgram?.sacramentHymnType || 'hymn'
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-700 underline hover:text-blue-900"
                            >
                              {data?.musicProgram?.sacramentHymnTitle ||
                                getSongTitle(
                                  data?.musicProgram?.sacramentHymnNumber,
                                  data?.musicProgram?.sacramentHymnType || 'hymn'
                                )}
                            </a>
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="text-center">
                      <p className="font-medium text-gray-900">Administration of the Sacrament</p>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Closing Hymn */}
        {(data?.musicProgram?.closingHymnNumber || data?.musicProgram?.closingHymnTitle) && (
          <div className="space-y-1">
            <DottedLine rightAlign={data?.musicProgram?.closingHymnNumber}><span>Closing Hymn</span></DottedLine>
            <div className="text-center py-1">
              <p className="italic">
                <a
                  href={getSongUrl(
                    data?.musicProgram?.closingHymnNumber,
                    data?.musicProgram?.closingHymnType || 'hymn'
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 underline hover:text-blue-900"
                >
                  {data?.musicProgram?.closingHymnTitle ||
                    getSongTitle(
                      data?.musicProgram?.closingHymnNumber,
                      data?.musicProgram?.closingHymnType || 'hymn'
                    )}
                </a>
              </p>
            </div>
          </div>
        )}

        {/* Closing Prayer */}
        {data?.prayers?.closing && (
          <DottedLine rightAlign={data.prayers.closing}><span>Benediction</span></DottedLine>
        )}

        {/* Announcements (print) */}
        {sanitizedAnnouncements.length > 0 ? (
          <div className="space-y-4 mt-4">
            {sanitizedAnnouncements.map((a, i) => (
              <div key={i} className="text-sm">
                <div className="mb-1">
                  <span className="font-bold text-gray-900 text-sm mr-2">{a.audienceLabel}</span>
                  {a.category && a.category !== 'general' && (
                    <span className="text-gray-600 text-xs bg-gray-100 px-2 py-1 rounded">
                      {a.category}
                    </span>
                  )}
                </div>
                <div className="flex items-center mb-1">
                  <h4 className="font-semibold mr-2 text-gray-900">{a.title}</h4>
                </div>
                
                <div 
                  className="text-gray-900 mb-2" 
                  style={{
                    '--tw-prose-bullets': 'disc',
                    '--tw-prose-list-style': 'disc'
                  } as React.CSSProperties}
                  dangerouslySetInnerHTML={{ 
                    __html: a.html.replace(
                      /<ul>/g, 
                      '<ul style="list-style-type: disc; list-style-position: inside; margin-left: 1rem;">'
                    ).replace(
                      /<ol>/g, 
                      '<ol style="list-style-type: decimal; list-style-position: inside; margin-left: 1rem;">'
                    ).replace(
                      /<li>/g, 
                      '<li style="margin-left: 0.5rem; display: list-item;">'
                    )
                  }} 
                />
                
                {/* Announcement Image (print) */}
                {a.imageId && a.imageId !== 'none' && !a.hideImageOnPrint && (
                  <div className="mb-2">
                    {(() => {
                      const selectedImage = getImageById(a.imageId);
                      return selectedImage?.url ? (
                        <img
                          src={selectedImage.url}
                          alt={selectedImage.name}
                          className="max-w-full h-auto rounded shadow-sm"
                          style={{ maxHeight: '150px' }}
                        />
                      ) : null;
                    })()}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400">No announcements</div>
        )}

        {/* Meetings (print) */}
        {Array.isArray(data?.meetings) && data.meetings.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-300">
            <h3 className="text-base font-bold mb-3 text-center">Meetings This Week</h3>
            <div className="space-y-3">
              {data.meetings.map((m, i) => (
                <div key={i} className="text-sm bg-gray-50 p-3 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <div>
                    <h4 className="font-semibold">{m.title}</h4>
                    {m.description && <p className="text-gray-700">{m.description}</p>}
                  </div>
                  <div className="flex flex-col sm:items-end mt-2 sm:mt-0">
                    <span className="text-gray-600">{m.location}</span>
                    <span className="text-gray-600">{m.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Special Events (print) */}
        {Array.isArray(data?.specialEvents) && data.specialEvents.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-300">
            <h3 className="text-base font-bold mb-3 text-center">Special Events</h3>
            <div className="space-y-3">
              {data.specialEvents.map((e, i) => (
                <div key={i} className="text-sm bg-gray-50 p-3 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <div>
                    <h4 className="font-semibold">{e.title}</h4>
                    {e.description && <p className="text-gray-700">{e.description}</p>}
                  </div>
                  <div className="flex flex-col sm:items-end mt-2 sm:mt-0">
                    <span className="text-gray-600">
                      {e.date ? new Date(e.date).toLocaleDateString() : ''}{e.time ? ` - ${e.time}` : ''}
                    </span>
                    <span className="text-gray-600">{e.location}</span>
                    {e.contact && <span className="text-gray-600">Contact: {e.contact}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-100 text-center border-t border-gray-300 p-3">
        <p className="text-sm text-gray-500">{data?.wardName}</p>
      </div>
    </div>
  );
}
