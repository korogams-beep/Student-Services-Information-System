import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Printer } from 'lucide-react';

export const CashierPaymentView = () => {
  const { 
    outstandingBalance, 
    setPaymentHistory, 
    showToast, 
    recordAuditLog,
    setActiveReceipt 
  } = useApp();

  const [studentSearch, setStudentSearch] = useState('Maria Santos');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amountStr, setAmountStr] = useState('10,000.00');
  const [currentOR, setCurrentOR] = useState({
    orNumber: 'OR-2026-005104',
    dateTime: 'February 16, 2026 • 10:42 AM',
    description: 'Tuition payment',
    amount: 10000.00,
    cashier: 'L. Navarro',
  });

  const handleProcessPayment = (e) => {
    e.preventDefault();
    const cleanAmount = parseFloat(amountStr.replace(/[^0-9.]/g, '')) || 0;

    if (cleanAmount <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    if (cleanAmount > outstandingBalance) {
      alert(`Amount exceeds outstanding balance of PHP ${outstandingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}.`);
      return;
    }

    const randomOR = 'OR-2026-' + Math.floor(100000 + Math.random() * 900000);
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) +
      ' • ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newPayment = {
      id: Date.now(),
      date: now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      reference: randomOR,
      amount: cleanAmount,
      method: paymentMethod,
    };

    setPaymentHistory(prev => [newPayment, ...prev]);

    const receiptData = {
      orNumber: randomOR,
      dateTime: dateFormatted,
      description: 'Tuition payment',
      amount: cleanAmount,
      cashier: 'L. Navarro',
    };
    setCurrentOR(receiptData);

    showToast(`Payment of PHP ${cleanAmount.toLocaleString()} recorded. Issued ${randomOR}.`);
    recordAuditLog('Payment recorded', `L. Navarro • ${randomOR}`);

    fetch('/api/cashier/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: 1,
        amount: cleanAmount,
        payment_method: paymentMethod,
      }),
    }).catch(err => console.log('Client-side synced', err));
  };

  const handleOpenReceiptModal = () => {
    setActiveReceipt({
      reference: currentOR.orNumber,
      date: currentOR.dateTime,
      amount: currentOR.amount,
      method: paymentMethod,
      student: 'Maria L. Santos',
      cashier: 'L. Navarro (Counter 3)',
    });
  };

  return (
    <div className="ssis-canvas">
      <div className="ssis-page-tag">DFD 5.0 • CASHIER WORKSPACE</div>
      <h1 className="ssis-page-heading">Record a student payment</h1>
      <p className="ssis-page-desc">
        Search the student account, verify the balance, and issue an official receipt.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '36px', alignItems: 'start' }}>
        {/* Left Payment Form matching Page 11 */}
        <div className="ssis-card">
          <form onSubmit={handleProcessPayment}>
            <div className="ssis-form-group">
              <label className="ssis-label">Search student name or ID</label>
              <input
                type="text"
                className="ssis-input"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search student..."
                required
              />
            </div>

            <div className="ssis-form-group">
              <label className="ssis-label">Payment method</label>
              <select
                className="ssis-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="Cash">Cash</option>
                <option value="Online (GCash/Maya)">Online (GCash/Maya)</option>
                <option value="Debit/Credit Card">Debit/Credit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>

            <div className="ssis-form-group">
              <label className="ssis-label">Amount</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '16px', top: '11px', color: '#64748B', fontWeight: '600' }}>
                  PHP
                </span>
                <input
                  type="text"
                  className="ssis-input"
                  style={{ paddingLeft: '56px', fontWeight: '600' }}
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="ssis-btn-primary"
              style={{ width: '100%', marginTop: '14px', padding: '14px' }}
            >
              Process Payment
            </button>
          </form>
        </div>

        {/* Right Info & Receipt Preview Cards matching Page 11 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Student Balance Card */}
          <div className="ssis-highlight-card" style={{ padding: '28px', textAlign: 'left', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '15px', fontWeight: '800', letterSpacing: '0.5px' }}>
              MARIA SANTOS • 2024-01847
            </div>
            <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '6px' }}>
              Balance due PHP {outstandingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Official Receipt Preview Card */}
          <div className="ssis-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="ssis-card-title" style={{ marginBottom: 0 }}>Official Receipt Preview</h3>
              <button
                onClick={handleOpenReceiptModal}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#475569',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '13px',
                }}
              >
                <Printer size={15} />
                <span>Print OR</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <div style={{ fontWeight: '700', color: '#0F172A', fontSize: '15px' }}>
                {currentOR.orNumber}
              </div>
              <div style={{ color: '#64748B' }}>
                {currentOR.dateTime}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                <span>{currentOR.description}</span>
                <span style={{ fontWeight: '700' }}>
                  PHP {Number(currentOR.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div style={{ fontSize: '13.5px', color: '#64748B', borderTop: '1px solid #F1F5F9', paddingTop: '10px', marginTop: '6px' }}>
                Cashier: <strong>{currentOR.cashier}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'right', marginTop: '60px', fontSize: '12px', color: '#94A3B8' }}>
        Process Payment — DFD 5.0
      </div>
    </div>
  );
};
