import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert, Modal, Switch
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { apiRequest } from '../api/api';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

// ── Info row ─────────────────────────────────────────
const InfoRow = ({ icon, label, value }) => (
  <View style={s.infoRow}>
    <View style={s.infoIconBg}>
      <Ionicons name={icon} size={17} color={COLORS.primary} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  </View>
);

// ── Settings modal (same UI) ─────────────────────────
const SettingsModal = ({ visible, onClose }) => {
  const [notif, setNotif] = useState(true);
  const [darkMode, setDark] = useState(false);
  const [emailUpd, setEmail] = useState(true);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={s.modalContainer}>
        <View style={s.modalHead}>
          <Text style={s.modalHeadTitle}>Settings</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={22} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ── Other modals SAME ─────────────────────────
const PrivacyModal = ({ visible, onClose }) => (
  <Modal visible={visible}><View style={s.modalContainer}><Text>Privacy</Text></View></Modal>
);
const HelpModal = ({ visible, onClose }) => (
  <Modal visible={visible}><View style={s.modalContainer}><Text>Help</Text></View></Modal>
);
const AboutModal = ({ visible, onClose }) => (
  <Modal visible={visible}><View style={s.modalContainer}><Text>About</Text></View></Modal>
);

// ── MAIN ─────────────────────────────────────
export default function ProfileScreen({ navigation }) {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showSettings, setSettings] = useState(false);
  const [showPrivacy, setPrivacy] = useState(false);
  const [showHelp, setHelp] = useState(false);
  const [showAbout, setAbout] = useState(false);

  // 🔥 API INTEGRATION
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await apiRequest('/users/me');
        setUser(data);
      } catch (err) {
        console.log("ERROR:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading || !user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  const role = user.role || 'student';

  const initials = (user.name || "U")
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2);

  const menuItems = [
    { icon: 'settings-outline', label: 'Settings', action: () => setSettings(true) },
    { icon: 'shield-outline', label: 'Privacy & Security', action: () => setPrivacy(true) },
    { icon: 'help-circle-outline', label: 'Help & Support', action: () => setHelp(true) },
    { icon: 'information-circle-outline', label: 'About UniVerse', action: () => setAbout(true) },
    {
      icon: 'log-out-outline',
      label: 'Logout',
      danger: true,
      action: () => Alert.alert('Logout', 'Are you sure?', [
        { text: 'Cancel' },
        {
          text: 'Logout',
          onPress: () => navigation.reset({ index: 0, routes: [{ name: 'GetStarted' }] })
        }
      ])
    }
  ];

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView>

        {/* Header */}
        <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={s.profileBg}>
          <View style={s.avatar}>
            <Text style={s.avatarTxt}>{initials}</Text>
          </View>

          <Text style={s.profileName}>
            {user.name || user.full_name}
          </Text>

          <Text style={s.profileSub}>
            {role === 'faculty'
              ? `${user.designation} · ${user.department}`
              : `Year ${user.year} · ${user.department}`}
          </Text>
        </LinearGradient>

        {/* DETAILS */}
        <View style={s.body}>
          <View style={s.infoCard}>
            <Text style={s.cardTitle}>Profile</Text>

            <InfoRow icon="person-outline" label="Name" value={user.name || user.full_name} />
            <InfoRow icon="mail-outline" label="Email" value={user.email} />

            {role === 'student' && (
              <>
                <InfoRow icon="school-outline" label="Year" value={user.year} />
                <InfoRow icon="grid-outline" label="Section" value={user.section} />
                <InfoRow icon="book-outline" label="Course" value={user.course} />
              </>
            )}

            <InfoRow icon="business-outline" label="Department" value={user.department} />

            {role === 'faculty' && (
              <InfoRow icon="briefcase-outline" label="Designation" value={user.designation} />
            )}
          </View>

          {/* MENU */}
          <View style={s.infoCard}>
            {menuItems.map((item, i) => (
              <TouchableOpacity key={i} style={s.menuRow} onPress={item.action}>
                <Text style={{ color: item.danger ? 'red' : 'black' }}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <SettingsModal visible={showSettings} onClose={() => setSettings(false)} />
      <PrivacyModal visible={showPrivacy} onClose={() => setPrivacy(false)} />
      <HelpModal visible={showHelp} onClose={() => setHelp(false)} />
      <AboutModal visible={showAbout} onClose={() => setAbout(false)} />
    </View>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgLight },

  profileBg: {
    paddingTop: 70,
    paddingBottom: SPACING.xl,
    alignItems: 'center'
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center'
  },

  avatarTxt: {
    fontSize: 30,
    fontWeight: 'bold',
    color: COLORS.secondary
  },

  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.secondary
  },

  profileSub: {
    fontSize: 14,
    color: '#eee'
  },

  body: {
    padding: 15
  },

  infoCard: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10
  },

  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 10
  },

  infoRow: {
    flexDirection: 'row',
    marginBottom: 10
  },

  infoIconBg: {
    marginRight: 10
  },

  infoLabel: {
    fontSize: 12,
    color: 'gray'
  },

  infoValue: {
    fontSize: 14,
    fontWeight: '500'
  },

  menuRow: {
    padding: 12
  },

  modalContainer: {
    flex: 1,
    padding: 20
  },

  modalHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  modalHeadTitle: {
    fontSize: 18,
    fontWeight: 'bold'
  }
});