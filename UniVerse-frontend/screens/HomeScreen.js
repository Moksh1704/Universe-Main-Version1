import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { apiRequest } from '../api/api';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

// ─── NOTE: Pass `navigation` prop into HomeScreen from your navigator ─────────
// e.g. <HomeScreen navigation={navigation} /> or via React Navigation's stack.

const TYPE_META = {
  exam:    { label: 'EXAM',    color: '#C0392B' },
  result:  { label: 'RESULT',  color: '#1E8449' },
  holiday: { label: 'HOLIDAY', color: '#D68910' },
};

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
            {/* URGENT tag removed */}
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

export default function HomeScreen({ navigation }) {
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

  const handleProfilePress = () => {
    // Navigate to the existing Profile screen
    if (navigation) {
      navigation.navigate('Profile');
    }
  };

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

          {/* Profile icon — replaces notification bell, opens Profile page */}
          <TouchableOpacity style={s.profileBtn} onPress={handleProfilePress} activeOpacity={0.8}>
            <Ionicons name="person-circle-outline" size={26} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={s.body}>

        {/* Section header with notification bell on the right */}
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>Latest Updates</Text>

          <View style={s.sectionRight}>
            <View style={s.countBadge}>
              <Text style={s.countBadgeTxt}>{announcements.length}</Text>
            </View>

            {/* Notification icon moved here */}
            <TouchableOpacity style={s.notifBtn} activeOpacity={0.75}>
              <Ionicons name="notifications-outline" size={20} color={COLORS.primary} />
              <View style={s.notifDot} />
            </TouchableOpacity>
          </View>
        </View>

        {/* List */}
        <FlatList
          data={announcements}
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

  // Profile button (top-right in header)
  profileBtn: {
    padding: 9,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: RADIUS.md,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  body: { flex: 1, paddingHorizontal: SPACING.md, paddingTop: SPACING.md },

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  sectionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
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

  // Notification bell (now beside Latest Updates)
  notifBtn: {
    position: 'relative',
    padding: 6,
    backgroundColor: COLORS.primary + '12',
    borderRadius: RADIUS.md,
  },
  notifDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
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
