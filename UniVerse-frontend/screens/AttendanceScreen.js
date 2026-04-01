import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ScrollView, StatusBar, Alert, Modal, TextInput,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import {
  MOCK_SUBJECT_ATTENDANCE, MOCK_DAYWISE_ATTENDANCE, MOCK_STUDENT,
} from '../data/mockData';

// ─────────────────────────────────────────────────────────────────────────────
// CSE 06 — real student list from the uploaded Excel sheet
// ─────────────────────────────────────────────────────────────────────────────
const CSE06_STUDENTS = [
  { id: '1',  name: 'R. Ashish',         regNo: '322506402355' },
  { id: '2',  name: 'R. Sumali',          regNo: '322506402357' },
  { id: '3',  name: 'S. Gyaneswari',      regNo: '322506402359' },
  { id: '4',  name: 'S Rupa Harshitha',   regNo: '322506402360' },
  { id: '5',  name: 'S. Gayatri',         regNo: '322506402361' },
  { id: '6',  name: 'Sai Moksha',         regNo: '322506402362' },
  { id: '7',  name: 'S. Anshul',          regNo: '322506402363' },
  { id: '8',  name: 'S. Vamsi',           regNo: '322506402364' },
  { id: '9',  name: 'S Karthik',          regNo: '322506402365' },
  { id: '10', name: 'S Ashwik',           regNo: '322506402366' },
  { id: '11', name: 'S Parjanya',         regNo: '322506402367' },
  { id: '12', name: 'S Balaji',           regNo: '322506402368' },
  { id: '13', name: 'S Jaswanth',         regNo: '322506402369' },
  { id: '14', name: 'S Prashanth',        regNo: '322506402370' },
  { id: '15', name: 'S Ishaan',           regNo: '322506402371' },
  { id: '16', name: 'S Uday',             regNo: '322506402372' },
  { id: '17', name: 'S Thagur',           regNo: '322506402373' },
  { id: '18', name: 'S Pallavi',          regNo: '322506402375' },
];

const MOCK_SCHEDULE = [
  { id: 'c1', subject: 'Data Structures',   code: 'CS401', time: '09:00 AM', year: '4th Year', section: 'CSE 06', room: 'Lab 3' },
  { id: 'c2', subject: 'Operating Systems', code: 'CS402', time: '11:00 AM', year: '4th Year', section: 'CSE 06', room: 'Room 204' },
  { id: 'c3', subject: 'Computer Networks', code: 'CS403', time: '01:00 PM', year: '4th Year', section: 'CSE 06', room: 'Room 101' },
  { id: 'c4', subject: 'Machine Learning',  code: 'CS404', time: '03:00 PM', year: '4th Year', section: 'CSE 06', room: 'Lab 5' },
];

const FACULTY_PASSWORD = '1234';

// null = unmarked, true = present, false = absent
const freshStudents = () => CSE06_STUDENTS.map(st => ({ ...st, present: null }));

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const pctColor = p => p >= 75 ? COLORS.success : p >= 65 ? COLORS.warning : COLORS.danger;

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_HEADERS = ['S','M','T','W','T','F','S'];

// Pastel calendar colors
const CAL_COLORS = {
  present: '#A7F3D0',
  partial:  '#FEF08A',
  absent:   '#FECACA',
  none:     '#E5E7EB',
};

// ─────────────────────────────────────────────────────────────────────────────
// PART 1 — SVG Circular Progress Ring

const RING_SIZE   = 160;
const RING_STROKE = 14;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRC   = 2 * Math.PI * RING_RADIUS;
const RING_CENTER = RING_SIZE / 2;

const ringColor = (pct) => {
  if (pct >= 75) return '#22C55E'; // green
  if (pct >= 65) return '#FACC15'; // yellow
  return '#EF4444';                // red
};

const AttendanceRing = ({ percentage }) => {
  const pct    = Math.min(100, Math.max(0, percentage));
  const offset = RING_CIRC * (1 - pct / 100);
  const color  = ringColor(pct);

  return (
    <View style={s.ringWrapper}>
      <View style={s.ringContainer}>
        <Svg width={RING_SIZE} height={RING_SIZE} style={{ position: 'absolute' }}>
          {/* Grey track */}
          <Circle
            cx={RING_CENTER}
            cy={RING_CENTER}
            r={RING_RADIUS}
            stroke="#E5E7EB"
            strokeWidth={RING_STROKE}
            fill="none"
          />
          {/* Coloured progress arc — starts from 12 o'clock (rotate -90°) */}
          <Circle
            cx={RING_CENTER}
            cy={RING_CENTER}
            r={RING_RADIUS}
            stroke={color}
            strokeWidth={RING_STROKE}
            fill="none"
            strokeDasharray={`${RING_CIRC} ${RING_CIRC}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${RING_CENTER}, ${RING_CENTER}`}
          />
        </Svg>

        {/* White inner disc — keeps centre clean */}
        <View style={s.ringInnerDisc} />

        {/* Centered text */}
        <View style={s.ringTextWrap}>
          <Text style={[s.ringPct, { color }]}>{pct}%</Text>
          <Text style={s.ringLabel}>Overall</Text>
        </View>
      </View>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PART 2 — Clean Subject Card (no icons / hint text)
// ─────────────────────────────────────────────────────────────────────────────
const SubjectCard = ({ subject }) => {
  const pct   = subject.percentage;
  const color = pctColor(pct);
  return (
    <View style={s.subCard}>
      <View style={s.subTop}>
        <Text style={s.subName} numberOfLines={2}>{subject.subject}</Text>
        <Text style={[s.subPct, { color }]}>{pct}%</Text>
      </View>
      <Text style={s.subClasses}>{subject.present} / {subject.total} classes attended</Text>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PARTS 3, 4, 5 — Calendar with month navigation + pastel colors + day-click
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Rich inline day-wise mock data.
 * Covers the current month with a realistic spread of all four states:
 *   present (green), partial (yellow), absent (red), no-data (grey).
 * Also provides subject-level records so day-click detail works.
 */
const SUBJECTS = [
  'Data Structures',
  'Operating Systems',
  'Computer Networks',
  'Machine Learning',
];

const makeRecords = (statuses) =>
  SUBJECTS.map((subject, i) => ({ subject, status: statuses[i] || 'absent' }));

// Build entries for the current month
const _buildLocalEntries = () => {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  const today = now.getDate();

  const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  // Pattern per date (1-based). Weekends get no data automatically below.
  // p=present, a=absent, x=partial
  const PATTERN = {
    1:  'p', 2:  'p', 3:  'p', 4:  'a', 5:  'p',
    6:  'x', 7:  'p', 8:  'p', 9:  'a', 10: 'p',
    11: 'p', 12: 'x', 13: 'a', 14: 'p', 15: 'p',
    16: 'a', 17: 'p', 18: 'p', 19: 'x', 20: 'a',
    21: 'p', 22: 'p', 23: 'x', 24: 'p', 25: 'a',
    26: 'p', 27: 'p', 28: 'x',
  };

  const entries = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let d = 1; d <= Math.min(daysInMonth, today); d++) {
    const date   = new Date(year, month, d);
    const dow    = date.getDay(); // 0=Sun, 6=Sat
    const dayName = DAY_NAMES[dow];
    const monthAbbr = MONTH_NAMES[month].slice(0, 3);
    const dateStr   = `${d} ${monthAbbr}`;

    // Weekends — no data
    if (dow === 0 || dow === 6) {
      entries.push({ day: dayName, date: dateStr, records: [] });
      continue;
    }

    const pat = PATTERN[d] || 'p';
    let records;
    if (pat === 'p') {
      records = makeRecords(['present','present','present','present']);
    } else if (pat === 'a') {
      records = makeRecords(['absent','absent','absent','absent']);
    } else {
      // partial — mix present/absent
      records = makeRecords(['present','absent','present','absent']);
    }
    entries.push({ day: dayName, date: dateStr, records });
  }
  return entries;
};

const LOCAL_DAYWISE = _buildLocalEntries();

// Merge: LOCAL_DAYWISE takes priority; fall back to MOCK_DAYWISE_ATTENDANCE for other months
const _buildDateMap = () => {
  const map   = {};
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth();

  // Index LOCAL_DAYWISE entries (current month)
  LOCAL_DAYWISE.forEach(entry => {
    const parts = entry.date.trim().split(' ');
    if (parts.length < 2) return;
    const d = parseInt(parts[0], 10);
    const m = MONTH_NAMES.findIndex(mn => mn.toLowerCase().startsWith(parts[1].toLowerCase()));
    if (m === -1 || isNaN(d)) return;
    const key = `${year}-${String(m + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const records = entry.records || [];
    if (records.length === 0) { map[key] = 'none'; return; }
    const pc = records.filter(r => r.status === 'present').length;
    if (pc === records.length) map[key] = 'present';
    else if (pc === 0) map[key] = 'absent';
    else map[key] = 'partial';
  });

  // Also index MOCK_DAYWISE_ATTENDANCE for any other months it may cover
  MOCK_DAYWISE_ATTENDANCE.forEach(entry => {
    const parts = entry.date.trim().split(' ');
    if (parts.length < 2) return;
    const d = parseInt(parts[0], 10);
    const m = MONTH_NAMES.findIndex(mn => mn.toLowerCase().startsWith(parts[1].toLowerCase()));
    if (m === -1 || isNaN(d)) return;
    // Only add if not already set by LOCAL_DAYWISE
    const key = `${year}-${String(m + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    if (map[key]) return;
    const records = entry.records || [];
    if (records.length === 0) { map[key] = 'none'; return; }
    const pc = records.filter(r => r.status === 'present').length;
    if (pc === records.length) map[key] = 'present';
    else if (pc === 0) map[key] = 'absent';
    else map[key] = 'partial';
  });

  return map;
};

const DATE_MAP = _buildDateMap();

// Combined lookup list used by day-click detail
const ALL_DAYWISE = [...LOCAL_DAYWISE, ...MOCK_DAYWISE_ATTENDANCE];

const CalendarView = () => {
  const today = new Date();
  const [calYear,  setCalYear]  = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDateKey, setSelectedDateKey] = useState(null);

  const isFutureMonth =
    calYear > today.getFullYear() ||
    (calYear === today.getFullYear() && calMonth > today.getMonth());

  // Navigate months
  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
    setSelectedDateKey(null);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
    setSelectedDateKey(null);
  };

  // Build grid cells: leading nulls + day numbers
  const firstDay = new Date(calYear, calMonth, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  // Find the MOCK_DAYWISE_ATTENDANCE entry for a selected date key
  const selectedEntry = selectedDateKey
    ? (() => {
        const [, mm, dd] = selectedDateKey.split('-');
        const monthAbbr = MONTH_NAMES[parseInt(mm, 10) - 1]?.slice(0, 3);
        const dayNum = parseInt(dd, 10);
        return ALL_DAYWISE.find(e => {
          const parts = e.date.trim().split(' ');
          return (
            parseInt(parts[0], 10) === dayNum &&
            parts[1]?.toLowerCase() === monthAbbr?.toLowerCase()
          );
        });
      })()
    : null;

  return (
    <View>
      {/* ── Month navigation header ── */}
      <View style={s.calNavRow}>
        <TouchableOpacity onPress={prevMonth} style={s.calNavBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={s.calNavTitle}>{MONTH_NAMES[calMonth]} {calYear}</Text>
        <TouchableOpacity onPress={nextMonth} style={s.calNavBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* ── Weekday headers ── */}
      <View style={s.calHeaderRow}>
        {DAY_HEADERS.map((d, i) => (
          <Text key={i} style={s.calHeaderCell}>{d}</Text>
        ))}
      </View>

      {/* ── Date grid ── */}
      <View style={s.calGrid}>
        {cells.map((day, idx) => {
          if (day === null) {
            return <View key={`empty-${idx}`} style={s.calCell} />;
          }
          const key = `${calYear}-${String(calMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          const status = isFutureMonth ? 'none' : (DATE_MAP[key] || 'none');
          const bg = CAL_COLORS[status];
          const isSelected = selectedDateKey === key;
          return (
            <TouchableOpacity
              key={key}
              style={[s.calCell, { backgroundColor: bg }, isSelected && s.calCellSelected]}
              onPress={() => setSelectedDateKey(isSelected ? null : key)}
              activeOpacity={0.75}
            >
              <Text style={[s.calCellTxt, isSelected && s.calCellTxtSelected]}>{day}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Legend ── */}
      <View style={s.calLegend}>
        {[['Present','#A7F3D0'],['Partial','#FEF08A'],['Absent','#FECACA'],['No data','#E5E7EB']].map(([lbl, col]) => (
          <View key={lbl} style={s.calLegendItem}>
            <View style={[s.calLegendDot, { backgroundColor: col }]} />
            <Text style={s.calLegendTxt}>{lbl}</Text>
          </View>
        ))}
      </View>

      {/* ── PART 5 — Day-click details ── */}
      {selectedEntry ? (
        <View style={s.dayDetailBox}>
          <Text style={s.dayDetailHeading}>{selectedEntry.day}  ·  {selectedEntry.date}</Text>
          <Text style={s.dayDetailSub}>{selectedEntry.records.length} subject{selectedEntry.records.length !== 1 ? 's' : ''} recorded</Text>
          {selectedEntry.records.length === 0 ? (
            <View style={s.daywiseEmpty}>
              <Ionicons name="calendar-outline" size={32} color={COLORS.textMuted} />
              <Text style={s.daywiseEmptyTxt}>No classes recorded</Text>
            </View>
          ) : (
            selectedEntry.records.map((rec, i) => (
              <View key={i} style={s.recCard}>
                <View style={[s.recStatusBox, { backgroundColor: rec.status === 'present' ? COLORS.success + '1A' : COLORS.danger + '15' }]}>
                  <Ionicons
                    name={rec.status === 'present' ? 'checkmark-circle' : 'close-circle'}
                    size={24}
                    color={rec.status === 'present' ? COLORS.success : COLORS.danger}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.recSubject} numberOfLines={2}>{rec.subject}</Text>
                  <Text style={[s.recStatusLbl, { color: rec.status === 'present' ? COLORS.success : COLORS.danger }]}>
                    {rec.status === 'present' ? 'Present' : 'Absent'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      ) : selectedDateKey ? (
        <View style={s.dayDetailBox}>
          <Text style={s.dayDetailHeading}>No records found</Text>
          <Text style={s.dayDetailSub}>No attendance data for this date.</Text>
        </View>
      ) : null}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Student Attendance — Overview + Day-wise tabs
// ─────────────────────────────────────────────────────────────────────────────
const StudentAttendance = () => {
  const overall = MOCK_STUDENT.overallAttendance;
  const [tab, setTab] = useState('Overview');

  return (
    <View style={{ flex: 1 }}>
      <View style={s.tabSwitcher}>
        {['Overview', 'Day-wise'].map(t => (
          <TouchableOpacity key={t} style={[s.tabBtn, tab === t && s.tabBtnActive]} onPress={() => setTab(t)} activeOpacity={0.8}>
            <Text style={[s.tabBtnTxt, tab === t && s.tabBtnTxtActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'Overview' ? (
        <ScrollView contentContainerStyle={s.scrollBody} showsVerticalScrollIndicator={false}>
          {/* PART 1 — Circular ring */}
          <AttendanceRing percentage={overall} />

          {/* PART 2 — Subject cards */}
          <Text style={s.secTitle}>Subject-wise Attendance</Text>
          {MOCK_SUBJECT_ATTENDANCE.map((sub, i) => <SubjectCard key={i} subject={sub} />)}
        </ScrollView>
      ) : (
        /* PARTS 3, 4, 5 — Calendar view */
        <ScrollView contentContainerStyle={[s.scrollBody, { paddingBottom: 60 }]} showsVerticalScrollIndicator={false}>
          <CalendarView />
        </ScrollView>
      )}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Faculty Attendance (unchanged logic — only UI untouched here)
// ─────────────────────────────────────────────────────────────────────────────
const FacultyAttendance = () => {
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents]           = useState(freshStudents());
  const [submitted, setSubmitted]         = useState(false);
  const [showSummary, setShowSummary]     = useState(false);

  // password modal state
  const [pwdModal, setPwdModal]   = useState(false);
  const [pwdInput, setPwdInput]   = useState('');
  const [pwdError, setPwdError]   = useState('');
  const [pwdAction, setPwdAction] = useState(null); // 'edit' | 'toggle:ID'

  const presentCount  = students.filter(st => st.present === true).length;
  const absentCount   = students.filter(st => st.present === false).length;
  const unmarkedCount = students.filter(st => st.present === null).length;
  const pct           = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0;

  // Open password prompt
  const askPassword = (action) => {
    setPwdAction(action);
    setPwdInput('');
    setPwdError('');
    setPwdModal(true);
  };

  // Confirm password
  const confirmPassword = () => {
    if (pwdInput !== FACULTY_PASSWORD) {
      setPwdError('Incorrect password. Try again.');
      return;
    }
    setPwdModal(false);
    if (pwdAction === 'edit') {
      setSubmitted(false);
      setShowSummary(false);
    } else if (typeof pwdAction === 'string' && pwdAction.startsWith('toggle:')) {
      const parts = pwdAction.split(':');
      const id   = parts[1];
      const side = parts[2];
      if (side !== undefined) {
        setStatus(id, side === 'true');
      } else {
        doToggle(id);
      }
    }
  };

  const doToggle = (id) => {
    setStudents(prev => prev.map(st => {
      if (st.id !== id) return st;
      const next = st.present === null ? true : st.present === true ? false : null;
      return { ...st, present: next };
    }));
  };

  const setStatus = (id, newPresent) => {
    setStudents(prev => prev.map(st => {
      if (st.id !== id) return st;
      if (st.present === newPresent) return { ...st, present: null };
      return { ...st, present: newPresent };
    }));
  };

  const handleTagPress = (id, tappingPresent) => {
    if (submitted) {
      askPassword(`toggle:${id}:${tappingPresent}`);
    } else {
      setStatus(id, tappingPresent);
    }
  };

  const handleSubmit = () => {
    Alert.alert(
      'Submit Attendance',
      `Present: ${presentCount}  |  Absent: ${absentCount}  |  ${pct}%\n\nConfirm submission?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Submit', onPress: () => { setSubmitted(true); setShowSummary(true); } },
      ]
    );
  };

  const handleReset = () => {
    setSelectedClass(null);
    setStudents(freshStudents());
    setSubmitted(false);
    setShowSummary(false);
  };

  // ── Password Modal ────────────────────────────────────────────────────────
  const PasswordModal = () => (
    <Modal visible={pwdModal} transparent animationType="fade">
      <View style={s.modalOverlay}>
        <View style={s.pwdBox}>
          <View style={s.pwdIconWrap}>
            <Ionicons name="lock-closed" size={28} color={COLORS.primary} />
          </View>
          <Text style={s.pwdTitle}>Verification Required</Text>
          <Text style={s.pwdSub}>
            {pwdAction === 'edit'
              ? 'Enter your password to edit submitted attendance.'
              : 'Attendance is locked. Enter password to change this entry.'}
          </Text>
          <TextInput
            style={[s.pwdInput, pwdError ? { borderColor: COLORS.danger } : {}]}
            placeholder="Faculty password"
            placeholderTextColor={COLORS.textMuted}
            secureTextEntry
            value={pwdInput}
            onChangeText={t => { setPwdInput(t); setPwdError(''); }}
            autoFocus
          />
          {!!pwdError && <Text style={s.pwdErr}>{pwdError}</Text>}
          <View style={s.pwdBtns}>
            <TouchableOpacity style={s.pwdCancelBtn} onPress={() => setPwdModal(false)} activeOpacity={0.8}>
              <Text style={s.pwdCancelTxt}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.pwdConfirmBtn} onPress={confirmPassword} activeOpacity={0.8}>
              <Text style={s.pwdConfirmTxt}>Confirm</Text>
            </TouchableOpacity>
          </View>
          <Text style={s.pwdHint}>Demo password: 1234</Text>
        </View>
      </View>
    </Modal>
  );

  // ── Summary screen ────────────────────────────────────────────────────────
  if (showSummary) {
    const absentStudents = students.filter(st => !st.present);
    return (
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.summaryPage} showsVerticalScrollIndicator={false}>
          <View style={s.summaryBadge}>
            <View style={s.summaryIconCircle}>
              <Ionicons name="checkmark-circle" size={52} color={COLORS.success} />
            </View>
            <Text style={s.summaryTitle}>Attendance Submitted</Text>
            <Text style={s.summarySub}>{selectedClass?.subject}  ·  {selectedClass?.time}</Text>
            <Text style={s.summarySub2}>{selectedClass?.section}  ·  {selectedClass?.year}</Text>
          </View>
          <View style={s.statsRow}>
            <View style={[s.statBox, { borderColor: COLORS.success }]}>
              <Text style={[s.statVal, { color: COLORS.success }]}>{presentCount}</Text>
              <Text style={s.statLbl}>Present</Text>
            </View>
            <View style={[s.statBox, { borderColor: COLORS.danger }]}>
              <Text style={[s.statVal, { color: COLORS.danger }]}>{absentCount}</Text>
              <Text style={s.statLbl}>Absent</Text>
            </View>
            <View style={[s.statBox, { borderColor: COLORS.primary }]}>
              <Text style={[s.statVal, { color: COLORS.primary }]}>{pct}%</Text>
              <Text style={s.statLbl}>Present %</Text>
            </View>
          </View>
          {absentStudents.length > 0 && (
            <View style={s.absentCard}>
              <Text style={s.absentCardTitle}>Absent Students  ({absentStudents.length})</Text>
              {absentStudents.map((st, i) => (
                <View key={st.id} style={[s.absentRow, i === absentStudents.length - 1 && { borderBottomWidth: 0 }]}>
                  <View style={s.absentAvatar}>
                    <Text style={s.absentAvatarTxt}>{st.name.trim()[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.absentName}>{st.name.trim()}</Text>
                    <Text style={s.absentReg}>{st.regNo}</Text>
                  </View>
                  <View style={s.absentBadge}><Text style={s.absentBadgeTxt}>Absent</Text></View>
                </View>
              ))}
            </View>
          )}
          <TouchableOpacity style={s.editBtn} onPress={() => askPassword('edit')} activeOpacity={0.85}>
            <Ionicons name="create-outline" size={18} color={COLORS.primary} />
            <Text style={s.editBtnTxt}>Edit Attendance</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.doneBtn} onPress={handleReset} activeOpacity={0.88}>
            <Text style={s.doneBtnTxt}>Mark Another Class</Text>
          </TouchableOpacity>
        </ScrollView>
        <PasswordModal />
      </View>
    );
  }

  // ── Class selector ────────────────────────────────────────────────────────
  if (!selectedClass) {
    const todayLabel = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
    return (
      <ScrollView contentContainerStyle={s.scrollBody} showsVerticalScrollIndicator={false}>
        <View style={s.dateRow}>
          <Ionicons name="calendar-outline" size={15} color={COLORS.textMuted} />
          <Text style={s.dateTxt}>{todayLabel}</Text>
        </View>
        <View style={s.infoCard}>
          <Ionicons name="information-circle-outline" size={18} color={COLORS.primary} />
          <Text style={s.infoTxt}>Select a class from today's schedule to begin marking attendance.</Text>
        </View>
        <Text style={s.secTitle}>Today's Schedule</Text>
        {MOCK_SCHEDULE.map(cls => (
          <TouchableOpacity
            key={cls.id}
            style={s.schedCard}
            onPress={() => { setSelectedClass(cls); setStudents(freshStudents()); setSubmitted(false); setShowSummary(false); }}
            activeOpacity={0.85}
          >
            <View style={s.schedTimeBadge}>
              <Text style={s.schedTimeTop}>{cls.time.split(' ')[0]}</Text>
              <Text style={s.schedTimeBot}>{cls.time.split(' ')[1]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.schedSubject}>{cls.subject}</Text>
              <Text style={s.schedCode}>{cls.code}</Text>
              <Text style={s.schedMeta}>{cls.year}  ·  {cls.section}  ·  {cls.room}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  }

  // ── Mark attendance ───────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1 }}>
      {/* Class header */}
      <View style={s.classHeader}>
        <TouchableOpacity onPress={() => setSelectedClass(null)} style={s.backBtn} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.classHeaderTitle}>{selectedClass.subject}</Text>
          <Text style={s.classHeaderMeta}>{selectedClass.section}  ·  {selectedClass.time}</Text>
        </View>
        <View style={s.presentPill}>
          <Text style={s.presentPillTxt}>{presentCount}/{students.length}</Text>
        </View>
      </View>

      {/* Locked banner */}
      {submitted && (
        <View style={s.lockedBanner}>
          <Ionicons name="lock-closed" size={13} color={COLORS.warning} />
          <Text style={s.lockedTxt}>Submitted — password required to edit</Text>
        </View>
      )}

      {/* Live stats strip */}
      <View style={s.statsStrip}>
        <View style={s.stripItem}>
          <View style={[s.stripDot, { backgroundColor: COLORS.success }]} />
          <Text style={s.stripLabel}>Present</Text>
          <Text style={[s.stripVal, { color: COLORS.success }]}>{presentCount}</Text>
        </View>
        <View style={s.stripSep} />
        <View style={s.stripItem}>
          <View style={[s.stripDot, { backgroundColor: COLORS.danger }]} />
          <Text style={s.stripLabel}>Absent</Text>
          <Text style={[s.stripVal, { color: COLORS.danger }]}>{absentCount}</Text>
        </View>
        <View style={s.stripSep} />
        <View style={s.stripItem}>
          <View style={[s.stripDot, { backgroundColor: COLORS.textMuted }]} />
          <Text style={s.stripLabel}>Unmarked</Text>
          <Text style={[s.stripVal, { color: COLORS.textMuted }]}>{unmarkedCount}</Text>
        </View>
      </View>

      {/* Student list */}
      <FlatList
        data={students}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.listPad}
        ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
        renderItem={({ item, index }) => {
          const isPresent  = item.present === true;
          const isAbsent   = item.present === false;
          const isUnmarked = item.present === null;
          return (
            <View style={s.stuRow}>
              <Text style={s.stuNum}>{index + 1}</Text>
              <Text style={s.stuName} numberOfLines={1}>{item.name.trim()}</Text>
              <TouchableOpacity
                style={[
                  s.navyTag,
                  isPresent  && s.navyTagPresent,
                  isAbsent   && s.navyTagAbsent,
                  isUnmarked && s.navyTagUnmarked,
                ]}
                onPress={() => {
                  if (isUnmarked) handleTagPress(item.id, true);   // Mark → Present
                  else if (isPresent) handleTagPress(item.id, false); // Present → Absent
                  else handleTagPress(item.id, null);               // Absent → Unmarked
                }}
                activeOpacity={0.8}
              >
                <Text style={[
                  s.navyTagTxt,
                  isPresent  && s.navyTagTxtPresent,
                  isAbsent   && s.navyTagTxtAbsent,
                  isUnmarked && s.navyTagTxtUnmarked,
                ]}>
                  {isPresent ? 'Present' : isAbsent ? 'Absent' : 'Mark'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      {/* Docked submit */}
      {!submitted && (
        <View style={s.submitFooter}>
          <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} activeOpacity={0.88}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
            <Text style={s.submitTxt}>Submit Attendance  ·  {students.length} students</Text>
          </TouchableOpacity>
        </View>
      )}

      <PasswordModal />
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Root export
// ─────────────────────────────────────────────────────────────────────────────
export default function AttendanceScreen({ route }) {
  const role = route?.params?.role || 'student';
  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={[COLORS.primary, COLORS.primaryMid]} style={s.header}>
        <Text style={s.headerTitle}>Attendance</Text>
        <Text style={s.headerSub}>
          {role === 'faculty' ? 'Mark & manage class attendance' : 'Track your attendance records'}
        </Text>
      </LinearGradient>
      {role === 'student' ? <StudentAttendance /> : <FacultyAttendance />}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: COLORS.bgLight },
  header: { paddingTop: 62, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.lg },
  headerTitle: { fontSize: FONTS.sizes.xxxl, fontWeight: '900', color: COLORS.secondary },
  headerSub:   { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.6)', marginTop: 4 },

  // ── Shared ──────────────────────────────────────────────────────────────
  scrollBody: { padding: SPACING.md, paddingBottom: 110 },
  secTitle:   { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.sm, marginTop: SPACING.sm },

  // ── Tab switcher ─────────────────────────────────────────────────────────
  tabSwitcher:     { flexDirection: 'row', margin: SPACING.md, backgroundColor: COLORS.cardBg, borderRadius: RADIUS.full, padding: 3, borderWidth: 1, borderColor: COLORS.cardBorder },
  tabBtn:          { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: RADIUS.full },
  tabBtnActive:    { backgroundColor: COLORS.primary },
  tabBtnTxt:       { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.textSecondary },
  tabBtnTxtActive: { color: COLORS.secondary },

  // ── PART 1 — SVG Progress Ring ──────────────────────────────────────────
  ringWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.lg,
  },
  ringContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // White disc punches out the SVG circle centre to create the hollow ring
  ringInnerDisc: {
    position: 'absolute',
    width: RING_SIZE - RING_STROKE * 2,
    height: RING_SIZE - RING_STROKE * 2,
    borderRadius: (RING_SIZE - RING_STROKE * 2) / 2,
    backgroundColor: '#FFFFFF',
  },
  ringTextWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPct: {
    fontSize: 38,
    fontWeight: '900',
    lineHeight: 42,
  },
  ringLabel: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginTop: 2,
  },

  // ── PART 2 — Subject cards (minimal) ────────────────────────────────────
  subCard:    { backgroundColor: COLORS.cardBg, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOWS.card, borderWidth: 1, borderColor: COLORS.cardBorder },
  subTop:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  subName:    { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.textPrimary, flex: 1, marginRight: SPACING.sm },
  subPct:     { fontSize: FONTS.sizes.xl, fontWeight: '900' },
  subClasses: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },

  // ── PARTS 3 & 4 — Calendar ───────────────────────────────────────────────
  calNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    paddingHorizontal: 4,
  },
  calNavBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.cardBg,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  calNavTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  calHeaderRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  calHeaderCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
    color: COLORS.textMuted,
    paddingVertical: 4,
  },
  calGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calCell: {
    width: '14.28%',    // 100% / 7 columns
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    marginBottom: 3,
    // tiny gap via padding on parent not needed — borderRadius handles it
  },
  calCellSelected: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  calCellTxt: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  calCellTxtSelected: {
    fontWeight: '900',
    color: COLORS.primary,
  },
  calLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  calLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  calLegendDot:  { width: 11, height: 11, borderRadius: 6 },
  calLegendTxt:  { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, fontWeight: '600' },

  // ── PART 5 — Day detail box ──────────────────────────────────────────────
  dayDetailBox: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.card,
  },
  dayDetailHeading: { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 3 },
  dayDetailSub:     { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginBottom: SPACING.sm },

  // Day-wise empty state
  daywiseEmpty:    { alignItems: 'center', paddingTop: 24, gap: 10 },
  daywiseEmptyTxt: { fontSize: FONTS.sizes.md, color: COLORS.textMuted },

  // Record cards (reused in day detail)
  recCard:      { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgLight, borderRadius: RADIUS.md, padding: SPACING.sm, marginBottom: SPACING.xs, gap: SPACING.md },
  recStatusBox: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  recSubject:   { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.textPrimary, lineHeight: 20 },
  recStatusLbl: { fontSize: FONTS.sizes.xs, fontWeight: '700', marginTop: 2 },

  // ── Faculty — class selector ─────────────────────────────────────────────
  dateRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.md },
  dateTxt:  { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.textMuted },
  infoCard: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, backgroundColor: COLORS.primary + '10', borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.primary + '20' },
  infoTxt:  { fontSize: FONTS.sizes.sm, color: COLORS.primary, flex: 1, fontWeight: '600', lineHeight: 19 },

  schedCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.cardBg, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.sm,
    ...SHADOWS.card, borderWidth: 1, borderColor: COLORS.cardBorder, gap: 14,
  },
  schedTimeBadge: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingHorizontal: 10, paddingVertical: 8, alignItems: 'center', minWidth: 52 },
  schedTimeTop:   { fontSize: FONTS.sizes.md, fontWeight: '900', color: COLORS.accent, lineHeight: 18 },
  schedTimeBot:   { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.6)', lineHeight: 13 },
  schedSubject:   { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.textPrimary },
  schedCode:      { fontSize: FONTS.sizes.xs, fontWeight: '700', color: COLORS.accent, marginTop: 1 },
  schedMeta:      { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 3 },

  // ── Faculty — class header bar ───────────────────────────────────────────
  classHeader: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.cardBg, padding: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder, gap: SPACING.sm,
  },
  backBtn:          { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.bgLight, justifyContent: 'center', alignItems: 'center' },
  classHeaderTitle: { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.textPrimary },
  classHeaderMeta:  { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 1 },
  presentPill:      { backgroundColor: COLORS.primary, borderRadius: RADIUS.full, paddingHorizontal: 12, paddingVertical: 5 },
  presentPillTxt:   { fontSize: FONTS.sizes.sm, color: COLORS.accent, fontWeight: '800' },

  lockedBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.warning + '18', paddingVertical: 9, paddingHorizontal: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.warning + '30' },
  lockedTxt:    { fontSize: FONTS.sizes.xs, color: COLORS.warning, fontWeight: '600' },

  // ── Faculty — live stats strip ───────────────────────────────────────────
  statsStrip: { flexDirection: 'row', backgroundColor: COLORS.cardBg, borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder, paddingVertical: 10, paddingHorizontal: SPACING.md },
  stripItem:  { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  stripDot:   { width: 7, height: 7, borderRadius: 4 },
  stripLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, fontWeight: '600' },
  stripVal:   { fontSize: FONTS.sizes.sm, fontWeight: '900' },
  stripSep:   { width: 1, height: 22, backgroundColor: COLORS.cardBorder },

  // ── Faculty — student rows ───────────────────────────────────────────────
  listPad: { paddingHorizontal: SPACING.md, paddingTop: SPACING.sm, paddingBottom: SPACING.md },

  stuRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    paddingVertical: 12, paddingHorizontal: SPACING.md,
    gap: SPACING.sm, ...SHADOWS.card,
    borderWidth: 0.5, borderColor: COLORS.cardBorder,
  },
  stuNum:  { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, width: 20, textAlign: 'center', flexShrink: 0 },
  stuName: { flex: 1, fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.textPrimary },

  navyTag: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center', minWidth: 82,
  },
  navyTagPresent:  { backgroundColor: '#22C55E' },          // bright green
  navyTagAbsent:   { backgroundColor: '#EF4444' },          // bright red
  navyTagUnmarked: { backgroundColor: COLORS.bgLight, borderWidth: 1.5, borderColor: '#CBD5E1' },

  navyTagTxt:         { fontSize: FONTS.sizes.sm, fontWeight: '700' },
  navyTagTxtPresent:  { color: '#ffffff' },
  navyTagTxtAbsent:   { color: '#ffffff' },
  navyTagTxtUnmarked: { color: '#CBD5E1' },

  // ── Faculty — docked submit footer ──────────────────────────────────────
  submitFooter: {
    backgroundColor: COLORS.cardBg, borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder, padding: SPACING.md,
  },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: SPACING.sm, backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg, paddingVertical: 15,
  },
  submitTxt: { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.accent },

  // ── Summary screen ───────────────────────────────────────────────────────
  summaryPage:       { padding: SPACING.lg, paddingBottom: 100 },
  summaryBadge:      { alignItems: 'center', marginBottom: SPACING.xl },
  summaryIconCircle: { width: 88, height: 88, borderRadius: 44, backgroundColor: COLORS.success + '15', justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md },
  summaryTitle:      { fontSize: FONTS.sizes.xxl, fontWeight: '900', color: COLORS.textPrimary, textAlign: 'center' },
  summarySub:        { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 4, textAlign: 'center' },
  summarySub2:       { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2, textAlign: 'center' },

  statsRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.xl },
  statBox:  { flex: 1, backgroundColor: COLORS.cardBg, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', ...SHADOWS.card, borderWidth: 2 },
  statVal:  { fontSize: FONTS.sizes.xxl, fontWeight: '900', marginBottom: 4 },
  statLbl:  { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, fontWeight: '700' },

  absentCard:      { backgroundColor: COLORS.cardBg, borderRadius: RADIUS.xl, padding: SPACING.md, ...SHADOWS.card, marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.cardBorder },
  absentCardTitle: { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.sm },
  absentRow:       { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder },
  absentAvatar:    { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.danger + '18', alignItems: 'center', justifyContent: 'center' },
  absentAvatarTxt: { fontSize: FONTS.sizes.sm, fontWeight: '800', color: COLORS.danger },
  absentName:      { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.textPrimary },
  absentReg:       { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 1 },
  absentBadge:     { backgroundColor: COLORS.danger + '15', borderRadius: RADIUS.full, paddingHorizontal: 9, paddingVertical: 3 },
  absentBadgeTxt:  { fontSize: 10, fontWeight: '800', color: COLORS.danger },

  editBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 7, borderWidth: 1.5, borderColor: COLORS.primary,
    borderRadius: RADIUS.lg, paddingVertical: 13, marginBottom: SPACING.sm,
  },
  editBtnTxt: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.primary },
  doneBtn:    { backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, paddingVertical: 15, alignItems: 'center' },
  doneBtnTxt: { fontSize: FONTS.sizes.md, fontWeight: '900', color: COLORS.accent },

  // ── Password modal ───────────────────────────────────────────────────────
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  pwdBox:       { backgroundColor: COLORS.cardBg, borderRadius: RADIUS.xl, padding: SPACING.xl, width: '100%', alignItems: 'center', ...SHADOWS.card },
  pwdIconWrap:  { width: 58, height: 58, borderRadius: 29, backgroundColor: COLORS.bgLight, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md },
  pwdTitle:     { fontSize: FONTS.sizes.xl, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 6 },
  pwdSub:       { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.lg, lineHeight: 19 },
  pwdInput:     { width: '100%', borderWidth: 1.5, borderColor: COLORS.cardBorder, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: 13, fontSize: FONTS.sizes.md, color: COLORS.textPrimary, marginBottom: SPACING.sm },
  pwdErr:       { fontSize: FONTS.sizes.xs, color: COLORS.danger, fontWeight: '600', marginBottom: SPACING.sm, alignSelf: 'flex-start' },
  pwdBtns:      { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.sm, width: '100%' },
  pwdCancelBtn: { flex: 1, paddingVertical: 13, borderRadius: RADIUS.full, borderWidth: 1.5, borderColor: COLORS.cardBorder, alignItems: 'center' },
  pwdCancelTxt: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.textSecondary },
  pwdConfirmBtn:{ flex: 1, paddingVertical: 13, borderRadius: RADIUS.full, backgroundColor: COLORS.primary, alignItems: 'center' },
  pwdConfirmTxt:{ fontSize: FONTS.sizes.sm, fontWeight: '800', color: COLORS.accent },
  pwdHint:      { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: SPACING.md },
});