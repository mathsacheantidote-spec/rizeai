import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, LogOut, Trash2, Power, PowerOff, Users } from 'lucide-react';
import { getCurrentUser, getAllUsers, updateUserRole, deactivateUser, reactivateUser, deleteUser, signOut } from '@/lib/auth';
import { UserProfile } from '@/lib/supabase';

export default function AdminPanel() {
  const [, navigate] = useLocation();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      if (!user || user.role !== 'admin') {
        navigate('/admin-login');
        return;
      }
      setCurrentUser(user);
      await loadUsers();
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const loadUsers = async () => {
    const allUsers = await getAllUsers();
    setUsers(allUsers);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setActionLoading(userId);
    setError(null);
    setSuccess(null);

    const { error: roleError } = await updateUserRole(userId, newRole as 'user' | 'mentor' | 'admin');

    if (roleError) {
      setError(roleError);
    } else {
      setSuccess(`User role updated to ${newRole}`);
      await loadUsers();
    }

    setActionLoading(null);
  };

  const handleDeactivate = async (userId: string) => {
    setActionLoading(userId);
    setError(null);
    setSuccess(null);

    const { error: deactivateError } = await deactivateUser(userId);

    if (deactivateError) {
      setError(deactivateError);
    } else {
      setSuccess('User deactivated');
      await loadUsers();
    }

    setActionLoading(null);
  };

  const handleReactivate = async (userId: string) => {
    setActionLoading(userId);
    setError(null);
    setSuccess(null);

    const { error: reactivateError } = await reactivateUser(userId);

    if (reactivateError) {
      setError(reactivateError);
    } else {
      setSuccess('User reactivated');
      await loadUsers();
    }

    setActionLoading(null);
  };

  const handleDelete = async (userId: string) => {
    setActionLoading(userId);
    setError(null);
    setSuccess(null);

    const { error: deleteError } = await deleteUser(userId);

    if (deleteError) {
      setError(deleteError);
    } else {
      setSuccess('User deleted');
      await loadUsers();
    }

    setActionLoading(null);
    setDeleteConfirm(null);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/admin-login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          <p className="text-slate-300">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
              <p className="text-sm text-slate-400">Welcome, {currentUser.name || currentUser.email}</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-slate-600 text-slate-200 hover:bg-slate-700"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm text-green-400">{success}</p>
          </div>
        )}

        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-6">User Management</h2>

            {users.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Role</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Created</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                        <td className="py-4 px-4 text-sm text-slate-200">{user.name || '—'}</td>
                        <td className="py-4 px-4 text-sm text-slate-200">{user.email}</td>
                        <td className="py-4 px-4">
                          <Select
                            value={user.role}
                            onValueChange={(value) => handleRoleChange(user.id, value)}
                            disabled={actionLoading === user.id}
                          >
                            <SelectTrigger className="w-32 bg-slate-700/50 border-slate-600 text-slate-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-700 border-slate-600">
                              <SelectItem value="user" className="text-slate-200">
                                User
                              </SelectItem>
                              <SelectItem value="mentor" className="text-slate-200">
                                Mentor
                              </SelectItem>
                              <SelectItem value="admin" className="text-slate-200">
                                Admin
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.is_active
                                ? 'bg-green-500/10 text-green-400'
                                : 'bg-red-500/10 text-red-400'
                            }`}
                          >
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-400">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            {user.is_active ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeactivate(user.id)}
                                disabled={actionLoading === user.id}
                                className="border-slate-600 text-slate-300 hover:bg-slate-700 h-8"
                              >
                                {actionLoading === user.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <PowerOff className="h-3 w-3" />
                                )}
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReactivate(user.id)}
                                disabled={actionLoading === user.id}
                                className="border-slate-600 text-slate-300 hover:bg-slate-700 h-8"
                              >
                                {actionLoading === user.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Power className="h-3 w-3" />
                                )}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDeleteConfirm(user.id)}
                              disabled={actionLoading === user.id}
                              className="border-red-600/50 text-red-400 hover:bg-red-500/10 h-8"
                            >
                              {actionLoading === user.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Trash2 className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete User</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to permanently delete this user? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel className="bg-slate-700 text-slate-200 border-slate-600 hover:bg-slate-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
