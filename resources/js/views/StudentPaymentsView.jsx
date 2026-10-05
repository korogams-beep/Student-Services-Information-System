import React from 'react';
import { useApp } from '../context/AppContext';

export const StudentPaymentsView = () => {
  const { assessedFees, paymentHistory, outstandingBalance, setActiveReceipt } = useApp();

  const handleViewReceipt = (payment) => {
    setActiveReceipt({
      reference: payment.reference,
      date: payment.date,
      amount: payment.amount,
      method: payment.method,
      student: 'Maria L. Santos',
      cashier: 'L. Navarro (Counter 3)',
    });
  };

  return (
    <div className="ssis-canvas">
      <div className="ssis-page-tag">DFD 5.0 • STUDENT FINANCE</div>
      <h1 className="ssis-page-heading">Fees and payment history</h1>
      <p className="ssis-page-desc">
        Second Semester AY 2025–2026 • Assessment updated February 10, 2026.
      </p>

      {/* Top Assessment Breakdown & Outstanding Balance Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '32px', marginBottom: '40px', alignItems: 'stretch' }}>
        {/* Left Assessment Table */}
        <div className="ssis-table-container">
          <table className="ssis-table">
            <thead>
              <tr>
                <th>Fee category</th>
                <th style={{ textAlign: 'right' }}>Assessment</th>
              </tr>
            </thead>
            <tbody>
              {assessedFees.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: '500' }}>{item.category}</td>
                  <td style={{ textAlign: 'right', fontWeight: '600' }}>
                    PHP {item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Highlight Pink Card matching Page 4 */}
        <div className="ssis-highlight-card" style={{ padding: '36px 28px' }}>
          <div style={{ fontSize: '14px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>
            OUTSTANDING BALANCE
          </div>
          <div style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '-0.5px' }}>
            PHP {outstandingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Bottom Payment History Table */}
      <div className="ssis-table-container">
        <table className="ssis-table">
          <thead>
            <tr>
              <th>Payment date</th>
              <th>Reference</th>
              <th>Amount</th>
              <th style={{ textAlign: 'right' }}>Receipt</th>
            </tr>
          </thead>
          <tbody>
            {paymentHistory.map(payment => (
              <tr key={payment.id}>
                <td>{payment.date}</td>
                <td style={{ fontWeight: '600', color: '#1E293B' }}>{payment.reference}</td>
                <td style={{ fontWeight: '600' }}>
                  PHP {payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    onClick={() => handleViewReceipt(payment)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#64748B',
                      fontSize: '13.5px',
                      cursor: 'pointer',
                      textDecoration: 'none',
                      fontWeight: '500',
                    }}
                    onMouseOver={e => e.target.style.color = '#0F172A'}
                    onMouseOut={e => e.target.style.color = '#64748B'}
                  >
                    Download Official Receipt
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ textAlign: 'right', marginTop: '60px', fontSize: '12px', color: '#94A3B8' }}>
        View Assessed Fees and Payment History — DFD 5.0
      </div>
    </div>
  );
};
