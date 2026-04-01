import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, StatusBar, TextInput, ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { apiRequest } from '../api/api';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

const CATEGORIES = ['All', 'Technical', 'Cultural', 'Sports', 'Workshops'];

const EventCard = ({ event }) => {
  const [reg, setReg] = useState(event.registered);

  const handleRegister = async () => {
    try {
      if (!reg) {
        await apiRequest(`/events/${event.id}/register`, 'POST');
      } else {
        await apiRequest(`/events/${event.id}/register`, 'DELETE');
      }
      setReg(!reg);
    } catch (err) {
      console.log('Registration error:', err);
    }
  };

  return (
    <View style={s.card}>
      <View style={[s.colorBar, { backgroundColor: event.color || COLORS.primary }]} />
      <View style={s.cardBody}>

        {/* Head */}
        <View style={s.cardHead}>
          <View style={[s.catIcon, { backgroundColor: (event.color || COLORS.primary) + '1E' }]}>
            <Ionicons name="calendar" size={20} color={event.color || COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.catLabel, { color: event.color || COLORS.primary }]}>
              {event.category?.toUpperCase()}
            </Text>
            <Text style={s.eventTitle}>{event.title}</Text>
          </View>
        </View>

        {/* Meta */}
        <View style={s.metaRow}>
          <Ionicons name="time-outline" size={13} color={COLORS.textMuted} />
          <Text style={s.metaTxt}>{event.date} · {event.time}</Text>
        </View>

        <View style={s.metaRow}>
          <Ionicons name="location-outline" size={13} color={COLORS.textMuted} />
          <Text style={s.metaTxt}>{event.venue}</Text>
        </View>

        <Text style={s.desc}>{event.description}</Text>

        {/* Register Button */}
        <TouchableOpacity
          style={[s.regBtn, reg && s.regBtnDone]}
          onPress={handleRegister}
          activeOpacity={0.85}
        >
          <Ionicons
            name={reg ? 'checkmark-circle' : 'add-circle-outline'}
            size={16}
            color={reg ? COLORS.success : COLORS.secondary}
          />
          <Text style={[s.regBtnTxt, reg && s.regBtnTxtDone]}>
            {reg ? 'Registered' : 'Register Now'}
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
};

export default function EventsScreen() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await apiRequest('/events');
        console.log('Events:', data);
        setEvents(data);
      } catch (err) {
        console.log('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      activeCategory === 'All' ||
      event.category?.toLowerCase() === activeCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <View style={s.container}>
        <Text style={{ textAlign: 'center', marginTop: 50 }}>
          Loading events...
        </Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient colors={[COLORS.primary, COLORS.primaryMid]} style={s.header}>
        <Text style={s.headerTitle}>Events</Text>
        <Text style={s.headerSub}>Campus events and activities</Text>
      </LinearGradient>

      {/* Search Bar */}
      <View style={s.searchWrap}>
        <View style={s.searchBar}>
          <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
          <TextInput
            style={s.searchInput}
            placeholder="Search events..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={17} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filters */}
      <View style={s.filterWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filterScroll}
        >
          {CATEGORIES.map(cat => {
            const active = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[s.filterPill, active && s.filterPillActive]}
                onPress={() => setActiveCategory(cat)}
                activeOpacity={0.8}
              >
                <Text style={[s.filterPillTxt, active && s.filterPillTxtActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={s.body}>
        {/* List */}
        <FlatList
          data={filteredEvents}
          keyExtractor={i => i.id}
          renderItem={({ item }) => <EventCard event={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.list}
          ListEmptyComponent={
            <View style={s.emptyWrap}>
              <Ionicons name="calendar-outline" size={40} color={COLORS.textMuted} />
              <Text style={s.empty}>No events found.</Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgLight },
  header: { paddingTop: 62, paddingBottom: SPACING.xl, paddingHorizontal: SPACING.lg },
  headerTitle: { fontSize: FONTS.sizes.xxxl, fontWeight: '900', color: COLORS.secondary },
  headerSub: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.6)', marginTop: 4 },

  // Search
  searchWrap: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: SPACING.md,
    paddingVertical: 11,
    ...SHADOWS.card,
  },
  searchInput: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textPrimary,
  },

  // Filters
  filterWrap: {
    paddingBottom: SPACING.sm,
  },
  filterScroll: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
  },
  filterPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterPillTxt: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterPillTxtActive: {
    color: COLORS.secondary,
    fontWeight: '700',
  },

  body: { flex: 1 },
  list: { padding: SPACING.md, paddingBottom: 110 },
  emptyWrap: { alignItems: 'center', paddingTop: 40, gap: SPACING.sm },
  empty: { textAlign: 'center', color: COLORS.textMuted },

  card: {
    backgroundColor: COLORS.cardBg, borderRadius: RADIUS.lg,
    marginBottom: SPACING.md, overflow: 'hidden',
    ...SHADOWS.card, borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  colorBar: { height: 5 },
  cardBody: { padding: SPACING.md },
  cardHead: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginBottom: SPACING.sm },
  catIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  catLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  eventTitle: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.textPrimary, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  metaTxt: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  desc: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginVertical: SPACING.sm },

  regBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 7, backgroundColor: COLORS.primary, borderRadius: RADIUS.full,
    paddingVertical: 12,
  },
  regBtnTxt: { color: COLORS.secondary, fontWeight: '800' },
  regBtnDone: { backgroundColor: COLORS.success + '1E', borderWidth: 1.5, borderColor: COLORS.success },
  regBtnTxtDone: { color: COLORS.success },
});
