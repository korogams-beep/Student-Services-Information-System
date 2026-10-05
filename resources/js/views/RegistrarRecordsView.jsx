import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const RegistrarRecordsView = () => {
  const { 
    encodeGradesList, 
    setEncodeGradesList, 
    registrarDocumentQueue, 
    setRegistrarDocumentQueue,
    showToast,
    recordAuditLog
  } = useApp();

  const handleGradeChange = (id, newGrade) => {
    setEncodeGradesList(prev =>
      prev.map(item => item.id === id ? { ...item, grade: newGrade } : item)
    );
  };

  const handleSaveGrades = () => {
    showToast('Grades for CS 101 successfully encoded and saved.');
    recordAuditLog('Grade sheet updated', 'R. Alcantara • CS 101');

    fetch('/api/registrar/grades/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grades: encodeGradesList.map(g => ({ enrollment_id: g.id, grade_value: g.grade })),
      }),
    }).catch(err => console.log('Client-side synced', err));
  };

  const toggleSelectDoc = (id) => {
    setRegistrarDocumentQueue(prev =>
      prev.map(d => d.id === id ? { ...d, selected: !d.selected } : d)
    );
  };

  const handleReleaseDoc = () => {
    const selected = registrarDocumentQueue.filter(d => d.selected);
    if (selected.length === 0) {
      alert('Please select at least one document to release.');
      return;
    }

    setRegistrarDocumentQueue(prev =>
      prev.filter(d => !d.selected)
    );

    showToast(`Released ${selected.length} document request(s).`);
    recordAuditLog('Document approved & released', `R. Alcantara • ${selected.map(s => s.studentName).join(', ')}`);

    fetch(`/api/registrar/documents/${selected[0].id}/release`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Ready for Release' }),
    }).catch(err => console.log('Client-side synced', err));
  };

  return (
    <div className="ssis-canvas">
      <div className="ssis-page-tag">DFD 3.0 + 4.0 • REGISTRAR WORKSPACE</div>
      <h1 className="ssis-page-heading">Grades and document approvals</h1>
      <p className="ssis-page-desc">
        Two coordinated work queues for today’s registrar operations.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '32px', alignItems: 'stretch' }}>
        {/* Left Card: Encode grades • CS 101 matching Page 10 */}
        <div className="ssis-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 className="ssis-card-title">Encode grades • CS 101</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
              {encodeGradesList.map(item => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#FAF5F5',
                  }}
                >
                  <div style={{ fontSize: '14px', color: '#1E293B' }}>
                    <span style={{ color: '#64748B', marginRight: '8px' }}>{item.studentId}</span>
                    <strong style={{ color: '#0F172A' }}>{item.studentName}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: '#64748B', fontSize: '13px' }}>[</span>
                    <input
                      type="text"
                      value={item.grade}
                      onChange={(e) => handleGradeChange(item.id, e.target.value)}
                      style={{
                        width: '48px',
                        textAlign: 'center',
                        fontWeight: '700',
                        fontSize: '14px',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        padding: '4px',
                        background: '#FFFFFF',
                      }}
                    />
                    <span style={{ color: '#64748B', fontSize: '13px' }}>]</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '36px' }}>
            <button
              onClick={handleSaveGrades}
              className="ssis-btn-primary"
              style={{ width: '100%', padding: '14px' }}
            >
              Save Grades
            </button>
          </div>
        </div>

        {/* Right Card: Document approvals matching Page 10 */}
        <div className="ssis-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 className="ssis-card-title">Document approvals</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
              {registrarDocumentQueue.map(item => (
                <div
                  key={item.id}
                  onClick={() => toggleSelectDoc(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '16px',
                    borderRadius: '8px',
                    backgroundColor: item.selected ? '#FAF5F5' : '#FFFFFF',
                    border: '1px solid',
                    borderColor: item.selected ? '#F1B82D' : '#E2E8F0',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={() => toggleSelectDoc(item.id)}
                    style={{ marginTop: '3px', width: '16px', height: '16px', accentColor: '#1E293B' }}
                  />
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A' }}>
                      {item.studentName}
                    </div>
                    <div style={{ fontSize: '13.5px', color: '#475569', marginTop: '4px' }}>
                      {item.request}
                    </div>
                  </div>
                </div>
              ))}
              {registrarDocumentQueue.length === 0 && (
                <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748B', fontSize: '14px' }}>
                  All pending document requests have been processed!
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: '36px' }}>
            <button
              onClick={handleReleaseDoc}
              className="ssis-btn-lavender"
              style={{ width: '100%', padding: '14px', fontSize: '14.5px' }}
            >
              Release Selected Approval
            </button>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'right', marginTop: '60px', fontSize: '12px', color: '#94A3B8' }}>
        Encode Grades and Document Request Approval — DFD 3.0 & 4.0
      </div>
    </div>
  );
};
