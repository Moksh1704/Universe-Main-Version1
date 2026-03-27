import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, ScrollView, Modal, SafeAreaView, TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MOCK_CAREERS } from '../data/mockData';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

// ── Filter categories matching the data ───────────────────────────────────────
const FILTERS = [
  { key: 'All',       label: 'All',        icon: 'apps-outline'           },
  { key: 'Software',  label: 'Software',   icon: 'code-slash-outline'     },
  { key: 'Data',      label: 'Data',       icon: 'bar-chart-outline'      },
  { key: 'Cloud',     label: 'Cloud',      icon: 'cloud-outline'          },
  { key: 'Security',  label: 'Security',   icon: 'shield-outline'         },
  { key: 'Testing',   label: 'Testing',    icon: 'checkmark-done-outline' },
  { key: 'IT Support',label: 'IT Support', icon: 'desktop-outline'        },
];

// Colors per category
const CAT_COLOR = {
  Software:   '#2471A3',
  Data:       '#117A65',
  Cloud:      '#1A5276',
  Security:   '#7D6608',
  Testing:    '#6C3483',
  'IT Support':'#784212',
};

// ── Career list card ──────────────────────────────────────────────────────────
const CareerCard = ({ career, onPress }) => {
  const color = CAT_COLOR[career.category] || COLORS.primary;
  return (
    <TouchableOpacity
      style={s.card}
      onPress={() => onPress(career)}
      activeOpacity={0.88}
    >
      {/* Left accent bar */}
      <View style={[s.cardBar, { backgroundColor: color }]} />

      <View style={s.cardContent}>
        <View style={s.cardTop}>
          <View style={{ flex: 1 }}>
            <View style={[s.groupPill, { backgroundColor: color + '18' }]}>
              <Text style={[s.groupPillTxt, { color }]}>{career.group}</Text>
            </View>
            <Text style={s.cardTitle}>{career.title}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} style={{ marginTop: 4 }} />
        </View>
        <Text style={s.cardShortDesc} numberOfLines={2}>{career.shortDesc}</Text>

        {/* Demand + salary in one row */}
        <View style={s.cardMeta}>
          <View style={[s.demandPill, { backgroundColor: career.demandColor + '18' }]}>
            <View style={[s.demandDot, { backgroundColor: career.demandColor }]} />
            <Text style={[s.demandTxt, { color: career.demandColor }]}>{career.demand}</Text>
          </View>
          <View style={s.salaryPill}>
            <Ionicons name="cash-outline" size={12} color={COLORS.success} />
            <Text style={s.salaryTxt}>{career.salaryRange}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ── Career detail modal ───────────────────────────────────────────────────────
const CareerDetail = ({ career, onClose }) => {
  if (!career) return null;
  const color = CAT_COLOR[career.category] || COLORS.primary;

  const SectionBlock = ({ title, children }) => (
    <View style={s.detailSection}>
      <Text style={s.detailSectionTitle}>{title}</Text>
      {children}
    </View>
  );

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={s.detailRoot}>
        {/* Header bar */}
        <View style={s.detailBar}>
          <TouchableOpacity onPress={onClose} style={s.closeBtn}>
            <Ionicons name="close" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={s.detailBarTitle} numberOfLines={1}>{career.title}</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.detailScroll}>
          {/* Hero */}
          <LinearGradient colors={[color, color + 'CC']} style={s.detailHero}>
            <View style={s.detailHeroIcon}>
              <Ionicons name="briefcase" size={30} color="#fff" />
            </View>
            <Text style={s.detailHeroTitle}>{career.title}</Text>
            <Text style={s.detailHeroGroup}>{career.group}</Text>
            <Text style={s.detailHeroSalary}>{career.salaryRange}</Text>
            <View style={[s.heroDemandPill, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={s.heroDemandTxt}>Demand: {career.demand}</Text>
            </View>
          </LinearGradient>

          {/* About */}
          <SectionBlock title="About This Role">
            <Text style={s.detailBody}>{career.description}</Text>
          </SectionBlock>

          {/* Typical Work */}
          <SectionBlock title="Typical Work">
            {career.typicalWork.map((w, i) => (
              <View key={i} style={s.bulletRow}>
                <View style={[s.bulletDot, { backgroundColor: color }]} />
                <Text style={s.bulletTxt}>{w}</Text>
              </View>
            ))}
          </SectionBlock>

          {/* Skills */}
          <SectionBlock title="Required Skills">
            {career.skills.map((sk, i) => (
              <View key={i} style={s.bulletRow}>
                <View style={[s.bulletDot, { backgroundColor: color }]} />
                <Text style={s.bulletTxt}>{sk}</Text>
              </View>
            ))}
          </SectionBlock>

          {/* Tech Stack */}
          <SectionBlock title="Tech Stack">
            <View style={s.chipRow}>
              {career.techStack.map((t, i) => (
                <View key={i} style={[s.techChip, { borderColor: color + '44' }]}>
                  <Text style={[s.techChipTxt, { color }]}>{t}</Text>
                </View>
              ))}
            </View>
          </SectionBlock>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

// ── Main screen ───────────────────────────────────────────────────────────────
export default function CareerScreen() {
  const [filter,   setFilter]   = useState('All');
  const [query,    setQuery]    = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    let list = MOCK_CAREERS;
    if (filter !== 'All') list = list.filter(c => c.category === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.shortDesc.toLowerCase().includes(q) ||
        c.group.toLowerCase().includes(q) ||
        c.skills.some(sk => sk.toLowerCase().includes(q)) ||
        c.techStack.some(t => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [filter, query]);

  // Group by category heading for display
  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach(c => {
      if (!map[c.group]) map[c.group] = [];
      map[c.group].push(c);
    });
    return Object.entries(map); // [[groupName, [roles]], ...]
  }, [filtered]);

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient colors={[COLORS.primary, COLORS.primaryMid]} style={s.header}>
        <Text style={s.headerTitle}>Career Hub</Text>
        <Text style={s.headerSub}>B.Tech CSE / IT fresher roles  ·  Tap a card for details</Text>
      </LinearGradient>

      <View style={s.body}>
        {/* Search */}
        <View style={s.searchWrap}>
          <Ionicons name="search" size={18} color={COLORS.textMuted} />
          <TextInput
            style={s.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search roles, skills, tools..."
            placeholderTextColor={COLORS.textMuted}
            returnKeyType="search"
          />
          {!!query && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={17} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filterRow}
          bounces={false}
        >
          {FILTERS.map(f => {
            const active = filter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                style={[s.filterBtn, active && s.filterBtnActive]}
                onPress={() => setFilter(f.key)}
                activeOpacity={0.8}
                hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
              >
                <Ionicons name={f.icon} size={13} color={active ? '#FFFFFF' : COLORS.textSecondary} />
                <Text style={[s.filterBtnTxt, active && s.filterBtnTxtActive]}>{f.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Results count */}
        <Text style={s.resultCount}>
          {filtered.length} role{filtered.length !== 1 ? 's' : ''} found
        </Text>

        {/* Grouped list */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.list}>
          {grouped.length === 0 ? (
            <Text style={s.empty}>No roles match your search.</Text>
          ) : (
            grouped.map(([groupName, roles]) => (
              <View key={groupName}>
                <View style={s.groupHeader}>
                  <View style={[s.groupDot, { backgroundColor: CAT_COLOR[roles[0].category] || COLORS.primary }]} />
                  <Text style={s.groupTitle}>{groupName}</Text>
                  <Text style={s.groupCount}>{roles.length}</Text>
                </View>
                {roles.map(career => (
                  <CareerCard
                    key={career.id}
                    career={career}
                    onPress={setSelected}
                  />
                ))}
              </View>
            ))
          )}
        </ScrollView>
      </View>

      <CareerDetail career={selected} onClose={() => setSelected(null)} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgLight },
  header:    { paddingTop: 62, paddingBottom: SPACING.xl, paddingHorizontal: SPACING.lg },
  headerTitle: { fontSize: FONTS.sizes.xxxl, fontWeight: '900', color: COLORS.secondary },
  headerSub:   { fontSize: FONTS.sizes.xs, color: 'rgba(255,255,255,0.6)', marginTop: 4 },

  body:      { flex: 1, paddingHorizontal: SPACING.md, paddingTop: SPACING.md },

  // Search
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.cardBg, borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md, paddingVertical: 11,
    borderWidth: 1.5, borderColor: COLORS.cardBorder,
    gap: SPACING.sm, marginBottom: SPACING.sm,
    ...SHADOWS.card,
  },
  searchInput: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.textPrimary },

  // Filters
  filterRow:       { gap: 8, paddingBottom: SPACING.sm, alignItems: 'center' },
  filterBtn:       { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 16, paddingVertical: 9, borderRadius: RADIUS.full, backgroundColor: COLORS.cardBg, borderWidth: 1.5, borderColor: COLORS.cardBorder, minHeight: 36, ...SHADOWS.card },
  filterBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterBtnTxt:    { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.textSecondary },
  filterBtnTxtActive: { color: '#FFFFFF' },

  resultCount: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, fontWeight: '600', marginBottom: SPACING.sm },

  // Group header
  list: { paddingBottom: 110 },
  groupHeader: {
    flexDirection: 'row', alignItems: 'center',
    gap: SPACING.sm, marginTop: SPACING.md, marginBottom: SPACING.sm,
  },
  groupDot:   { width: 10, height: 10, borderRadius: 5 },
  groupTitle: { flex: 1, fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.textPrimary },
  groupCount: {
    fontSize: FONTS.sizes.xs, fontWeight: '700', color: COLORS.textMuted,
    backgroundColor: COLORS.bgLight, borderRadius: RADIUS.full,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },

  empty: { textAlign: 'center', color: COLORS.textMuted, paddingTop: 40 },

  // List card
  card: {
    flexDirection: 'row', backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg, marginBottom: SPACING.sm,
    overflow: 'hidden', ...SHADOWS.card,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  cardBar:       { width: 4 },
  cardContent:   { flex: 1, padding: SPACING.md },
  cardTop:       { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  groupPill:     { alignSelf: 'flex-start', borderRadius: RADIUS.full, paddingHorizontal: 9, paddingVertical: 3, marginBottom: 5 },
  groupPillTxt:  { fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
  cardTitle:     { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.textPrimary, lineHeight: 21 },
  cardShortDesc: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 19, marginBottom: SPACING.sm },
  cardMeta:      { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  demandPill:    { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: RADIUS.full, paddingHorizontal: 9, paddingVertical: 4 },
  demandDot:     { width: 6, height: 6, borderRadius: 3 },
  demandTxt:     { fontSize: 10, fontWeight: '700' },
  salaryPill:    { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.success + '12', borderRadius: RADIUS.full, paddingHorizontal: 9, paddingVertical: 4 },
  salaryTxt:     { fontSize: 10, color: COLORS.success, fontWeight: '700' },

  // Detail modal
  detailRoot:      { flex: 1, backgroundColor: COLORS.bgLight },
  detailBar:       { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder, gap: SPACING.sm },
  closeBtn:        { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.bgLight, justifyContent: 'center', alignItems: 'center' },
  detailBarTitle:  { flex: 1, fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center' },
  detailScroll:    { paddingBottom: 60 },

  detailHero:      { padding: SPACING.xl, alignItems: 'center', gap: 6 },
  detailHeroIcon:  { width: 64, height: 64, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  detailHeroTitle: { fontSize: FONTS.sizes.xxl, fontWeight: '900', color: '#fff', textAlign: 'center' },
  detailHeroGroup: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.75)', fontWeight: '600' },
  detailHeroSalary:{ fontSize: FONTS.sizes.lg, fontWeight: '800', color: '#fff', marginTop: 2 },
  heroDemandPill:  { borderRadius: RADIUS.full, paddingHorizontal: 14, paddingVertical: 5, marginTop: 4 },
  heroDemandTxt:   { fontSize: FONTS.sizes.sm, fontWeight: '700', color: '#fff' },

  detailSection:      { margin: SPACING.md, backgroundColor: COLORS.cardBg, borderRadius: RADIUS.lg, padding: SPACING.md, ...SHADOWS.card, borderWidth: 1, borderColor: COLORS.cardBorder },
  detailSectionTitle: { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.sm },
  detailBody:         { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 22 },

  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 7 },
  bulletDot: { width: 7, height: 7, borderRadius: 4, marginTop: 6 },
  bulletTxt: { flex: 1, fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 20 },

  chipRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  techChip:   { borderRadius: RADIUS.full, borderWidth: 1.5, paddingHorizontal: 12, paddingVertical: 5, backgroundColor: COLORS.cardBg },
  techChipTxt:{ fontSize: FONTS.sizes.xs, fontWeight: '700' },
});
