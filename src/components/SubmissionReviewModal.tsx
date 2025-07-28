import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';

import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Mail, 
  Loader2, 
  Trash2 
} from 'lucide-react';

interface Submission {
  id: string;
  title: string;
  content: string;
  category: string;
  audience: string;
  date: string;
  submitter_name: string;
  submitter_email: string;
  submitter_phone: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

interface SubmissionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileSlug: string;
  onSubmissionApproved: (submission: Submission) => void;
  onSubmissionRejected?: (submission: Submission) => void;
  onSubmissionsChanged?: () => void;
}

export default function SubmissionReviewModal({
  isOpen,
  onClose,
  profileSlug,
  onSubmissionApproved,
  onSubmissionRejected,
  onSubmissionsChanged
}: SubmissionReviewModalProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    if (isOpen && profileSlug) {
      fetchSubmissions();
    }
  }, [isOpen, profileSlug]);

  const fetchSubmissions = async () => {
    if (!supabase) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('announcement_submissions')
        .select('*')
        .eq('profile_slug', profileSlug)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching submissions:', error);
        toast.error('Failed to load submissions');
      } else {
        setSubmissions(data || []);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (submission: Submission) => {
    if (!supabase) return;
    
    setProcessing(submission.id);
    try {
      const { error } = await supabase
        .from('announcement_submissions')
        .update({ 
          status: 'approved',
          notes: notes.trim() || null
        })
        .eq('id', submission.id);

      if (error) throw error;

      

      // Add to bulletin
      onSubmissionApproved(submission);

      // Refresh submissions
      await fetchSubmissions();
      setNotes('');
      
      // Notify parent component that submissions have changed
      onSubmissionsChanged?.();
      
    } catch (error) {
      console.error('Error approving submission:', error);
      toast.error('Failed to approve submission');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (submission: Submission) => {
    if (!supabase) return;
    
    setProcessing(submission.id);
    try {
      const { error } = await supabase
        .from('announcement_submissions')
        .update({ 
          status: 'rejected',
          notes: notes.trim() || null
        })
        .eq('id', submission.id);

      if (error) throw error;

      

      // Refresh submissions
      await fetchSubmissions();
      setNotes('');
      
      // Notify parent component that submissions have changed
      onSubmissionsChanged?.();
      
      // Notify parent component about rejection
      onSubmissionRejected?.(submission);
      
    } catch (error) {
      console.error('Error rejecting submission:', error);
      toast.error('Failed to reject submission');
    } finally {
      setProcessing(null);
    }
  };





  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-3 h-3" />;
      case 'rejected': return <XCircle className="w-3 h-3" />;
      default: return <AlertCircle className="w-3 h-3" />;
    }
  };

  const handleApproveGroup = async (audience: string) => {
    const groupSubmissions = submissions.filter(s => s.audience === audience && s.status === 'pending');
    
    if (groupSubmissions.length === 0) return;
    
    setProcessing('group-' + audience);
    try {
      // Update all submissions in database
      for (const submission of groupSubmissions) {
        if (!supabase) continue;
        
        const { error } = await supabase
          .from('announcement_submissions')
          .update({ 
            status: 'approved',
            notes: notes.trim() || null
          })
          .eq('id', submission.id);

        if (error) throw error;


      }

      // Create consolidated announcement
      const titles = groupSubmissions.map(s => s.title).filter(t => t.trim());
      const contents = groupSubmissions.map(s => s.content).filter(c => c.trim());
      
      // Create content with original titles as headers
      const contentWithHeaders = groupSubmissions
        .filter(s => s.title.trim() || s.content.trim())
        .map(s => {
          const title = s.title.trim();
          const content = s.content.trim();
          if (title && content) {
            return `<h4 style="font-size: 18px; font-weight: 600; margin-bottom: 8px; color: #111827; margin-top: 16px;">${title}</h4>${content}`;
          } else if (title) {
            return `<h4 style="font-size: 18px; font-weight: 600; margin-bottom: 8px; color: #111827; margin-top: 16px;">${title}</h4>`;
          } else if (content) {
            return content;
          }
          return '';
        })
        .filter(item => item)
        .join('<br><br>');

      // Add consolidated announcement to bulletin
      onSubmissionApproved({
        id: Date.now().toString() + Math.random(),
        title: '', // Empty title for consolidated announcements
        content: contentWithHeaders,
        category: 'general',
        audience: audience,
        date: '',
        submitter_name: groupSubmissions[0].submitter_name,
        submitter_email: groupSubmissions[0].submitter_email,
        submitter_phone: groupSubmissions[0].submitter_phone,
        created_at: new Date().toISOString(),
        status: 'approved'
      });

      // Refresh submissions
      await fetchSubmissions();
      setNotes('');
      
      // Notify parent component that submissions have changed
      onSubmissionsChanged?.();
      
      toast.success(`${audience.replace('_', ' ')} announcements have been consolidated and added to the bulletin!`);
      
    } catch (error) {
      console.error('Error approving group:', error);
      toast.error('Failed to approve group');
    } finally {
      setProcessing(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Review Announcement Submissions</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-gray-50">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200 ${
              activeTab === 'pending'
                ? 'bg-white text-blue-600 border-b-2 border-blue-500 shadow-sm'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            Pending
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200 ${
              activeTab === 'approved'
                ? 'bg-white text-green-600 border-b-2 border-green-500 shadow-sm'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Approved
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200 ${
              activeTab === 'rejected'
                ? 'bg-white text-red-600 border-b-2 border-red-500 shadow-sm'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <XCircle className="w-4 h-4" />
            Rejected
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Loading submissions...</span>
            </div>
          ) : (() => {
            // Filter submissions by active tab
            const filteredSubmissions = submissions.filter(s => s.status === activeTab);
            
            if (filteredSubmissions.length === 0) {
              return (
                <div className="text-center py-16">
                  <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No {activeTab} submissions
                  </h3>
                  <p className="text-gray-500">
                    {activeTab === 'pending' 
                      ? 'Submissions from ward members will appear here'
                      : `No ${activeTab} submissions found`
                    }
                  </p>
                </div>
              );
            }
            
            const groupedFilteredSubmissions = filteredSubmissions.reduce((groups, submission) => {
              const audience = submission.audience;
              if (!groups[audience]) {
                groups[audience] = [];
              }
              groups[audience].push(submission);
              return groups;
            }, {} as Record<string, Submission[]>);

            return (
              <div className="space-y-6">
                {Object.entries(groupedFilteredSubmissions).map(([audience, audienceSubmissions]) => {
                  const statusCount = audienceSubmissions.filter(s => s.status === activeTab).length;
                  const hasStatusItems = statusCount > 0;
                  
                  return (
                    <div key={audience} className="border rounded-lg p-4 bg-white">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold capitalize">{audience.replace('_', ' ')} Announcements</h3>
                          <p className="text-sm text-gray-500">
                            {statusCount} {activeTab}, {audienceSubmissions.length} total
                          </p>
                        </div>
                        {activeTab === 'pending' && hasStatusItems && (
                          <button
                            onClick={() => handleApproveGroup(audience)}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve All {audience.replace('_', ' ')}
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        {audienceSubmissions.map((submission) => (
                          <div key={submission.id} className="border-l-4 border-gray-200 pl-4 py-3 bg-gray-50 rounded-r-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium">{submission.title}</h4>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(submission.status)}`}>
                                    {getStatusIcon(submission.status)}
                                    {submission.status}
                                  </span>
                                </div>
                                <div 
                                  className="text-gray-600 text-sm mb-2"
                                  dangerouslySetInnerHTML={{ __html: submission.content }}
                                />
                                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                                  <span>From: {submission.submitter_name}</span>
                                  {submission.submitter_email && (
                                    <span>Email: {submission.submitter_email}</span>
                                  )}
                                </div>
                              </div>

                            </div>

                            {submission.status === 'pending' && (
                              <div className="border-t pt-3 mt-3">
                                <div className="mb-3">
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Notes (optional)
                                  </label>
                                  <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add feedback for the submitter..."
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                    rows={2}
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleApprove(submission)}
                                    disabled={processing === submission.id}
                                    className="flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                  >
                                    {processing === submission.id ? (
                                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                    ) : (
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                    )}
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleReject(submission)}
                                    disabled={processing === submission.id}
                                    className="flex items-center px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                                  >
                                    {processing === submission.id ? (
                                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                    ) : (
                                      <XCircle className="w-3 h-3 mr-1" />
                                    )}
                                    Reject
                                  </button>
                                </div>
                              </div>
                            )}

                            {submission.notes && (
                              <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                                <p className="text-blue-800">
                                  <strong>Notes:</strong> {submission.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}