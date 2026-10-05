import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Clock, Printer, Download, TrendingUp, DollarSign, CreditCard } from 'lucide-react';
import { printIsolatedElement, downloadPdfFromElement } from '../utils/pdfExport';

export const CashierReportsView = () => {
  const { paymentHistory, showToast } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState('Today (Feb 16, 2026)');
  const [isExporting, setIsExporting] = useState(false);

  // Method totals
  const cashPayments = paymentHistory.filter(p => p.method === 'Cash');
  const onlinePayments = paymentHistory.filter(p => p.method?.includes('Online') || p.method?.includes('GCash'));
  const cardPayments = paymentHistory.filter(p => p.method?.includes('Card') || p.method?.includes('Debit'));

  const cashTotal = cashPayments.reduce((acc, curr) => acc + curr.amount, 0);
  const onlineTotal = onlinePayments.reduce((acc, curr) => acc + curr.amount, 0);
  const cardTotal = cardPayments.reduce((acc, curr) => acc + curr.amount, 0);
  const grandTotal = paymentHistory.reduce((acc, curr) => acc + curr.amount, 0);

  const handlePrint = () => {
    printIsolatedElement('ssis-cashier-report-doc', 'Daily Cashier Collection Report');
    showToast('Sending Cashier Collection Report to printer...');
  };

  const handleDownload = async () => {
    setIsExporting(true);
    showToast('Generating official collection report PDF...');
    const success = await downloadPdfFromElement('ssis-cashier-report-doc', 'Daily_Collection_Report_Feb16.pdf', 'a4');
    setIsExporting(false);
    if (success) {
      showToast('Daily Collection Report downloaded as PDF.');
    }
  };

  return (
    <div className="ssis-canvas">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div className="ssis-page-tag">DFD 5.0 • CASHIER OPERATIONS</div>
          <h1 className="ssis-page-heading">Financial & Collection Reports</h1>
          <p className="ssis-page-desc">
            End-of-shift reconciliation and daily cashiering audit statements.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            className="ssis-select"
            style={{ width: '220px', padding: '8px 12px', fontSize: '13px' }}
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="Today (Feb 16, 2026)">Today (Feb 16, 2026)</option>
            <option value="Yesterday (Feb 15, 2026)">Yesterday (Feb 15, 2026)</option>
            <option value="Month of February 2026">Month of February 2026</option>
          </select>

          <button onClick={handlePrint} className="ssis-btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
            <Printer size={15} />
            <span>Print Report</span>
          </button>
          <button onClick={handleDownload} disabled={isExporting} className="ssis-btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
            <Download size={15} />
            <span>{isExporting ? 'Exporting...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div
        id="ssis-cashier-report-doc"
        className="printable-document ssis-card"
        style={{
          maxWidth: '860px',
          margin: '0 auto',
          padding: '40px 48px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #CBD5E1',
          borderRadius: '12px',
        }}
      >
        {/* Report Header */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #0F172A', paddingBottom: '20px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <img src="/images/pnc-logo.png" alt="PNC Logo" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '0.5px', color: '#0F172A', margin: 0 }}>
                CUYOTECH UNIVERSITY
              </h2>
              <p style={{ fontSize: '11px', color: '#475569', margin: '2px 0 0' }}>CuyoTech University • Office of the Cashier</p>
            </div>
          </div>
          <p style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '4px' }}>
            CASHIERING & TREASURY OFFICE
          </p>
          <div style={{ fontSize: '15px', fontWeight: '800', color: '#92400E', marginTop: '12px' }}>
            DAILY COLLECTION & SHIFT AUDIT REPORT
          </div>
          <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '4px' }}>
            Period: {selectedPeriod} • Counter No. 3 (Cashier: Leah Navarro)
          </div>
        </div>

        {/* Collection Breakdown Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
          <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Cash Collections</span>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', marginTop: '4px' }}>
              PHP {cashTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>{cashPayments.length} transactions</div>
          </div>

          <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Online (GCash/Maya)</span>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', marginTop: '4px' }}>
              PHP {onlineTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>{onlinePayments.length} transactions</div>
          </div>

          <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Card & Bank</span>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', marginTop: '4px' }}>
              PHP {cardTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>{cardPayments.length} transactions</div>
          </div>
        </div>

        {/* Transactions Detail Table */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.5px' }}>
            Audit Itemized Transactions
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid #CBD5E1', backgroundColor: '#F8FAFC' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left' }}>OR Number</th>
                <th style={{ padding: '8px 12px', textAlign: 'left' }}>Student Name</th>
                <th style={{ padding: '8px 12px', textAlign: 'left' }}>Method</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Amount Paid</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.map(p => (
                <tr key={p.id || p.reference} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: '700' }}>{p.reference}</td>
                  <td style={{ padding: '10px 12px' }}>{p.studentName || 'Student'}</td>
                  <td style={{ padding: '10px 12px', color: '#475569' }}>{p.method}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '700' }}>
                    PHP {Number(p.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid #0F172A', backgroundColor: '#FAF5F5' }}>
                <td colSpan="3" style={{ padding: '12px', fontWeight: '800', color: '#0F172A' }}>
                  GRAND TOTAL REVENUE COLLECTED
                </td>
                <td style={{ padding: '12px', textAlign: 'right', fontWeight: '900', fontSize: '15px', color: '#9F1239' }}>
                  PHP {grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Audit Sign-off */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', marginTop: '40px', borderTop: '1px solid #E2E8F0', paddingTop: '24px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid #64748B', width: '220px', margin: '40px auto 0', paddingTop: '4px' }}>
              <strong style={{ fontSize: '12.5px', color: '#0F172A', display: 'block' }}>LEAH NAVARRO</strong>
              <span style={{ fontSize: '11px', color: '#64748B' }}>Cashier In-Charge (Counter 3)</span>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid #64748B', width: '220px', margin: '40px auto 0', paddingTop: '4px' }}>
              <strong style={{ fontSize: '12.5px', color: '#0F172A', display: 'block' }}>VICTOR RAMOS</strong>
              <span style={{ fontSize: '11px', color: '#64748B' }}>University Auditor / Admin</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
