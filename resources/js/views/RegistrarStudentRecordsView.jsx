import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, Search, GraduationCap, FileText, CheckCircle, UserPlus, Filter } from 'lucide-react';

export const RegistrarStudentRecordsView = () => {
  const { demoUsers, studentGradesMap, setCurrentView, showToast, searchQuery } = useApp();
  const [filterProgram, setFilterProgram] = useState('ALL');
  const [localSearch, setLocalSearch] = useState('');

  // Extract all students
  const students = demoUsers.filter(u => u.role === 'Student');

  // Filter students
  const filteredStudents = students.filter(s => {
    const q = (localSearch || searchQuery).toLowerCase();
    const matchesSearch = !q ||
      s.name.toLowerCase().includes(q) ||
      (s.student_id_number && s.student_id_number.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q));

    const matchesProg = filterProgram === 'ALL' || (s.program && s.program.includes(filterProgram));
    return matchesSearch && matchesProg;
  });

  const handleEncodeGradesFor = (student) => {
    showToast(`Opening Grade Encoding workspace for ${student.name}...`);
    setCurrentView('academic_records');
  };

  const handleViewCorFor = (student) => {
    showToast(`Opening Certificate of Registration for ${student.name}...`);
    setCurrentView('cor_archive');
  };

  return (
    <div className="ssis-canvas">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div className="ssis-page-tag">CUYOTECH UNIVERSITY • REGISTRAR'S OFFICE</div>
          <h1 className="ssis-page-heading">Student Directory & Academic Masterlist</h1>
          <p className="ssis-page-desc">
            Official roster of admitted students, academic standings, and departmental records.
          </p>
        </div>

        {/* Quick KPI stats */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="ssis-card" style={{ padding: '12px 20px', minWidth: '140px', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Students</span>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#0F172A' }}>{students.length}</div>
          </div>
          <div className="ssis-card" style={{ padding: '12px 20px', minWidth: '140px', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Programs</span>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#5B21B6' }}>2 Active</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, maxWidth: '420px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="ssis-input"
              placeholder="Search by student name, ID number, or email..."
              style={{ paddingLeft: '36px' }}
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Filter size={16} color="#64748B" />
          <select
            className="ssis-select"
            style={{ width: '220px' }}
            value={filterProgram}
            onChange={(e) => setFilterProgram(e.target.value)}
          >
            <option value="ALL">All Academic Programs</option>
            <option value="Computer Science">BS Computer Science</option>
            <option value="Information Technology">BS Information Technology</option>
          </select>
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="ssis-table-container">
        {filteredStudents.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: '#64748B' }}>
            <Users size={40} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#1E293B', marginBottom: '6px' }}>
              No Students Found
            </h4>
            <p style={{ fontSize: '13.5px', maxWidth: '420px', margin: '0 auto' }}>
              {students.length === 0 
                ? 'No students are registered yet. Student accounts start fresh with default 0 once created via the Sign Up portal.' 
                : 'No student matches your current filter criteria.'}
            </p>
          </div>
        ) : (
          <table className="ssis-table">
            <thead>
              <tr>
                <th>Student ID Number</th>
                <th>Full Name</th>
                <th>Academic Program</th>
                <th>Year Level</th>
                <th style={{ textAlign: 'center' }}>Evaluated Grades</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => {
                const sId = student.student_id_number || student.studentId || 'N/A';
                const grades = studentGradesMap[sId] || [];
                const hasGrades = grades.length > 0;

                return (
                  <tr key={student.id || student.email}>
                    <td style={{ fontWeight: '700', color: '#0F172A', fontFamily: 'monospace' }}>
                      {sId}
                    </td>
                    <td>
                      <div style={{ fontWeight: '600', color: '#0F172A' }}>{student.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>{student.email}</div>
                    </td>
                    <td style={{ color: '#334155', fontWeight: '500' }}>
                      {student.program || 'BS Computer Science'}
                    </td>
                    <td style={{ color: '#475569' }}>
                      {student.yearLevel || '1st Year'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${hasGrades ? 'badge-success' : 'badge-pending'}`}>
                        {hasGrades ? `${grades.length} Courses Encoded` : '0 Encoded'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-success">
                        {student.status || 'Active'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => handleEncodeGradesFor(student)}
                          className="ssis-btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          title="Encode Grades for Student"
                        >
                          <GraduationCap size={14} />
                          <span>Encode Grades</span>
                        </button>
                        <button
                          onClick={() => handleViewCorFor(student)}
                          className="ssis-btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          title="View Official COR"
                        >
                          <FileText size={14} />
                          <span>View COR</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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
