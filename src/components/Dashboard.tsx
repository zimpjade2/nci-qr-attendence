import React from 'react';
import { useApp } from '../context/AppContext';
import { Users, Calendar, CheckCircle, Clock, TrendingUp, QrCode } from 'lucide-react';
import { format, isToday, isThisWeek } from 'date-fns';

export const Dashboard: React.FC = () => {
  const { currentUser, sessions, attendanceRecords, users } = useApp();

  // Statistics calculations
  const totalSessions = sessions.length;
  const activeSessions = sessions.filter(s => s.isActive).length;
  const totalUsers = users.length;
  const todayAttendance = attendanceRecords.filter(record => 
    isToday(new Date(record.markedAt))
  ).length;

  const userAttendanceRecords = attendanceRecords.filter(record => record.userId === currentUser?.id);
  const userSessionsCreated = sessions.filter(session => session.createdBy === currentUser?.id);

  // Recent activities
  const recentSessions = sessions
    .filter(session => isThisWeek(new Date(session.createdAt)))
    .slice(0, 5);

  const recentAttendance = attendanceRecords
    .filter(record => record.userId === currentUser?.id)
    .sort((a, b) => new Date(b.markedAt).getTime() - new Date(a.markedAt).getTime())
    .slice(0, 5);

  const stats = currentUser?.role === 'admin' 
    ? [
        { label: 'Total Sessions', value: totalSessions, icon: Calendar, color: 'from-blue-500 to-cyan-500' },
        { label: 'Active Sessions', value: activeSessions, icon: Clock, color: 'from-green-500 to-emerald-500' },
        { label: 'Total Users', value: totalUsers, icon: Users, color: 'from-purple-500 to-pink-500' },
        { label: "Today's Attendance", value: todayAttendance, icon: CheckCircle, color: 'from-orange-500 to-red-500' }
      ]
    : [
        { label: 'Sessions Attended', value: userAttendanceRecords.length, icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
        { label: 'This Week', value: userAttendanceRecords.filter(r => isThisWeek(new Date(r.markedAt))).length, icon: TrendingUp, color: 'from-blue-500 to-cyan-500' },
        { label: 'Available Sessions', value: sessions.filter(s => s.isActive).length, icon: QrCode, color: 'from-purple-500 to-pink-500' },
        { label: 'Total Sessions', value: totalSessions, icon: Calendar, color: 'from-orange-500 to-red-500' }
      ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {currentUser?.name}!
        </h1>
        <p className="text-white/70 text-lg">
          {currentUser?.role === 'admin' 
            ? 'Manage attendance sessions and monitor student participation.'
            : 'Scan QR codes to mark your attendance for active sessions.'
          }
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sessions */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4">
            {currentUser?.role === 'admin' ? 'Recent Sessions' : 'Available Sessions'}
          </h2>
          <div className="space-y-3">
            {(currentUser?.role === 'admin' ? recentSessions : sessions.filter(s => s.isActive).slice(0, 5)).map((session) => (
              <div
                key={session.id}
                className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">{session.title}</h3>
                    <p className="text-white/70 text-sm">{session.description}</p>
                    <p className="text-white/50 text-xs mt-1">
                      {format(new Date(session.startTime), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    session.isActive 
                      ? 'bg-green-500/20 text-green-300' 
                      : 'bg-gray-500/20 text-gray-300'
                  }`}>
                    {session.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>
            ))}
            {(currentUser?.role === 'admin' ? recentSessions : sessions.filter(s => s.isActive)).length === 0 && (
              <p className="text-white/50 text-center py-4">
                {currentUser?.role === 'admin' ? 'No recent sessions' : 'No active sessions available'}
              </p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4">
            {currentUser?.role === 'admin' ? 'Recent Attendance' : 'My Recent Attendance'}
          </h2>
          <div className="space-y-3">
            {(currentUser?.role === 'admin' 
              ? attendanceRecords.slice(0, 5)
              : recentAttendance
            ).map((record) => {
              const session = sessions.find(s => s.id === record.sessionId);
              const user = users.find(u => u.id === record.userId);
              
              return (
                <div
                  key={record.id}
                  className="bg-white/5 rounded-lg p-4 border border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">
                        {session?.title || 'Unknown Session'}
                      </h3>
                      {currentUser?.role === 'admin' && (
                        <p className="text-white/70 text-sm">{user?.name}</p>
                      )}
                      <p className="text-white/50 text-xs mt-1">
                        {format(new Date(record.markedAt), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                </div>
              );
            })}
            {(currentUser?.role === 'admin' 
              ? attendanceRecords 
              : recentAttendance
            ).length === 0 && (
              <p className="text-white/50 text-center py-4">No recent attendance records</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};