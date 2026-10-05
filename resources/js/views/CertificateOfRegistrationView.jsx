import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Printer, Download, CheckCircle, FileText } from 'lucide-react';
import { printIsolatedElement, downloadPdfFromElement } from '../utils/pdfExport';

export const CertificateOfRegistrationView = () => {
  const { currentUser, demoUsers, showToast, scheduleCourses, registrarQueue } = useApp();

  const isStudentUser = currentUser?.role === 'Student';
  const registeredStudents = demoUsers.filter(u => u.role === 'Student');

  const defaultStudentId = isStudentUser
    ? (currentUser.student_id_number || currentUser.studentId || '')
    : (registeredStudents[0]?.student_id_number || registrarQueue[0]?.studentIdNumber || '');

  const [selectedStudentId, setSelectedStudentId] = useState(defaultStudentId);
  const [isExporting, setIsExporting] = useState(false);

  // Dynamically resolve target student: strictly isolated to student accounts, NEVER staff
  let student = null;
  if (isStudentUser) {
    student = currentUser;
  } else {
    student = registeredStudents.find(u => u.student_id_number === selectedStudentId) 
      || registeredStudents[0] 
      || (registrarQueue[0] ? {
            name: registrarQueue[0].studentName,
            student_id_number: registrarQueue[0].studentIdNumber,
            program: registrarQueue[0].program,
            year_level: registrarQueue[0].yearLevel || '2nd Year',
         } : null);
  }

  // Enrolled subjects for this student (from approved enrollment request or active schedule)
  const studentIdToMatch = student?.student_id_number || student?.studentId || student?.id;
  const approvedEnrollment = registrarQueue?.find(q => 
    q.studentIdNumber === studentIdToMatch || 
    q.studentId === studentIdToMatch || 
    q.studentName === student?.name
  );
  const enrolledCourses = (approvedEnrollment?.courses && approvedEnrollment.courses.length > 0)
    ? approvedEnrollment.courses
    : (isStudentUser ? scheduleCourses.filter(c => c.selected) : []);
  const totalUnits = enrolledCourses.reduce((sum, c) => sum + (Number(c.units) || 0), 0);

  const handlePrint = () => {
    if (!student) return;
    printIsolatedElement('ssis-cor-document', `Certificate of Registration - ${student.name}`);
    showToast(`Printing Certificate of Registration for ${student.name}...`);
  };

  const handleDownload = async () => {
    if (!student) return;
    setIsExporting(true);
    showToast('Generating official PDF document...');
    const filename = `COR_${student.student_id_number || 'Student'}_${student.name.replace(/\s+/g, '_')}.pdf`;
    const success = await downloadPdfFromElement('ssis-cor-document', filename, 'a4');
    setIsExporting(false);
    if (success) {
      showToast(`Downloaded ${filename} successfully!`);
    }
  };

  return (
    <div className="ssis-canvas">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="ssis-page-tag">CUYOTECH UNIVERSITY • OFFICIAL DOCUMENT</div>
          <h1 className="ssis-page-heading">Certificate of Registration</h1>
          <p className="ssis-page-desc">
            Official academic enrollment record. Isolated for clean printing and vector PDF export.
          </p>
        </div>

        {/* If Registrar or Staff, allow choosing student to preview COR */}
        {!isStudentUser && registeredStudents.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748B' }}>Student:</span>
            <select
              className="ssis-select"
              style={{ width: '240px', padding: '8px 12px', fontSize: '13px' }}
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
            >
              {registeredStudents.map(s => (
                <option key={s.id || s.email} value={s.student_id_number}>
                  {s.name} ({s.student_id_number})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Action Buttons at top */}
      {student && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginBottom: '20px' }}>
          <button onClick={handlePrint} className="ssis-btn-secondary" style={{ minWidth: '150px' }}>
            <Printer size={16} />
            <span>Print COR</span>
          </button>
          <button 
            onClick={handleDownload} 
            disabled={isExporting} 
            className="ssis-btn-primary" 
            style={{ minWidth: '170px' }}
          >
            <Download size={16} />
            <span>{isExporting ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>
        </div>
      )}

      {!student ? (
        <div className="ssis-card" style={{ maxWidth: '820px', margin: '40px auto', padding: '60px 40px', textAlign: 'center' }}>
          <FileText size={48} color="#94A3B8" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>
            No Student Registration Records Found
          </h3>
          <p style={{ color: '#64748B', maxWidth: '460px', margin: '0 auto', fontSize: '14px' }}>
            There are currently no registered students in the system. Once a student registers an account or submits an enrollment schedule, their Certificate of Registration (COR) will generate here.
          </p>
        </div>
      ) : (
        /* Official Document Card - isolated with id="ssis-cor-document" */
        <div
          id="ssis-cor-document"
          className="cor-document printable-document ssis-card"
          style={{
            maxWidth: '800px',
            width: '100%',
            boxSizing: 'border-box',
            margin: '0 auto',
            padding: '36px 40px',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            border: '1px solid #CBD5E1',
            borderRadius: '10px',
          }}
        >
          {/* Document Header */}
          <div style={{ textAlign: 'center', marginBottom: '18px', borderBottom: '2px solid #0F172A', paddingBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <img src="/images/pnc-logo.png" alt="University Logo" style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: '19px', fontWeight: '900', letterSpacing: '0.5px', color: '#0F172A', margin: 0 }}>
                  CUYOTECH UNIVERSITY
                </h2>
                <p style={{ fontSize: '10.5px', color: '#475569', margin: '2px 0 0', fontWeight: '600' }}>
                  (CuyoTech University) • Cuyo, Palawan
                </p>
              </div>
            </div>
            <p style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', letterSpacing: '1.2px', textTransform: 'uppercase', margin: '4px 0 0' }}>
              OFFICE OF THE UNIVERSITY REGISTRAR
            </p>
            <div style={{ display: 'inline-block', backgroundColor: '#FAF5F5', padding: '4px 16px', borderRadius: '9999px', marginTop: '8px', border: '1px solid #FECDD3' }}>
              <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#9F1239', letterSpacing: '0.8px' }}>
                OFFICIAL CERTIFICATE OF REGISTRATION (COR)
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', textAlign: 'left', marginTop: '14px', backgroundColor: '#F8FAFC', padding: '12px 16px', borderRadius: '8px' }}>
              <div>
                <span style={{ fontSize: '10px', color: '#64748B', display: 'block', fontWeight: '700', textTransform: 'uppercase' }}>Student Name</span>
                <strong style={{ fontSize: '13px', color: '#0F172A' }}>{student.name}</strong>
              </div>
              <div>
                <span style={{ fontSize: '10px', color: '#64748B', display: 'block', fontWeight: '700', textTransform: 'uppercase' }}>Student ID Number</span>
                <strong style={{ fontSize: '13px', color: '#0F172A', fontFamily: 'monospace' }}>{student.student_id_number || student.studentId || '2026-0001'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '10px', color: '#64748B', display: 'block', fontWeight: '700', textTransform: 'uppercase' }}>Degree Program</span>
                <strong style={{ fontSize: '13px', color: '#0F172A' }}>{student.program || 'BS Computer Science'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '10px', color: '#64748B', display: 'block', fontWeight: '700', textTransform: 'uppercase' }}>Academic Term</span>
                <strong style={{ fontSize: '13px', color: '#0F172A' }}>2nd Sem, AY 2025–2026</strong>
              </div>
            </div>
          </div>

        {/* Subjects Schedule Table */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '10px' }}>
            Enrolled Course Subjects & Class Schedule
          </div>
          
          {enrolledCourses.length === 0 ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px dashed #CBD5E1', color: '#64748B' }}>
              <FileText size={28} color="#94A3B8" style={{ margin: '0 auto 6px' }} />
              <p style={{ fontSize: '12.5px', margin: 0, fontWeight: '500' }}>
                No courses enrolled yet. Select and submit your class schedule under the Enrollment tab.
              </p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid #CBD5E1', backgroundColor: '#F8FAFC' }}>
                  <th style={{ padding: '8px 10px', fontSize: '11.5px', fontWeight: '700', color: '#475569' }}>Course Code</th>
                  <th style={{ padding: '8px 10px', fontSize: '11.5px', fontWeight: '700', color: '#475569' }}>Course Description</th>
                  <th style={{ padding: '8px 10px', fontSize: '11.5px', fontWeight: '700', color: '#475569', textAlign: 'center' }}>Units</th>
                  <th style={{ padding: '8px 10px', fontSize: '11.5px', fontWeight: '700', color: '#475569', textAlign: 'right' }}>Schedule & Room</th>
                </tr>
              </thead>
              <tbody>
                {enrolledCourses.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '9px 10px', fontSize: '12.5px', fontWeight: '700', color: '#0F172A', fontFamily: 'monospace' }}>{c.code}</td>
                    <td style={{ padding: '9px 10px', fontSize: '12.5px', color: '#334155' }}>{c.title}</td>
                    <td style={{ padding: '9px 10px', fontSize: '12.5px', textAlign: 'center', color: '#475569' }}>{c.units}.0</td>
                    <td style={{ padding: '9px 10px', fontSize: '12.5px', textAlign: 'right', color: '#475569' }}>{c.schedule}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Units & Academic Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', borderTop: '1.5px solid #0F172A', paddingTop: '14px', marginBottom: '22px' }}>
          <div>
            <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Total Enrolled Units</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#0F172A' }}>{totalUnits}.0 Units</div>
          </div>
          <div>
            <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Registration Status</div>
            <div style={{ fontSize: '15px', fontWeight: '800', color: totalUnits > 0 ? '#166534' : '#64748B' }}>
              {totalUnits > 0 ? 'Officially Enrolled' : 'Pending Enrollment'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Issuing Authority</div>
            <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#0F172A' }}>Ramon Alcantara (University Registrar)</div>
          </div>
        </div>

        {/* Official Signatures */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '20px', borderTop: '1px dashed #CBD5E1' }}>
          <div style={{ textAlign: 'center', width: '200px' }}>
            <div style={{ borderBottom: '1px solid #0F172A', paddingBottom: '24px', marginBottom: '4px' }}></div>
            <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#0F172A' }}>{student.name}</div>
            <div style={{ fontSize: '10.5px', color: '#64748B' }}>Student Signature</div>
          </div>

          <div style={{ textAlign: 'center', width: '120px' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', border: '2px solid #166534', margin: '0 auto 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '7px', fontWeight: '900', color: '#166534', textAlign: 'center' }}>CUYOTECH REGISTRAR</span>
              <CheckCircle size={20} color="#166534" />
              <span style={{ fontSize: '6.5px', fontWeight: '700', color: '#166534' }}>VERIFIED</span>
            </div>
            <div style={{ fontSize: '9.5px', color: '#64748B' }}>Official University Seal</div>
          </div>

          <div style={{ textAlign: 'center', width: '200px' }}>
            <div style={{ borderBottom: '1px solid #0F172A', paddingBottom: '24px', marginBottom: '4px' }}></div>
            <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#0F172A' }}>Ramon Alcantara</div>
            <div style={{ fontSize: '10.5px', color: '#64748B' }}>University Registrar</div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
