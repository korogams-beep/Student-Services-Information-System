import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Clock, Printer, Download, BarChart2, Award, Users, BookOpen } from 'lucide-react';
import { printIsolatedElement } from '../utils/pdfExport';
import { computeAcademicStanding } from '../utils/academicStanding';

export const RegistrarReportsView = () => {
  const { demoUsers, studentGradesMap, showToast } = useApp();
  const [selectedSem, setSelectedSem] = useState('Second Semester 2025–2026');

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

      <div id="cuyotech-registrar-report" className="printable-document">
        {/* KPI Cards Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div className="ssis-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#5B21B6', marginBottom: '10px' }}>
              <Users size={20} />
              <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Students</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#0F172A' }}>{students.length}</div>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '6px 0 0' }}>Enrolled in College Programs</p>
          </div>

          <div className="ssis-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#166534', marginBottom: '10px' }}>
              <Award size={20} />
              <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Dean's Honor List</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#166534' }}>{deansListCandidates}</div>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '6px 0 0' }}>GWA ≤ 1.75 & No Failing Grade</p>
          </div>

          <div className="ssis-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1E40AF', marginBottom: '10px' }}>
              <BookOpen size={20} />
              <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Regular Standing</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#1E40AF' }}>{regularStanding}</div>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '6px 0 0' }}>GWA 1.76 – 3.00</p>
          </div>

          <div className="ssis-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#DC2626', marginBottom: '10px' }}>
              <BarChart2 size={20} />
              <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ineligible for Honors</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#DC2626' }}>{ineligibleHonors}</div>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '6px 0 0' }}>Has 5.00 Failing Grade</p>
          </div>
        </div>

        {/* Detailed Audit Table */}
        <div className="ssis-table-container">
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9' }}>
            <h3 className="ssis-card-title" style={{ marginBottom: '4px' }}>Official Academic Roster & Honors Evaluation</h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
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
                      <td style={{ fontWeight: '600', color: '#0F172A' }}>{s.name}</td>
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
