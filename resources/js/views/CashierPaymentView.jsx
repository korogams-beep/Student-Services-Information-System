import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CreditCard, Search, ArrowRight, Printer, CheckCircle2, Receipt, AlertCircle } from 'lucide-react';
import { printIsolatedElement } from '../utils/pdfExport';

export const CashierPaymentView = () => {
  const { 
    currentUser,
    demoUsers,
    studentAssessmentsList, 
    setStudentAssessmentsList,
    paymentHistory, 
    setPaymentHistory, 
    outstandingBalance, 
    showToast, 
    recordAuditLog,
    setActiveReceipt 
  } = useApp();

  const students = demoUsers.filter(u => u.role === 'Student');

  const [studentSearch, setStudentSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amountStr, setAmountStr] = useState('');
  const [currentOR, setCurrentOR] = useState(null);

  // Explicitly match student only when search or selection is made
  const matchedStudent = studentSearch.trim()
    ? (students.find(s =>
        s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        (s.student_id_number && s.student_id_number.toLowerCase().includes(studentSearch.toLowerCase()))
      ) || null)
    : null;

  const matchedStudentAssessment = (matchedStudent && studentAssessmentsList.find(a =>
    a.studentId === matchedStudent.student_id_number
  )) || (matchedStudent ? {
    name: matchedStudent.name,
    studentId: matchedStudent.student_id_number || '2026-0001',
    balance: 0.00,
    totalAssessed: 0.00,
    totalPaid: 0.00,
  } : null);

  const handleSelectQuickStudent = (student) => {
    setStudentSearch(student.name);
    const assess = studentAssessmentsList.find(a => a.studentId === student.student_id_number);
    if (assess && assess.balance > 0) {
      setAmountStr(Number(assess.balance).toLocaleString('en-US', { minimumFractionDigits: 2 }));
    } else {
      setAmountStr('');
    }
  };

  const handleProcessPayment = (e) => {
    e.preventDefault();
    if (!matchedStudent) {
      alert('Please search or select a student before processing payment.');
      return;
    }

    const cleanNum = parseFloat(amountStr.replace(/,/g, '')) || 0;
    if (cleanNum <= 0) {
      alert('Please enter a valid payment amount greater than PHP 0.00.');
      return;
    }

    const targetName = matchedStudent.name;
    const targetId = matchedStudent.student_id_number || '2026-0001';
    const currentBalance = Number(matchedStudentAssessment?.balance || 0);

    // Calculate applied payment, change ("sukli"), and remaining balance
    const amountApplied = currentBalance > 0 ? Math.min(cleanNum, currentBalance) : cleanNum;
    const changeDue = Math.max(0, cleanNum - currentBalance);
    const newRemainingBalance = Math.max(0, currentBalance - amountApplied);

    const newORNumber = `OR-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) + ' • ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newPaymentRecord = {
      id: Date.now(),
      date: dateFormatted,
      reference: newORNumber,
      studentName: targetName,
      studentId: targetId,
      amount: amountApplied,
      tenderedAmount: cleanNum,
      amountApplied: amountApplied,
      changeDue: changeDue,
      remainingBalance: newRemainingBalance,
      method: paymentMethod,
      cashier: 'L. Navarro (Counter 3)',
    };

    // Update global payment history
    setPaymentHistory(prev => [newPaymentRecord, ...prev]);

    // Update student assessment balance
    setStudentAssessmentsList(prev =>
      prev.map(a => {
        if (a.studentId === targetId) {
          const newPaid = (a.totalPaid || 0) + amountApplied;
          const newBalance = Math.max(0, (a.totalAssessed || 0) - newPaid);
          const newStatus = newBalance === 0 ? 'Paid in Full' : 'Partial';
          return { ...a, totalPaid: newPaid, balance: newBalance, status: newStatus };
        }
        return a;
      })
    );

    const generatedOR = {
      orNumber: newORNumber,
      dateTime: dateFormatted,
      description: 'Tuition & Academic Fees Payment',
      amount: amountApplied,
      tenderedAmount: cleanNum,
      amountApplied: amountApplied,
      changeDue: changeDue,
      remainingBalance: newRemainingBalance,
      cashier: 'L. Navarro (Counter 3)',
      studentName: targetName,
      studentId: targetId,
      method: paymentMethod,
    };

    setCurrentOR(generatedOR);

    showToast(`Payment processed! Official Receipt ${newORNumber} issued.${changeDue > 0 ? ` Change: PHP ${changeDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : ''}`);
    recordAuditLog('Payment collected', `L. Navarro • ${targetName} (${newORNumber}): Tendered PHP ${cleanNum}, Applied PHP ${amountApplied}, Change PHP ${changeDue}`);

    // Persist to backend API if available
    fetch('/api/cashier/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: matchedStudent.id || 1,
        amount: amountApplied,
        tendered_amount: cleanNum,
        change_due: changeDue,
        payment_method: paymentMethod,
        or_number: newORNumber,
      }),
    }).catch(err => console.log('Client-side synced', err));
  };

  const handlePrintCurrentOR = () => {
    if (!currentOR) return;
    setActiveReceipt({
      reference: currentOR.orNumber,
      date: currentOR.dateTime,
      amount: currentOR.amount,
      tenderedAmount: currentOR.tenderedAmount,
      amountApplied: currentOR.amountApplied,
      changeDue: currentOR.changeDue,
      remainingBalance: currentOR.remainingBalance,
      method: currentOR.method,
      student: currentOR.studentName,
      student_id: currentOR.studentId,
      cashier: currentOR.cashier,
    });
  };

  return (
    <div className="ssis-canvas">
      <div className="ssis-page-tag">CUYOTECH UNIVERSITY • CASHIER OPERATIONS</div>
      <h1 className="ssis-page-heading">Process Student Payment</h1>
      <p className="ssis-page-desc">
        Search student account, verify assessment balances, and issue official university payment receipts.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '36px', alignItems: 'start' }}>
        {/* Left Payment Form */}
        <div className="ssis-card">
          <form onSubmit={handleProcessPayment}>
            <div className="ssis-form-group">
              <label className="ssis-label">Search or Select Student</label>
              <input
                type="text"
                className="ssis-input"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search student by name or ID number..."
              />

              {students.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center' }}>Quick Select:</span>
                  {students.map(s => (
                    <button
                      key={s.id || s.email}
                      type="button"
                      onClick={() => handleSelectQuickStudent(s)}
                      style={{
                        background: studentSearch === s.name ? '#FEF3C7' : '#F1F5F9',
                        border: `1px solid ${studentSearch === s.name ? '#F59E0B' : '#CBD5E1'}`,
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '11.5px',
                        fontWeight: '600',
                        color: studentSearch === s.name ? '#92400E' : '#475569',
                        cursor: 'pointer',
                      }}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="ssis-form-group">
              <label className="ssis-label">Payment Method</label>
              <select
                className="ssis-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="Cash">Cash Tendered</option>
                <option value="Online (GCash/Maya)">Online (GCash / Maya)</option>
                <option value="Bank Transfer">Bank Transfer (Landbank / DBP)</option>
                <option value="Debit/Credit Card">Debit / Credit Card</option>
              </select>
            </div>

            <div className="ssis-form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="ssis-label" style={{ margin: 0 }}>Payment Amount (PHP)</label>
                {matchedStudent && matchedStudentAssessment?.balance > 0 && (
                  <button
                    type="button"
                    onClick={() => setAmountStr(Number(matchedStudentAssessment.balance).toLocaleString('en-US', { minimumFractionDigits: 2 }))}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0284C7',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Pay Full Balance (PHP {Number(matchedStudentAssessment.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })})
                  </button>
                )}
              </div>
              <input
                type="text"
                className="ssis-input"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <button
              type="submit"
              disabled={!matchedStudent}
              className="ssis-btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                marginTop: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '15px',
                opacity: !matchedStudent ? 0.6 : 1,
                cursor: !matchedStudent ? 'not-allowed' : 'pointer',
              }}
            >
              <CreditCard size={18} />
              <span>Process Payment & Issue Receipt</span>
            </button>
          </form>
        </div>

        {/* Right Student Account & Receipt Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Target Student Assessment Card */}
          <div className="ssis-card" style={{ padding: '24px', backgroundColor: '#F8FAFC' }}>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
              Student Account Balance
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  {matchedStudent?.name || 'No Student Selected'}
                </h3>
                <span style={{ fontSize: '12px', color: '#64748B', fontFamily: 'monospace' }}>
                  {matchedStudent ? `${matchedStudent.student_id_number || 'N/A'} • ${matchedStudent.program || 'Student'}` : 'Search student above'}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>Balance Due</span>
                <span style={{ fontSize: '20px', fontWeight: '900', color: '#9F1239' }}>
                  PHP {Number(matchedStudentAssessment?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Recently Issued Receipt in this session */}
          {currentOR ? (
            <div className="ssis-card" style={{ padding: '24px', border: '1.5px solid #FEF3C7', backgroundColor: '#FFFDF5' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#92400E', backgroundColor: '#FEF3C7', padding: '3px 8px', borderRadius: '4px' }}>
                  RECEIPT ISSUED
                </span>
                <button
                  onClick={handlePrintCurrentOR}
                  className="ssis-btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                >
                  <Printer size={14} />
                  <span>View & Print OR</span>
                </button>
              </div>

              <div style={{ fontSize: '18px', fontWeight: '900', color: '#0F172A', fontFamily: 'monospace' }}>
                {currentOR.orNumber}
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                {currentOR.dateTime}
              </div>

              <div style={{ marginTop: '16px', borderTop: '1px dashed #CBD5E1', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#475569' }}>Cash Tendered:</span>
                  <span style={{ fontWeight: '600' }}>PHP {Number(currentOR.tenderedAmount || currentOR.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#475569' }}>Applied to Tuition:</span>
                  <span style={{ fontWeight: '700', color: '#166534' }}>PHP {Number(currentOR.amountApplied || currentOR.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                {Number(currentOR.changeDue || 0) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#ECFDF5', padding: '6px 8px', borderRadius: '6px' }}>
                    <span style={{ fontWeight: '800', color: '#065F46' }}>Change ("Sukli"):</span>
                    <strong style={{ fontSize: '15px', color: '#047857' }}>PHP {Number(currentOR.changeDue).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '6px', fontSize: '12px', color: '#64748B' }}>
                  <span>Remaining Balance:</span>
                  <span style={{ fontWeight: '700' }}>PHP {Number(currentOR.remainingBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="ssis-card" style={{ padding: '32px 20px', textAlign: 'center', color: '#64748B' }}>
              <Receipt size={36} color="#94A3B8" style={{ margin: '0 auto 10px' }} />
              <p style={{ fontSize: '13px', margin: 0 }}>
                Enter payment details on the left to process transaction and generate official receipt.
              </p>
            </div>
          )}
        </div>
      </div>

      <div style={{ textAlign: 'right', marginTop: '60px', fontSize: '12px', color: '#94A3B8' }}>
        CuyoTech University — Cashiering & Financial Services
      </div>
    </div>
  );
};
