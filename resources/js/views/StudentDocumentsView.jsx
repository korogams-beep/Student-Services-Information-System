import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const StudentDocumentsView = () => {
  const { documentRequests, setDocumentRequests, showToast, recordAuditLog } = useApp();
  const [docType, setDocType] = useState('Transcript of Records');
  const [purpose, setPurpose] = useState('Graduate school application');
  const [copies, setCopies] = useState('2 copies');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!purpose.trim()) {
      alert('Please state the purpose of the document request.');
      return;
    }

    const numCopies = parseInt(copies) || 1;
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

    const newRequest = {
      id: Date.now(),
      request: docType,
      submitted: today,
      status: 'Pending',
      copies: numCopies,
      purpose,
    };

    setDocumentRequests(prev => [newRequest, ...prev]);
    showToast(`Request for ${docType} submitted successfully!`);
    recordAuditLog('Document requested', `Maria Santos • ${docType} (${numCopies} copies)`);

    fetch('/api/documents/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: 1,
        document_type: docType,
        purpose,
        number_of_copies: numCopies,
      }),
    }).catch(err => console.log('Client-side synced', err));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Ready for Release':
        return <span className="badge badge-success">Ready for Release</span>;
      case 'Approved':
        return <span className="badge badge-review">Approved</span>;
      case 'Pending':
      default:
        return <span className="badge badge-pending">Pending</span>;
    }
  };

  return (
    <div className="ssis-canvas">
      <div className="ssis-page-tag">DFD 4.0 • RECORDS SERVICES</div>
      <h1 className="ssis-page-heading">Request an academic document</h1>
      <p className="ssis-page-desc">
        Submit a new request and track its release status.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '36px', alignItems: 'start' }}>
        {/* Left Form Card matching Page 7 */}
        <div className="ssis-card">
          <h3 className="ssis-card-title">New request</h3>
          <form onSubmit={handleSubmit}>
            <div className="ssis-form-group">
              <label className="ssis-label">Document type</label>
              <select
                className="ssis-select"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
              >
                <option value="Transcript of Records">Transcript of Records</option>
                <option value="Certificate of Enrollment">Certificate of Enrollment</option>
                <option value="Good Moral Certificate">Good Moral Certificate</option>
                <option value="Certified True Copy of Grades">Certified True Copy of Grades</option>
                <option value="Honorable Dismissal">Honorable Dismissal</option>
              </select>
            </div>

            <div className="ssis-form-group">
              <label className="ssis-label">Purpose</label>
              <input
                type="text"
                className="ssis-input"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Graduate school application"
                required
              />
            </div>

            <div className="ssis-form-group">
              <label className="ssis-label">Number of copies</label>
              <select
                className="ssis-select"
                value={copies}
                onChange={(e) => setCopies(e.target.value)}
              >
                <option value="1 copy">1 copy</option>
                <option value="2 copies">2 copies</option>
                <option value="3 copies">3 copies</option>
                <option value="4 copies">4 copies</option>
              </select>
            </div>

            <button
              type="submit"
              className="ssis-btn-primary"
              style={{ width: '100%', marginTop: '10px', padding: '13px' }}
            >
              Submit Request
            </button>
          </form>
        </div>

        {/* Right Status Table matching Page 7 */}
        <div className="ssis-table-container">
          <table className="ssis-table">
            <thead>
              <tr>
                <th>Request</th>
                <th>Submitted</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {documentRequests.map(doc => (
                <tr key={doc.id}>
                  <td style={{ fontWeight: '500' }}>{doc.request}</td>
                  <td style={{ color: '#475569' }}>{doc.submitted}</td>
                  <td>{getStatusBadge(doc.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ textAlign: 'right', marginTop: '60px', fontSize: '12px', color: '#94A3B8' }}>
        Document Requests — DFD 4.0
      </div>
    </div>
  );
};
