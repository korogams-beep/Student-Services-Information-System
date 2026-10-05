/**
 * Academic Standing & Dean's List Evaluation Utility
 * Follows Pamantasan ng Cabuyao (PNC) & CHED Academic Standards
 *
 * Rules:
 * 1. President's Honor List (1st Honors): GWA 1.00 – 1.45, no grade > 2.00, no failing grade (5.00/INC/Drop).
 * 2. Dean's Honor List (2nd Honors): GWA 1.46 – 1.75, no grade > 2.50, no failing grade (5.00/INC/Drop).
 * 3. Ineligible / Disqualified: Any failing grade (5.00) or GWA > 1.75 disqualifies student from Dean's List.
 * 4. Regular Academic Standing: GWA between 1.76 and 3.00, all courses passed.
 * 5. Default 0 State: If 0 units or no grades evaluated, status is 'No Grades Recorded Yet'.
 */

export const computeAcademicStanding = (gradesList = []) => {
  if (!gradesList || gradesList.length === 0) {
    return {
      status: 'No Grades Evaluated',
      badgeClass: 'badge-pending',
      badgeColor: '#64748B',
      badgeBg: '#F1F5F9',
      isDeansList: false,
      isPresidentsList: false,
      gwaDisplay: '0.00',
      totalUnits: 0,
      description: 'No academic records have been encoded yet. Awaiting Registrar evaluation.',
      hasFailingGrade: false,
    };
  }

  // Filter valid courses
  const validGrades = gradesList.filter(
    g => g && (typeof g.grade === 'number' || (!isNaN(parseFloat(g.grade)) && parseFloat(g.grade) > 0))
  );

  if (validGrades.length === 0) {
    return {
      status: 'No Grades Evaluated',
      badgeClass: 'badge-pending',
      badgeColor: '#64748B',
      badgeBg: '#F1F5F9',
      isDeansList: false,
      isPresidentsList: false,
      gwaDisplay: '0.00',
      totalUnits: 0,
      description: 'No academic records have been encoded yet. Awaiting Registrar evaluation.',
      hasFailingGrade: false,
    };
  }

  let totalWeighted = 0;
  let totalUnits = 0;
  let hasFailingGrade = false;
  let highestSingleGrade = 1.0;
  let lowestSingleGrade = 1.0;

  validGrades.forEach(g => {
    const numGrade = parseFloat(g.grade);
    const units = Number(g.units) || 3;
    totalWeighted += numGrade * units;
    totalUnits += units;

    if (numGrade > 3.00 || g.remarks === 'Failed') {
      hasFailingGrade = true;
    }
    if (numGrade > lowestSingleGrade) lowestSingleGrade = numGrade;
  });

  const numericGwa = totalUnits > 0 ? parseFloat((totalWeighted / totalUnits).toFixed(2)) : 0.00;
  const gwaDisplay = numericGwa.toFixed(2);

  // 1. Deficient / Failed Grade Check
  if (hasFailingGrade) {
    return {
      status: 'Ineligible for Honors (Has Failing Grade)',
      badgeClass: 'badge-danger',
      badgeColor: '#DC2626',
      badgeBg: '#FEF2F2',
      isDeansList: false,
      isPresidentsList: false,
      gwaDisplay,
      totalUnits,
      description: `Contains at least one failed course (5.00). Ineligible for Dean's Honor List regardless of GWA.`,
      hasFailingGrade: true,
      hasWarning: true,
    };
  }

  // 2. President's List (1.00 – 1.45)
  if (numericGwa >= 1.00 && numericGwa <= 1.45 && lowestSingleGrade <= 2.00 && totalUnits >= 12) {
    return {
      status: `President's Honor List Standing`,
      badgeClass: 'badge-success',
      badgeColor: '#166534',
      badgeBg: '#DCFCE7',
      isDeansList: true,
      isPresidentsList: true,
      gwaDisplay,
      totalUnits,
      description: `First Honors • Exceptional academic excellence with GWA of ${gwaDisplay}.`,
      hasFailingGrade: false,
    };
  }

  // 3. Dean's Honor List (1.46 – 1.75)
  if (numericGwa <= 1.75 && lowestSingleGrade <= 2.50 && totalUnits >= 12) {
    return {
      status: `Dean's Honor List Standing`,
      badgeClass: 'badge-success',
      badgeColor: '#1E40AF',
      badgeBg: '#DBEAFE',
      isDeansList: true,
      isPresidentsList: false,
      gwaDisplay,
      totalUnits,
      description: `Second Honors • Commendable academic standing with GWA of ${gwaDisplay}.`,
      hasFailingGrade: false,
    };
  }

  // 4. Good / Regular Academic Standing (GWA 1.76 – 3.00, no failing grade)
  if (numericGwa <= 3.00) {
    return {
      status: 'Good Academic Standing',
      badgeClass: 'badge-review',
      badgeColor: '#475569',
      badgeBg: '#F1F5F9',
      isDeansList: false,
      isPresidentsList: false,
      gwaDisplay,
      totalUnits,
      description: `Satisfactory academic standing. Current GWA (${gwaDisplay}) does not meet the Dean's List cutoff (1.75).`,
      hasFailingGrade: false,
    };
  }

  // 5. Academic Probation (GWA > 3.00)
  return {
    status: 'Academic Warning',
    badgeClass: 'badge-danger',
    badgeColor: '#DC2626',
    badgeBg: '#FEF2F2',
    isDeansList: false,
    isPresidentsList: false,
    gwaDisplay,
    totalUnits,
    description: `GWA exceeds 3.00. Subject to academic retention counseling.`,
    hasFailingGrade: true,
    hasWarning: true,
  };
};
