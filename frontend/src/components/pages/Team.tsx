// @ts-nocheck
import React from 'react';
import { Users, Plus, Mail, Shield, Edit } from 'lucide-react';

interface TeamProps {
  selectedBrands?: string[];
}

const Team: React.FC<TeamProps> = ({ selectedBrands = [] }) => {
  // Note: Team page is global, no brand filtering needed (team members work across all brands)
  const team = [
    { id: 1, name: 'Admin User', email: 'admin@geoplatform.com', role: 'Super Admin', avatar: '👤', status: 'active', projects: ['SweetNight', 'Eufy', 'Hisense'] },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@geoplatform.com', role: 'Project Manager', avatar: '👩', status: 'active', projects: ['SweetNight'] },
    { id: 3, name: 'Mike Chen', email: 'mike@geoplatform.com', role: 'Content Writer', avatar: '👨', status: 'active', projects: ['Eufy', 'Hisense'] },
    { id: 4, name: 'Emily Davis', email: 'emily@geoplatform.com', role: 'Data Analyst', avatar: '👩‍💼', status: 'active', projects: ['SweetNight', 'Eufy'] },
    { id: 5, name: 'Tom Wilson', email: 'tom@geoplatform.com', role: 'SEO Specialist', avatar: '👨‍💻', status: 'inactive', projects: [] }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team</h1>
          <p className="text-gray-600 mt-1">Manage team members and permissions</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-700">Total Members</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{team.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-700">Active</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{team.filter(m => m.status === 'active').length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-700">Admins</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">1</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Mail className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="font-semibold text-gray-700">Pending Invites</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">3</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {team.map((member) => (
          <div key={member.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="text-5xl">{member.avatar}</div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{member.name}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                    <Mail className="w-3 h-3" />
                    {member.email}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                member.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
              </span>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Role:</span>
                <span className="text-sm text-gray-900">{member.role}</span>
              </div>
              <div className="mb-3">
                <span className="text-sm font-medium text-gray-700">Projects:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {member.projects.length > 0 ? member.projects.map((project) => (
                    <span key={project} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                      {project}
                    </span>
                  )) : (
                    <span className="text-sm text-gray-400">No projects assigned</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Team;
