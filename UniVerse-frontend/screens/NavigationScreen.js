import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Modal, TouchableOpacity, Linking, StatusBar, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SearchBar } from '../components/UIComponents';
import { MOCK_LOCATIONS } from '../data/mockData';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

// Indoor navigation steps per location
const INDOOR_STEPS = {
  l1: {
    entrance: 'Enter through the main glass doors facing North Gate Road.',
    steps: [
      'Walk straight past the security desk — sign the visitor register.',
      'Take the lift or staircase on your left to reach the required floor.',
      'Floor 1: Magazines & Newspapers  |  Floor 2: Reference Books',
      'Floor 3–4: Academic & Research  |  Floor 5: Digital Resources',
      'Silence is mandatory above Floor 2. Switch phones to silent.',
    ],
  },
  l2: {
    entrance: 'Enter from the East side of the CSE Block. Look for the "CSE Dept" signboard.',
    steps: [
      'Ground floor: Labs (Lab-101, Lab-102, Lab-103).',
      'First floor: Faculty cabins and the HOD office.',
      'Second floor: Seminar hall and project lab.',
      'Follow the green arrows on the corridor walls for lab directions.',
      'Attendance is marked at the lab entrance — carry your ID card.',
    ],
  },
  l3: {
    entrance: 'Main entrance is from the central campus road. Large gates with "University Auditorium" sign.',
    steps: [
      'Show your hall ticket or event pass at the entrance gate.',
      'Left corridor leads to Rows A–M (front section).',
      'Right corridor leads to Rows N–Z (rear section).',
      'Balcony seats are accessible via the staircase near the right entrance.',
      'Emergency exits are marked in green on each row.',
    ],
  },
  l4: {
    entrance: 'Located near the Main Gate — look for the yellow "Canteen" signboard.',
    steps: [
      'Counter 1: Breakfast & Tea (7 AM – 11 AM).',
      'Counter 2: Rice meals and thalis (11 AM – 3 PM).',
      'Counter 3: Snacks, juices and cold drinks (all day).',
      'Seating area is inside and an open-air area outside.',
      'Payment: Cash or UPI accepted at all counters.',
    ],
  },
  l5: {
    entrance: 'Central entrance facing the main driveway. Security cabin at the gate.',
    steps: [
      'Security check required — carry university ID.',
      'Ground floor: Registrar, Accounts, Exam Cell.',
      'First floor: Vice-Chancellor office, PRO office.',
      'Second floor: Controller of Examinations office.',
      'Photography is not permitted inside the building.',
    ],
  },
  l6: {
    entrance: 'Enter from the South Gate near the hostel road. Large open ground visible from gate.',
    steps: [
      'Cricket & Football ground: straight ahead from the entrance.',
      'Indoor sports hall (Badminton, Table Tennis): left turn at the main gate.',
      'Gym: right side of the indoor hall — carry your gym card.',
      'Changing rooms are available on both sides of the indoor hall.',
      'Timings: 6 AM – 8 AM and 4 PM – 7 PM on weekdays.',
    ],
  },
  l7: {
    entrance: 'Enter from the West Block road. ECE Dept sign is visible from the road.',
    steps: [
      'Ground floor: Signal Processing Lab, Electronics Lab.',
      'First floor: Communication Lab, Faculty cabins.',
      'Second floor: Research Lab and project presentations room.',
      'Timetable is displayed on the notice board near the staircase.',
    ],
  },
  l8: {
    entrance: 'Located behind the Admin Building. Follow the Red Cross signboard.',
    steps: [
      'Reception and registration at the front desk.',
      'Doctor available: 9 AM – 1 PM and 2 PM – 5 PM on weekdays.',
      'Emergency first aid available 24/7 with the duty nurse.',
      'Pharmacy attached — basic medicines available free for students.',
      'Carry your university ID for free consultation.',
    ],
  },
};

const LocationCard = ({ location, onPress }) => (
  <TouchableOpacity style={st.locCard} onPress={() => onPress(location)} activeOpacity={0.85}>
    <View style={st.locIcon}>
      <Ionicons name={location.icon || 'location'} size={22} color={COLORS.primary} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={st.locName}>{location.name}</Text>
      <Text style={st.locDesc}>{location.description}</Text>
    </View>
    <Ionicons name="navigate-circle-outline" size={28} color={COLORS.accent} />
  </TouchableOpacity>
);

export default function NavigationScreen() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = MOCK_LOCATIONS.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.description.toLowerCase().includes(search.toLowerCase())
  );

  const openMaps = (loc) => {
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`);
  };

  return (
    <View style={st.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={st.header}>
        <Text style={st.headerTitle}>Campus Map</Text>
        <Text style={st.headerSub}>Navigate Andhra University</Text>
      </LinearGradient>

      <View style={st.body}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search locations..." />

        {/* Campus info strip — no external link button */}
        <View style={st.campusStrip}>
          <Ionicons name="map" size={22} color={COLORS.accent} />
          <View style={{ flex: 1 }}>
            <Text style={st.campusStripTitle}>Andhra University Campus</Text>
            <Text style={st.campusStripSub}>Visakhapatnam, Andhra Pradesh</Text>
          </View>
        </View>

        <Text style={st.sectionTitle}>Campus Locations</Text>
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          renderItem={({ item }) => <LocationCard location={item} onPress={setSelected} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={st.list}
          ListEmptyComponent={<Text style={st.empty}>No locations found</Text>}
        />
      </View>

      {/* ── Location Detail Modal with indoor steps ── */}
      <Modal visible={!!selected} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelected(null)}>
        <View style={st.modal}>
          {/* Modal header */}
          <View style={st.modalHead}>
            <TouchableOpacity onPress={() => setSelected(null)} style={st.closeBtn}>
              <Ionicons name="close" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={st.modalTitle}>{selected?.name}</Text>
          </View>

          <ScrollView contentContainerStyle={st.modalBody} showsVerticalScrollIndicator={false}>
            {/* Map placeholder */}
            <View style={st.mapView}>
              <LinearGradient colors={['#dce8f5', '#c8dbee']} style={st.mapViewGrad}>
                {[...Array(6)].map((_,i) => <View key={`h${i}`} style={[st.gridLine, { top: i*50 }]} />)}
                {[...Array(5)].map((_,i) => <View key={`v${i}`} style={[st.gridLineV, { left: i*76 }]} />)}
                <View style={st.mapPin}>
                  <Ionicons name="location" size={44} color={COLORS.danger} />
                  <View style={st.pinShadow} />
                </View>
                <View style={st.mapLabel}>
                  <Text style={st.mapLabelTxt}>{selected?.name}</Text>
                </View>
              </LinearGradient>
            </View>

            {/* Location info */}
            <View style={st.infoSection}>
              <View style={st.infoRow}>
                <Ionicons name="information-circle-outline" size={18} color={COLORS.primary} />
                <Text style={st.infoTxt}>{selected?.description}</Text>
              </View>
              <View style={st.infoRow}>
                <Ionicons name="location-outline" size={18} color={COLORS.textMuted} />
                <Text style={st.infoTxt}>Lat: {selected?.lat}, Lng: {selected?.lng}</Text>
              </View>
            </View>

            {/* ── Entrance Instructions ── */}
            {selected && INDOOR_STEPS[selected.id] && (
              <>
                <View style={st.stepsSection}>
                  <View style={st.stepsSectionHead}>
                    <Ionicons name="enter-outline" size={18} color={COLORS.primary} />
                    <Text style={st.stepsSectionTitle}>Entrance Instructions</Text>
                  </View>
                  <Text style={st.entranceTxt}>{INDOOR_STEPS[selected.id].entrance}</Text>
                </View>

                {/* ── Indoor Navigation Steps ── */}
                <View style={st.stepsSection}>
                  <View style={st.stepsSectionHead}>
                    <Ionicons name="footsteps-outline" size={18} color={COLORS.primary} />
                    <Text style={st.stepsSectionTitle}>Indoor Navigation</Text>
                  </View>
                  {INDOOR_STEPS[selected.id].steps.map((step, i) => (
                    <View key={i} style={st.stepRow}>
                      <View style={st.stepNum}>
                        <Text style={st.stepNumTxt}>{i + 1}</Text>
                      </View>
                      <Text style={st.stepTxt}>{step}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </ScrollView>

          {/* Open in Google Maps */}
          <View style={st.bottomBar}>
            <TouchableOpacity
              style={st.mapsBtn}
              onPress={() => { setSelected(null); openMaps(selected); }}
              activeOpacity={0.88}
            >
              <LinearGradient colors={[COLORS.accent, COLORS.accentDark]} style={st.mapsBtnGrad}>
                <Ionicons name="navigate" size={20} color={COLORS.primary} />
                <Text style={st.mapsBtnTxt}>Get Directions in Google Maps</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgLight },
  header: { paddingTop: 62, paddingBottom: SPACING.xl, paddingHorizontal: SPACING.lg },
  headerTitle: { fontSize: FONTS.sizes.xxxl, fontWeight: '900', color: COLORS.secondary },
  headerSub: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  body: { flex: 1, padding: SPACING.md, gap: SPACING.sm },


  mapBannerBtnTxt: { fontSize: FONTS.sizes.xs, fontWeight: '800', color: COLORS.primary },

  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.textPrimary },
  list: { paddingBottom: 100 },
  empty: { textAlign: 'center', color: COLORS.textMuted, paddingTop: 20 },

  locCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBg, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOWS.card, borderWidth: 1, borderColor: COLORS.cardBorder, gap: SPACING.sm },
  locIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: COLORS.bgLight, justifyContent: 'center', alignItems: 'center' },
  locName: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.textPrimary },
  locDesc: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2 },

  // Modal
  modal: { flex: 1, backgroundColor: COLORS.bgLight },
  modalHead: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, paddingTop: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder, gap: SPACING.md },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.bgLight, justifyContent: 'center', alignItems: 'center' },
  modalTitle: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.textPrimary, flex: 1 },
  modalBody: { paddingBottom: 20 },

  mapView: { height: 220, overflow: 'hidden' },
  mapViewGrad: { flex: 1, position: 'relative', justifyContent: 'center', alignItems: 'center' },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(10,22,40,0.08)' },
  gridLineV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(10,22,40,0.08)' },
  mapPin: { alignItems: 'center' },
  pinShadow: { width: 18, height: 5, borderRadius: 9, backgroundColor: 'rgba(0,0,0,0.18)', marginTop: -4 },
  mapLabel: { position: 'absolute', bottom: 12, backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: RADIUS.full, paddingHorizontal: 14, paddingVertical: 5 },
  mapLabelTxt: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.textPrimary },

  infoSection: { padding: SPACING.md, gap: SPACING.sm },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  infoTxt: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, flex: 1, lineHeight: 20 },

  stepsSection: { marginHorizontal: SPACING.md, marginBottom: SPACING.sm, backgroundColor: COLORS.cardBg, borderRadius: RADIUS.lg, padding: SPACING.md, ...SHADOWS.card, borderWidth: 1, borderColor: COLORS.cardBorder },
  stepsSectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.sm, paddingBottom: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder },
  stepsSectionTitle: { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.textPrimary },
  entranceTxt: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 21 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginTop: SPACING.sm },
  stepNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginTop: 1 },
  stepNumTxt: { fontSize: 11, fontWeight: '800', color: COLORS.accent },
  stepTxt: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, flex: 1, lineHeight: 20 },

  bottomBar: { padding: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.cardBorder, backgroundColor: COLORS.cardBg },
  mapsBtn: { borderRadius: RADIUS.full, overflow: 'hidden', ...SHADOWS.button },
  mapsBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, paddingVertical: 16 },
  mapsBtnTxt: { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.primary },
});
