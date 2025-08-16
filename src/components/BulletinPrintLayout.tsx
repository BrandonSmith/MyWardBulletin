import React, { forwardRef, useEffect, useRef } from 'react';
import { sanitizeHtml } from "../lib/sanitizeHtml";
import { decodeHtml } from '../lib/decodeHtml';
import { LDS_IMAGES, getImageById } from '../data/images';
import { useSession } from '../lib/SessionContext';
import QRCode from 'qrcode';
import { SHORT_DOMAIN } from '../lib/config';

// Function to format date from ISO format to natural format
function formatDate(dateString: string): string {
  if (!dateString) return '';
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    if (year && month && day) {
      const date = new Date(year, month - 1, day);
      // Use user's browser locale and timezone
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    // Fallback
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return dateString;
  } catch {
    return dateString;
  }
}

function BulletinPrintLayout({ data, refs }: { data: any, refs?: { page1?: React.RefObject<HTMLDivElement>, page2?: React.RefObject<HTMLDivElement> } }) {
  const { user, profile } = useSession();

  // Add audienceLabels mapping at the top
  const audienceLabels = {
    ward: 'Ward',
    relief_society: 'Relief Society',
    elders_quorum: 'Elders Quorum',
    young_women: 'Young Women',
    young_men: 'Young Men',
    youth: 'Youth',
    primary: 'Primary',
    stake: 'Stake',
    other: 'Other',
  };

  // Helper function to check if ward info entry has meaningful data
  // For leadership, we only care about name/phone, not title (since titles are pre-populated)
  const hasValidLeadershipInfo = (entry: any) => {
    return entry && (entry.name?.trim() || entry.phone?.trim());
  };
  
  // For missionaries, we care about name, phone, mission, or email
  const hasValidMissionaryInfo = (entry: any) => {
    return entry && (entry.name?.trim() || entry.phone?.trim() || entry.mission?.trim() || entry.email?.trim());
  };

  // Filter out empty ward info entries
  const filteredWardLeadership = data.wardLeadership?.filter(hasValidLeadershipInfo) || [];
  const filteredMissionaries = data.missionaries?.filter(hasValidMissionaryInfo) || [];
  const filteredWardMissionaries = data.wardMissionaries?.filter(hasValidMissionaryInfo) || [];

  // Check if there's any meaningful ward info to display
  const hasWardInfo = filteredWardLeadership.length > 0 || filteredMissionaries.length > 0 || filteredWardMissionaries.length > 0;

  return (
    <div className="print-layout font-sans">
      {/* Page 1: Outside (landscape) */}
      <div
        ref={refs?.page1}
        className="print-page landscape w-[11in] h-[8.5in] flex"
        style={{ pageBreakAfter: 'always' }}
      >
                 {/* Back Cover (left) - Ward Information */}
         <div className="w-1/2 pr-16 py-8 flex flex-col justify-start items-start text-left border-r border-gray-300 print:!text-xl print:!text-black overflow-y-auto">
           {/* Ward Leadership Table */}
            {filteredWardLeadership.length > 0 && (
              <div className="w-full mb-6">
                <h2 className="text-2xl font-bold mb-4 print:!text-3xl print:!text-black w-full text-center">WARD LEADERSHIP</h2>
                <table className="w-full text-xs print:!text-sm print:!text-black">
                  <tbody>
                    {filteredWardLeadership.map((leader: any, idx: number) => (
                      <tr key={idx}>
                        <td className="py-1 font-semibold w-1/3">{leader.title}</td>
                        <td className="py-1 px-6 w-1/3">{leader.name}</td>
                        <td className="py-1 w-1/3 text-right">
                          {leader.phone && <span className="mr-1">📞</span>}
                          {leader.phone || ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Missionaries Table */}
            {filteredMissionaries.length > 0 && (
              <div className="w-full mb-6">
                <h3 className="text-lg font-semibold mb-3 print:!text-xl print:!text-black">MISSIONARIES</h3>
                <table className="w-full text-xs print:!text-sm print:!text-black">
                  <tbody>
                    {filteredMissionaries.map((missionary: any, idx: number) => (
                      <tr key={idx}>
                                                 <td className="py-1 font-semibold w-1/2">{missionary.name}</td>
                         <td className="py-1 w-1/2 text-right">
                          {missionary.phone && <span className="mr-1">📞</span>}
                          {missionary.phone || ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Missionaries from our ward */}
            {filteredWardMissionaries.length > 0 && (
              <div className="w-full mb-6">
                <h3 className="text-lg font-semibold mb-3 print:!text-xl print:!text-black">MISSIONARIES FROM OUR WARD</h3>
                <table className="w-full text-xs print:!text-xs print:!text-black">
                  <tbody>
                    {filteredWardMissionaries.map((missionary: any, idx: number) => (
                      <tr key={idx} className={filteredWardMissionaries.length > 4 ? "py-1" : "border-b border-gray-200 py-1 print:!border-b-0"}>
                        <td className="py-1 font-semibold w-1/3">{missionary.name}</td>
                        <td className="py-1 w-1/3 text-xs">
                          {missionary.mission && <span>📍 {missionary.mission}</span>}
                        </td>
                        <td className="py-1 w-1/3 text-xs">
                          {missionary.email && <span>✉️ {missionary.email}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

           {/* QR Code - always show if profile slug is available */}
           {profile?.profile_slug && (
             <div className="w-full flex flex-col items-center justify-center text-center mt-6">
               <div className="mb-4">
                 <PrintQRCode profileSlug={profile.profile_slug} />
               </div>
               <p className="text-sm print:!text-base print:!text-black font-medium">
                 Scan to view the latest digital bulletin
               </p>
               <p className="text-xs print:!text-sm print:!text-black text-gray-600 mt-2">
                 Visit: mywardbulletin.com/{profile.profile_slug}
               </p>
             </div>
           )}
           

         </div>

        {/* Front Cover (right) */}
        <div className="w-1/2 pl-12 pr-2 py-8 flex flex-col justify-center items-center text-center print:!text-xl print:!text-black">
          <h1 className="text-3xl font-bold mb-2 print:!text-4xl print:!text-black">{data.wardName || 'Ward Name'}</h1>
          <p className="text-lg mb-1 print:!text-2xl print:!text-black">{formatDate(data.date)}</p>
          <p className="text-base mb-1 print:!text-xl print:!text-black">The Church of Jesus Christ of Latter-day Saints</p>
          <p className="text-base mb-4 print:!text-xl print:!text-black">{data.meetingType === 'sacrament' ? 'Sacrament Meeting' : data.meetingType}</p>

          {/* Image Display - moved below text, above theme */}
          {data.imageId && data.imageId !== 'none' && (
            <div className="mb-4">
              {(() => {
                const selectedImage = getImageById(data.imageId);
                return selectedImage.url ? (
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.name}
                    className="max-w-full max-h-80 object-contain print:!max-h-96"
                  />
                ) : null;
              })()}
            </div>
          )}

          {data.theme && <p className="font-semibold italic text-sm text-gray-600 print:!text-lg print:!text-black">"{data.theme}"</p>}
        </div>
      </div>

      {/* Page 2: Inside (landscape) */}
      <div ref={refs?.page2} className="print-page landscape w-[11in] h-[8.5in] flex print:!text-xl print:!text-black">
        {/* Announcements (left) */}
        <div className="w-1/2 pl-8 pr-18 py-8 border-r border-gray-300 print:!text-xl print:!text-black">
          <h2 className="text-xl font-bold mb-4 print:!text-3xl print:!text-black">Announcements & Events</h2>
          <ul className="space-y-4">
            {data.announcements?.map((a: any, idx: number) => {
              const decodedContent = sanitizeHtml(decodeHtml(a.content));

              return (
                <li key={idx}>
                  {/* Audience and Category labels */}
                  <div className="font-bold print:!text-lg print:!text-black mb-1">
                    {audienceLabels[(a.audience as keyof typeof audienceLabels) || 'ward']}
                    {a.category && a.category !== 'general' && (
                      <span className="text-gray-600 text-xs bg-gray-100 px-2 py-1 rounded ml-2">{a.category}</span>
                    )}
                  </div>
                                      <div className="font-semibold print:!text-base print:!text-black">{a.title}</div>
                    
                    <div className="text-sm print:!text-sm print:!text-black mb-2" dangerouslySetInnerHTML={{ __html: decodedContent }} />
                    
                    {/* Announcement Image */}
                    {a.imageId && a.imageId !== 'none' && !a.hideImageOnPrint && (
                      <div className="mb-2">
                        {(() => {
                          const selectedImage = getImageById(a.imageId);
                          return selectedImage?.url ? (
                            <img
                              src={selectedImage.url}
                              alt={selectedImage.name}
                              className="max-w-full h-auto rounded shadow-sm"
                              style={{ maxHeight: '120px' }}
                            />
                          ) : null;
                        })()}
                      </div>
                    )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Program (right) */}
        <div className="w-1/2 pl-20 pr-8 py-8 text-center print:!text-xl print:!text-black">
          <h2 className="text-3xl font-bold mb-1 print:!text-4xl print:!text-black">{data.wardName || 'Ward Name'}</h2>
          <h3 className="text-2xl font-bold mb-1 print:!text-3xl print:!text-black">
            {data.meetingType === 'sacrament' ? 'Sacrament Meeting' : 'Program'}
          </h3>
          <p className="italic text-lg mb-6 print:!text-2xl print:!text-black">{formatDate(data.date)}</p>

          <table className="w-full text-[1.05rem] print:!text-lg print:!text-black" style={{ borderCollapse: 'separate', borderSpacing: '0 0.4em' }}>
            <tbody>
              <ProgramTableRow label="Presiding" value={data.leadership?.presiding} />
              <ProgramTableRow label="Conducting" value={data.leadership?.conducting} />
              <ProgramTableRow label="Chorister" value={data.leadership?.chorister} />
              <ProgramTableRow label={data.leadership?.organistLabel || 'Organist'} value={data.leadership?.organist} />
              <ProgramTableRow label="Prelude Music" value={data.leadership?.preludeMusic} />
              <ProgramTableRow
                label="Opening Hymn"
                value={data.musicProgram?.openingHymnNumber}
                extra={data.musicProgram?.openingHymnTitle}
              />
              <ProgramTableRow label="Invocation" value={data.prayers?.opening} />
              {data.agenda?.map((item: any, idx: number) => (
                item.type === 'speaker' ? (
                  <ProgramTableRow key={idx} label={item.speakerType === 'youth' ? 'Youth Speaker' : 'Speaker'} value={item.name} />
                ) : item.type === 'musical' ? (
                  <ProgramTableRow key={idx} label={item.label || 'Musical Number'} value={item.hymnNumber || item.songName} extra={item.hymnTitle} />
                ) : item.type === 'sacrament' ? (
                  <React.Fragment key={idx}>
                    <ProgramTableRow
                      label="Sacrament Hymn"
                      value={data.musicProgram?.sacramentHymnNumber}
                      extra={data.musicProgram?.sacramentHymnTitle}
                    />
                    <tr>
                      <td colSpan={3} className="text-center font-bold text-lg py-2 print:!text-2xl print:!text-black">Administration of the Sacrament</td>
                    </tr>
                  </React.Fragment>
                ) : null
              ))}
              <ProgramTableRow
                label="Closing Hymn"
                value={data.musicProgram?.closingHymnNumber}
                extra={data.musicProgram?.closingHymnTitle}
              />
              <ProgramTableRow label="Benediction" value={data.prayers?.closing} />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// PrintQRCode component for generating QR codes specifically for printing
function PrintQRCode({ profileSlug }: { profileSlug: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const generateQRCode = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const qrUrl = `https://${SHORT_DOMAIN}/${profileSlug}`;
      
      try {
        await QRCode.toCanvas(canvas, qrUrl, {
          width: 128, // Reduced from 192
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'H' // Highest error correction for print
        });
      } catch (error) {
        console.error('QR Code generation error:', error);
        // Fallback to text display
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, 128, 128);
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, 128, 128);
          ctx.strokeStyle = 'black';
          ctx.strokeRect(0, 0, 128, 128);
          ctx.fillStyle = 'black';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('QR Code', 64, 60);
          ctx.fillText('Error', 64, 75);
        }
      }
    };

    generateQRCode();
  }, [profileSlug]);

  return (
    <canvas
      ref={canvasRef}
      width={128}
      height={128}
      className="w-32 h-32 bg-white mx-auto"
    />
  );
}

export default BulletinPrintLayout;

function ProgramTableRow({ label, value, extra }: { label: string, value?: string, extra?: string }) {
  return (
    <>
      <tr>
        <td colSpan={3} className="py-[2px] print:!text-lg print:!text-black">
          <div className="flex justify-between w-full">
            <span className="text-left mr-2 whitespace-nowrap print:!text-lg print:!text-black">{label}</span>
            <span className="text-right ml-2 whitespace-nowrap text-[0.95rem] print:!text-lg print:!text-black">{value}</span>
          </div>
        </td>
      </tr>
      {extra && (
        <tr>
          <td colSpan={3} className="pt-0 text-center italic text-black text-base print:!text-lg print:!text-black">{extra}</td>
        </tr>
      )}
    </>
  );
}
