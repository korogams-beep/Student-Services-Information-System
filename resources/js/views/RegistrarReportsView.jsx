import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Clock, Printer, Download, BarChart2, Award, Users, BookOpen } from 'lucide-react';
import { printIsolatedElement } from '../utils/pdfExport';
import { computeAcademicStanding } from '../utils/academicStanding';

export const RegistrarReportsView = () => {
  const { demoUsers, studentGradesMap, showToast } = useApp();
  const [selectedSem, setSelectedSem] = useState('Second Semester 2025–2026');
  const reportRef = useRef(null);

  useEffect(() => {
    const el = reportRef.current;
    if (!el) return;
    el.querySelectorAll('.ssis-card, .ssis-table-container').forEach(card => {
      card.style.setProperty('background-color', '#FFFFFF', 'important');
      // Force table header to white bg with dark text
      card.querySelectorAll('thead tr, thead th').forEach(th => {
        th.style.setProperty('background-color', '#F8FAFC', 'important');
        th.style.setProperty('color', '#475569', 'important');
      });
      card.querySelectorAll('*').forEach(child => {
        const tag = child.tagName.toLowerCase();
        if (['svg','path','circle','line','polyline','rect','thead','th'].includes(tag)) return;
        const existingColor = child.style.color;
        if (!existingColor || existingColor === '' || existingColor === 'inherit') {
          child.style.setProperty('color', '#0F172A', 'important');
        }
      });
    });
  });

  const students = demoUsers.filter(u => u.role === 'Student');

  // Calculate Dean's list candidates according to strict CuyoTech rules
  let deansListCandidates = 0;
  let regularStanding = 0;
  let ineligibleHonors = 0;

  students.forEach(s => {
    const sId = s.student_id_number || s.studentId;
    const grades = studentGradesMap[sId] || [];
    const standing = computeAcademicStanding(grades);
    if (standing.isDeansList || standing.isPresidentsList) {
      deansListCandidates++;
    } else if (standing.hasFailingGrade) {
      ineligibleHonors++;
    } else if (grades.length > 0) {
      regularStanding++;
    }
  });

  const handlePrintReport = () => {
    printIsolatedElement('cuyotech-registrar-report', 'CuyoTech Registrar Academic Report');
    showToast('Printing Registrar Academic & Enrollment Report...');
  };

  return (
    <div className="ssis-canvas">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div className="ssis-page-tag">CUYOTECH UNIVERSITY • REGISTRAR'S OFFICE</div>
          <h1 className="ssis-page-heading">Academic Analytics & Enrollment Reports</h1>
          <p className="ssis-page-desc">
            Institutional metrics, grade distribution, and honors retention audit for {selectedSem}.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handlePrintReport} className="ssis-btn-secondary">
            <Printer size={16} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      <div id="cuyotech-registrar-report" ref={reportRef}>
        {/* KPI Cards Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div className="ssis-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#8B5CF6', marginBottom: '10px' }}>
              <Users size={20} />
              <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#8B5CF6' }}>Total Students</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '900' }}>{students.length}</div>
            <p style={{ fontSize: '12px', margin: '6px 0 0' }}>Enrolled in College Programs</p>
          </div>

          <div className="ssis-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#22C55E', marginBottom: '10px' }}>
              <Award size={20} />
              <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#22C55E' }}>Dean's Honor List</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#22C55E' }}>{deansListCandidates}</div>
            <p style={{ fontSize: '12px', margin: '6px 0 0' }}>GWA ≤ 1.75 & No Failing Grade</p>
          </div>

          <div className="ssis-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#38BDF8', marginBottom: '10px' }}>
              <BookOpen size={20} />
              <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#38BDF8' }}>Regular Standing</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#38BDF8' }}>{regularStanding}</div>
            <p style={{ fontSize: '12px', margin: '6px 0 0' }}>GWA 1.76 – 3.00</p>
          </div>

          <div className="ssis-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#EF4444', marginBottom: '10px' }}>
              <BarChart2 size={20} />
              <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#EF4444' }}>Ineligible for Honors</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#EF4444' }}>{ineligibleHonors}</div>
            <p style={{ fontSize: '12px', margin: '6px 0 0' }}>Has 5.00 Failing Grade</p>
          </div>
        </div>

        {/* Detailed Audit Table */}
        <div className="ssis-table-container">
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--table-border)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>Official Academic Roster & Honors Evaluation</h3>
            <p style={{ fontSize: '13px', margin: 0 }}>
              Evaluation criteria: GWA Cutoff ≤ 1.75, zero grades of 5.00, regular enrolled unit load.
            </p>
          </div>

          {students.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748B' }}>
              <p style={{ margin: 0 }}>No student records available for reporting.</p>
            </div>
          ) : (
            <table className="ssis-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Full Name</th>
                  <th>Degree Program</th>
                  <th style={{ textAlign: 'center' }}>Total Units</th>
                  <th style={{ textAlign: 'center' }}>GWA</th>
                  <th style={{ textAlign: 'right' }}>Official Standing</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => {
                  const sId = s.student_id_number || s.studentId || '2026-0001';
                  const grades = studentGradesMap[sId] || [];
                  const standing = computeAcademicStanding(grades);

                  return (
                    <tr key={sId}>
                      <td style={{ fontFamily: 'monospace', fontWeight: '700' }}>{sId}</td>
                      <td style={{ fontWeight: '600' }}>{s.name}</td>
                      <td>{s.program || 'BS Computer Science'}</td>
                      <td style={{ textAlign: 'center' }}>{standing.totalUnits}.0</td>
                      <td style={{ textAlign: 'center', fontWeight: '800', color: standing.badgeColor }}>
                        {standing.totalUnits > 0 ? standing.gwaDisplay : '0.00'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className={`badge ${standing.badgeClass}`}>
                          {standing.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div style={{ textAlign: 'right', marginTop: '60px', fontSize: '12px', color: '#94A3B8' }}>
        CuyoTech University — Office of the University Registrar
      </div>
    </div>
  );
};
