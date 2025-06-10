import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Calendar, Clock, MapPin, Users, QrCode, Download, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import QRCode from 'qrcode';
import toast from 'react-hot-toast';

export const SessionManager: React.FC = () => {
  const { sessions, createSession, currentUser, getSessionAttendance, users, updateSessionStatus } = useApp();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    location: '',
    department: ''
  });

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      await createSession({
        ...formData,
        createdBy: currentUser.id,
        isActive: true
      });
      
      setFormData({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        location: '',
        department: ''
      });
      setShowCreateForm(false);
      toast.success('Session created successfully!');
    } catch (error) {
      toast.error('Failed to create session');
    }
  };

  const generateQRCode = async (session: any) => {
    if (!canvasRef.current) return;

    try {
      await QRCode.toCanvas(canvasRef.current, session.qrCode, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const downloadQRCode = (session: any) => {
    if (!canvasRef.current) return;

    const link = document.createElement('a');
    link.download = `${session.title}-qr-code.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const getAttendanceCount = (sessionId: string) => {
    return getSessionAttendance(sessionId).length;
  };

  const toggleSessionStatus = (sessionId: string, currentStatus: boolean) => {
    updateSessionStatus(sessionId, !currentStatus);
    toast.success(`Session ${!currentStatus ? 'activated' : 'deactivated'}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Session Management</h1>
          <p className="text-white/70 mt-1">Create and manage attendance sessions</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-purple-900 transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          <span>Create Session</span>
        </button>
      </div>

      {/* Create Session Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Create New Session</h2>
            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Session title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Session description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Start Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">End Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Room/Location"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-200"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sessions List */}
      <div className="grid gap-6">
        {sessions.map((session) => {
          const attendanceCount = getAttendanceCount(session.id);
          const attendanceList = getSessionAttendance(session.id);
          
          return (
            <div
              key={session.id}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{session.title}</h3>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      session.isActive 
                        ? 'bg-green-500/20 text-green-300' 
                        : 'bg-gray-500/20 text-gray-300'
                    }`}>
                      {session.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  <p className="text-white/70 mb-3">{session.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2 text-white/70">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(session.startTime), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-white/70">
                      <Clock className="w-4 h-4" />
                      <span>{format(new Date(session.startTime), 'HH:mm')} - {format(new Date(session.endTime), 'HH:mm')}</span>
                    </div>
                    {session.location && (
                      <div className="flex items-center space-x-2 text-white/70">
                        <MapPin className="w-4 h-4" />
                        <span>{session.location}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-white/70">
                      <Users className="w-4 h-4" />
                      <span>{attendanceCount} present</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleSessionStatus(session.id, session.isActive)}
                    className={`p-2 rounded-lg transition-colors ${
                      session.isActive
                        ? 'text-green-400 hover:bg-green-500/20'
                        : 'text-gray-400 hover:bg-gray-500/20'
                    }`}
                    title={session.isActive ? 'Deactivate session' : 'Activate session'}
                  >
                    {session.isActive ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedSession(selectedSession === session.id ? null : session.id);
                      setTimeout(() => generateQRCode(session), 100);
                    }}
                    className="p-2 text-purple-400 hover:bg-purple-500/20 rounded-lg transition-colors"
                    title="Show QR Code"
                  >
                    <QrCode className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* QR Code Section */}
              {selectedSession === session.id && (
                <div className="mt-6 pt-6 border-t border-white/20">
                  <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
                    <div className="bg-white p-4 rounded-lg">
                      <canvas ref={canvasRef} />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white mb-2">QR Code for {session.title}</h4>
                      <p className="text-white/70 mb-4">
                        Students can scan this QR code to mark their attendance for this session.
                      </p>
                      
                      <button
                        onClick={() => downloadQRCode(session)}
                        className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download QR Code</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Attendance List */}
              {attendanceList.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/20">
                  <h4 className="text-lg font-semibold text-white mb-4">Attendance ({attendanceCount})</h4>
                  <div className="grid gap-2 max-h-48 overflow-y-auto">
                    {attendanceList.map((record) => {
                      const user = users.find(u => u.id === record.userId);
                      return (
                        <div
                          key={record.id}
                          className="flex items-center justify-between bg-white/5 rounded-lg p-3"
                        >
                          <div>
                            <span className="text-white font-medium">{user?.name}</span>
                            {user?.studentId && (
                              <span className="text-white/70 text-sm ml-2">({user.studentId})</span>
                            )}
                          </div>
                          <span className="text-white/70 text-sm">
                            {format(new Date(record.markedAt), 'HH:mm')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {sessions.length === 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
            <QrCode className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Sessions Yet</h3>
            <p className="text-white/70 mb-6">Create your first attendance session to get started.</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-200"
            >
              Create Your First Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
};