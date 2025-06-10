import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, Plus, Search, Mail, UserCheck, GraduationCap, Shield, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const UserManager: React.FC = () => {
  const { users, createUser, attendanceRecords } = useApp();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'student'>('all');
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student' as 'admin' | 'student',
    studentId: '',
    department: ''
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    try {
      await createUser(formData);
      
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'student',
        studentId: '',
        department: ''
      });
      setShowCreateForm(false);
      setShowPassword(false);
      toast.success('User created successfully!');
    } catch (error: any) {
      if (error.message?.includes('UNIQUE constraint failed')) {
        toast.error('A user with this email already exists');
      } else {
        toast.error('Failed to create user');
      }
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.studentId && user.studentId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const getUserAttendanceCount = (userId: string) => {
    return attendanceRecords.filter(record => record.userId === userId).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-white/70 mt-1">Manage students and administrators</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-purple-900 transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          <span>Add User</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="text"
                placeholder="Search by name, email, or student ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="md:w-48">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as 'all' | 'admin' | 'student')}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all" className="bg-gray-800">All Roles</option>
              <option value="admin" className="bg-gray-800">Administrators</option>
              <option value="student" className="bg-gray-800">Students</option>
            </select>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">Add New User</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Password * <span className="text-white/50 text-xs">(minimum 6 characters)</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter secure password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'student' })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="student" className="bg-gray-800">Student</option>
                  <option value="admin" className="bg-gray-800">Administrator</option>
                </select>
              </div>

              {formData.role === 'student' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Student ID</label>
                    <input
                      type="text"
                      value={formData.studentId}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter student ID"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Department</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter department"
                    />
                  </div>
                </>
              )}

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setShowPassword(false);
                    setFormData({
                      name: '',
                      email: '',
                      password: '',
                      role: 'student',
                      studentId: '',
                      department: ''
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-200"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-white/20">
          <h2 className="text-xl font-bold text-white">
            Users ({filteredUsers.length})
          </h2>
        </div>

        <div className="divide-y divide-white/10">
          {filteredUsers.map((user) => {
            const attendanceCount = getUserAttendanceCount(user.id);
            
            return (
              <div key={user.id} className="p-6 hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      user.role === 'admin' 
                        ? 'bg-gradient-to-r from-orange-500 to-red-500' 
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                    }`}>
                      {user.role === 'admin' ? (
                        <Shield className="w-6 h-6 text-white" />
                      ) : (
                        <GraduationCap className="w-6 h-6 text-white" />
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-white/70">
                        <div className="flex items-center space-x-1">
                          <Mail className="w-4 h-4" />
                          <span>{user.email}</span>
                        </div>
                        {user.studentId && (
                          <span>ID: {user.studentId}</span>
                        )}
                        {user.department && (
                          <span>{user.department}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      user.role === 'admin'
                        ? 'bg-orange-500/20 text-orange-300'
                        : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {user.role === 'admin' ? 'Administrator' : 'Student'}
                    </div>
                    
                    <div className="mt-2 text-sm text-white/70">
                      <div className="flex items-center space-x-1">
                        <UserCheck className="w-4 h-4" />
                        <span>{attendanceCount} sessions attended</span>
                      </div>
                      <div className="text-xs text-white/50">
                        Joined {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-8 text-center">
            <Users className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Users Found</h3>
            <p className="text-white/70 mb-6">
              {searchTerm || filterRole !== 'all' 
                ? 'No users match your current filters.' 
                : 'Add your first user to get started.'
              }
            </p>
            {(!searchTerm && filterRole === 'all') && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-200"
              >
                Add Your First User
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};