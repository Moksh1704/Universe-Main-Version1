import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, StatusBar, ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { apiRequest } from '../api/api';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

const CATEGORIES = [
  { key: 'All', icon: 'apps-outline', label: 'All' },
  { key: 'Technical', icon: 'code-slash-outline', label: 'Technical' },
  { key: 'Non-Technical', icon: 'briefcase-outline', label: 'Non-Tech' },
  { key: 'Cultural', icon: 'musical-notes-outline', label: 'Cultural' },
  { key: 'Sports', icon: 'trophy-outline', label: 'Sports' },
];

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
  const [cat, setCat] = useState('All');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const filtered =
    cat === 'All'
      ? events
      : events.filter(e =>
          e.category?.toLowerCase() === cat.toLowerCase()
        );

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

      <View style={s.body}>

        {/* Filter */}
        <View style={s.filterWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.filterRow}
            bounces={false}
          >
            {CATEGORIES.map(c => {
              const active = cat === c.key;
              return (
                <TouchableOpacity
                  key={c.key}
                  style={[s.filterBtn, active && s.filterBtnActive]}
                  onPress={() => setCat(c.key)}
                >
                  <Ionicons
                    name={c.icon}
                    size={14}
                    color={active ? '#FFFFFF' : COLORS.textSecondary}
                  />
                  <Text style={[s.filterBtnTxt, active && s.filterBtnTxtActive]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* List */}
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          renderItem={({ item }) => <EventCard event={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.list}
          ListEmptyComponent={
            <Text style={s.empty}>No events found.</Text>
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

  body: { flex: 1 },
  filterWrap: { paddingHorizontal: SPACING.md, paddingTop: SPACING.md, paddingBottom: 2 },
  filterRow: { flexDirection: 'row', gap: 8, paddingBottom: SPACING.sm, alignItems: 'center' },

  filterBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 16, paddingVertical: 9,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1.5, borderColor: COLORS.cardBorder,
    minHeight: 36,
    ...SHADOWS.card,
  },
  filterBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterBtnTxt: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.textSecondary },
  filterBtnTxtActive: { color: '#FFFFFF' },

  list: { padding: SPACING.md, paddingBottom: 110 },
  empty: { textAlign: 'center', color: COLORS.textMuted, paddingTop: 40 },

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