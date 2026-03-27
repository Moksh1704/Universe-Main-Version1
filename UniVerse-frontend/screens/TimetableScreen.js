import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Modal, TextInput, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { MOCK_FACULTY } from '../data/mockData';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat'];
const SUBJECT_COLORS = {
  'Data Structures': '#3498DB', 'Algorithms Lab': '#9B59B6',
  'Computer Networks': '#27AE60', 'Research Guidance': '#E67E22',
  'Dept Meeting': '#E74C3C', 'Office Hours': '#1ABC9C',
};
const TIMETABLE_DATA = {
  Mon: [
    { time:'9:00 AM',  subject:'Data Structures',   room:'CS-101', year:'2nd Year', section:'A', duration:'1hr' },
    { time:'11:00 AM', subject:'Algorithms Lab',     room:'Lab-203',year:'3rd Year', section:'B', duration:'2hr' },
    { time:'2:00 PM',  subject:'Computer Networks',  room:'CS-205', year:'3rd Year', section:'A', duration:'1hr' },
  ],
  Tue: [
    { time:'10:00 AM', subject:'Data Structures',   room:'CS-101', year:'2nd Year', section:'B', duration:'1hr' },
    { time:'1:00 PM',  subject:'Research Guidance', room:'Staff Room',year:'PG', section:'-', duration:'2hr' },
  ],
  Wed: [
    { time:'9:00 AM',  subject:'Computer Networks', room:'CS-205', year:'3rd Year', section:'B', duration:'1hr' },
    { time:'11:00 AM', subject:'Data Structures',   room:'CS-101', year:'2nd Year', section:'A', duration:'1hr' },
    { time:'3:00 PM',  subject:'Dept Meeting',      room:'HOD Room',year:'-', section:'-', duration:'1hr' },
  ],
  Thu: [
    { time:'9:00 AM',  subject:'Algorithms Lab',    room:'Lab-203', year:'3rd Year', section:'A', duration:'2hr' },
    { time:'2:00 PM',  subject:'Computer Networks', room:'CS-205',  year:'2nd Year', section:'A', duration:'1hr' },
  ],
  Fri: [
    { time:'10:00 AM', subject:'Data Structures',   room:'CS-102', year:'2nd Year', section:'B', duration:'1hr' },
    { time:'12:00 PM', subject:'Office Hours',      room:'Staff Room',year:'-', section:'-', duration:'1hr' },
  ],
  Sat: [],
};
const todayIdx = new Date().getDay();
const todayKey = DAYS[todayIdx === 0 ? 0 : todayIdx - 1] || 'Mon';

// ── Manual Entry Form ─────────────────────────────────────────────────────────
const ManualEntryModal = ({ visible, onClose }) => {
  const [form, setForm] = useState({ subject:'', time:'', room:'', year:'', section:'', duration:'' });
  const set = k => v => setForm(f => ({ ...f, [k]: v }));
  const Field = ({ label, key2, placeholder }) => (
    <View style={{ marginBottom: 12 }}>
      <Text style={ms.label}>{label}</Text>
      <TextInput style={ms.input} value={form[key2]} onChangeText={set(key2)} placeholder={placeholder} placeholderTextColor={COLORS.textMuted} />
    </View>
  );
  const handleSave = () => {
    if (!form.subject || !form.time) { Alert.alert('Missing', 'Subject and Time are required.'); return; }
    Alert.alert('Saved!', `${form.subject} at ${form.time} added to timetable.`);
    onClose();
  };
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={ms.container}>
        <View style={ms.head}>
          <TouchableOpacity onPress={onClose}><Text style={ms.cancel}>Cancel</Text></TouchableOpacity>
          <Text style={ms.title}>Add Class</Text>
          <TouchableOpacity onPress={handleSave}><Text style={ms.save}>Save</Text></TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={ms.body}>
          <Field label="Subject" key2="subject" placeholder="e.g. Data Structures" />
          <Field label="Time" key2="time" placeholder="e.g. 9:00 AM" />
          <Field label="Room" key2="room" placeholder="e.g. CS-101" />
          <Field label="Year" key2="year" placeholder="e.g. 2nd Year" />
          <Field label="Section" key2="section" placeholder="e.g. A" />
          <Field label="Duration" key2="duration" placeholder="e.g. 1hr" />
        </ScrollView>
      </View>
    </Modal>
  );
};

const ms = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgLight },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md, paddingTop: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder },
  cancel: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary },
  title: { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.textPrimary },
  save: { fontSize: FONTS.sizes.md, color: COLORS.primary, fontWeight: '800' },
  body: { padding: SPACING.lg },
  label: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 5 },
  input: { backgroundColor: COLORS.cardBg, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.cardBorder, paddingHorizontal: SPACING.md, paddingVertical: 12, fontSize: FONTS.sizes.md, color: COLORS.textPrimary },
});

// ── Upload Options Modal ──────────────────────────────────────────────────────
const UploadModal = ({ visible, onClose, onManual }) => {
  const pickDoc = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'application/pdf'], copyToCacheDirectory: false });
      if (!res.canceled && res.assets?.length) {
        Alert.alert('File Selected', `${res.assets[0].name}\n\nIn production this would be uploaded to POST /attendance/timetable/upload-image`);
        onClose();
      }
    } catch (e) {
      Alert.alert('Error', 'Could not open file picker.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={um.overlay}>
        <View style={um.sheet}>
          <View style={um.handle} />
          <Text style={um.title}>Upload Timetable</Text>
          <Text style={um.sub}>Choose how you want to add your timetable</Text>

          <TouchableOpacity style={um.option} onPress={() => { onClose(); onManual(); }}>
            <View style={[um.optIcon, { backgroundColor: COLORS.primary + '18' }]}>
              <Ionicons name="create-outline" size={26} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={um.optLabel}>Manual Entry</Text>
              <Text style={um.optSub}>Add classes one by one with a form</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={um.option} onPress={pickDoc}>
            <View style={[um.optIcon, { backgroundColor: COLORS.accent + '22' }]}>
              <Ionicons name="cloud-upload-outline" size={26} color={COLORS.accentDark} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={um.optLabel}>Upload File</Text>
              <Text style={um.optSub}>Image or PDF — auto-parsed via API</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={um.cancelBtn} onPress={onClose}>
            <Text style={um.cancelTxt}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const um = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: COLORS.cardBg, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: SPACING.lg, paddingBottom: 36 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.cardBorder, alignSelf: 'center', marginBottom: SPACING.md },
  title: { fontSize: FONTS.sizes.xl, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 4 },
  sub: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.lg },
  option: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.md, backgroundColor: COLORS.bgLight, borderRadius: RADIUS.lg, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.cardBorder },
  optIcon: { width: 52, height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  optLabel: { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.textPrimary },
  optSub: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: 2 },
  cancelBtn: { marginTop: SPACING.sm, alignItems: 'center', paddingVertical: 14, borderRadius: RADIUS.full, backgroundColor: COLORS.bgLight, borderWidth: 1, borderColor: COLORS.cardBorder },
  cancelTxt: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.textSecondary },
});

export default function TimetableScreen() {
  const [activeDay, setActiveDay] = useState(todayKey);
  const [uploadModal, setUploadModal] = useState(false);
  const [manualModal, setManualModal] = useState(false);
  const classes = TIMETABLE_DATA[activeDay] || [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Timetable</Text>
            <Text style={styles.headerSub}>{MOCK_FACULTY.name}</Text>
          </View>
          <TouchableOpacity style={styles.uploadBtn} onPress={() => setUploadModal(true)} activeOpacity={0.85}>
            <Ionicons name="cloud-upload-outline" size={17} color={COLORS.primary} />
            <Text style={styles.uploadBtnTxt}>Upload</Text>
          </TouchableOpacity>
        </View>

        {/* Day selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayRow}>
          {DAYS.map(day => (
            <TouchableOpacity key={day} style={[styles.dayChip, activeDay===day && styles.dayChipActive]} onPress={() => setActiveDay(day)}>
              <Text style={[styles.dayChipTxt, activeDay===day && styles.dayChipTxtActive]}>{day}</Text>
              {day === todayKey && <View style={[styles.todayDot, activeDay===day && { backgroundColor: COLORS.primary }]} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {classes.length === 0 ? (
          <View style={styles.emptyDay}>
            <Ionicons name="cafe-outline" size={52} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Classes</Text>
            <Text style={styles.emptySub}>Enjoy your free day!</Text>
          </View>
        ) : classes.map((cls, i) => {
          const color = SUBJECT_COLORS[cls.subject] || COLORS.primaryLight;
          return (
            <View key={i} style={styles.classCard}>
              <View style={[styles.classBar, { backgroundColor: color }]} />
              <View style={styles.classContent}>
                <View style={styles.classRow}>
                  <View style={[styles.classIcon, { backgroundColor: color + '22' }]}>
                    <Ionicons name="book-outline" size={20} color={color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.classSub}>{cls.subject}</Text>
                    <Text style={styles.classMeta}>{cls.year} · Sec {cls.section}</Text>
                  </View>
                  <View style={styles.durationBg}><Text style={styles.durationTxt}>{cls.duration}</Text></View>
                </View>
                <View style={styles.classChips}>
                  <View style={styles.chip}><Ionicons name="time-outline" size={12} color={COLORS.textMuted} /><Text style={styles.chipTxt}>{cls.time}</Text></View>
                  <View style={styles.chip}><Ionicons name="location-outline" size={12} color={COLORS.textMuted} /><Text style={styles.chipTxt}>{cls.room}</Text></View>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <UploadModal visible={uploadModal} onClose={() => setUploadModal(false)} onManual={() => setManualModal(true)} />
      <ManualEntryModal visible={manualModal} onClose={() => setManualModal(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgLight },
  header: { paddingTop: 62, paddingBottom: SPACING.sm, paddingHorizontal: SPACING.lg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.md },
  headerTitle: { fontSize: FONTS.sizes.xxxl, fontWeight: '900', color: COLORS.secondary },
  headerSub: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.6)', marginTop: 3 },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.accent, borderRadius: RADIUS.full, paddingHorizontal: 14, paddingVertical: 9 },
  uploadBtnTxt: { fontSize: FONTS.sizes.sm, fontWeight: '800', color: COLORS.primary },
  dayRow: { gap: SPACING.sm, paddingBottom: SPACING.md, paddingTop: 4 },
  dayChip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: RADIUS.full, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', position: 'relative' },
  dayChipActive: { backgroundColor: COLORS.accent },
  dayChipTxt: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
  dayChipTxtActive: { color: COLORS.primary },
  todayDot: { position: 'absolute', bottom: 4, width: 5, height: 5, borderRadius: 3, backgroundColor: COLORS.accent },
  body: { padding: SPACING.md, paddingBottom: 110, gap: SPACING.sm },
  emptyDay: { alignItems: 'center', paddingTop: 80, gap: SPACING.sm },
  emptyTitle: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.textPrimary },
  emptySub: { fontSize: FONTS.sizes.md, color: COLORS.textMuted },
  classCard: { backgroundColor: COLORS.cardBg, borderRadius: RADIUS.lg, overflow: 'hidden', ...SHADOWS.card, borderWidth: 1, borderColor: COLORS.cardBorder },
  classBar: { height: 5 },
  classContent: { padding: SPACING.md },
  classRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  classIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  classSub: { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.textPrimary },
  classMeta: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  durationBg: { backgroundColor: COLORS.bgLight, borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4 },
  durationTxt: { fontSize: FONTS.sizes.xs, fontWeight: '700', color: COLORS.textSecondary },
  classChips: { flexDirection: 'row', gap: SPACING.sm },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.bgLight, borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 5 },
  chipTxt: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, fontWeight: '600' },
});
