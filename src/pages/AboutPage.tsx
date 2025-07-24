import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import AuthModal from '../components/AuthModal';

export default function AboutPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const goHome = () => { window.location.href = '/'; };
  const openAuthModal = () => setShowAuthModal(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Helmet>
        <title>About MyWardBulletin | Free LDS Ward Bulletin Creator</title>
        <meta name="description" content="Learn how MyWardBulletin simplifies the way Latter-day Saint wards create, print, and share sacrament meeting bulletins." />
        <meta property="og:title" content="About MyWardBulletin" />
        <meta property="og:description" content="Build and share LDS ward bulletins in minutes. Clean layout. Print-ready. Private by default." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mywardbulletin.com/about" />
        <meta property="og:image" content="https://mywardbulletin.com/og-image.png" />
        <meta property="og:site_name" content="MyWardBulletin" />
        <meta property="og:image:alt" content="Preview of LDS digital bulletin created using MyWardBulletin" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About MyWardBulletin" />
        <meta name="twitter:description" content="Create and share LDS ward bulletins in minutes. Free, private, and mobile-friendly." />
        <meta name="twitter:image" content="https://mywardbulletin.com/og-image.png" />
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "MyWardBulletin",
            "url": "https://mywardbulletin.com",
            "applicationCategory": "Religious Tool",
            "operatingSystem": "All",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "description": "Create, print, and share digital LDS ward bulletins in minutes. Built for simplicity, mobile access, and QR code sharing.",
            "publisher": {
              "@type": "Person",
              "name": "Matthew Fuller"
            }
          }
        `}</script>
      </Helmet>

      <Header
        user={null}
        loading={false}
        currentBulletinId={null}
        hasUnsavedChanges={false}
        showQRCode={false}
        setShowQRCode={() => {}}
        setShowAuthModal={openAuthModal}
        handleNewBulletin={goHome}
        handleExportPDF={goHome}
        handleSaveBulletin={goHome}
        handleViewSavedBulletins={goHome}
        setUser={goHome}
        setShowProfile={goHome}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        isSupabaseConfigured={true}
        hideExportPDF={true}
        hideQRCode={true}
        onlyNewBulletin={true}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={() => setShowAuthModal(false)}
      />

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto mt-8">
          <h1 className="text-4xl font-bold mb-4 text-blue-800">About MyWardBulletin</h1>
          <p className="mb-4 text-lg text-gray-700">
            MyWardBulletin is a free, private, and modern tool designed to make it easier for Latter-day Saint wards to create, print, and share weekly bulletins.
          </p>
          <p className="mb-4 text-gray-700">
            I built this tool for my wife when she was asked to manage the ward bulletin. The other tools were overcomplicated, not mobile-friendly, or too rigid. She just needed something fast, flexible, and reliable.
          </p>
          <p className="mb-4 text-gray-700">
            MyWardBulletin lets anyone create a bulletin with no tech background, share it with a link or QR code, and print a clean, foldable version with just a few clicks.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4 text-blue-700">Why It’s Different</h2>
          <ul className="mb-6 space-y-3 text-gray-700">
            <li>✅ <b>Quick and Clean</b><br />Start editing instantly with a layout that focuses on what matters.</li>
            <li>🔗 <b>Shareable Links and QR Codes</b><br />Sign in to save your bulletin and get a link and QR code to share digitally or print.</li>
            <li>🖨️ <b>Print-Optimized PDFs</b><br />Export beautiful, folded bulletin layouts ready for sacrament meeting handouts.</li>
            <li>🔒 <b>Private by Design</b><br />No ads, no tracking, and no hidden scripts. Your data stays with you.</li>
            <li>📱 <b>Mobile-Friendly</b><br />Use it on any device—no app needed, no downloads required.</li>
            <li>💾 <b>Auto-Save and Cloud Sync</b><br />Work is saved automatically. Sign in to access your bulletins from anywhere.</li>
            <li>🚫 <b>Zero Clutter</b><br />No upsells, no distractions—just a focused experience for Sunday prep.</li>
          </ul>

          <p className="mb-4 text-gray-700 italic">
            MyWardBulletin is not affiliated with or endorsed by The Church of Jesus Christ of Latter-day Saints. It’s simply a tool built to make Sunday a little smoother.
          </p>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 text-base font-medium">
              MyWardBulletin.com — Free Ward Bulletin Creator
            </p>
            <nav className="mt-4 space-x-4">
              <a href="/about" className="text-gray-600 hover:text-gray-900">About</a>
              <a href="/how-to-use" className="text-gray-600 hover:text-gray-900">How To Use</a>
              <a href="/contact" className="text-gray-600 hover:text-gray-900">Contact</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
