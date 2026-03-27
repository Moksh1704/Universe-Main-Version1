import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Image, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

// ─── PostCard ────────────────────────────────────────────────────────────────
export const PostCard = ({ post, onDelete }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const initials = post.userName.split(' ').map(n => n[0]).join('').slice(0, 2);

  return (
    <View style={styles.card}>
      <View style={styles.postHeader}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.postUserName}>{post.userName}</Text>
          <Text style={styles.postMeta}>{post.userRole} · {post.timePosted}</Text>
        </View>
        {post.isOwn && (
          <TouchableOpacity onPress={() => onDelete && onDelete(post.id)} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.postContent}>{post.content}</Text>
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => { setLiked(!liked); setLikeCount(liked ? likeCount - 1 : likeCount + 1); }}>
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={20} color={liked ? COLORS.danger : COLORS.textSecondary} />
          <Text style={[styles.actionText, liked && { color: COLORS.danger }]}>{likeCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="chatbubble-outline" size={20} color={COLORS.textSecondary} />
          <Text style={styles.actionText}>{post.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="repeat-outline" size={20} color={COLORS.textSecondary} />
          <Text style={styles.actionText}>{post.reposts}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="happy-outline" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── EventCard ────────────────────────────────────────────────────────────────
export const EventCard = ({ event, onRegister }) => {
  const [registered, setRegistered] = useState(event.registered);

  return (
    <View style={styles.card}>
      <View style={[styles.eventColorBar, { backgroundColor: event.color }]} />
      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <View style={[styles.eventIconBg, { backgroundColor: event.color + '22' }]}>
            <Ionicons name="calendar" size={22} color={event.color} />
          </View>
          <View style={{ flex: 1, marginLeft: SPACING.sm }}>
            <Text style={styles.eventCategory}>{event.category.toUpperCase()}</Text>
            <Text style={styles.eventTitle}>{event.title}</Text>
          </View>
        </View>
        <View style={styles.eventMeta}>
          <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.eventMetaText}>{event.date} · {event.time}</Text>
        </View>
        <View style={styles.eventMeta}>
          <Ionicons name="location-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.eventMetaText}>{event.venue}</Text>
        </View>
        <Text style={styles.eventDesc}>{event.description}</Text>
        <TouchableOpacity
          style={[styles.registerBtn, registered && styles.registeredBtn]}
          onPress={() => setRegistered(!registered)}
        >
          <Text style={[styles.registerBtnText, registered && styles.registeredBtnText]}>
            {registered ? '✓ Registered' : 'Register Now'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── CareerCard ───────────────────────────────────────────────────────────────
export const CareerCard = ({ career }) => (
  <View style={styles.card}>
    <View style={styles.careerHeader}>
      <Text style={styles.careerTitle}>{career.title}</Text>
      <View style={[styles.categoryChip, { backgroundColor: COLORS.accent + '22' }]}>
        <Text style={[styles.categoryChipText, { color: COLORS.accentDark }]}>{career.category}</Text>
      </View>
    </View>
    <Text style={styles.careerDesc}>{career.description}</Text>
    <View style={styles.careerRow}>
      <Ionicons name="cash-outline" size={16} color={COLORS.success} />
      <Text style={styles.careerSalary}>{career.salaryRange}</Text>
    </View>
    <View style={styles.careerRow}>
      <Ionicons name="trending-up-outline" size={16} color={career.demandColor} />
      <Text style={[styles.careerDemand, { color: career.demandColor }]}>Demand: {career.demand}</Text>
    </View>
    <Text style={styles.skillsLabel}>Required Skills</Text>
    <View style={styles.chipsRow}>
      {career.skills.map((s, i) => (
        <View key={i} style={styles.skillChip}><Text style={styles.skillChipText}>{s}</Text></View>
      ))}
    </View>
    <Text style={styles.skillsLabel}>Tech Stack</Text>
    <View style={styles.chipsRow}>
      {career.techStack.map((t, i) => (
        <View key={i} style={styles.techChip}><Text style={styles.techChipText}>{t}</Text></View>
      ))}
    </View>
  </View>
);

// ─── AttendanceCard ───────────────────────────────────────────────────────────
export const AttendanceCard = ({ subject }) => {
  const color = subject.percentage >= 75 ? COLORS.success : subject.percentage >= 65 ? COLORS.warning : COLORS.danger;
  const barWidth = `${subject.percentage}%`;

  return (
    <View style={styles.card}>
      <View style={styles.attRow}>
        <Text style={styles.attSubject} numberOfLines={2}>{subject.subject}</Text>
        <Text style={[styles.attPercent, { color }]}>{subject.percentage}%</Text>
      </View>
      <View style={styles.attBarBg}>
        <View style={[styles.attBarFill, { width: barWidth, backgroundColor: color }]} />
      </View>
      <Text style={styles.attClasses}>{subject.present}/{subject.total} classes attended</Text>
    </View>
  );
};

// ─── LocationCard ─────────────────────────────────────────────────────────────
export const LocationCard = ({ location, onPress }) => (
  <TouchableOpacity style={[styles.card, styles.locationCard]} onPress={onPress}>
    <View style={styles.locationIconBg}>
      <Ionicons name={location.icon || 'location'} size={22} color={COLORS.primary} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.locationName}>{location.name}</Text>
      <Text style={styles.locationDesc}>{location.description}</Text>
    </View>
    <Ionicons name="navigate-circle-outline" size={28} color={COLORS.accent} />
  </TouchableOpacity>
);

// ─── SearchBar ────────────────────────────────────────────────────────────────
export const SearchBar = ({ value, onChangeText, placeholder }) => (
  <View style={styles.searchBar}>
    <Ionicons name="search" size={20} color={COLORS.textMuted} />
    <TextInput
      style={styles.searchInput}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder || 'Search...'}
      placeholderTextColor={COLORS.textMuted}
    />
    {value ? (
      <TouchableOpacity onPress={() => onChangeText('')}>
        <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
      </TouchableOpacity>
    ) : null}
  </View>
);

// ─── ProfileCard ──────────────────────────────────────────────────────────────
export const ProfileCard = ({ user }) => {
  const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2);
  return (
    <View style={styles.profileCard}>
      <View style={styles.profileAvatarLg}>
        <Text style={styles.profileAvatarText}>{initials}</Text>
      </View>
      <Text style={styles.profileName}>{user.name}</Text>
      <Text style={styles.profileRole}>
        {user.role === 'student' ? `${user.year} · ${user.department}` : `${user.designation} · ${user.department}`}
      </Text>
      <Text style={styles.profileEmail}>{user.email}</Text>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  // Post
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  avatarCircle: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center',
    marginRight: SPACING.sm,
  },
  avatarText: { color: COLORS.secondary, fontWeight: '700', fontSize: FONTS.sizes.md },
  postUserName: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.textPrimary },
  postMeta: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  deleteBtn: { padding: SPACING.xs },
  postContent: { fontSize: FONTS.sizes.md, color: COLORS.textPrimary, lineHeight: 22, marginBottom: SPACING.md },
  postActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.cardBorder, paddingTop: SPACING.sm, gap: SPACING.md },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  // Event
  eventColorBar: { height: 4, borderRadius: 2, marginBottom: SPACING.md },
  eventContent: {},
  eventHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.sm },
  eventIconBg: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  eventCategory: { fontSize: FONTS.sizes.xs, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 1 },
  eventTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.textPrimary, marginTop: 2 },
  eventMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  eventMetaText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  eventDesc: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 20, marginVertical: SPACING.sm },
  registerBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.full,
    paddingVertical: 10, alignItems: 'center', marginTop: SPACING.sm,
  },
  registerBtnText: { color: COLORS.secondary, fontWeight: '700', fontSize: FONTS.sizes.sm },
  registeredBtn: { backgroundColor: COLORS.success + '22', borderWidth: 1, borderColor: COLORS.success },
  registeredBtnText: { color: COLORS.success },
  // Career
  careerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.sm },
  careerTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.textPrimary, flex: 1, marginRight: SPACING.sm },
  categoryChip: { borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4 },
  categoryChipText: { fontSize: FONTS.sizes.xs, fontWeight: '700' },
  careerDesc: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 20, marginBottom: SPACING.sm },
  careerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  careerSalary: { fontSize: FONTS.sizes.sm, color: COLORS.success, fontWeight: '600' },
  careerDemand: { fontSize: FONTS.sizes.sm, fontWeight: '600' },
  skillsLabel: { fontSize: FONTS.sizes.xs, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 0.8, marginTop: SPACING.sm, marginBottom: SPACING.xs },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  skillChip: { backgroundColor: COLORS.bgLight, borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4 },
  skillChipText: { fontSize: FONTS.sizes.xs, color: COLORS.textPrimary, fontWeight: '600' },
  techChip: { backgroundColor: COLORS.primary + '11', borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4 },
  techChipText: { fontSize: FONTS.sizes.xs, color: COLORS.primary, fontWeight: '600' },
  // Attendance
  attRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  attSubject: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.textPrimary, flex: 1, marginRight: SPACING.sm },
  attPercent: { fontSize: FONTS.sizes.lg, fontWeight: '800' },
  attBarBg: { height: 8, backgroundColor: COLORS.bgLight, borderRadius: 4, marginBottom: 6 },
  attBarFill: { height: 8, borderRadius: 4 },
  attClasses: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  // Location
  locationCard: { flexDirection: 'row', alignItems: 'center' },
  locationIconBg: {
    width: 46, height: 46, borderRadius: 14, backgroundColor: COLORS.bgLight,
    justifyContent: 'center', alignItems: 'center', marginRight: SPACING.sm,
  },
  locationName: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.textPrimary },
  locationDesc: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  // Search
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 12,
    borderWidth: 1, borderColor: COLORS.cardBorder, gap: SPACING.sm,
    ...SHADOWS.card,
  },
  searchInput: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.textPrimary },
  // Profile
  profileCard: { alignItems: 'center', padding: SPACING.xl },
  profileAvatarLg: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: COLORS.accent, marginBottom: SPACING.md,
  },
  profileAvatarText: { fontSize: 32, fontWeight: '800', color: COLORS.secondary },
  profileName: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center' },
  profileRole: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, textAlign: 'center', marginTop: 4 },
  profileEmail: { fontSize: FONTS.sizes.sm, color: COLORS.primary, textAlign: 'center', marginTop: 4 },
});
