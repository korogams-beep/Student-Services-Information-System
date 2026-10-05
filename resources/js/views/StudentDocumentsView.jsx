import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FileText, Clock, Send } from 'lucide-react';

export const StudentDocumentsView = () => {
  const { currentUser, documentRequests, submitDocumentRequest, showToast, recordAuditLog } = useApp();
  const [docType, setDocType] = useState('Transcript of Records');
  const [purpose, setPurpose] = useState('Graduate school application');
  const [copies, setCopies] = useState('1 copy');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!purpose.trim()) {
      alert('Please state the purpose of the document request.');
      return;
    }

    const numCopies = parseInt(copies) || 1;
    submitDocumentRequest({
      docType,
      purpose,
      copies: numCopies,
    });
    setPurpose('');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Released':
      case 'Ready for Release':
        return <span className="badge badge-success">{status}</span>;
      case 'Approved':
        return <span className="badge badge-review">Approved</span>;
      case 'Pending':
      default:
        return <span className="badge badge-pending">Pending</span>;
    }
  };

  return (
    <div className="ssis-canvas">
      <div className="ssis-page-tag">CUYOTECH UNIVERSITY • RECORDS SERVICES</div>
      <h1 className="ssis-page-heading">Request an academic document</h1>
      <p className="ssis-page-desc">
        Select the required document and submit your request for Registrar processing.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'start' }}>
        {/* Left Form */}
        <div className="ssis-card">
          <h3 className="ssis-card-title">New Document Request</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label className="ssis-label">Document type</label>
              <select
                className="ssis-select"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
              >
                <option value="Transcript of Records">Transcript of Records (TOR)</option>
                <option value="Certificate of Enrollment">Certificate of Enrollment (COE)</option>
                <option value="Good Moral Certificate">Good Moral Certificate</option>
                <option value="Certificate of Grades">Certificate of Grades</option>
                <option value="Honorable Dismissal">Honorable Dismissal / Transfer Credential</option>
              </select>
            </div>

            <div>
              <label className="ssis-label">Purpose</label>
              <input
                type="text"
                className="ssis-input"
                placeholder="e.g. Scholarship requirement, Job application, Board Exam..."
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="ssis-label">Number of copies</label>
              <select
                className="ssis-select"
                value={copies}
                onChange={(e) => setCopies(e.target.value)}
              >
                <option value="1 copy">1 copy</option>
                <option value="2 copies">2 copies</option>
                <option value="3 copies">3 copies</option>
              </select>
            </div>

            <button type="submit" className="ssis-btn-primary" style={{ marginTop: '10px' }}>
              <Send size={16} />
              <span>Submit Request</span>
            </button>
          </form>
        </div>

        {/* Right Request History */}
        <div className="ssis-table-container">
          <h3 className="ssis-card-title" style={{ padding: '20px 24px 0', marginBottom: 0 }}>
            Request History
          </h3>

          {documentRequests.length === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', color: '#64748B' }}>
              <Clock size={36} color="#94A3B8" style={{ margin: '0 auto 10px' }} />
              <p style={{ fontSize: '13.5px', margin: 0 }}>
                No document requests submitted yet. Use the form to submit an official request to the Registrar.
              </p>
            </div>
          ) : (
            <table className="ssis-table">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Submitted</th>
                  <th style={{ textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {documentRequests.map(doc => (
                  <tr key={doc.id}>
                    <td>
                      <div style={{ fontWeight: '600', color: '#0F172A' }}>{doc.request}</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>{doc.purpose} ({doc.copies} copy)</div>
                    </td>
                    <td style={{ color: '#475569', fontSize: '13px' }}>{doc.submitted}</td>
                    <td style={{ textAlign: 'right' }}>
                      {getStatusBadge(doc.status)}
                      {doc.approvedBy && (
                        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '3px' }}>
                          by {doc.approvedBy}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div style={{ textAlign: 'right', marginTop: '60px', fontSize: '12px', color: '#94A3B8' }}>
        CuyoTech University — Office of the University Registrar
      </div>
    </div>
  );
};
