import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FileText, CheckCircle2, Clock, Check, X, Filter, Printer } from 'lucide-react';

export const RegistrarDocumentsQueueView = () => {
  const { 
    currentUser,
    registrarDocumentQueue, 
    updateDocumentRequestStatus,
    documentRequests,
    showToast, 
    recordAuditLog,
    searchQuery 
  } = useApp();

  const [docFilter, setDocFilter] = useState('ALL');

  const allRequests = [
    ...registrarDocumentQueue,
    ...documentRequests.filter(d => !registrarDocumentQueue.some(q => q.id === d.id || String(q.id) === String(d.id)))
  ];

  const filteredRequests = allRequests.filter(req => {
    const q = searchQuery.toLowerCase();
    const studentName = req.studentName || req.student || 'Student';
    const docName = req.document || req.request || '';
    const matchesSearch = !q || studentName.toLowerCase().includes(q) || docName.toLowerCase().includes(q);
    const matchesFilter = docFilter === 'ALL' || req.status === docFilter;
    return matchesSearch && matchesFilter;
  });

  const handleUpdateStatus = (id, newStatus) => {
    updateDocumentRequestStatus(id, newStatus);
  };

  return (
    <div className="ssis-canvas">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div className="ssis-page-tag">CUYOTECH UNIVERSITY • REGISTRAR'S OFFICE</div>
          <h1 className="ssis-page-heading">Document Requests & Credentials Queue</h1>
          <p className="ssis-page-desc">
            Process, evaluate, and release official academic credentials (TOR, Certifications, Good Moral).
          </p>
        </div>

        {/* Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} color="#64748B" />
          <select
            className="ssis-select"
            style={{ width: '180px' }}
            value={docFilter}
            onChange={(e) => setDocFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending Review</option>
            <option value="Approved">Approved</option>
            <option value="Ready for Release">Ready for Release</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="ssis-table-container">
        {filteredRequests.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: '#64748B' }}>
            <FileText size={40} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#1E293B', marginBottom: '6px' }}>
              No Document Requests in Queue
            </h4>
            <p style={{ fontSize: '13.5px', maxWidth: '420px', margin: '0 auto' }}>
              When students apply for credentials via their student portal, their requests will appear here for Registrar processing.
            </p>
          </div>
        ) : (
          <table className="ssis-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Requested Document</th>
                <th>Purpose / Copies</th>
                <th>Date Submitted</th>
                <th style={{ textAlign: 'center' }}>Current Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map(req => {
                const sName = req.studentName || req.student || 'Student';
                const sId = req.studentId || req.student_id || '2026-0001';
                const docTitle = req.document || req.request || 'Academic Document';

                return (
                  <tr key={req.id}>
                    <td>
                      <div style={{ fontWeight: '600', color: '#0F172A' }}>{sName}</div>
                      <div style={{ fontSize: '12px', color: '#64748B', fontFamily: 'monospace' }}>{sId}</div>
                    </td>
                    <td style={{ fontWeight: '600', color: '#0F172A' }}>
                      {docTitle}
                    </td>
                    <td style={{ color: '#475569', fontSize: '13px' }}>
                      <div>{req.purpose || 'Official verification'}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748B' }}>{req.copies || 1} copy</div>
                    </td>
                    <td style={{ color: '#475569', fontSize: '13px' }}>
                      {req.submitted || req.date || 'Feb 16, 2026'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${
                        req.status === 'Ready for Release' || req.status === 'Released' ? 'badge-success' :
                        req.status === 'Approved' ? 'badge-review' : 'badge-pending'
                      }`}>
                        {req.status}
                      </span>
                      {req.approvedBy && (
                        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                          by {req.approvedBy}
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center' }}>
                        {req.status === 'Pending' && (
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'Approved')}
                            className="ssis-btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                            title="Approve Processing"
                          >
                            <CheckCircle2 size={14} />
                            <span>Approve</span>
                          </button>
                        )}
                        {(req.status === 'Pending' || req.status === 'Approved') && (
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'Ready for Release')}
                            className="ssis-btn-primary"
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                            title="Mark Ready for Release"
                          >
                            <Check size={14} />
                            <span>Release</span>
                          </button>
                        )}
                        {req.status === 'Ready for Release' && (
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'Released')}
                            className="ssis-btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '12px', borderColor: '#86EFAC', color: '#166534', background: '#F0FDF4' }}
                            title="Mark as Claimed / Handed Over"
                          >
                            <CheckCircle2 size={14} color="#16A34A" />
                            <span>Claimed</span>
                          </button>
                        )}
                        {req.status === 'Released' && (
                          <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={14} /> Claimed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ textAlign: 'right', marginTop: '60px', fontSize: '12px', color: '#94A3B8' }}>
        CuyoTech University — Office of the University Registrar
      </div>
    </div>
  );
};
