import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Layers, CreditCard, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export const CashierAssessmentsView = () => {
  const { 
    studentAssessmentsList, 
    setCurrentView, 
    searchQuery, 
    showToast 
  } = useApp();

  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const filteredAssessments = studentAssessmentsList.filter(a => {
    const matchesSearch = !searchQuery ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.program.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'ALL' || a.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalAssessedSum = filteredAssessments.reduce((acc, curr) => acc + curr.totalAssessed, 0);
  const totalPaidSum = filteredAssessments.reduce((acc, curr) => acc + curr.totalPaid, 0);
  const totalBalanceDue = filteredAssessments.reduce((acc, curr) => acc + curr.balance, 0);

  const handleTakePayment = (studentAssessment) => {
    showToast(`Redirecting to process payment for ${studentAssessment.name}...`);
    setCurrentView('process_payment');
  };

  return (
    <div className="ssis-canvas">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div className="ssis-page-tag">CUYOTECH UNIVERSITY • CASHIER OPERATIONS</div>
          <h1 className="ssis-page-heading">Student Tuition Assessments</h1>
          <p className="ssis-page-desc">
            Accounts receivable and assessment ledger across enrolled university students.
          </p>
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748B' }}>Status:</span>
          <select
            className="ssis-select"
            style={{ width: '180px', padding: '8px 12px', fontSize: '13px' }}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="ALL">All Accounts</option>
            <option value="Paid in Full">Paid in Full</option>
            <option value="Partial">Partial Balance</option>
            <option value="Unpaid">Unpaid</option>
          </select>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        <div className="ssis-card" style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Total Assessed</div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A', marginTop: '6px' }}>
            PHP {totalAssessedSum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
            Tuition, Labs, and Misc
          </div>
        </div>

        <div className="ssis-card" style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Total Collected</div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#166534', marginTop: '6px' }}>
            PHP {totalPaidSum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '12px', color: '#166534', marginTop: '4px', fontWeight: '600' }}>
            {((totalPaidSum / (totalAssessedSum || 1)) * 100).toFixed(1)}% Realized
          </div>
        </div>

        <div className="ssis-card" style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Outstanding Receivables</div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#9F1239', marginTop: '6px' }}>
            PHP {totalBalanceDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '12px', color: '#9F1239', marginTop: '4px', fontWeight: '600' }}>
            Awaiting cashier settlement
          </div>
        </div>
      </div>

      {/* Assessments Directory Table */}
      <div className="ssis-table-container">
        <table className="ssis-table">
          <thead>
            <tr>
              <th>Student Account</th>
              <th>Degree Program</th>
              <th style={{ textAlign: 'right' }}>Total Assessed</th>
              <th style={{ textAlign: 'right' }}>Paid to Date</th>
              <th style={{ textAlign: 'right' }}>Balance Due</th>
              <th style={{ textAlign: 'center' }}>Account Status</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssessments.map(a => (
              <tr key={a.id || a.studentId}>
                <td>
                  <strong style={{ color: '#0F172A' }}>{a.name}</strong>
                  <span style={{ color: '#64748B', fontSize: '12px', display: 'block' }}>
                    {a.studentId}
                  </span>
                </td>
                <td style={{ color: '#475569' }}>{a.program}</td>
                <td style={{ textAlign: 'right', fontWeight: '600', color: '#0F172A' }}>
                  PHP {a.totalAssessed.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td style={{ textAlign: 'right', color: '#166534', fontWeight: '600' }}>
                  PHP {a.totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td style={{ textAlign: 'right', fontWeight: '800', color: a.balance > 0 ? '#9F1239' : '#166534' }}>
                  PHP {a.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`badge ${
                    a.status === 'Paid in Full' ? 'badge-success' :
                    a.status === 'Partial' ? 'badge-pending' : 'badge-danger'
                  }`}>
                    {a.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  {a.balance > 0 ? (
                    <button
                      onClick={() => handleTakePayment(a)}
                      className="ssis-btn-primary"
                      style={{ padding: '6px 14px', fontSize: '12.5px' }}
                    >
                      <CreditCard size={13} />
                      <span>Collect</span>
                    </button>
                  ) : (
                    <span style={{ fontSize: '12.5px', color: '#166534', fontWeight: '600' }}>
                      ✓ Cleared
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ textAlign: 'right', marginTop: '60px', fontSize: '12px', color: '#94A3B8' }}>
        Assessments & Accounts Receivable — DFD 5.0
      </div>
    </div>
  );
};
