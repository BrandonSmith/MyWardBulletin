import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import AuthModal from '../components/AuthModal';

export default function HowToUsePage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const goHome = () => { window.location.href = '/'; };
  const openAuthModal = () => setShowAuthModal(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Helmet>
        <title>How to Use | MyWardBulletin</title>
        <meta
          name="description"
          content="Learn how to create, print, and share LDS ward bulletins using MyWardBulletin. A step-by-step guide to building your Sunday program with ease."
        />
        <meta property="og:title" content="How to Use MyWardBulletin" />
        <meta
          property="og:description"
          content="Step-by-step instructions for building and sharing LDS sacrament meeting bulletins. Create, customize, print, and publish with ease."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mywardbulletin.com/how-to-use" />
        <meta property="og:image" content="https://mywardbulletin.com/og-image.png" />
        <meta property="og:site_name" content="MyWardBulletin" />
        <meta property="og:image:alt" content="How to create and share a Sunday bulletin" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="How to Use MyWardBulletin" />
        <meta
          name="twitter:description"
          content="Build and publish your LDS Sunday bulletin in minutes. Learn how MyWardBulletin makes it easy."
        />
        <meta name="twitter:image" content="https://mywardbulletin.com/og-image.png" />
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "How to Use MyWardBulletin",
            "description": "Step-by-step instructions for building and printing LDS sacrament meeting bulletins with MyWardBulletin.",
            "url": "https://mywardbulletin.com/how-to-use",
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

      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto mt-8">
          <h1 className="text-3xl font-bold mb-4 text-blue-800">How to Use MyWardBulletin</h1>
          <p className="mb-6 text-lg text-gray-700">
            Creating and sharing a Sunday program should be simple. Here’s how to do it with MyWardBulletin:
          </p>

          <ol className="list-decimal list-inside mb-6 space-y-6 text-gray-700">
            <li>
              <b>Start Your Bulletin</b>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Go to <b>mywardbulletin.com</b></li>
                <li>Click “Start a New Bulletin”</li>
                <li>You’ll see a clean editor where you can add sections like:
                  <ul className="list-disc ml-6 mt-1">
                    <li>Date and Ward Name</li>
                    <li>Presiding and conducting</li>
                    <li>Opening/closing hymns</li>
                    <li>Speakers and prayers</li>
                    <li>Announcements</li>
                    <li>Custom notes</li>
                  </ul>
                </li>
                <li>The layout is flexible—add or remove anything you need.</li>
              </ul>
            </li>

            <li>
              <b>Customize As Needed</b>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Rearrange agenda items easily</li>
                <li>Click into each field to edit text</li>
                <li>Use “+ Add Section” for speakers, musical numbers, or testimonies</li>
                <li>You can build as much as you want before signing in</li>
              </ul>
            </li>

            <li>
              <b>Sign In to Save and Share</b>
              <p className="mt-2">Once your bulletin is ready:</p>
              <ul className="list-disc ml-6 mt-1 space-y-1">
                <li>Click “Save or Share”</li>
                <li>Sign in or create a free account</li>
                <li>After signing in, you'll get:</li>
                <ul className="list-disc ml-6 mt-1">
                  <li>✅ A custom shareable link</li>
                  <li>✅ An auto-generated QR code</li>
                </ul>
                <li>Your saved bulletins are available from any device</li>
              </ul>
            </li>

            <li>
              <b>Print (If Needed)</b>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Click “Export as PDF”</li>
                <li>Prints cleanly on standard paper</li>
                <li>Optimized for folding and chapel distribution</li>
              </ul>
            </li>

            <li>
              <b>Reuse and Manage Bulletins</b>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Access saved bulletins in your dashboard</li>
                <li>Duplicate past bulletins to save time</li>
                <li>Make changes anytime, even Sunday morning</li>
                <li>QR codes and links always show the latest version</li>
              </ul>
            </li>
          </ol>

          <h2 className="text-2xl font-bold mt-8 mb-4 text-blue-700">Need to Keep It Offline?</h2>
          <ul className="mb-6 list-disc ml-6 text-gray-700">
            <li>You can build a full bulletin before signing in</li>
            <li>If you don’t want an account, you can still print directly from your browser</li>
            <li className="text-sm text-gray-500 ml-4">(Note: QR codes and shareable links require sign-in)</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4 text-blue-700">Tips</h2>
          <ul className="mb-6 list-disc ml-6 text-gray-700">
            <li>Print a QR code on a sign or program cover for quick access</li>
            <li>Combine digital and physical—print a few copies and let others use phones</li>
            <li>Edit bulletins in real time if last-minute changes arise</li>
          </ul>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">
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
