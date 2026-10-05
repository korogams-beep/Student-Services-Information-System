import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GraduationCap, Award, BookCheck, AlertCircle } from 'lucide-react';
import { computeAcademicStanding } from '../utils/academicStanding';

export const StudentGradesView = () => {
  const { 
    currentUser, 
    gradeReports, 
    studentGradesMap, 
    searchQuery 
  } = useApp();
  
  const [selectedTerm, setSelectedTerm] = useState('2nd Semester 2025–2026');

  // Determine active student grades
  const activeStudentId = currentUser.student_id_number || currentUser.studentId || '2026-0001';
  const currentGrades = studentGradesMap[activeStudentId] || gradeReports || [];

  // Compute official academic standing & honors eligibility
  const standing = computeAcademicStanding(currentGrades);

  // Apply search query filter if user typed in top search bar
  const displayedGrades = currentGrades.filter(g => 
    !searchQuery ||
    (g.subject && g.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (g.code && g.code.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="ssis-canvas">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="ssis-page-tag">CUYOTECH UNIVERSITY • ACADEMIC RECORDS</div>
          <h1 className="ssis-page-heading">Official Grade Report</h1>
          <p className="ssis-page-desc">
            Academic performance for <strong>{currentUser.name}</strong> ({activeStudentId}) • {currentUser.program || 'Student'}.
          </p>
        </div>

        {/* Term Dropdown */}
        <div style={{ minWidth: '220px' }}>
          <select
            className="ssis-select"
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            style={{ fontWeight: '600' }}
          >
            <option value="2nd Semester 2025–2026">2nd Semester 2025–2026</option>
            <option value="1st Semester 2025–2026">1st Semester 2025–2026</option>
            <option value="1st Semester 2024–2025">1st Semester 2024–2025</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', alignItems: 'start' }}>
        {/* Grades Table */}
        <div className="ssis-table-container">
          {displayedGrades.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: '#64748B' }}>
              <GraduationCap size={44} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1E293B', marginBottom: '6px' }}>
                No Grades Encoded Yet
              </h3>
              <p style={{ fontSize: '13.5px', maxWidth: '440px', margin: '0 auto' }}>
                Your academic evaluations start at default 0. Once your instructors and the Registrar submit and verify your final grades, your official transcript will display here.
              </p>
            </div>
          ) : (
            <table className="ssis-table">
              <thead>
                <tr>
                  <th>Course / Subject</th>
                  <th style={{ textAlign: 'center' }}>Units</th>
                  <th style={{ textAlign: 'center' }}>Final Grade</th>
                  <th style={{ textAlign: 'right' }}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {displayedGrades.map(g => {
                  const numericGrade = parseFloat(g.grade);
                  const isPassed = numericGrade > 0 && numericGrade <= 3.0;

                  return (
                    <tr key={g.id || g.code}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <BookCheck size={16} color={isPassed ? '#166534' : '#DC2626'} />
                          <span style={{ fontWeight: '600' }}>{g.subject || `${g.code} • Course`}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', color: '#475569' }}>{g.units || 3}.0</td>
                      <td style={{ textAlign: 'center', fontWeight: '800', color: isPassed ? '#0F172A' : '#DC2626', fontSize: '15px' }}>
                        {numericGrade ? numericGrade.toFixed(2) : '—'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className={`badge ${isPassed ? 'badge-success' : 'badge-danger'}`}>
                          {g.remarks || (isPassed ? 'Passed' : 'Failed')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Right GWA Highlight Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div 
            className="ssis-card" 
            style={{ 
              padding: '32px 24px',
              backgroundColor: standing.badgeBg,
              border: `1.5px solid ${standing.hasFailingGrade ? '#FECACA' : (standing.isDeansList ? '#BFDBFE' : '#E2E8F0')}`,
              borderRadius: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              {standing.hasFailingGrade ? (
                <AlertCircle size={20} color="#DC2626" />
              ) : standing.isDeansList ? (
                <Award size={20} color="#1E40AF" />
              ) : (
                <GraduationCap size={20} color="#475569" />
              )}
              <div style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', color: standing.badgeColor }}>
                OVERALL GWA
              </div>
            </div>
            
            <div style={{ fontSize: '52px', fontWeight: '900', letterSpacing: '-1px', lineHeight: 1, color: standing.badgeColor }}>
              {standing.totalUnits > 0 ? standing.gwaDisplay : '0.00'}
            </div>

            <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '13.5px', fontWeight: '800', color: standing.badgeColor, marginBottom: '4px' }}>
                {standing.status}
              </div>
              <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.4, margin: 0 }}>
                {standing.description}
              </p>
            </div>
          </div>

          <div className="ssis-card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' }}>
              CuyoTech Grading & Honors Standard
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#64748B' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>1.00 – 1.45</span>
                <strong style={{ color: '#166534' }}>President's List (1st Honors)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>1.46 – 1.75</span>
                <strong style={{ color: '#1E40AF' }}>Dean's List (2nd Honors)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>1.76 – 3.00</span>
                <strong style={{ color: '#475569' }}>Passed (Regular Standing)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>5.00</span>
                <strong style={{ color: '#DC2626' }}>Failed (Ineligible for Honors)</strong>
              </div>
            </div>
            <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #F1F5F9', fontSize: '11px', color: '#64748B', lineHeight: 1.4 }}>
              * Rule: Any failing grade (5.00) or GWA &gt; 1.75 strictly disqualifies candidate from Dean's List honors.
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'right', marginTop: '60px', fontSize: '12px', color: '#94A3B8' }}>
        CuyoTech University — Official Student Academic Records
      </div>
    </div>
  );
};
