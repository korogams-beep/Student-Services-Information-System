import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GraduationCap, Save, Plus, Search, CheckCircle2 } from 'lucide-react';

const OFFICIAL_COURSES = [
  { code: 'CCS109', title: 'System Analysis and Design' },
  { code: 'CCS112', title: 'Applications Development and Emerging Technologies' },
  { code: 'CSP108', title: 'Programming Languages' },
  { code: 'CCS106', title: 'Social Issues and Professional Practice' },
  { code: 'CSEG1',  title: 'Game Concepts and Production' },
  { code: 'ENV101', title: 'Environmental Science' },
  { code: 'CSP105', title: 'Algorithms and Complexity' },
];

export const RegistrarRecordsView = () => {
  const { 
    demoUsers,
    encodeGradesList, 
    setEncodeGradesList, 
    updateGradeRecord,
    showToast,
    recordAuditLog,
    searchQuery
  } = useApp();

  const [selectedSubject, setSelectedSubject] = useState('CCS109');
  const [selectedStudentToAdd, setSelectedStudentToAdd] = useState('');

  // Get all registered students
  const registeredStudents = demoUsers.filter(u => u.role === 'Student');

  const handleGradeChange = (id, newGrade) => {
    setEncodeGradesList(prev =>
      prev.map(item => item.id === id ? { ...item, grade: newGrade } : item)
    );
  };

  const handleAddStudentToSheet = () => {
    if (!selectedStudentToAdd) return;
    const targetStudent = registeredStudents.find(s => (s.student_id_number || s.id) === selectedStudentToAdd);
    if (!targetStudent) return;

    if (encodeGradesList.some(g => g.studentId === targetStudent.student_id_number)) {
      showToast(`${targetStudent.name} is already in the grade sheet.`);
      return;
    }

    const newEntry = {
      id: Date.now(),
      studentId: targetStudent.student_id_number || `2026-${Math.floor(10000 + Math.random() * 90000)}`,
      studentName: targetStudent.name,
      grade: '1.75',
    };

    setEncodeGradesList(prev => [...prev, newEntry]);
    showToast(`Added ${targetStudent.name} to ${selectedSubject} grade sheet.`);
    setSelectedStudentToAdd('');
  };

  const handleSaveGrades = () => {
    if (encodeGradesList.length === 0) {
      alert('No student records to save in the grade sheet.');
      return;
    }

    // Synchronize every edited student grade into their academic records
    encodeGradesList.forEach(item => {
      updateGradeRecord(item.studentId, item.grade, selectedSubject);
    });

    const studentSummary = encodeGradesList.map(s => `${s.studentName} [${s.grade}]`).join(', ');
    showToast(`Grades for ${selectedSubject} saved! Student academic records updated.`);
    recordAuditLog('Grade sheet updated', `R. Alcantara • ${selectedSubject}: ${studentSummary}`);

    // Persist to MySQL database backend
    fetch('/api/registrar/grades/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject_code: selectedSubject,
        grades: encodeGradesList.map(g => ({
          student_id_number: g.studentId,
          studentName: g.studentName,
          grade_value: g.grade,
        })),
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          showToast(`Grades saved and persisted to MySQL database!`);
        }
      })
      .catch(err => console.log('Client-side synced', err));
  };

  // Filter encode grades by search query if typed
  const filteredGrades = encodeGradesList.filter(item => 
    !searchQuery || 
    item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="ssis-canvas">
      <div className="ssis-page-tag">CUYOTECH UNIVERSITY • REGISTRAR WORKSPACE</div>
      <h1 className="ssis-page-heading">Academic Records & Grade Encoding</h1>
      <p className="ssis-page-desc">
        Encode course grades directly into student transcripts and compute GWA honors eligibility in real-time.
      </p>

      <div style={{ maxWidth: '880px', margin: '0 auto' }}>
        <div className="ssis-card" style={{ padding: '32px' }}>
          {/* Header Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GraduationCap size={24} color="#5B21B6" />
              </div>
              <div>
                <h3 className="ssis-card-title" style={{ margin: 0 }}>Course Grade Sheet</h3>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>Term: 2nd Semester AY 2025–2026</p>
              </div>
            </div>

            {/* Subject selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Select Subject:</span>
              <select
                className="ssis-select"
                style={{ minWidth: '220px', fontWeight: '700' }}
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                {OFFICIAL_COURSES.map(course => (
                  <option key={course.code} value={course.code}>
                    {course.code} • {course.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Add Student Row */}
          {registeredStudents.length > 0 && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '24px', backgroundColor: '#F8FAFC', padding: '12px 16px', borderRadius: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Add Student:</span>
              <select
                className="ssis-select"
                style={{ flex: 1 }}
                value={selectedStudentToAdd}
                onChange={(e) => setSelectedStudentToAdd(e.target.value)}
              >
                <option value="">Choose registered student to grade...</option>
                {registeredStudents.map(s => (
                  <option key={s.id || s.email} value={s.student_id_number || s.id}>
                    {s.name} ({s.student_id_number || 'New'}) — {s.program || 'Student'}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddStudentToSheet}
                className="ssis-btn-secondary"
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                <Plus size={16} />
                <span>Add to Sheet</span>
              </button>
            </div>
          )}

          {/* Students Grade Encoding List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
            {filteredGrades.length === 0 ? (
              <div style={{ padding: '36px 20px', textAlign: 'center', color: '#64748B' }}>
                <p style={{ margin: 0 }}>
                  No students in this grade sheet yet. Use the dropdown above to add registered students.
                </p>
              </div>
            ) : (
              filteredGrades.map(item => {
                const num = parseFloat(item.grade);
                const isPassed = num > 0 && num <= 3.0;

                return (
                  <div
                    key={item.id || item.studentId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 20px',
                      borderRadius: '8px',
                      backgroundColor: '#FAF5F5',
                      border: '1px solid #F1E2E4',
                    }}
                  >
                    <div style={{ fontSize: '14.5px', color: '#1E293B' }}>
                      <span style={{ color: '#64748B', marginRight: '10px', fontSize: '13px', fontFamily: 'monospace' }}>
                        {item.studentId}
                      </span>
                      <strong style={{ color: '#0F172A' }}>{item.studentName}</strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className={`badge ${isPassed ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '11.5px' }}>
                        {isPassed ? 'Passed' : 'Failed'}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#94A3B8', fontSize: '16px' }}>[</span>
                        <input
                          type="number"
                          step="0.25"
                          min="1.00"
                          max="5.00"
                          value={item.grade}
                          onChange={(e) => handleGradeChange(item.id, e.target.value)}
                          style={{
                            width: '64px',
                            textAlign: 'center',
                            fontWeight: '800',
                            fontSize: '15px',
                            border: '1.5px solid #CBD5E1',
                            borderRadius: '6px',
                            padding: '6px 4px',
                            background: '#FFFFFF',
                            color: isPassed ? '#166534' : '#DC2626',
                          }}
                        />
                        <span style={{ color: '#94A3B8', fontSize: '16px' }}>]</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Action Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px' }}>
            <button
              onClick={handleSaveGrades}
              className="ssis-btn-primary"
              style={{ minWidth: '220px', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Save size={18} />
              <span>Commit All Changes</span>
            </button>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'right', marginTop: '60px', fontSize: '12px', color: '#94A3B8' }}>
        CuyoTech University — Office of the University Registrar
      </div>
    </div>
  );
};
