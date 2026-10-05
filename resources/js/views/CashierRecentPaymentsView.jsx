import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Receipt, Printer, Eye, Download, Search, CheckCircle } from 'lucide-react';
import { printIsolatedElement, downloadPdfFromElement } from '../utils/pdfExport';

export const CashierRecentPaymentsView = () => {
  const { paymentHistory, setActiveReceipt, searchQuery, showToast } = useApp();
  const [filterMethod, setFilterMethod] = useState('ALL');

  const filteredPayments = paymentHistory.filter(payment => {
    const matchesSearch = !searchQuery ||
      payment.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.studentId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.method?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMethod = filterMethod === 'ALL' || payment.method === filterMethod;
    return matchesSearch && matchesMethod;
  });

  const totalCollected = filteredPayments.reduce((acc, curr) => acc + curr.amount, 0);

  const handleViewReceipt = (payment) => {
    setActiveReceipt({
      reference: payment.reference,
      date: payment.date,
      amount: payment.amount,
      method: payment.method || 'Cash',
      student: payment.studentName || 'Student',
      studentId: payment.studentId || '2026-0001',
      cashier: payment.cashier || 'L. Navarro (Counter 3)',
    });
  };

  return (
    <div className="ssis-canvas">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div className="ssis-page-tag">CUYOTECH UNIVERSITY • CASHIER OPERATIONS</div>
          <h1 className="ssis-page-heading">Recent Payments Ledger</h1>
          <p className="ssis-page-desc">
            Complete transaction record of student tuition and fees collected at Counter 3.
          </p>
        </div>

        {/* Filter by Payment Method */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748B' }}>Method:</span>
          <select
            className="ssis-select"
            style={{ width: '190px', padding: '8px 12px', fontSize: '13px' }}
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
          >
            <option value="ALL">All Payment Methods</option>
            <option value="Cash">Cash</option>
            <option value="Online (GCash/Maya)">Online (GCash/Maya)</option>
            <option value="Debit/Credit Card">Debit/Credit Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        <div className="ssis-card" style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Filtered Collections</div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A', marginTop: '6px' }}>
            PHP {totalCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '12px', color: '#166534', marginTop: '4px', fontWeight: '600' }}>
            ✓ Verified with University Vault
          </div>
        </div>

        <div className="ssis-card" style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Transactions Count</div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A', marginTop: '6px' }}>
            {filteredPayments.length} Receipts
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
            Active cashier shift
          </div>
        </div>

        <div className="ssis-card" style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Cashier on Duty</div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#92400E', marginTop: '6px' }}>
            Counter 3
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
            Leah Navarro • Term 2025–2026
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="ssis-table-container">
        <table className="ssis-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Official Receipt #</th>
              <th>Student Payer</th>
              <th>Payment Method</th>
              <th style={{ textAlign: 'right' }}>Amount Paid</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map(p => (
              <tr key={p.id || p.reference}>
                <td style={{ color: '#475569', fontSize: '13.5px' }}>{p.date}</td>
                <td style={{ fontWeight: '700', color: '#0F172A' }}>
                  <span style={{ fontFamily: 'monospace', backgroundColor: '#F1F5F9', padding: '3px 8px', borderRadius: '4px' }}>
                    {p.reference}
                  </span>
                </td>
                <td>
                  <strong style={{ color: '#0F172A' }}>{p.studentName || 'Student'}</strong>
                  <span style={{ color: '#64748B', fontSize: '12px', display: 'block' }}>
                    {p.studentId || '2026-0001'}
                  </span>
                </td>
                <td style={{ color: '#334155' }}>{p.method || 'Cash'}</td>
                <td style={{ textAlign: 'right', fontWeight: '700', color: '#0F172A' }}>
                  PHP {Number(p.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className="badge badge-success">Posted</span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    onClick={() => handleViewReceipt(p)}
                    className="ssis-btn-secondary"
                    style={{ padding: '6px 14px', fontSize: '12.5px' }}
                  >
                    <Eye size={13} />
                    <span>View OR</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ textAlign: 'right', marginTop: '60px', fontSize: '12px', color: '#94A3B8' }}>
        Recent Student Payments — DFD 5.0
      </div>
    </div>
  );
};
