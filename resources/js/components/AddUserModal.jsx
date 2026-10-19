import React, { useState, useEffect } from 'react';
import { useApp, deduplicateUsers } from '../context/AppContext';
import { X, UserPlus, Shield, Hash } from 'lucide-react';

export const AddUserModal = () => {
  const { 
    currentUser,
    isAddUserModalOpen, 
    setIsAddUserModalOpen, 
    setAdminUsersList, 
    setDemoUsers, 
    demoUsers,
    recordAuditLog, 
    showToast,
    generateUniqueAccountId,
    getRolePrefix,
    setStudentGradesMap,
    setStudentClearanceMap,
    setStudentEnrollmentSelections,
    setStudentAssessmentsList,
    setEncodeGradesList
  } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    role: 'Student',
    accountId: '',
    username: '',
    email: '',
    program: 'BS Computer Science',
  });

  // Whenever modal opens, generate a fresh unique role-matched ID
  useEffect(() => {
    if (isAddUserModalOpen) {
      const initialId = generateUniqueAccountId ? generateUniqueAccountId('Student', demoUsers) : `STU-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setFormData({
        name: '',
        role: 'Student',
        accountId: initialId,
        username: '',
        email: '',
        program: 'BS Computer Science',
      });
    }
  }, [isAddUserModalOpen]);

  if (!isAddUserModalOpen) return null;

  const handleRoleSelect = (newRole) => {
    const newId = generateUniqueAccountId ? generateUniqueAccountId(newRole, demoUsers) : `${getRolePrefix(newRole)}-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setFormData(prev => ({
      ...prev,
      role: newRole,
      accountId: newId,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please fill out the user full name.');
      return;
    }

    const expectedPrefix = getRolePrefix(formData.role);
    let finalAccountId = (formData.accountId || '').trim();

    if (!finalAccountId) {
      finalAccountId = generateUniqueAccountId ? generateUniqueAccountId(formData.role, demoUsers) : `${expectedPrefix}-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    } else {
      // Strictly enforce role-matched prefix
      if (!finalAccountId.toUpperCase().startsWith(`${expectedPrefix}-`)) {
        finalAccountId = `${expectedPrefix}-2026-${finalAccountId.replace(/^[^0-9]+/, '') || Math.floor(1000 + Math.random() * 9000)}`;
      }
    }

    // Uniqueness validation across all users
    const isDuplicate = demoUsers.some(u =>
      (u.account_id && u.account_id.toLowerCase() === finalAccountId.toLowerCase()) ||
      (u.student_id_number && u.student_id_number.toLowerCase() === finalAccountId.toLowerCase())
    );

    if (isDuplicate) {
      alert(`Account ID "${finalAccountId}" is already assigned. Every user must have a unique ID matching their role.`);
      return;
    }

    const usernameVal = formData.username.trim() || finalAccountId.toLowerCase();
    const emailVal = formData.email.trim() || `${usernameVal}@cuyotech.edu.ph`;

    const newUser = {
      id: Date.now(),
      name: formData.name.trim(),
      role: formData.role,
      account_id: finalAccountId,
      student_id_number: finalAccountId,
      account: 'Active',
      status: 'Active',
      email: emailVal,
      username: usernameVal,
      program: formData.role === 'Student' ? formData.program : undefined,
      initials: formData.name.trim().split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
    };

    // If Student role, initialize empty 0 structures
    if (formData.role === 'Student') {
      if (setStudentGradesMap) {
        setStudentGradesMap(prev => ({ ...prev, [finalAccountId]: [] }));
      }
      if (setStudentClearanceMap) {
        const freshClearance = [
          { id: 1, department: 'University Library', lastUpdated: 'Pending Review', status: 'Pending', remarks: 'Awaiting book return audit' },
          { id: 2, department: 'Computer Laboratory', lastUpdated: 'Pending Review', status: 'Pending', remarks: 'Awaiting workstation & equipment check' },
          { id: 3, department: 'Guidance & Counseling', lastUpdated: 'Pending Review', status: 'Pending', remarks: 'Awaiting student counseling verification' },
          { id: 4, department: 'Office of Student Affairs', lastUpdated: 'Pending Review', status: 'Pending', remarks: 'Awaiting student organization clearance' },
          { id: 5, department: 'College Dean', lastUpdated: 'Pending Review', status: 'Pending', remarks: 'Awaiting Dean final sign-off' },
        ];
        setStudentClearanceMap(prev => ({ ...prev, [finalAccountId]: freshClearance }));
      }
      if (setStudentEnrollmentSelections) {
        setStudentEnrollmentSelections(prev => ({ ...prev, [finalAccountId]: [] }));
      }
      if (setStudentAssessmentsList) {
        setStudentAssessmentsList(prev => [
          { id: Date.now(), studentId: finalAccountId, name: newUser.name, program: formData.program, totalAssessed: 0.00, totalPaid: 0.00, balance: 0.00, status: 'Unassessed' },
          ...prev,
        ]);
      }
      if (setEncodeGradesList) {
        setEncodeGradesList(prev => [
          ...prev,
          { id: Date.now(), studentId: finalAccountId, studentName: newUser.name, grade: '1.75' },
        ]);
      }
    }

    setDemoUsers(prev => deduplicateUsers([...prev, newUser]));
    recordAuditLog('Account provisioned', `V. Ramos • ${newUser.name} (${newUser.role} • ID: ${finalAccountId})`);
    showToast(`User ${newUser.name} provisioned with role ${newUser.role} (ID: ${finalAccountId})!`);

    // Server-side sync
    fetch('/api/admin/users', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-User-Role': currentUser?.role || 'Admin',
      },
      body: JSON.stringify({
        name: newUser.name,
        role: newUser.role,
        username: newUser.username,
        account_id: newUser.account_id,
        student_id_number: newUser.student_id_number,
        email: newUser.email,
        program: newUser.program,
      }),
    }).catch(err => console.log('Admin user sync note:', err));

    // Reset and close
    setFormData({ name: '', role: 'Student', accountId: '', username: '', email: '', program: 'BS Computer Science' });
    setIsAddUserModalOpen(false);
  };

  return (
    <div className="ssis-modal-backdrop" onClick={() => setIsAddUserModalOpen(false)}>
      <div className="ssis-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserPlus size={22} color="#F1B82D" />
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: 0 }}>Provision New Account</h3>
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
            <label className="ssis-label">Role Assignment *</label>
            <select
              className="ssis-select"
              value={formData.role}
              onChange={(e) => handleRoleSelect(e.target.value)}
              style={{ fontWeight: '700' }}
            >
              <option value="Student">Student (STU-)</option>
              <option value="Registrar">Registrar (REG-)</option>
              <option value="Cashier">Cashier (CSH-)</option>
              <option value="Department Staff">Department Staff (STF-)</option>
              <option value="Admin">Admin (ADM-)</option>
            </select>
            <span style={{ fontSize: '11.5px', color: '#64748B', marginTop: '4px', display: 'block' }}>
              Account ID prefix dynamically matches the assigned role ({getRolePrefix(formData.role)}-2026-XXXX).
            </span>
          </div>

          <div className="ssis-form-group">
            <label className="ssis-label">System-Generated Account ID ({getRolePrefix(formData.role)})</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                readOnly
                className="ssis-input"
                style={{ fontFamily: 'monospace', fontWeight: '700', color: '#0F172A', paddingLeft: '36px', backgroundColor: '#F1F5F9', cursor: 'not-allowed' }}
                value={formData.accountId}
              />
              <Hash size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
            <span style={{ fontSize: '11.5px', color: '#059669', marginTop: '3px', display: 'block', fontWeight: '600' }}>
              🔒 System-generated unique identifier for {formData.role} role. Duplication is strictly prevented.
            </span>
          </div>

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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="ssis-form-group">
              <label className="ssis-label">Username (Optional)</label>
              <input
                type="text"
                className="ssis-input"
                placeholder="e.g. j.delacruz"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>

            <div className="ssis-form-group">
              <label className="ssis-label">Email (Optional)</label>
              <input
                type="email"
                className="ssis-input"
                placeholder="name@cuyotech.edu.ph"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          {formData.role === 'Student' && (
            <div className="ssis-form-group">
              <label className="ssis-label">Academic Program</label>
              <select
                className="ssis-select"
                value={formData.program}
                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
              >
                <option value="BS Computer Science">BS Computer Science</option>
                <option value="BS Information Technology">BS Information Technology</option>
              </select>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '26px' }}>
            <button
              type="button"
              onClick={() => setIsAddUserModalOpen(false)}
              className="ssis-btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="ssis-btn-primary">
              Provision Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
