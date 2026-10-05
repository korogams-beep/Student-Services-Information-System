import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Printer, CheckCircle, Download } from 'lucide-react';
import { printIsolatedElement, downloadPdfFromElement } from '../utils/pdfExport';

export const ReceiptModal = () => {
  const { activeReceipt, setActiveReceipt, showToast } = useApp();
  const [isExporting, setIsExporting] = useState(false);

  if (!activeReceipt) return null;

  const orNumber = activeReceipt.reference || activeReceipt.or_number || 'OR-2026-0842';
  const studentName = activeReceipt.student || activeReceipt.studentName || 'Student';
  const studentId = activeReceipt.student_id || activeReceipt.studentId || '2026-0001';

  const handlePrintReceipt = () => {
    printIsolatedElement('ssis-official-receipt-paper', `Receipt - ${orNumber}`);
    showToast(`Printing Official Receipt ${orNumber}...`);
  };

  const handleDownloadReceiptPdf = async () => {
    setIsExporting(true);
    showToast('Generating official receipt PDF...');
    const filename = `Receipt_${orNumber}_${studentName.replace(/\s+/g, '_')}.pdf`;
    const success = await downloadPdfFromElement('ssis-official-receipt-paper', filename, 'receipt');
    setIsExporting(false);
    if (success) {
      showToast(`Downloaded ${filename} successfully!`);
    }
  };

  return (
    <div className="ssis-modal-backdrop" onClick={() => setActiveReceipt(null)}>
      <div className="ssis-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="ssis-modal-header no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={22} color="#16A34A" />
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>Official Payment Receipt</h3>
          </div>
          <button
            onClick={() => setActiveReceipt(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Receipt Paper Design - Isolated with ID */}
        <div id="ssis-official-receipt-paper" className="receipt-paper printable-document">
          <div style={{ textAlign: 'center', borderBottom: '1px dashed #94A3B8', paddingBottom: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <img src="/images/pnc-logo.png" alt="CuyoTech Logo" style={{ width: '44px', height: '44px', objectFit: 'contain' }} />
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '0.5px', color: '#0F172A', margin: 0 }}>
                  CUYOTECH UNIVERSITY
                </h2>
                <p style={{ fontSize: '11px', color: '#475569', margin: 0 }}>CuyoTech University • Office of the Cashier</p>
              </div>
            </div>
            <p style={{ fontSize: '11.5px', color: '#475569', fontWeight: '700', marginTop: '4px' }}>CASHIERING & FINANCIAL SERVICES OFFICE</p>
            <p style={{ fontSize: '10.5px', color: '#64748B', letterSpacing: '1px' }}>OFFICIAL PAYMENT RECEIPT</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '12px' }}>
            <span style={{ color: '#475569' }}>OR Number:</span>
            <span style={{ fontWeight: '700', fontFamily: 'monospace' }}>{orNumber}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '12px' }}>
            <span style={{ color: '#475569' }}>Date / Time:</span>
            <span>{activeReceipt.date || 'February 16, 2026 • 10:42 AM'}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '12px' }}>
            <span style={{ color: '#475569' }}>Student Name:</span>
            <span style={{ fontWeight: '600' }}>{studentName}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '16px' }}>
            <span style={{ color: '#475569' }}>Student ID:</span>
            <span style={{ fontFamily: 'monospace' }}>{studentId}</span>
          </div>

          <div style={{ borderTop: '1px solid #CBD5E1', borderBottom: '1px solid #CBD5E1', padding: '12px 0', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
              <span>Tuition & Assessment Payment</span>
              <span style={{ fontWeight: '700' }}>PHP {Number(activeReceipt.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B' }}>
              <span>Payment Method:</span>
              <span style={{ fontWeight: '500' }}>{activeReceipt.method || 'Cash'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '800', marginBottom: '24px' }}>
            <span>TOTAL AMOUNT PAID:</span>
            <span>PHP {Number(activeReceipt.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>

          <div style={{ textAlign: 'center', fontSize: '11px', color: '#64748B', borderTop: '1px dashed #CBD5E1', paddingTop: '16px' }}>
            <p style={{ margin: '0 0 4px 0' }}>Cashier In-Charge: {activeReceipt.cashier || 'L. Navarro (Counter 3)'}</p>
            <p style={{ margin: 0, fontStyle: 'italic' }}>System Generated Official Receipt • CuyoTech University</p>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="ssis-modal-actions no-print" style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '24px' }}>
          <button
            onClick={handlePrintReceipt}
            className="ssis-btn-secondary"
            style={{ minWidth: '150px' }}
          >
            <Printer size={16} />
            <span>Print Receipt</span>
          </button>
          <button
            onClick={handleDownloadReceiptPdf}
            disabled={isExporting}
            className="ssis-btn-primary"
            style={{ minWidth: '160px' }}
          >
            <Download size={16} />
            <span>{isExporting ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
