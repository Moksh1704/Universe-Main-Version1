import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ScrollView, StatusBar, Alert, Modal, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { apiRequest } from '../api/api';


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
  { id: 'c1', subject: 'Data Structures',       code: 'CS401', time: '09:00 AM', year: '4th Year', section: 'CSE 06', room: 'Lab 3' },
  { id: 'c2', subject: 'Operating Systems',     code: 'CS402', time: '11:00 AM', year: '4th Year', section: 'CSE 06', room: 'Room 204' },
  { id: 'c3', subject: 'Computer Networks',     code: 'CS403', time: '01:00 PM', year: '4th Year', section: 'CSE 06', room: 'Room 101' },
  { id: 'c4', subject: 'Machine Learning',      code: 'CS404', time: '03:00 PM', year: '4th Year', section: 'CSE 06', room: 'Lab 5' },
];

const FACULTY_PASSWORD = '1234';

// null = unmarked, true = present, false = absent
const freshStudents = () => CSE06_STUDENTS.map(s => ({ ...s, present: null }));

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const pctColor = p => p >= 75 ? COLORS.success : p >= 65 ? COLORS.warning : COLORS.danger;

// ─────────────────────────────────────────────────────────────────────────────
// Student Attendance — API integrated, UI unchanged
// ─────────────────────────────────────────────────────────────────────────────
const SubjectCard = ({ subject }) => {
  const pct     = subject.percentage;
  const color   = pctColor(pct);
  const canSkip = pct >= 75 ? Math.floor((subject.present - 0.75 * subject.total) / 0.25) : 0;
  const needed  = pct <  75 ? Math.ceil((0.75 * subject.total - subject.present) / 0.25) : 0;
  return (
    <View style={s.subCard}>
      <View style={s.subTop}>
        <Text style={s.subName} numberOfLines={2}>{subject.subject}</Text>
        <Text style={[s.subPct, { color }]}>{pct}%</Text>
      </View>
      <Text style={s.subClasses}>{subject.present} / {subject.total} classes attended</Text>
      <View style={s.subHint}>
        <Ionicons name={pct >= 75 ? 'checkmark-circle' : 'alert-circle'} size={13} color={color} />
        <Text style={[s.subHintTxt, { color }]}>
          {pct >= 75 ? `Can skip ${canSkip} more class${canSkip === 1 ? '' : 'es'}` : `Attend ${needed} more to reach 75%`}
        </Text>
      </View>
    </View>
  );
};

// ─── REMOVE this import at the top ───────────────────────────────────────────
// REMOVE: import { MOCK_DAYWISE_ATTENDANCE } from '../data/mockData';
// (delete the whole line)


// ─── REPLACE the entire DaywiseView component with this ──────────────────────
const DaywiseView = () => {
  const [records, setRecords]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [grouped, setGrouped]   = useState({});  // { "2024-03-25": [records] }
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const fetchDaily = async () => {
      try {
        const data = await apiRequest('/attendance/me/daily');
        // data is an array of: { id, registrationNumber, date, subject, status, markedBy }

        // Group records by date
        const groups = {};
        data.forEach(rec => {
          const d = rec.date; // "2024-03-25"
          if (!groups[d]) groups[d] = [];
          groups[d].push(rec);
        });

        setGrouped(groups);
        setRecords(data);

        // Auto-select the most recent date
        const dates = Object.keys(groups).sort((a, b) => b.localeCompare(a));
        if (dates.length > 0) setSelectedDate(dates[0]);

      } catch (err) {
        console.log('DAILY ATTENDANCE ERROR:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDaily();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.sm }}>
          Loading day-wise attendance…
        </Text>
      </View>
    );
  }

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  if (sortedDates.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
        <Ionicons name="calendar-outline" size={36} color={COLORS.textMuted} />
        <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.md, marginTop: 10 }}>
          No attendance records found
        </Text>
      </View>
    );
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const formatDayLabel = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase();
  };

  const formatDayNum = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.getDate();
  };

  const dayRecords = selectedDate ? grouped[selectedDate] : [];

  return (
    <View style={{ flex: 1 }}>
      {/* ── Date chips ── */}
      <View style={s.daySelectorWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.dayChipsRow}
          bounces={false}
        >
          {sortedDates.map((dateStr) => (
            <TouchableOpacity
              key={dateStr}
              style={[s.dayChip, selectedDate === dateStr && s.dayChipActive]}
              onPress={() => setSelectedDate(dateStr)}
              activeOpacity={0.8}
            >
              <Text style={[s.dayChipDay, selectedDate === dateStr && s.dayChipTxtActive]}>
                {formatDayLabel(dateStr)}
              </Text>
              <Text style={[s.dayChipDate, selectedDate === dateStr && s.dayChipDateActive]}>
                {formatDayNum(dateStr)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Records for selected date ── */}
      <ScrollView
        contentContainerStyle={s.daywiseList}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.daywiseHeading}>{formatDate(selectedDate)}</Text>
        <Text style={s.daywiseSub}>
          {dayRecords.length} subject{dayRecords.length !== 1 ? 's' : ''} recorded
        </Text>

        {dayRecords.map((rec, i) => (
          <View key={i} style={s.recCard}>
            <View style={[
              s.recStatusBox,
              { backgroundColor: rec.status === 'present'
                  ? COLORS.success + '1A'
                  : COLORS.danger + '15' }
            ]}>
              <Ionicons
                name={rec.status === 'present' ? 'checkmark-circle' : 'close-circle'}
                size={24}
                color={rec.status === 'present' ? COLORS.success : COLORS.danger}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.recSubject} numberOfLines={2}>{rec.subject}</Text>
              <Text style={[
                s.recStatusLbl,
                { color: rec.status === 'present' ? COLORS.success : COLORS.danger }
              ]}>
                {rec.status === 'present' ? 'Present' : 'Absent'}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const StudentAttendance = () => {
  // ── API state ──────────────────────────────────────────────────────────────
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState('Overview');

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const data = await apiRequest('/attendance/me');
        console.log('ATTENDANCE:', data);
        setAttendance(data);
      } catch (err) {
        console.log('ERROR:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  if (loading || !attendance) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.sm }}>Loading attendance…</Text>
      </View>
    );
  }

  // ── Map API response → UI values ──────────────────────────────────────────
  // 🔥 HANDLE BOTH ARRAY + OBJECT RESPONSE

const rawSubjects = Array.isArray(attendance)
  ? attendance
  : (attendance.subjects ?? []);

const normalizedSubjects = rawSubjects.map(sub => ({
  subject: sub.subject || sub.name,
  present: sub.present || sub.attended || 0,
  total: sub.total || 0,
  percentage: sub.percentage || 0,
}));

const totalCls = normalizedSubjects.reduce((a, x) => a + x.total, 0);
const totalPres = normalizedSubjects.reduce((a, x) => a + x.present, 0);

const overall = totalCls > 0
  ? Math.round((totalPres / totalCls) * 100)
  : 0;

// no daywise from backend
const daywiseData = [];

  const accentColor = overall >= 75 ? COLORS.accent : '#FF6B6B';
  const canSkipAll  = overall >= 75 ? Math.floor((totalPres - 0.75 * totalCls) / 0.25) : 0;
  const neededAll   = overall <  75 ? Math.ceil((0.75 * totalCls - totalPres) / 0.25) : 0;

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
          <LinearGradient colors={[COLORS.primary, COLORS.primaryMid]} style={s.overallCard}>
            <Text style={s.overallLabel}>Overall Attendance</Text>
            <Text style={[s.overallPct, { color: accentColor }]}>{overall}%</Text>
            <View style={s.overallBarBg}><View style={[s.overallBarFill, { width: `${overall}%`, backgroundColor: accentColor }]} /></View>
            <Text style={s.overallNote}>{overall >= 75 ? 'You meet the attendance requirement' : 'Below 75% — attend more classes'}</Text>
          </LinearGradient>
          <View style={s.insightRow}>
            <View style={s.insightCard}><Ionicons name="trending-up" size={22} color={COLORS.success} /><Text style={s.insightVal}>{canSkipAll}</Text><Text style={s.insightLbl}>Can skip safely</Text></View>
            <View style={s.insightCard}><Ionicons name="school" size={22} color={COLORS.warning} /><Text style={s.insightVal}>{neededAll}</Text><Text style={s.insightLbl}>Classes to 75%</Text></View>
          </View>
          <Text style={s.secTitle}>Subject-wise Attendance</Text>
          {normalizedSubjects.map((sub, i) => (
  <SubjectCard key={i} subject={sub} />
))}
        </ScrollView>
      ) : <DaywiseView />}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Faculty Attendance (unchanged — no API integration needed per file 2)
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

  const presentCount  = students.filter(s => s.present === true).length;
  const absentCount   = students.filter(s => s.present === false).length;
  const unmarkedCount = students.filter(s => s.present === null).length;
  const pct           = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0;

  const askPassword = (action) => {
    setPwdAction(action);
    setPwdInput('');
    setPwdError('');
    setPwdModal(true);
  };

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
      const id    = parts[1];
      const side  = parts[2];
      if (side !== undefined) {
        setStatus(id, side === 'true');
      } else {
        doToggle(id);
      }
    }
  };

  const doToggle = (id) => {
    setStudents(prev => prev.map(s => {
      if (s.id !== id) return s;
      const next = s.present === null ? true : s.present === true ? false : null;
      return { ...s, present: next };
    }));
  };

  const handleTagPress = (id, tappingPresent) => {
    if (submitted) {
      askPassword(`toggle:${id}:${tappingPresent}`);
    } else {
      setStatus(id, tappingPresent);
    }
  };

  const setStatus = (id, newPresent) => {
    setStudents(prev => prev.map(s => {
      if (s.id !== id) return s;
      if (s.present === newPresent) return { ...s, present: null };
      return { ...s, present: newPresent };
    }));
  };

  
  const handleSubmit = async () => {
  Alert.alert(
    'Submit Attendance',
    `Present: ${presentCount}  |  Absent: ${absentCount}  |  ${pct}%\n\nConfirm submission?`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Submit',
        onPress: async () => {
          try {
            const payload = {
              subject: selectedClass.subject,
              date: new Date().toISOString(),

              students: students.map(s => ({
                registration_number: s.regNo,       
                present: s.present === true
              }))
            };

            console.log("ATTENDANCE PAYLOAD:", payload);

            const res = await apiRequest('/attendance/bulk', 'POST', payload);

            console.log("ATTENDANCE SUCCESS:", res);

            setSubmitted(true);
            setShowSummary(true);

          } catch (err) {
            console.log("ATTENDANCE ERROR:", err);
            Alert.alert("Error", "Failed to mark attendance");
          }
        }
      }
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
    const absentStudents = students.filter(s => !s.present);
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

      {submitted && (
        <View style={s.lockedBanner}>
          <Ionicons name="lock-closed" size={13} color={COLORS.warning} />
          <Text style={s.lockedTxt}>Submitted — password required to edit</Text>
        </View>
      )}

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
                onPress={() => handleTagPress(item.id, !isPresent)}
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
  secTitle:   { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.sm },

  // ── Student mode — tab switcher ──────────────────────────────────────────
  tabSwitcher:     { flexDirection: 'row', margin: SPACING.md, backgroundColor: COLORS.cardBg, borderRadius: RADIUS.full, padding: 3, borderWidth: 1, borderColor: COLORS.cardBorder },
  tabBtn:          { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: RADIUS.full },
  tabBtnActive:    { backgroundColor: COLORS.primary },
  tabBtnTxt:       { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.textSecondary },
  tabBtnTxtActive: { color: COLORS.secondary },

  // ── Student mode — overview ──────────────────────────────────────────────
  overallCard:    { borderRadius: RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.md, alignItems: 'center' },
  overallLabel:   { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.7)', fontWeight: '600', letterSpacing: 1 },
  overallPct:     { fontSize: 76, fontWeight: '900', lineHeight: 88, marginTop: 4 },
  overallBarBg:   { height: 10, width: '100%', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 5, marginVertical: SPACING.sm },
  overallBarFill: { height: 10, borderRadius: 5 },
  overallNote:    { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.85)', textAlign: 'center', fontWeight: '500' },
  insightRow:     { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.lg },
  insightCard:    { flex: 1, backgroundColor: COLORS.cardBg, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', gap: 6, ...SHADOWS.card, borderWidth: 1, borderColor: COLORS.cardBorder },
  insightVal:     { fontSize: FONTS.sizes.xxl, fontWeight: '900', color: COLORS.textPrimary },
  insightLbl:     { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, textAlign: 'center', fontWeight: '600' },
  subCard:        { backgroundColor: COLORS.cardBg, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOWS.card, borderWidth: 1, borderColor: COLORS.cardBorder },
  subTop:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  subName:        { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.textPrimary, flex: 1, marginRight: SPACING.sm },
  subPct:         { fontSize: FONTS.sizes.xl, fontWeight: '900' },
  subClasses:     { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginBottom: SPACING.xs },
  subHint:        { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  subHintTxt:     { fontSize: FONTS.sizes.xs, fontWeight: '600' },

  // ── Student mode — day-wise ──────────────────────────────────────────────
  daySelectorWrap: { paddingHorizontal: SPACING.md, paddingTop: SPACING.sm },
  dayChipsRow:     { flexDirection: 'row', gap: SPACING.sm, paddingVertical: SPACING.sm },
  dayChip:         { paddingHorizontal: 14, paddingVertical: 10, borderRadius: RADIUS.lg, backgroundColor: COLORS.cardBg, borderWidth: 1.5, borderColor: COLORS.cardBorder, alignItems: 'center', minWidth: 58 },
  dayChipActive:   { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dayChipDay:      { fontSize: FONTS.sizes.sm, fontWeight: '800', color: COLORS.textSecondary },
  dayChipDate:     { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
  dayChipTxtActive:  { color: COLORS.secondary },
  dayChipDateActive: { color: 'rgba(255,255,255,0.7)' },
  daywiseList:    { padding: SPACING.md, paddingBottom: 110 },
  daywiseHeading: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 3 },
  daywiseSub:     { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginBottom: SPACING.md },
  daywiseEmpty:   { alignItems: 'center', paddingTop: 40, gap: 10 },
  daywiseEmptyTxt:{ fontSize: FONTS.sizes.md, color: COLORS.textMuted },
  recCard:        { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBg, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOWS.card, borderWidth: 1, borderColor: COLORS.cardBorder, gap: SPACING.md },
  recStatusBox:   { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  recSubject:     { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.textPrimary, lineHeight: 20 },
  recStatusLbl:   { fontSize: FONTS.sizes.sm, fontWeight: '700', marginTop: 3 },

  // ── Faculty — class selector ─────────────────────────────────────────────
  dateRow:    { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.md },
  dateTxt:    { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.textMuted },
  infoCard:   { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, backgroundColor: COLORS.primary + '10', borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.primary + '20' },
  infoTxt:    { fontSize: FONTS.sizes.sm, color: COLORS.primary, flex: 1, fontWeight: '600', lineHeight: 19 },

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
  navyTagPresent:    { backgroundColor: COLORS.primary },
  navyTagAbsent:     { backgroundColor: COLORS.bgLight, borderWidth: 1.5, borderColor: COLORS.cardBorder },
  navyTagUnmarked:   { backgroundColor: COLORS.bgLight, borderWidth: 1.5, borderColor: '#CBD5E1' },

  navyTagTxt:          { fontSize: FONTS.sizes.sm, fontWeight: '700' },
  navyTagTxtPresent:   { color: COLORS.accent },
  navyTagTxtAbsent:    { color: COLORS.textMuted },
  navyTagTxtUnmarked:  { color: '#CBD5E1' },

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