import React from 'react';
import { useApp } from '../context/AppContext';
import { CreditCard, Receipt, AlertCircle } from 'lucide-react';

export const StudentPaymentsView = () => {
  const { 
    currentUser, 
    assessedFees, 
    paymentHistory, 
    outstandingBalance, 
    setActiveReceipt 
  } = useApp();

  const activeStudentId = currentUser?.student_id_number || currentUser?.studentId || '2026-0001';
  const studentPayments = paymentHistory.filter(p => !p.studentId || p.studentId === activeStudentId);

  const handleViewReceipt = (payment) => {
    setActiveReceipt({
      reference: payment.reference,
      date: payment.date,
      amount: payment.amount,
      method: payment.method,
      student: currentUser?.name || payment.studentName || 'Student',
      student_id: activeStudentId,
      cashier: payment.cashier || 'L. Navarro (Counter 3)',
    });
  };

  return (
    <div className="ssis-canvas">
      <div className="ssis-page-tag">CUYOTECH UNIVERSITY • STUDENT FINANCE</div>
      <h1 className="ssis-page-heading">Fees and payment history</h1>
      <p className="ssis-page-desc">
        Tuition assessment & payment records for <strong>{currentUser?.name}</strong> ({activeStudentId}).
      </p>

      {/* Top Assessment Breakdown & Outstanding Balance Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '32px', marginBottom: '40px', alignItems: 'stretch' }}>
        {/* Left Assessment Table */}
        <div className="ssis-table-container">
          {assessedFees.length === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', color: '#64748B' }}>
              <CreditCard size={36} color="#94A3B8" style={{ margin: '0 auto 10px' }} />
              <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#1E293B', marginBottom: '6px' }}>
                No Fee Assessment Yet
              </h4>
              <p style={{ fontSize: '13px', margin: 0 }}>
                Your account is currently at default 0. Once your enrollment is approved and assessed by the Cashiering Office, fee categories will appear here.
              </p>
            </div>
          ) : (
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
                      PHP {Number(item.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Right Highlight Card */}
        <div className="ssis-highlight-card" style={{ padding: '36px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>
            OUTSTANDING BALANCE
          </div>
          <div style={{ fontSize: '38px', fontWeight: '900', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
            PHP {Number(outstandingBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p style={{ fontSize: '12px', marginTop: '12px', opacity: 0.85, margin: '12px 0 0' }}>
            {outstandingBalance > 0 
              ? 'Payable at the CuyoTech University Cashier counter (Counter 3).' 
              : 'No pending financial obligations for this academic term.'}
          </p>
        </div>
      </div>

      {/* Payment History Table matching Page 4 */}
      <div className="ssis-table-container">
        <h3 className="ssis-card-title" style={{ padding: '20px 24px 0', marginBottom: 0 }}>
          Official Payment History
        </h3>
        
        {studentPayments.length === 0 ? (
          <div style={{ padding: '36px 20px', textAlign: 'center', color: '#64748B' }}>
            <Receipt size={36} color="#94A3B8" style={{ margin: '0 auto 10px' }} />
            <p style={{ fontSize: '13.5px', margin: 0 }}>
              No payments recorded yet. Official receipts will be archived here once payment is processed at the Cashier counter.
            </p>
          </div>
        ) : (
          <table className="ssis-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Reference (OR)</th>
                <th>Method</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {studentPayments.map(payment => (
                <tr key={payment.id}>
                  <td style={{ color: '#475569' }}>{payment.date}</td>
                  <td style={{ fontWeight: '600', color: '#0F172A', fontFamily: 'monospace' }}>
                    {payment.reference}
                  </td>
                  <td>{payment.method}</td>
                  <td style={{ textAlign: 'right', fontWeight: '700', color: '#166534' }}>
                    PHP {Number(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => handleViewReceipt(payment)}
                      className="ssis-btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      View Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ textAlign: 'right', marginTop: '60px', fontSize: '12px', color: '#94A3B8' }}>
        CuyoTech University — Student Services Information System
      </div>
    </div>
  );
};
