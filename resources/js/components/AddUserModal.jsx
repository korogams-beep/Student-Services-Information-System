import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, UserPlus } from 'lucide-react';

export const AddUserModal = () => {
  const { isAddUserModalOpen, setIsAddUserModalOpen, setAdminUsersList, recordAuditLog, showToast } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    role: 'Student',
    username: '',
    email: '',
  });

  if (!isAddUserModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.username) {
      alert('Please fill out all required fields.');
      return;
    }

    const newUser = {
      id: Date.now(),
      name: formData.name,
      role: formData.role,
      account: 'Active',
    };

    setAdminUsersList(prev => [...prev, newUser]);
    recordAuditLog('Account created', `V. Ramos • ${newUser.name} (${newUser.role})`);
    showToast(`User ${newUser.name} provisioned successfully!`);

    // Reset and close
    setFormData({ name: '', role: 'Student', username: '', email: '' });
    setIsAddUserModalOpen(false);
  };

  return (
    <div className="ssis-modal-backdrop" onClick={() => setIsAddUserModalOpen(false)}>
      <div className="ssis-modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={22} color="#F1B82D" />
            <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Provision New User</h3>
          </div>
          <button
            onClick={() => setIsAddUserModalOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="ssis-form-group">
            <label className="ssis-label">Full Name *</label>
            <input
              type="text"
              required
              className="ssis-input"
              placeholder="e.g. Juan dela Cruz"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="ssis-form-group">
            <label className="ssis-label">Username / Student ID *</label>
            <input
              type="text"
              required
              className="ssis-input"
              placeholder="e.g. 2024-05512 or j.delacruz"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

          <div className="ssis-form-group">
            <label className="ssis-label">Role Assignment *</label>
            <select
              className="ssis-select"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="Student">Student</option>
              <option value="Registrar">Registrar</option>
              <option value="Cashier">Cashier</option>
              <option value="Department Staff">Department Staff</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '30px' }}>
            <button
              type="button"
              onClick={() => setIsAddUserModalOpen(false)}
              className="ssis-btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="ssis-btn-primary">
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
