import React from 'react';
import { useApp } from '../context/AppContext';
import { Printer, Download, X, CheckCircle } from 'lucide-react';

export const ReceiptModal = () => {
  const { activeReceipt, setActiveReceipt, showToast } = useApp();

  if (!activeReceipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    showToast(`Official Receipt ${activeReceipt.reference || activeReceipt.or_number} downloaded.`);
  };

  return (
    <div className="ssis-modal-backdrop" onClick={() => setActiveReceipt(null)}>
      <div className="ssis-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={22} color="#16A34A" />
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>Official Receipt</h3>
          </div>
          <button
            onClick={() => setActiveReceipt(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Receipt Paper Design */}
        <div className="receipt-paper">
          <div style={{ textAlign: 'center', borderBottom: '1px dashed #94A3B8', paddingBottom: '16px', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '1px' }}>NORTHRIDGE STATE UNIVERSITY</h2>
            <p style={{ fontSize: '12px', color: '#475569' }}>CASHIERING & FINANCIAL SERVICES OFFICE</p>
            <p style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>OFFICIAL PAYMENT RECEIPT</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '12px' }}>
            <span style={{ color: '#475569' }}>OR Number:</span>
            <span style={{ fontWeight: '700' }}>{activeReceipt.reference || activeReceipt.or_number}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '12px' }}>
            <span style={{ color: '#475569' }}>Date / Time:</span>
            <span>{activeReceipt.date || 'February 16, 2026 • 10:42 AM'}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '12px' }}>
            <span style={{ color: '#475569' }}>Student Name:</span>
            <span style={{ fontWeight: '600' }}>{activeReceipt.student || 'Maria L. Santos'}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '16px' }}>
            <span style={{ color: '#475569' }}>Student ID:</span>
            <span>2024-01847</span>
          </div>

          <div style={{ borderTop: '1px solid #CBD5E1', borderBottom: '1px solid #CBD5E1', padding: '12px 0', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
              <span>Tuition & Assessment Payment</span>
              <span style={{ fontWeight: '700' }}>PHP {Number(activeReceipt.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B' }}>
              <span>Payment Method:</span>
              <span>{activeReceipt.method || 'Cash'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '800', marginBottom: '20px' }}>
            <span>TOTAL AMOUNT PAID:</span>
            <span style={{ color: '#0F172A' }}>PHP {Number(activeReceipt.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>

          <div style={{ textAlign: 'center', fontSize: '11px', color: '#64748B', borderTop: '1px dashed #94A3B8', paddingTop: '12px' }}>
            <p>Cashier In-Charge: <strong>{activeReceipt.cashier || 'L. Navarro (Counter 3)'}</strong></p>
            <p style={{ marginTop: '4px' }}>System Generated Official Receipt • SSIS DFD 5.0</p>
          </div>
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
          <button onClick={handlePrint} className="ssis-btn-secondary">
            <Printer size={16} />
            <span>Print Receipt</span>
          </button>
          <button onClick={handleDownload} className="ssis-btn-primary">
            <Download size={16} />
            <span>Download PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
