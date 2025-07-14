import React, { useState, useRef } from 'react';
import { Plus, Download, QrCode, User, LogIn, Menu, X } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { supabase, isSupabaseConfigured, userService, bulletinService } from './lib/supabase';
import BulletinForm from './components/BulletinForm';
import BulletinPreview from './components/BulletinPreview';
import QRCodeGenerator from './components/QRCodeGenerator';
import AuthModal from './components/AuthModal';
import UserMenu from './components/UserMenu';
import SavedBulletinsModal from './components/SavedBulletinsModal';
import ProfileModal from './components/ProfileModal';
import PublicBulletinView from './components/PublicBulletinView';
import { BulletinData } from './types/bulletin';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useQuery } from '@tanstack/react-query';

function App() {
  const [currentView, setCurrentView] = useState<'editor' | 'public'>('editor');
  const [publicBulletinData, setPublicBulletinData] = useState<any>(null);
  const [publicLoading, setPublicLoading] = useState(false);
  const [publicError, setPublicError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [activeBulletinId, setActiveBulletinId] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSavedBulletins, setShowSavedBulletins] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [currentBulletinId, setCurrentBulletinId] = useState<string | null>(null);
  const [savedBulletins, setSavedBulletins] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [bulletinData, setBulletinData] = useState<BulletinData>({
    wardName: '',
    date: new Date().toISOString().split('T')[0],
    meetingType: 'sacrament',
    theme: '',
    bishopricMessage: '',
    announcements: [],
    meetings: [],
    specialEvents: [],
    speakers: [],
    prayers: {
      opening: '',
      closing: '',
      invocation: '',
      benediction: ''
    },
    musicProgram: {
      prelude: '',
      openingHymn: '',
      openingHymnNumber: '',
      openingHymnTitle: '',
      sacramentHymn: '',
      sacramentHymnNumber: '',
      sacramentHymnTitle: '',
      closingHymn: '',
      closingHymnNumber: '',
      closingHymnTitle: '',
      specialMusical: '',
      musicalPerformers: ''
    },
    leadership: {
      presiding: '',
      musicDirector: '',
      organist: ''
    }
  });

  const [showQRCode, setShowQRCode] = useState(false);
  const bulletinRef = useRef<HTMLDivElement>(null);

  const handleBulletinDataChange = (newData: BulletinData) => {
    setBulletinData(newData);
    setHasUnsavedChanges(true);
  };

  // Check for profile slug in URL
  const path = window.location.pathname;
  const profileSlugMatch = path.match(/^\/u\/([^\/]+)$/);
  const profileSlug = profileSlugMatch ? profileSlugMatch[1] : null;

  // Use React Query for public bulletin loading
  const {
    data: publicBulletin,
    isLoading: publicBulletinLoading,
    error: publicErrorObj
  } = useQuery({
    queryKey: ['public-bulletin', profileSlug],
    queryFn: () => profileSlug ? bulletinService.getLatestBulletinByProfileSlug(profileSlug) : Promise.resolve(null),
    enabled: !!profileSlug
  });
  React.useEffect(() => {
    if (publicBulletin) {
      // Convert database format to app format
      const bulletinData: BulletinData = {
        wardName: publicBulletin.ward_name,
        date: publicBulletin.date,
        meetingType: publicBulletin.meeting_type,
        theme: publicBulletin.theme || '',
        bishopricMessage: publicBulletin.bishopric_message || '',
        announcements: publicBulletin.announcements || [],
        meetings: publicBulletin.meetings || [],
        specialEvents: publicBulletin.special_events || [],
        speakers: publicBulletin.speakers || [],
        prayers: publicBulletin.prayers || {
          opening: '',
          closing: '',
          invocation: '',
          benediction: ''
        },
        musicProgram: publicBulletin.music_program || {
          prelude: '',
          openingHymn: '',
          openingHymnNumber: '',
          openingHymnTitle: '',
          sacramentHymn: '',
          sacramentHymnNumber: '',
          sacramentHymnTitle: '',
          closingHymn: '',
          closingHymnNumber: '',
          closingHymnTitle: '',
          specialMusical: '',
          musicalPerformers: ''
        },
        leadership: publicBulletin.leadership || {
          presiding: '',
          musicDirector: '',
          organist: ''
        }
      };
      setPublicBulletinData(bulletinData);
      setCurrentView('public');
      setPublicError('');
    } else if (publicErrorObj) {
      setPublicError(publicErrorObj.message || 'Bulletin not found');
      setCurrentView('public');
    }
  }, [publicBulletin, publicErrorObj]);

  // Check for existing session on mount
  React.useEffect(() => {
    if (isSupabaseConfigured() && supabase) {
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        setUser(session?.user ?? null);
        
        // If user is logged in, fetch their active bulletin ID
        if (session?.user) {
          try {
            const profile = await userService.getUserProfile(session.user.id);
            if (profile && profile.length > 0) {
              setActiveBulletinId(profile[0].active_bulletin_id || null);
            }
          } catch (error) {
            console.error('Error fetching user profile:', error);
          }
        } else {
          setActiveBulletinId(null);
        }
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setUser(session?.user ?? null);
        
        // If user is logged in, fetch their active bulletin ID
        if (session?.user) {
          try {
            const profile = await userService.getUserProfile(session.user.id);
            if (profile && profile.length > 0) {
              setActiveBulletinId(profile[0].active_bulletin_id || null);
            }
          } catch (error) {
            console.error('Error fetching user profile:', error);
          }
        } else {
          setActiveBulletinId(null);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const handleBackToEditor = () => {
    setCurrentView('editor');
    setPublicBulletinData(null);
    setPublicError('');
    // Update URL to home
    window.history.pushState({}, '', '/');
  };

  const handleSaveBulletin = async () => {
    if (!isSupabaseConfigured()) {
      alert('Please connect to Supabase first to save bulletins.');
      return;
    }
    
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    console.log('Starting bulletin save process...');
    console.log('Current bulletin data:', bulletinData);
    console.log('Current bulletin ID:', currentBulletinId);
    console.log('User ID:', user.id);

    setLoading(true);
    try {
      const savedBulletin = await bulletinService.saveBulletin(
        bulletinData, 
        user.id, 
        currentBulletinId || undefined
      );
      
      console.log('Bulletin saved successfully:', savedBulletin);
      setCurrentBulletinId(savedBulletin.id);
      setHasUnsavedChanges(false);
      
      // Show success message
      alert(currentBulletinId ? 'Bulletin updated successfully!' : 'Bulletin saved successfully!');
      
    } catch (error) {
      console.error('Error saving bulletin:', error);
      const errorMessage = (error as Error).message;
      console.error('Full error details:', error);
      alert('Error saving bulletin: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSavedBulletins = () => {
    setShowSavedBulletins(true);
  };

  const handleLoadSavedBulletin = (bulletin: any) => {
    // Check for unsaved changes
    if (hasUnsavedChanges) {
      if (!confirm('You have unsaved changes. Loading this bulletin will discard them. Continue?')) {
        return;
      }
    }

    // Convert database format back to app format
    const loadedData: BulletinData = {
      wardName: bulletin.ward_name,
      date: bulletin.date,
      meetingType: bulletin.meeting_type,
      theme: bulletin.theme || '',
      bishopricMessage: bulletin.bishopric_message || '',
      announcements: bulletin.announcements || [],
      meetings: bulletin.meetings || [],
      specialEvents: bulletin.special_events || [],
      speakers: bulletin.speakers || [],
      prayers: bulletin.prayers || {
        opening: '',
        closing: '',
        invocation: '',
        benediction: ''
      },
      musicProgram: bulletin.music_program || {
        prelude: '',
        openingHymn: '',
        openingHymnNumber: '',
        openingHymnTitle: '',
        sacramentHymn: '',
        sacramentHymnNumber: '',
        sacramentHymnTitle: '',
        closingHymn: '',
        closingHymnNumber: '',
        closingHymnTitle: '',
        specialMusical: '',
        musicalPerformers: ''
      },
      leadership: bulletin.leadership || {
        presiding: '',
        musicDirector: '',
        organist: ''
      }
    };

    setBulletinData(loadedData);
    setCurrentBulletinId(bulletin.id);
    setHasUnsavedChanges(false);
    setShowSavedBulletins(false);
  };

  const handleDeleteSavedBulletin = (bulletinId: string) => {
    // If we're currently editing the deleted bulletin, clear the current ID
    if (currentBulletinId === bulletinId) {
      setCurrentBulletinId(null);
      setHasUnsavedChanges(true); // Mark as unsaved since the saved version is gone
    }
  };

  const handleNewBulletin = () => {
    if (hasUnsavedChanges) {
      if (!confirm('You have unsaved changes. Creating a new bulletin will discard them. Continue?')) {
        return;
      }
    }

    // Reset to default bulletin data
    setBulletinData({
      wardName: '',
      date: new Date().toISOString().split('T')[0],
      meetingType: 'sacrament',
      theme: '',
      bishopricMessage: '',
      announcements: [],
      meetings: [],
      specialEvents: [],
      speakers: [],
      prayers: {
        opening: '',
        closing: '',
        invocation: '',
        benediction: ''
      },
      musicProgram: {
        prelude: '',
        openingHymn: '',
        openingHymnNumber: '',
        openingHymnTitle: '',
        sacramentHymn: '',
        sacramentHymnNumber: '',
        sacramentHymnTitle: '',
        closingHymn: '',
        closingHymnNumber: '',
        closingHymnTitle: '',
        specialMusical: '',
        musicalPerformers: ''
      },
      leadership: {
        presiding: '',
        musicDirector: '',
        organist: ''
      }
    });
    setCurrentBulletinId(null);
    setHasUnsavedChanges(false);
  };

  const handleActiveBulletinSelect = async (bulletinId: string | null) => {
    if (!user) return;
    
    try {
      await userService.updateActiveBulletinId(user.id, bulletinId);
      setActiveBulletinId(bulletinId);
    } catch (error) {
      console.error('Error updating active bulletin:', error);
      alert('Error updating active bulletin: ' + (error as Error).message);
    }
  };

  const handleExportPDF = async () => {
    if (bulletinRef.current) {
      try {
        // Create a clone of the bulletin for PDF generation
        const element = bulletinRef.current;
        
        // Generate canvas from the bulletin element
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: element.scrollWidth,
          height: element.scrollHeight
        });
        
        // Create PDF
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        // Calculate dimensions to fit the page
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 10; // Small margin from top
        
        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        
        // Generate filename
        const filename = `${bulletinData.wardName || 'Ward'}-Bulletin-${bulletinData.date || 'today'}.pdf`;
        
        // Save the PDF
        pdf.save(filename);
        
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('There was an error generating the PDF. Please try again.');
      }
    }
  };

  // If we're in public view mode, show the public bulletin
  if (currentView === 'public') {
    return (
      <PublicBulletinView
        bulletinData={publicBulletinData}
        loading={publicBulletinLoading}
        error={publicError}
        onBackToEditor={handleBackToEditor}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <ToastContainer position="top-center" autoClose={2000} hideProgressBar={true} />
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">ZionBoard</h1>
                <p className="text-sm text-gray-600">Ward Bulletin Creator</p>
              </div>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-3">
              <button
                onClick={handleNewBulletin}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Bulletin
              </button>
              
              <button
                onClick={handleExportPDF}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </button>
              
              {user && (
                <button
                  onClick={handleSaveBulletin}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  {loading ? 'Saving...' : (currentBulletinId ? 'Update Bulletin' : 'Save Bulletin')}
                </button>
              )}
              
              <button
                onClick={() => setShowQRCode(!showQRCode)}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                title="Manage your permanent QR code"
              >
                <QrCode className="w-4 h-4 mr-2" />
                My QR Code
              </button>
              
              {user ? (
                <UserMenu 
                  user={user}
                  onSignOut={() => setUser(null)}
                  onSaveBulletin={handleSaveBulletin}
                  onViewSavedBulletins={handleViewSavedBulletins}
                  hasUnsavedChanges={hasUnsavedChanges}
                  onOpenProfile={() => setShowProfile(true)}
                />
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  disabled={!isSupabaseConfigured()}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  title={!isSupabaseConfigured() ? 'Connect to Supabase first' : 'Sign In'}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  {isSupabaseConfigured() ? 'Sign In' : 'Sign In (Setup Required)'}
                </button>
              )}
            </div>
            
            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                {showMobileMenu ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="lg:hidden mt-4 pt-4 border-t border-gray-200">
              <div className="space-y-3">
                <button
                  onClick={() => {
                    handleNewBulletin();
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Bulletin
                </button>
                
                <button
                  onClick={() => {
                    handleExportPDF();
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </button>
                
                {user && (
                  <button
                    onClick={() => {
                      handleSaveBulletin();
                      setShowMobileMenu(false);
                    }}
                    disabled={loading}
                    className="w-full flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    {loading ? 'Saving...' : (currentBulletinId ? 'Update Bulletin' : 'Save Bulletin')}
                  </button>
                )}
                
                <button
                  onClick={() => {
                    setShowQRCode(!showQRCode);
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  My QR Code
                </button>
                
                {user ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        handleViewSavedBulletins();
                        setShowMobileMenu(false);
                      }}
                      className="w-full flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      My Bulletins
                    </button>
                    <button
                      onClick={() => {
                        setUser(null);
                        setShowMobileMenu(false);
                      }}
                      className="w-full flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setShowAuthModal(true);
                      setShowMobileMenu(false);
                    }}
                    disabled={!isSupabaseConfigured()}
                    className="w-full flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    {isSupabaseConfigured() ? 'Sign In' : 'Sign In (Setup Required)'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Create Your Bulletin</h2>
              <BulletinForm data={bulletinData} onChange={handleBulletinDataChange} />
            </div>
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                Bulletin Preview
                </h2>
                {currentBulletinId && (
                  <div className="text-sm text-gray-500">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Saved Bulletin
                    </span>
                    {hasUnsavedChanges && (
                      <span className="ml-2 bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                        Unsaved Changes
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div ref={bulletinRef}>
                <BulletinPreview data={bulletinData} />
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Modal */}
        {showQRCode && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowQRCode(false);
              }
            }}
          >
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">My Permanent QR Code</h3>
                <button
                  onClick={() => setShowQRCode(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              {user && isSupabaseConfigured() ? (
                <QRCodeGenerator 
                  user={user}
                  currentActiveBulletinId={activeBulletinId}
                  onActiveBulletinSelect={handleActiveBulletinSelect}
                  onProfileSlugUpdate={() => {
                    // Optionally refresh or show success message
                  }}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">Sign in to create your permanent QR code</p>
                  <button onClick={() => setShowAuthModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Sign In</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Auth Modal */}
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={() => {
            setShowAuthModal(false);
            // Optionally auto-save the current bulletin after successful auth
          }}
        />

        {/* Saved Bulletins Modal */}
        <SavedBulletinsModal
          isOpen={showSavedBulletins}
          onClose={() => setShowSavedBulletins(false)}
          user={user}
          onLoadBulletin={handleLoadSavedBulletin}
          onDeleteBulletin={handleDeleteSavedBulletin}
        />

        {/* Profile Modal */}
        <ProfileModal
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
          user={user}
          onProfileUpdate={() => {
            // Optionally refresh user data or show success message
          }}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">
              ZionBoard.com - Free Ward Bulletin Creator
            </p>
            <p className="text-sm text-gray-500 mt-2">
              All data is processed locally in your browser for privacy and security
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;