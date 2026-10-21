# Implementation Plan: Fix UI Readability, Enrollment Status, and COR Printing

## Issue 1: Fix Light-Theme Sidebar Active Item Contrast

### Root Cause
In `app.css`, the light theme (`:root` / `[data-theme="light"]`) defines:
- `--sidebar-text-active: #881337` (dark crimson)
- `--sidebar-pill-active: #FDE8E9` (very light pink)

The contrast ratio of #881337 on #FDE8E9 is approximately 4.3:1, which is marginal for small text and visually weak against the dark sidebar background (#1B2430). The active sidebar item is hard to distinguish from inactive items.

### Files to Change
- `d:\Student-Services-Information-System\resources\css\app.css`

### Specific Changes

**In the `:root, [data-theme="light"]` block (lines 7-50), replace:**

```css
--sidebar-text-active: #881337;
--sidebar-pill-active: #FDE8E9;
```

**With:**

```css
--sidebar-text-active: #7F1D1D;
--sidebar-pill-active: #FECDD3;
```

**Rationale:** `#7F1D1D` is a darker red-brown that provides stronger contrast against both the pill background and sidebar. `#FECDD3` is a deeper pink that creates better visual separation from the sidebar background while maintaining the existing rose/pink theme.

**Do NOT touch the dark theme** — it already uses `--sidebar-text-active: #F1B82D` (yellow) which has excellent contrast.

### Additional Readability Issues Found
None. The rest of app.css uses appropriate contrast:
- Badge colors all have WCAG-compliant contrast ratios in both themes
- Table text, card text, and form controls all use semantically appropriate color variables
- Dark mode overrides at the bottom of the file correctly invert inline styles

### Verification
- Navigate to any sidebar view in light theme
- Click through each navigation item
- Confirm the active item's text is clearly readable and the pill background creates visual separation from the sidebar
- Switch to dark theme and confirm the yellow active color remains unchanged and readable

---

## Issue 2: Fix Enrollment Status Logic Bug

### Root Cause
The bug has **two separate causes**:

#### Cause A: Initial `enrollmentStatus` State is Hardcoded to `'Pending'`
**File:** `d:\Student-Services-Information-System\resources\js\context\AppContext.jsx`  
**Line 541:**
```javascript
const [enrollmentStatus, setEnrollmentStatus] = useState('Pending');
```

This initializes the global `enrollmentStatus` to `'Pending'` on every mount, even when no enrollment request exists. This makes the student appear to have a pending request before they've submitted anything.

#### Cause B: Status Display Logic Misreads `myEnrollment.status`
**File:** `d:\Student-Services-Information-System\resources\js\views\StudentDashboardView.jsx`  
**Lines 24-26:**
```javascript
const isOfficiallyEnrolled = myEnrollment
  ? (myEnrollment.status === 'Enrolled' || myEnrollment.status === 'Approved')
  : (enrollmentStatus === 'Enrolled' || enrollmentStatus === 'Approved' || (gradedUnits > 0 && selectedUnits === 0));
```

The dashboard checks for `'Approved'` status, but `approveEnrollmentRequest` in AppContext.jsx (line 917) sets the queue item status to `'Enrolled'`, not `'Approved'`. This mismatch causes the dashboard to display incorrect status.

**File:** `d:\Student-Services-Information-System\resources\js\views\StudentEnrollmentView.jsx`  
**Line 128:**
```javascript
<span className={`badge ${enrollmentStatus === 'Enrolled' || enrollmentStatus === 'Approved' ? 'badge-success' : 'badge-pending'}`}>
  {enrollmentStatus}
</span>
```

The enrollment view displays the global `enrollmentStatus` state directly, but this state is only updated when the *student themselves* calls `submitEnrollmentRequest` or when the registrar approval runs. If the registrar approves while the student isn't logged in or on a different view, the student's local `enrollmentStatus` doesn't update until they refresh or the context re-mounts.

### Files to Change
1. `d:\Student-Services-Information-System\resources\js\context\AppContext.jsx`
2. `d:\Student-Services-Information-System\resources\js\views\StudentEnrollmentView.jsx`

### Specific Changes

#### Change 1: Fix Initial Enrollment Status (AppContext.jsx, line 541)

**Replace:**
```javascript
const [enrollmentStatus, setEnrollmentStatus] = useState('Pending');
```

**With:**
```javascript
const [enrollmentStatus, setEnrollmentStatus] = useState('Not Enrolled');
```

**Rationale:** A student who hasn't submitted an enrollment request should show `'Not Enrolled'`, not `'Pending'`. `'Pending'` should only appear after submission.

#### Change 2: Derive Enrollment Status from Queue Item (StudentEnrollmentView.jsx, lines 18-22)

**Current code:**
```javascript
const activeStudentId = currentUser?.student_id_number || currentUser?.studentId || currentUser?.account_id || 'STU-2026-0001';
const myEnrollment = registrarQueue.find(q => q.studentIdNumber === activeStudentId || q.studentId === currentUser?.id);

// Resolve active student's selected courses
const currentSelections = studentEnrollmentSelections[activeStudentId] ?? 
  (myEnrollment ? (myEnrollment.courses || []).map(c => c.id) : []);
```

**Add after line 22:**
```javascript
// Derive actual enrollment status from queue item, not global state
const actualEnrollmentStatus = myEnrollment 
  ? myEnrollment.status 
  : (currentSelections.length > 0 ? enrollmentStatus : 'Not Enrolled');
```

**Then replace line 128-131:**

**From:**
```javascript
<span className={`badge ${enrollmentStatus === 'Enrolled' || enrollmentStatus === 'Approved' ? 'badge-success' : 'badge-pending'}`}>
  {enrollmentStatus}
</span>
```

**To:**
```javascript
<span className={`badge ${actualEnrollmentStatus === 'Enrolled' || actualEnrollmentStatus === 'Approved' ? 'badge-success' : actualEnrollmentStatus === 'Rejected' ? 'badge-danger' : 'badge-pending'}`}>
  {actualEnrollmentStatus}
</span>
```

**Rationale:** The badge should display the queue item's actual status, not a stale global state. If a queue item exists, use its status; otherwise, use the global `enrollmentStatus` only if the student has made selections (otherwise show `'Not Enrolled'`).

#### Change 3: Ensure submitEnrollmentRequest Sets Status Correctly (AppContext.jsx, line 860)

**Current code is correct:**
```javascript
setEnrollmentStatus('Pending');
```

This line already sets the status to `'Pending'` when a student submits. No change needed here.

#### Change 4: Ensure approveEnrollmentRequest Updates Queue Status (AppContext.jsx, line 910)

**Current code at lines 910-912:**
```javascript
setRegistrarQueue(prev =>
  prev.map(q => q.id === queueItemId ? { ...q, status: 'Enrolled' } : q)
);
```

This is correct — it sets the queue item status to `'Enrolled'`.

**Current code at line 918:**
```javascript
setEnrollmentStatus('Enrolled');
```

This line updates the global `enrollmentStatus`, but this update only affects the registrar's session, not the student's session (since they're in different browser contexts or localStorage keys). The student's UI must read from the `registrarQueue` item status, not the global `enrollmentStatus`.

**No change needed in AppContext.jsx for this line** — the fix in StudentEnrollmentView.jsx (deriving status from `myEnrollment`) solves the display issue.

#### Change 5: Fix StudentDashboardView to Use Same Derived Status (StudentDashboardView.jsx, lines 17-26)

**Current code:**
```javascript
const myEnrollment = registrarQueue.find(q => q.studentIdNumber === activeStudentId || q.studentId === currentUser?.id);
// ... (lines 18-23 omitted)
const isOfficiallyEnrolled = myEnrollment
  ? (myEnrollment.status === 'Enrolled' || myEnrollment.status === 'Approved')
  : (enrollmentStatus === 'Enrolled' || enrollmentStatus === 'Approved' || (gradedUnits > 0 && selectedUnits === 0));
```

**No change needed** — the logic already checks `myEnrollment.status` first. The fallback to `enrollmentStatus` is correct for students who enrolled in a previous session or have grades but no active queue item.

### Verification
1. **As a new student:** Log in as a new student account. Navigate to Enrollment view. Status badge should show `'Not Enrolled'`, not `'Pending'`.
2. **Submit enrollment:** Select 3-4 subjects and click "Submit Enrollment Request". Status badge should change to `'Pending'`.
3. **As registrar:** Log in as Ramon Alcantara (Registrar). Navigate to Enrollment Approvals. Locate the student's request (status should show `'Pending'`). Click "Approve". Status badge in the queue table should change to `'Enrolled'`.
4. **As student again:** Log out and log back in as the student. Navigate to Enrollment view. Status badge should now show `'Enrolled'`, not `'Pending'`.
5. **Dashboard consistency:** Check the student dashboard. The enrollment status card should display `'ENROLLED • X UNITS'`, not `'PENDING • X UNITS'`.
6. **Rejection flow:** Submit another enrollment request as a different student, then reject it as registrar. Student's badge should show `'Rejected'`.

---

## Issue 3: Fix COR Single-Page Print Layout

### Root Cause
The Certificate of Registration prints across 2 pages because the document content height exceeds the A4 page height with the current padding, margins, and font sizes. The signature/seal section at the bottom overflows to page 2.

**File:** `d:\Student-Services-Information-System\resources\js\views\CertificateOfRegistrationView.jsx`  
**Lines 113-115:** The COR container has `padding: '36px 40px'`, which is appropriate for screen display but too large for print.

**File:** `d:\Student-Services-Information-System\resources\css\app.css`  
**Lines 1172-1197:** The existing `@media print` block hides navigation and resets layout, but does NOT reduce padding/margins or adjust font sizes for the COR document specifically.

### Files to Change
- `d:\Student-Services-Information-System\resources\css\app.css`

### Specific Changes

Add a new `@media print` block at the end of app.css (after line 1197, before the closing of the file) with COR-specific print rules:

```css
/* ==========================================================================
   Certificate of Registration (COR) Single-Page Print Optimization
   ========================================================================== */
@media print {
  @page {
    size: A4;
    margin: 8mm;
  }

  .cor-document,
  #ssis-cor-document {
    max-width: 100% !important;
    padding: 14px 20px !important;
    margin: 0 !important;
    border: none !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    font-size: 10px !important;
    page-break-inside: avoid !important;
  }

  .cor-document h2,
  #ssis-cor-document h2 {
    font-size: 16px !important;
  }

  .cor-document p,
  #ssis-cor-document p {
    font-size: 9px !important;
    margin: 2px 0 !important;
  }

  .cor-document table,
  #ssis-cor-document table {
    font-size: 10px !important;
  }

  .cor-document thead th,
  #ssis-cor-document thead th {
    padding: 5px 6px !important;
    font-size: 9.5px !important;
  }

  .cor-document tbody td,
  #ssis-cor-document tbody td {
    padding: 6px 6px !important;
    font-size: 10px !important;
  }

  .cor-document img,
  #ssis-cor-document img {
    width: 40px !important;
    height: 40px !important;
  }

  /* Reduce spacing in header sections */
  .cor-document > div:first-child,
  #ssis-cor-document > div:first-child {
    margin-bottom: 12px !important;
    padding-bottom: 10px !important;
  }

  /* Compact the student info grid */
  .cor-document > div:first-child > div:last-child,
  #ssis-cor-document > div:first-child > div:last-child {
    padding: 8px 12px !important;
    gap: 8px !important;
    margin-top: 10px !important;
  }

  .cor-document > div:first-child > div:last-child span,
  #ssis-cor-document > div:first-child > div:last-child span {
    font-size: 8.5px !important;
  }

  .cor-document > div:first-child > div:last-child strong,
  #ssis-cor-document > div:first-child > div:last-child strong {
    font-size: 11px !important;
  }

  /* Reduce table section spacing */
  .cor-document > div:nth-child(2),
  #ssis-cor-document > div:nth-child(2) {
    margin-bottom: 14px !important;
  }

  .cor-document > div:nth-child(2) > div:first-child,
  #ssis-cor-document > div:nth-child(2) > div:first-child {
    margin-bottom: 8px !important;
    font-size: 9.5px !important;
  }

  /* Compact the summary section */
  .cor-document > div:nth-child(3),
  #ssis-cor-document > div:nth-child(3) {
    padding-top: 10px !important;
    margin-bottom: 16px !important;
    gap: 12px !important;
  }

  .cor-document > div:nth-child(3) > div,
  #ssis-cor-document > div:nth-child(3) > div {
    font-size: 9px !important;
  }

  .cor-document > div:nth-child(3) > div > div:first-child,
  #ssis-cor-document > div:nth-child(3) > div > div:first-child {
    font-size: 9px !important;
  }

  .cor-document > div:nth-child(3) > div > div:last-child,
  #ssis-cor-document > div:nth-child(3) > div > div:last-child {
    font-size: 13px !important;
  }

  /* Compact the signatures section to prevent overflow */
  .cor-document > div:last-child,
  #ssis-cor-document > div:last-child {
    padding-top: 14px !important;
    page-break-inside: avoid !important;
  }

  .cor-document > div:last-child > div,
  #ssis-cor-document > div:last-child > div {
    width: 160px !important;
  }

  .cor-document > div:last-child > div:nth-child(2),
  #ssis-cor-document > div:last-child > div:nth-child(2) {
    width: 100px !important;
  }

  .cor-document > div:last-child > div:nth-child(2) > div,
  #ssis-cor-document > div:last-child > div:nth-child(2) > div {
    width: 60px !important;
    height: 60px !important;
  }

  .cor-document > div:last-child > div > div:first-child,
  #ssis-cor-document > div:last-child > div > div:first-child {
    padding-bottom: 18px !important;
  }

  .cor-document > div:last-child > div > div:nth-child(2),
  #ssis-cor-document > div:last-child > div > div:nth-child(2) {
    font-size: 10px !important;
  }

  .cor-document > div:last-child > div > div:last-child,
  #ssis-cor-document > div:last-child > div > div:last-child {
    font-size: 9px !important;
  }

  /* Ensure seal text is readable */
  .cor-document > div:last-child > div:nth-child(2) span,
  #ssis-cor-document > div:last-child > div:nth-child(2) span {
    font-size: 6px !important;
  }

  .cor-document > div:last-child > div:nth-child(2) > div:last-child,
  #ssis-cor-document > div:last-child > div:nth-child(2) > div:last-child {
    font-size: 8px !important;
  }
}
```

**Rationale:** 
- Reduces container padding from 36px/40px to 14px/20px in print mode
- Sets `@page` size to A4 with 8mm margins (standard print margins)
- Reduces font sizes proportionally: base 10px (was 12-14px), headings 16px (was 19px), labels 9px
- Reduces table cell padding from 8-9px to 5-6px
- Compacts the signature section and seal to fit within the remaining vertical space
- Uses `page-break-inside: avoid` on the signatures section to keep it together
- All changes are scoped to `@media print` only — screen layout remains unchanged

### Alternative Approach Considered
Modify CertificateOfRegistrationView.jsx to change inline styles. **Rejected** because:
1. CSS `@media print` is the standard way to handle print layouts
2. Keeps screen and print styles separated
3. Easier to maintain and adjust
4. Doesn't clutter the JSX with conditional inline styles

### Verification
1. Navigate to the Certificate of Registration view as a student or registrar
2. Click "Print COR" or use browser's print function (Ctrl+P / Cmd+P)
3. In the print preview, verify:
   - The entire COR document fits on **one page** (not two)
   - The signature section and university seal are visible at the bottom of page 1
   - No content is clipped or cut off
   - Text remains readable (not excessively small or blurry)
   - All sections (header, student info, course table, summary, signatures) are present
4. Close print preview and verify the on-screen COR still looks correct (full padding, normal font sizes)
5. Test with both students who have 2-3 subjects and students with 7 subjects enrolled
6. If the 7-subject COR still overflows slightly, reduce the padding further (try `12px 18px`) or the table cell padding (try `5px 5px`)

---

## Summary of Changes

| Issue | Root Cause | Files Changed | Lines Changed |
|-------|-----------|---------------|---------------|
| **Issue 1: Sidebar Contrast** | Light theme active text color (#881337) has weak contrast (4.3:1) against pill background (#FDE8E9) | `app.css` | Lines 13-14 |
| **Issue 2: Enrollment Status Bug** | (A) Initial `enrollmentStatus` hardcoded to `'Pending'` instead of `'Not Enrolled'`<br>(B) StudentEnrollmentView displays global state instead of deriving from queue item | `AppContext.jsx`<br>`StudentEnrollmentView.jsx` | AppContext line 541<br>StudentEnrollmentView lines 22-23, 128-131 |
| **Issue 3: COR 2-Page Split** | COR container padding (36px 40px), font sizes, and margins too large for A4 print, causing signature section to overflow to page 2 | `app.css` | Add new `@media print` block after line 1197 (~180 lines) |

**Total files modified:** 3  
**Estimated implementation time:** 30-45 minutes  
**Risk level:** Low (all changes are isolated, scoped, and reversible)

---

## Testing Checklist

### Issue 1: Sidebar Active Item
- [ ] Light theme: Active sidebar item text is clearly readable against pill background
- [ ] Light theme: Active pill has visual separation from sidebar background
- [ ] Dark theme: Active item remains yellow and unchanged
- [ ] Both themes: Inactive items remain readable and distinguishable from active

### Issue 2: Enrollment Status
- [ ] New student sees "Not Enrolled" before submitting enrollment
- [ ] After submission, status changes to "Pending"
- [ ] Registrar sees "Pending" in queue table
- [ ] After registrar approval, queue table shows "Enrolled"
- [ ] Student sees "Enrolled" after logging back in
- [ ] Student dashboard shows "ENROLLED • X UNITS"
- [ ] Rejected enrollment shows "Rejected" badge

### Issue 3: COR Printing
- [ ] Print preview shows complete COR on one page
- [ ] Signature section visible at bottom of page 1
- [ ] No content clipped or cut off
- [ ] Text remains readable (not too small)
- [ ] Screen display unchanged (full padding, normal fonts)
- [ ] Works with 2-3 subjects enrolled
- [ ] Works with 7 subjects enrolled

---

## Notes for Implementation

1. **Issue 1** is a simple CSS variable change. Test in both themes immediately after editing.

2. **Issue 2** requires careful state synchronization. The key insight is that `enrollmentStatus` is a *global* state that doesn't automatically sync across student/registrar sessions. The fix is to make StudentEnrollmentView read from the `registrarQueue` item directly (the source of truth) instead of relying on the global state.

3. **Issue 3** involves many selector-specific print rules. After adding the CSS block, test with the actual browser print preview (not just visual inspection). If the COR still overflows slightly, reduce padding or font sizes incrementally (e.g., `padding: 12px 18px`, base font `9.5px`).

4. **Do not** make changes outside the scope of these three issues. Do not refactor, add features, or "improve" unrelated code.

5. Run the application and test each fix manually. Automated tests are not required for CSS and UI state fixes, but verify the actual rendered output.

---

## Definition of Done

- [ ] All three issues are fixed
- [ ] Sidebar active item is readable in light theme
- [ ] Enrollment status displays correctly throughout the approval workflow
- [ ] COR prints on one page without clipping
- [ ] All verification tests pass
- [ ] No unrelated functionality is broken
- [ ] Code changes are minimal and targeted
