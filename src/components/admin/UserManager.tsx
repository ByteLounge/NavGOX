'use client';

import React, { useState } from 'react';
import { UserProfile, UserRole } from '@/types';
import { StorageService } from '@/lib/storage';
import {
  Check,
  Edit,
  Plus,
  Power,
  Shield,
  User,
  Users,
  X,
} from 'lucide-react';

interface UserManagerProps {
  users: UserProfile[];
  onRefresh: () => void;
}

const ROLES: UserRole[] = ['passenger', 'employee', 'driver', 'dispatcher', 'admin'];

export default function UserManager({ users, onRefresh }: UserManagerProps) {
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const emptyUser: UserProfile = {
    id: '',
    name: '',
    email: '',
    phone: '+91 ',
    role: 'employee',
    badge_number: 'MOPA-',
    department: 'Airport Ground Operations',
    is_active: true,
    created_at: '2026-11-21T00:00:00Z',
  };

  const handleOpenAdd = () => {
    setEditingUser({
      ...emptyUser,
      id: `usr-${Date.now()}`,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u: UserProfile) => {
    setEditingUser({ ...u });
    setIsModalOpen(true);
  };

  const handleToggleActive = (u: UserProfile) => {
    const updated = { ...u, is_active: !u.is_active };
    StorageService.saveUser(updated);
    onRefresh();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    StorageService.saveUser(editingUser);
    setIsModalOpen(false);
    setEditingUser(null);
    onRefresh();
  };

  const roleColors: Record<UserRole, string> = {
    passenger: 'bg-blue-100 text-blue-800 border-blue-200',
    employee: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    driver: 'bg-amber-100 text-amber-800 border-amber-200',
    dispatcher: 'bg-purple-100 text-purple-800 border-purple-200',
    admin: 'bg-rose-100 text-rose-800 border-rose-200',
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">
            Registered Users & Role Permissions ({users.length})
          </h3>
          <p className="text-xs text-slate-500">
            Control employee access, operational roles, and transport clearance levels
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
        >
          <Plus className="h-4 w-4 text-sky-400" />
          <span>Add User / Employee</span>
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">Role</th>
              <th className="p-3">Department / Badge</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/70">
                <td className="p-3">
                  <div className="font-semibold text-slate-900">{u.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{u.email}</div>
                </td>
                <td className="p-3">
                  <span
                    className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                      roleColors[u.role]
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="p-3">
                  <div className="font-medium text-slate-800">{u.department || 'General Public'}</div>
                  {u.badge_number && (
                    <div className="text-[10px] text-slate-400 font-mono">{u.badge_number}</div>
                  )}
                </td>
                <td className="p-3 font-mono text-slate-600">{u.phone}</td>
                <td className="p-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      u.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {u.is_active ? 'Active' : 'Deactivated'}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(u)}
                      className={`p-1.5 rounded-lg border text-xs ${
                        u.is_active
                          ? 'border-slate-200 text-slate-500 hover:bg-slate-50'
                          : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                      }`}
                      title={u.is_active ? 'Deactivate' : 'Activate'}
                    >
                      <Power className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(u)}
                      className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Edit Role
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingUser.name ? `Edit: ${editingUser.name}` : 'Create User Account'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    value={editingUser.phone}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs font-mono focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    System Role
                  </label>
                  <select
                    value={editingUser.role}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, role: e.target.value as UserRole })
                    }
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold capitalize focus:border-sky-500"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Airport Badge ID
                  </label>
                  <input
                    type="text"
                    value={editingUser.badge_number || ''}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, badge_number: e.target.value })
                    }
                    placeholder="e.g. GGIAL-4089"
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs font-mono uppercase focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Department / Agency
                </label>
                <input
                  type="text"
                  value={editingUser.department || ''}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, department: e.target.value })
                  }
                  placeholder="e.g. Directorate of Airport Security, CISF, GMR Ground Handling"
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs focus:border-sky-500"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingUser.is_active}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, is_active: e.target.checked })
                    }
                    className="rounded text-sky-600"
                  />
                  <span>Account Active & Permitted for Campus Shuttle Requests</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
