import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const StudentGradesView = () => {
  const { gradeReports, overallGWA } = useApp();
  const [selectedTerm, setSelectedTerm] = useState('2nd Semester 2025–2026');

  return (
    <div className="ssis-canvas">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="ssis-page-tag">DFD 3.0 • ACADEMIC RECORDS</div>
          <h1 className="ssis-page-heading">Grade report</h1>
          <p className="ssis-page-desc">
            Final grades for Second Semester AY 2025–2026.
          </p>
        </div>

        {/* Term Dropdown matching Page 6 */}
        <div style={{ minWidth: '220px' }}>
          <select
            className="ssis-select"
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            style={{ fontWeight: '600' }}
          >
            <option value="2nd Semester 2025–2026">2nd Semester 2025–2026</option>
            <option value="1st Semester 2025–2026">1st Semester 2025–2026</option>
            <option value="2nd Semester 2024–2025">2nd Semester 2024–2025</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '32px', alignItems: 'start' }}>
        {/* Grades Table matching Page 6 */}
        <div className="ssis-table-container">
          <table className="ssis-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Units</th>
                <th>Grade</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {gradeReports.map(g => (
                <tr key={g.id}>
                  <td style={{ fontWeight: '500' }}>{g.subject}</td>
                  <td>{g.units}</td>
                  <td style={{ fontWeight: '700', color: '#0F172A' }}>
                    {Number(g.grade).toFixed(2)}
                  </td>
                  <td>
                    <span className="badge badge-success">{g.remarks}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right GWA Highlight Card matching Page 6 */}
        <div className="ssis-highlight-card" style={{ padding: '48px 24px' }}>
          <div style={{ fontSize: '15px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>
            OVERALL GWA
          </div>
          <div style={{ fontSize: '56px', fontWeight: '900', letterSpacing: '-1px', lineHeight: 1 }}>
            {overallGWA}
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'right', marginTop: '60px', fontSize: '12px', color: '#94A3B8' }}>
        Grades — DFD 3.0
      </div>
    </div>
  );
};
