import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  ChevronDown, 
  UserCheck, 
  X, 
  GraduationCap, 
  BookOpen, 
  Receipt, 
  FileText, 
  ShieldCheck, 
  Navigation,
  User
} from 'lucide-react';

export const TopNavbar = () => {
  const { 
    currentUser, 
    currentView, 
    setCurrentView,
    searchQuery, 
    setSearchQuery, 
    switchRole, 
    demoUsers,
    setActiveReceipt,
    paymentHistory,
    scheduleCourses,
    showToast
  } = useApp();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef(null);

  // Close search and role dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Dashboard';
      case 'enrollment': return 'Enrollment';
      case 'payments': return 'Payments';
      case 'cor_preview': return 'Certificate of Registration';
      case 'grades': return 'Grades';
      case 'documents': return 'Document Requests';
      case 'clearance': return 'Clearance';
      case 'approvals': return 'Enrollment Approvals';
      case 'academic_records': return 'Academic Records';
      case 'student_records': return 'Student Records';
      case 'documents_queue': return 'Document Approvals';
      case 'cor_archive': return 'COR Archive';
      case 'registrar_reports': return 'Registrar Reports';
      case 'process_payment': return 'Process Payment';
      case 'recent_payments': return 'Recent Payments';
      case 'assessments': return 'Assessments';
      case 'receipts': return 'Official Receipts';
      case 'reports': return 'Financial Reports';
      case 'clearance_requests': return 'Clearance Requests';
      case 'completed_clearance': return 'Completed Clearances';
      case 'department_rules': return 'Department Rules';
      case 'dept_reports': return 'Clearance Reports';
      case 'user_accounts': return 'Accounts & Audit Logs';
      case 'audit_logs_view': return 'System Audit Logs';
      case 'roles_view': return 'Roles & Permissions';
      case 'security_view': return 'Security & Access';
      case 'system_settings_view': return 'System Settings';
      default: return 'SSIS Portal';
    }
  };

  // Compile search results across all entities
  const getSearchResults = () => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return null;

    // 1. Pages / Navigation
    const allPages = [
      { id: 'dashboard', title: 'Dashboard • Overview', role: 'Student' },
      { id: 'enrollment', title: 'Enrollment Schedule & Subjects', role: 'Student' },
      { id: 'cor_preview', title: 'Certificate of Registration (COR)', role: 'Student' },
      { id: 'grades', title: 'Grade Report & GWA Summary', role: 'Student' },
      { id: 'documents', title: 'Document Requests & Status', role: 'Student' },
      { id: 'payments', title: 'Student Payments & Fees', role: 'Student' },
      { id: 'clearance', title: 'Clearance Status & Approvals', role: 'Student' },
      { id: 'approvals', title: 'Registrar • Enrollment Approvals', role: 'Registrar' },
      { id: 'academic_records', title: 'Registrar • Academic Records & Grades', role: 'Registrar' },
      { id: 'documents_queue', title: 'Registrar • Document Approvals Queue', role: 'Registrar' },
      { id: 'cor_archive', title: 'Registrar • COR Archive', role: 'Registrar' },
      { id: 'process_payment', title: 'Cashier • Process Student Payment', role: 'Cashier' },
      { id: 'recent_payments', title: 'Cashier • Recent Payments Log', role: 'Cashier' },
      { id: 'assessments', title: 'Cashier • Student Assessments & Balance', role: 'Cashier' },
      { id: 'receipts', title: 'Cashier • Official Receipts Archive', role: 'Cashier' },
      { id: 'reports', title: 'Cashier • Financial & Collection Reports', role: 'Cashier' },
      { id: 'clearance_requests', title: 'Dept Staff • Clearance Requests', role: 'Department Staff' },
      { id: 'completed_clearance', title: 'Dept Staff • Completed Clearances', role: 'Department Staff' },
      { id: 'department_rules', title: 'Dept Staff • Clearance Guidelines & Rules', role: 'Department Staff' },
      { id: 'dept_reports', title: 'Dept Staff • Compliance Reports', role: 'Department Staff' },
      { id: 'user_accounts', title: 'Admin • User Accounts Management', role: 'Admin' },
      { id: 'audit_logs_view', title: 'Admin • Audit Trail Logs', role: 'Admin' },
      { id: 'roles_view', title: 'Admin • Roles & RBAC Permissions', role: 'Admin' },
      { id: 'security_view', title: 'Admin • Security & Access Control', role: 'Admin' },
      { id: 'system_settings_view', title: 'Admin • University System Settings', role: 'Admin' },
    ];
    const pages = allPages.filter(p => p.title.toLowerCase().includes(query) || p.id.includes(query));

    // 2. Students & Users
    const users = demoUsers.filter(u => 
      u.name?.toLowerCase().includes(query) || 
      u.student_id_number?.toLowerCase().includes(query) || 
      u.email?.toLowerCase().includes(query) ||
      u.role?.toLowerCase().includes(query)
    );

    // 3. Courses / Subjects
    const courses = scheduleCourses.filter(c => 
      c.code.toLowerCase().includes(query) || 
      c.title.toLowerCase().includes(query)
    );

    // 4. Receipts & Payments
    const receipts = paymentHistory.filter(p => 
      p.reference?.toLowerCase().includes(query) || 
      p.studentName?.toLowerCase().includes(query) ||
      p.method?.toLowerCase().includes(query)
    );

    // 5. Official Documents
    const docs = [
      { id: 'cor', title: 'Certificate of Registration (COR)', view: 'cor_preview' },
      { id: 'coe', title: 'Certificate of Enrollment', view: 'documents' },
      { id: 'tor', title: 'Transcript of Records', view: 'documents' },
      { id: 'gmc', title: 'Good Moral Certificate', view: 'documents' },
    ].filter(d => d.title.toLowerCase().includes(query));

    const totalResults = pages.length + users.length + courses.length + receipts.length + docs.length;

    return { pages, users, courses, receipts, docs, totalResults };
  };

  const searchResults = getSearchResults();

  const handleSelectResult = (item, type) => {
    setIsSearchOpen(false);
    setSearchQuery('');

    if (type === 'page') {
      setCurrentView(item.id);
      showToast(`Navigated to ${item.title}`);
    } else if (type === 'user') {
      if (item.role === 'Student') {
        setCurrentView('student_records');
      } else {
        setCurrentView('user_accounts');
      }
      showToast(`Selected user: ${item.name} (${item.role})`);
    } else if (type === 'course') {
      setCurrentView(currentUser.role === 'Registrar' ? 'academic_records' : 'enrollment');
      showToast(`Selected subject: ${item.code} — ${item.title}`);
    } else if (type === 'receipt') {
      setActiveReceipt({
        reference: item.reference,
        date: item.date,
        amount: item.amount,
        method: item.method || 'Cash',
        student: item.studentName || currentUser?.name || 'Student',
        cashier: item.cashier || 'L. Navarro (Counter 3)',
      });
      showToast(`Viewing receipt ${item.reference}`);
    } else if (type === 'doc') {
      setCurrentView(item.view);
      showToast(`Navigated to ${item.title}`);
    }
  };

  return (
    <header className="ssis-top-navbar">
      {/* Page Title */}
      <h2 className="ssis-header-title">{getPageTitle()}</h2>

      {/* Right Controls */}
      <div className="ssis-header-right">
        {/* Interactive Search Box */}
        <div className="ssis-search-container" ref={searchContainerRef} style={{ position: 'relative' }}>
          <div className="ssis-search-box">
            <Search size={16} color="#94A3B8" />
            <input
              type="text"
              className="ssis-search-input"
              placeholder="Search students, courses, receipts, pages..."
              value={searchQuery}
              onFocus={() => setIsSearchOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', alignItems: 'center' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Search Results Dropdown Overlay */}
          {isSearchOpen && searchQuery.trim() && searchResults && (
            <div className="ssis-search-results-overlay">
              {searchResults.totalResults === 0 ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: '#64748B', fontSize: '13.5px' }}>
                  No matches found for <strong style={{ color: '#0F172A' }}>"{searchQuery}"</strong>
                </div>
              ) : (
                <>
                  {/* Students & Users */}
                  {searchResults.users.length > 0 && (
                    <div>
                      <div className="ssis-search-category">Students & Users</div>
                      {searchResults.users.map(u => (
                        <button 
                          key={u.id || u.email} 
                          className="ssis-search-item"
                          onClick={() => handleSelectResult(u, 'user')}
                        >
                          <div className="ssis-search-icon-badge" style={{ backgroundColor: '#FBE8E9', color: '#9F1239' }}>
                            <User size={15} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', color: '#0F172A' }}>{u.name}</div>
                            <div style={{ fontSize: '12px', color: '#64748B' }}>
                              {u.student_id_number ? `ID: ${u.student_id_number} • ` : ''}{u.role} {u.program ? `• ${u.program}` : ''}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Courses & Subjects */}
                  {searchResults.courses.length > 0 && (
                    <div>
                      <div className="ssis-search-category">Courses & Subjects</div>
                      {searchResults.courses.map(c => (
                        <button 
                          key={c.id} 
                          className="ssis-search-item"
                          onClick={() => handleSelectResult(c, 'course')}
                        >
                          <div className="ssis-search-icon-badge" style={{ backgroundColor: '#EDE9FE', color: '#5B21B6' }}>
                            <GraduationCap size={15} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', color: '#0F172A' }}>{c.code} — {c.title}</div>
                            <div style={{ fontSize: '12px', color: '#64748B' }}>{c.units} units • {c.schedule}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Receipts & Payments */}
                  {searchResults.receipts.length > 0 && (
                    <div>
                      <div className="ssis-search-category">Receipts & Payments</div>
                      {searchResults.receipts.map((r, idx) => (
                        <button 
                          key={r.id || idx} 
                          className="ssis-search-item"
                          onClick={() => handleSelectResult(r, 'receipt')}
                        >
                          <div className="ssis-search-icon-badge" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
                            <Receipt size={15} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', color: '#0F172A' }}>{r.reference} • PHP {Number(r.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                            <div style={{ fontSize: '12px', color: '#64748B' }}>{r.studentName} • {r.date} ({r.method})</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Official Documents */}
                  {searchResults.docs.length > 0 && (
                    <div>
                      <div className="ssis-search-category">Academic Documents</div>
                      {searchResults.docs.map(d => (
                        <button 
                          key={d.id} 
                          className="ssis-search-item"
                          onClick={() => handleSelectResult(d, 'doc')}
                        >
                          <div className="ssis-search-icon-badge" style={{ backgroundColor: '#DBEAFE', color: '#1E40AF' }}>
                            <FileText size={15} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', color: '#0F172A' }}>{d.title}</div>
                            <div style={{ fontSize: '12px', color: '#64748B' }}>Official Academic Form</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Pages & Views */}
                  {searchResults.pages.length > 0 && (
                    <div>
                      <div className="ssis-search-category">Pages & Services</div>
                      {searchResults.pages.map(p => (
                        <button 
                          key={p.id} 
                          className="ssis-search-item"
                          onClick={() => handleSelectResult(p, 'page')}
                        >
                          <div className="ssis-search-icon-badge" style={{ backgroundColor: '#F1F5F9', color: '#475569' }}>
                            <Navigation size={15} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', color: '#0F172A' }}>{p.title}</div>
                            <div style={{ fontSize: '12px', color: '#64748B' }}>Workspace tab • {p.role}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* System Online Status dot */}
        <div className="ssis-status-dot" title="Database Connected (MySQL 8.0 • Online)" style={{ backgroundColor: '#22C55E' }} />

        {/* Quick Role Switcher Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="ssis-role-switcher-btn"
            title="Switch user perspective"
          >
            <UserCheck size={14} color="#F1B82D" />
            <span>Role: {currentUser.role}</span>
            <ChevronDown size={14} />
          </button>

          {isRoleDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.12)',
                border: '1px solid #E2E8F0',
                padding: '8px',
                width: '260px',
                zIndex: 100,
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', padding: '6px 12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Select Active Perspective
              </div>
              {demoUsers.slice(0, 8).map((u) => (
                <button
                  key={u.id || u.email}
                  onClick={() => {
                    switchRole(u.role, u);
                    setIsRoleDropdownOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: currentUser.email === u.email ? '#FBE8E9' : 'transparent',
                    color: currentUser.email === u.email ? '#9F1239' : '#1E293B',
                    fontSize: '13px',
                    fontWeight: currentUser.email === u.email ? '700' : '500',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div>
                    <div>{u.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>
                      {u.role} {u.student_id_number ? `(${u.student_id_number})` : ''}
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>
                    {u.initials || 'U'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Avatar Circle */}
        <div
          className="ssis-avatar"
          title={`${currentUser.name} (${currentUser.role})`}
          style={{
            backgroundColor: (() => {
              switch (currentUser.role) {
                case 'Registrar': return '#EDE9FE';
                case 'Cashier': return '#FEF3C7';
                case 'Department Staff': return '#DBEAFE';
                case 'Admin': return '#DCFCE7';
                default: return '#FBE8E9';
              }
            })(),
            color: (() => {
              switch (currentUser.role) {
                case 'Registrar': return '#5B21B6';
                case 'Cashier': return '#92400E';
                case 'Department Staff': return '#1E40AF';
                case 'Admin': return '#166534';
                default: return '#9F1239';
              }
            })(),
          }}
        >
          {currentUser.initials || 'MS'}
        </div>

        {/* Role & Name Label */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#0F172A', lineHeight: 1.2 }}>
            {currentUser.name}
          </span>
          <span
            className="ssis-user-role-label"
            style={{
              fontSize: '11.5px',
              color: (() => {
                switch (currentUser.role) {
                  case 'Registrar': return '#5B21B6';
                  case 'Cashier': return '#92400E';
                  case 'Department Staff': return '#1E40AF';
                  case 'Admin': return '#166534';
                  default: return '#9F1239';
                }
              })(),
              fontWeight: '600',
            }}
          >
            {currentUser.role}
          </span>
        </div>
      </div>
    </header>
  );
};
