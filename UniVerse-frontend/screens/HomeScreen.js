import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ScrollView, StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { apiRequest } from '../api/api';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

const TYPE_META = {
  exam:    { label: 'EXAM',    color: '#C0392B' },
  result:  { label: 'RESULT',  color: '#1E8449' },
  holiday: { label: 'HOLIDAY', color: '#D68910' },
};

const FILTERS = ['All', 'Exam', 'Result', 'Holiday'];

const AnnouncementCard = ({ item }) => {
  const meta = TYPE_META[item.type] || { label: 'UPDATE', color: COLORS.primary };

  return (
    <View style={s.card}>
      <View style={[s.cardAccent, { backgroundColor: meta.color }]} />

      <View style={s.cardInner}>
        <View style={s.cardHead}>
          <View style={[s.iconBox, { backgroundColor: meta.color + '15' }]}>
            <Ionicons name="notifications-outline" size={20} color={meta.color} />
          </View>

          <View style={s.badgeRow}>
            <View style={[s.typePill, { backgroundColor: meta.color + '15' }]}>
              <Text style={[s.typePillTxt, { color: meta.color }]}>
                {meta.label}
              </Text>
            </View>

            {item.urgent && (
              <View style={s.urgentPill}>
                <Text style={s.urgentTxt}>URGENT</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={s.cardTitle}>{item.title}</Text>
        <Text style={s.cardBody}>{item.body}</Text>

        <View style={s.cardFooter}>
          <Ionicons name="calendar-outline" size={12} color={COLORS.textMuted} />
          <Text style={s.cardDate}>{item.date}</Text>
        </View>
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const [filter, setFilter] = useState('All');
  const [announcements, setAnnouncements] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' :
    hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [annData, userData] = await Promise.all([
          apiRequest('/announcements'),
          apiRequest('/users/me'),
        ]);

        console.log("Announcements:", annData);
        console.log("User:", userData);

        setAnnouncements(annData);
        setUser(userData);
      } catch (err) {
        console.log('Home error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filtered =
    filter === 'All'
      ? announcements
      : announcements.filter(a => a.type === filter.toLowerCase());

  if (loading) {
    return (
      <View style={s.container}>
        <Text style={{ textAlign: 'center', marginTop: 50 }}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={[COLORS.primary, COLORS.primaryMid]} style={s.header}>
        <View style={s.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.greeting}>
              {greeting}, {user?.name?.split(' ')[0]}
            </Text>

            <Text style={s.headerSub}>
              {user?.department} · Year {user?.year} · Section {user?.section}
            </Text>
          </View>

          <TouchableOpacity style={s.notifBtn}>
            <Ionicons name="notifications-outline" size={22} color={COLORS.secondary} />
            <View style={s.notifDot} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={s.body}>

        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>Latest Updates</Text>

          <View style={s.countBadge}>
            <Text style={s.countBadgeTxt}>{filtered.length}</Text>
          </View>
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filterRow}
        >
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[s.filterChip, filter === f && s.filterChipActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[s.filterChipTxt, filter === f && s.filterChipTxtActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* List */}
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          renderItem={({ item }) => <AnnouncementCard item={item} />}
          contentContainerStyle={s.list}
          ListEmptyComponent={
            <Text style={s.emptyTxt}>No updates available.</Text>
          }
        />
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgLight },

  header: { paddingTop: 62, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.lg },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  greeting: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.secondary },
  headerSub: { fontSize: FONTS.sizes.xs, color: 'rgba(255,255,255,0.6)', marginTop: 4 },

  notifBtn: {
    padding: 9,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: RADIUS.md,
    position: 'relative',
    marginTop: 2,
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
  },

  body: { flex: 1, paddingHorizontal: SPACING.md, paddingTop: SPACING.md },

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },

  countBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  countBadgeTxt: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
    color: COLORS.secondary,
  },

filterRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
  paddingBottom: SPACING.sm,
  paddingRight: SPACING.md,
},

filterChip: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',

  paddingHorizontal: 18,
  height: 36,                // 🔥 FIX: consistent height
  borderRadius: 20,

  backgroundColor: COLORS.cardBg,
  borderWidth: 1.5,
  borderColor: COLORS.cardBorder,

  ...SHADOWS.card,
},

filterChipActive: {
  backgroundColor: COLORS.primary,
  borderColor: COLORS.primary,
},

filterChipTxt: {
  fontSize: FONTS.sizes.sm,
  fontWeight: '700',
  color: COLORS.textSecondary,
},

filterChipTxtActive: {
  color: '#FFFFFF',
},

  list: { paddingBottom: 110 },

  emptyTxt: {
    textAlign: 'center',
    color: COLORS.textMuted,
    paddingTop: 40,
  },

  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
    ...SHADOWS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },

  cardAccent: { width: 4 },

  cardInner: { flex: 1, padding: SPACING.md },

  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },

  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  badgeRow: { flexDirection: 'row', gap: 6 },

  typePill: {
    borderRadius: RADIUS.full,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },

  typePillTxt: {
    fontSize: 10,
    fontWeight: '800',
  },

  urgentPill: {
    borderRadius: RADIUS.full,
    paddingHorizontal: 9,
    paddingVertical: 3,
    backgroundColor: '#C0392B18',
  },

  urgentTxt: {
    fontSize: 10,
    fontWeight: '800',
    color: '#C0392B',
  },

  cardTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },

  cardBody: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  cardDate: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
  },
});