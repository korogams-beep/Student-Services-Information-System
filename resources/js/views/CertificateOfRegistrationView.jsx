import React from 'react';
import { useApp } from '../context/AppContext';
import { Printer, Download } from 'lucide-react';

export const CertificateOfRegistrationView = () => {
  const { showToast } = useApp();

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    showToast('Certificate of Registration (COR) downloaded as PDF.');
  };

  return (
    <div className="ssis-canvas">
      <div className="ssis-page-tag">OFFICIAL DOCUMENT PREVIEW</div>
      <h1 className="ssis-page-heading">Certificate of Registration</h1>
      <p className="ssis-page-desc">
        Review your finalized registration before printing or downloading a PDF copy.
      </p>

      {/* Official Document Card matching Page 5 */}
      <div
        className="ssis-card"
        style={{
          maxWidth: '820px',
          margin: '0 auto',
          padding: '50px 60px',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* Document Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '1px', color: '#0F172A' }}>
            NORTHRIDGE STATE UNIVERSITY
          </h2>
          <p style={{ fontSize: '13px', fontWeight: '600', color: '#64748B', letterSpacing: '1.5px', marginTop: '4px' }}>
            CERTIFICATE OF REGISTRATION
          </p>
          <div style={{ fontSize: '14.5px', fontWeight: '600', color: '#1E293B', marginTop: '16px' }}>
            Maria L. Santos • 2024-01847 • BS Computer Science
          </div>
          <div style={{ fontSize: '13.5px', color: '#64748B', marginTop: '4px' }}>
            Second Semester, AY 2025–2026
          </div>
        </div>

        {/* Subjects Schedule Table */}
        <div style={{ borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', padding: '24px 0', marginBottom: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ fontWeight: '600', color: '#0F172A', minWidth: '80px' }}>CS 101</span>
              <span style={{ flex: 1, paddingLeft: '16px', color: '#334155' }}>Introduction to Computing</span>
              <span style={{ minWidth: '70px', textAlign: 'center', color: '#64748B' }}>3 units</span>
              <span style={{ minWidth: '130px', textAlign: 'right', color: '#475569' }}>M/W 9:00–10:30</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ fontWeight: '600', color: '#0F172A', minWidth: '80px' }}>MATH 121</span>
              <span style={{ flex: 1, paddingLeft: '16px', color: '#334155' }}>Calculus II</span>
              <span style={{ minWidth: '70px', textAlign: 'center', color: '#64748B' }}>3 units</span>
              <span style={{ minWidth: '130px', textAlign: 'right', color: '#475569' }}>T/Th 10:30–12:00</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ fontWeight: '600', color: '#0F172A', minWidth: '80px' }}>CS 115</span>
              <span style={{ flex: 1, paddingLeft: '16px', color: '#334155' }}>Data Structures</span>
              <span style={{ minWidth: '70px', textAlign: 'center', color: '#64748B' }}>4 units</span>
              <span style={{ minWidth: '130px', textAlign: 'right', color: '#475569' }}>T/Th 13:00–15:00</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ fontWeight: '600', color: '#0F172A', minWidth: '80px' }}>ENG 103</span>
              <span style={{ flex: 1, paddingLeft: '16px', color: '#334155' }}>Academic Writing</span>
              <span style={{ minWidth: '70px', textAlign: 'center', color: '#64748B' }}>3 units</span>
              <span style={{ minWidth: '130px', textAlign: 'right', color: '#475569' }}>M/W 13:00–14:30</span>
            </div>
          </div>
        </div>

        {/* Totals Line */}
        <div style={{ textAlign: 'center', fontSize: '14.5px', fontWeight: '700', color: '#1E293B', marginBottom: '40px' }}>
          Total assessed fees: PHP 43,550.00 • Units enrolled: 21
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <button onClick={handlePrint} className="ssis-btn-secondary" style={{ minWidth: '160px' }}>
            <Printer size={16} />
            <span>Print COR</span>
          </button>
          <button onClick={handleDownload} className="ssis-btn-primary" style={{ minWidth: '180px' }}>
            <Download size={16} />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      <div style={{ textAlign: 'right', marginTop: '60px', fontSize: '12px', color: '#94A3B8' }}>
        View and Print COR
      </div>
    </div>
  );
};
