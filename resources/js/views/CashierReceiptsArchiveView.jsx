import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FileText, Printer, Download, Eye, ShieldCheck } from 'lucide-react';
import { printIsolatedElement, downloadPdfFromElement } from '../utils/pdfExport';

export const CashierReceiptsArchiveView = () => {
  const { paymentHistory, setActiveReceipt, searchQuery, showToast } = useApp();

  const filteredReceipts = paymentHistory.filter(r => 
    !searchQuery ||
    r.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.studentId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.method?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenReceipt = (receipt) => {
    setActiveReceipt({
      reference: receipt.reference,
      date: receipt.date,
      amount: receipt.amount,
      method: receipt.method || 'Cash',
      student: receipt.studentName || 'Student',
      studentId: receipt.studentId || '2026-0001',
      cashier: receipt.cashier || 'L. Navarro (Counter 3)',
    });
  };

  const handleQuickDownload = async (receipt) => {
    // Open in modal and trigger clean PDF download
    handleOpenReceipt(receipt);
    showToast(`Generating downloadable PDF for ${receipt.reference}...`);
  };

  return (
    <div className="ssis-canvas">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div className="ssis-page-tag">CUYOTECH UNIVERSITY • CASHIER OPERATIONS</div>
          <h1 className="ssis-page-heading">Official Receipts Archive</h1>
          <p className="ssis-page-desc">
            Digital repository of all generated official government and university cash receipts.
          </p>
        </div>
      </div>

      {/* Receipts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {filteredReceipts.map(receipt => (
          <div key={receipt.id || receipt.reference} className="ssis-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--card-border, #334155)', paddingBottom: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#D97706', backgroundColor: 'rgba(217, 119, 6, 0.15)', padding: '3px 8px', borderRadius: '4px' }}>
                  OFFICIAL RECEIPT
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted, #94A3B8)' }}>
                  {receipt.date}
                </span>
              </div>

              <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main, #F8FAFC)', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                {receipt.reference}
              </div>

              <div style={{ marginTop: '12px', fontSize: '13.5px' }}>
                <span style={{ color: 'var(--text-muted, #94A3B8)', display: 'block', fontSize: '11.5px', textTransform: 'uppercase', fontWeight: '600' }}>Student Payer</span>
                <strong style={{ color: 'var(--text-main, #F8FAFC)' }}>{receipt.studentName || 'Student'}</strong>
                <span style={{ color: 'var(--text-muted, #94A3B8)', fontSize: '12px', display: 'block' }}>
                  ID: {receipt.studentId || '2026-0001'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', backgroundColor: 'var(--surface-color, rgba(255,255,255,0.04))', padding: '10px 14px', borderRadius: '8px' }}>
                <span style={{ fontSize: '12.5px', color: 'var(--text-muted, #94A3B8)' }}>Amount Paid:</span>
                <strong style={{ fontSize: '15px', color: 'var(--text-main, #F8FAFC)' }}>
                  PHP {Number(receipt.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </strong>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-muted, #94A3B8)', marginTop: '8px' }}>
                Method: <strong style={{ color: 'var(--text-main, #F8FAFC)' }}>{receipt.method || 'Cash'}</strong> • Cashier: <strong style={{ color: 'var(--text-main, #F8FAFC)' }}>{receipt.cashier || 'L. Navarro'}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '20px', borderTop: '1px solid var(--card-border, #334155)', paddingTop: '14px' }}>
              <button
                onClick={() => handleOpenReceipt(receipt)}
                className="ssis-btn-secondary"
                style={{ flex: 1, padding: '8px 12px', fontSize: '12.5px' }}
              >
                <Eye size={13} />
                <span>View & Print</span>
              </button>
              <button
                onClick={() => handleQuickDownload(receipt)}
                className="ssis-btn-primary"
                style={{ padding: '8px 14px', fontSize: '12.5px' }}
              >
                <Download size={13} />
                <span>PDF</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'right', marginTop: '60px', fontSize: '12px', color: '#94A3B8' }}>
        Official Receipts Ledger — DFD 5.0
      </div>
    </div>
  );
};
