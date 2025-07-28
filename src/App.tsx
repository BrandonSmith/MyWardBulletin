import React from 'react';
import { Routes, Route } from 'react-router-dom';
import EditorApp from './pages/EditorApp';
import AboutPage from './pages/AboutPage';
import HowToUsePage from './pages/HowToUsePage';
import ContactPage from './pages/ContactPage';
import PublicBulletinPage from './pages/PublicBulletinPage';
import AnnouncementSubmissionPage from './pages/AnnouncementSubmissionPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<EditorApp />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/how-to-use" element={<HowToUsePage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/submit/:slug" element={<AnnouncementSubmissionPage />} />
      <Route path="/:slug" element={<PublicBulletinPage />} />
    </Routes>
  );
}
