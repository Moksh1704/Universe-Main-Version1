import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform, StatusBar, Alert, Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { loginUser } from "../api/authService";
import { apiRequest } from '../api/api';
import { saveToken } from "../api/storage";



// ─── Shared ───────────────────────────────────────────────────────────────────
const Field = ({ label, icon, value, onChange, placeholder, secure, keyboard, hint }) => {
  const [show, setShow] = useState(false);
  return (
    <View style={s.fieldGroup}>
      <Text style={s.fieldLabel}>{label}</Text>
      <View style={s.fieldWrap}>
        <Ionicons name={icon} size={17} color={COLORS.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          style={s.fieldInput}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry={secure && !show}
          keyboardType={keyboard || 'default'}
          autoCapitalize="none"
        />
        {secure && (
          <TouchableOpacity onPress={() => setShow(!show)}>
            <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={17} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>
      {hint ? <Text style={s.fieldHint}>{hint}</Text> : null}
    </View>
  );
};

const PrimaryBtn = ({ label, onPress }) => (
  <TouchableOpacity style={s.primaryBtn} onPress={onPress} activeOpacity={0.88}>
    <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.primaryBtnGrad}>
      <Text style={s.primaryBtnText}>{label}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const GoogleBtn = ({ onPress }) => (
  <TouchableOpacity style={s.googleBtn} onPress={onPress}>
    <Ionicons name="logo-google" size={19} color="#DB4437" />
    <Text style={s.googleBtnText}>Continue with Google</Text>
  </TouchableOpacity>
);

const Divider = () => (
  <View style={s.divider}>
    <View style={s.divLine} /><Text style={s.divText}>or</Text><View style={s.divLine} />
  </View>
);

const FormHeader = ({ icon, title, sub, onBack, iconBg }) => (
  <LinearGradient colors={[COLORS.primary, COLORS.primaryMid]} style={s.formHeader}>
    <TouchableOpacity onPress={onBack} style={s.backBtn}>
      <Ionicons name="arrow-back" size={21} color={COLORS.secondary} />
    </TouchableOpacity>
    <View style={[s.formHeaderIcon, { backgroundColor: iconBg || COLORS.accent }]}>
      <Ionicons name={icon} size={28} color={iconBg ? COLORS.secondary : COLORS.primary} />
    </View>
    <Text style={s.formHeaderTitle}>{title}</Text>
    <Text style={s.formHeaderSub}>{sub}</Text>
  </LinearGradient>
);

// ─── Registration Selection ───────────────────────────────────────────────────
export function RegSelectionScreen({ navigation }) {
  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={[COLORS.primary, COLORS.primaryMid]} style={s.selBanner}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={21} color={COLORS.secondary} />
        </TouchableOpacity>
        <View style={s.selLogoCircle}>
          <Image source={require('../assets/logo.png')} style={s.selLogo} resizeMode="contain" />
        </View>
        <Text style={s.selTitle}>Join UniVerse</Text>
        <Text style={s.selSub}>Select your role to continue</Text>
      </LinearGradient>

      <View style={s.selBody}>
        {[
          { label: 'Student', icon: 'school', bg: COLORS.accent, iconColor: COLORS.primary, route: 'StudentReg', desc: 'B.Tech / M.Tech / MCA & more' },
          { label: 'Faculty', icon: 'person', bg: COLORS.primary, iconColor: COLORS.secondary, route: 'FacultyReg', desc: 'Professors & Teaching Staff' },
        ].map(item => (
          <TouchableOpacity key={item.label} style={s.roleCard} onPress={() => navigation.navigate(item.route)} activeOpacity={0.9}>
            <View style={[s.roleIcon, { backgroundColor: item.bg }]}>
              <Ionicons name={item.icon} size={32} color={item.iconColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.roleLabel}>{item.label}</Text>
              <Text style={s.roleDesc}>{item.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        ))}
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={s.loginLink}>
          <Text style={s.loginLinkText}>Already have an account? <Text style={s.loginLinkBold}>Login</Text></Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Student Registration ─────────────────────────────────────────────────────
export function StudentRegScreen({ navigation }) {
  const [form, setForm] = useState({ name: '', email: '', course: '', department: '', year: '', section: '', password: '', confirm: '' });
  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    if (!form.name.trim()) return 'Enter your full name.';
    if (!form.email.endsWith('@andhrauniversity.edu.in')) return 'Use regnum@andhrauniversity.edu.in email.';
    if (!form.department.trim()) return 'Enter your department.';
    const yr = parseInt(form.year);
    if (!form.year || isNaN(yr) || yr < 1 || yr > 6) return 'Year must be 1–6.';
    if (!form.section.trim()) return 'Enter your section.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    if (form.password !== form.confirm) return 'Passwords do not match.';
    return null;
  };

  const handleReg = async () => {
  try {
    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      role: "student",

      department: form.department,
      year: Number(form.year),
      section: form.section,

      registration_number: form.registration_number,
      designation: "none"
    };

    console.log("REGISTER PAYLOAD:", payload);

    const res = await apiRequest('/auth/register', 'POST', payload);

    console.log("REGISTER SUCCESS:", res);

    Alert.alert("Success", "Account created successfully!");

    navigation.navigate('Login', { defaultRole: 'student' });

  } catch (err) {
    console.log("REGISTER ERROR:", err);
    Alert.alert("Error", "Registration failed");
  }
};

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <FormHeader icon="school" title="Student Registration" sub="Andhra University" onBack={() => navigation.goBack()} />
        <View style={s.form}>
          <Field label="Full Name" icon="person-outline" value={form.name} onChange={set('name')} placeholder="Your full name" />
          <Field label="Email" icon="mail-outline" value={form.email} onChange={set('email')} placeholder="regnum@andhrauniversity.edu.in" keyboard="email-address" hint="Use your registration number as email prefix" />
          <Field label="Department" icon="school-outline" value={form.department} onChange={set('department')} placeholder="e.g. Computer Science & Engineering" />
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Field label="Year (1–6)" icon="layers-outline" value={form.year} onChange={set('year')} placeholder="e.g. 3" keyboard="numeric" />
            </View>
            <View style={{ width: SPACING.md }} />
            <View style={{ flex: 1 }}>
              <Field label="Section" icon="grid-outline" value={form.section} onChange={set('section')} placeholder="e.g. A" />
            </View>
          </View>
          <Field label="Password" icon="lock-closed-outline" value={form.password} onChange={set('password')} placeholder="Min 6 characters" secure />
          <Field label="Confirm Password" icon="lock-closed-outline" value={form.confirm} onChange={set('confirm')} placeholder="Re-enter password" secure />
          <PrimaryBtn label="Create Student Account" onPress={handleReg} />
          <Divider />
          <GoogleBtn onPress={handleReg} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Faculty Registration ─────────────────────────────────────────────────────


export function FacultyRegScreen({ navigation }) {

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    department: '',
    designation: ''
  });

  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    if (!form.name.trim()) return 'Enter your full name.';
    if (!form.email.endsWith('@andhrauniversity.edu.in')) return 'Use @andhrauniversity.edu.in email.';
    if (!form.designation.trim()) return 'Enter your designation.';
    if (!form.department.trim()) return 'Enter your department.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    if (form.password !== form.confirm) return 'Passwords do not match.';
    return null;
  };

  // 🔥 UPDATED FUNCTION (CONNECTED TO BACKEND)
  const handleReg = async () => {
    const err = validate();
    if (err) {
      Alert.alert('Validation Error', err);
      return;
    }

    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: "faculty",
        department: form.department,
        designation: form.designation
      };

      console.log("FACULTY REGISTER PAYLOAD:", payload);

      const res = await apiRequest('/auth/register', 'POST', payload);

      console.log("FACULTY REGISTER SUCCESS:", res);

      Alert.alert('Success', 'Faculty account created!', [
        {
          text: 'Login Now',
          onPress: () =>
            navigation.navigate('Login', { defaultRole: 'faculty' })
        }
      ]);

    } catch (err) {
      console.log("FACULTY REGISTER ERROR:", err);

      Alert.alert(
        'Error',
        err?.message || 'Registration failed'
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        <FormHeader
          icon="person"
          title="Faculty Registration"
          sub="Andhra University"
          onBack={() => navigation.goBack()}
          iconBg={COLORS.primary}
        />

        <View style={s.form}>

          <Field
            label="Full Name"
            icon="person-outline"
            value={form.name}
            onChange={set('name')}
            placeholder="Dr. / Prof. Your Name"
          />

          <Field
            label="Email"
            icon="mail-outline"
            value={form.email}
            onChange={set('email')}
            placeholder="faculty@andhrauniversity.edu.in"
            keyboard="email-address"
          />

          <Field
            label="Designation"
            icon="briefcase-outline"
            value={form.designation}
            onChange={set('designation')}
            placeholder="e.g. Assistant Professor"
          />

          <Field
            label="Department"
            icon="school-outline"
            value={form.department}
            onChange={set('department')}
            placeholder="e.g. Computer Science & Engineering"
          />

          <Field
            label="Password"
            icon="lock-closed-outline"
            value={form.password}
            onChange={set('password')}
            placeholder="Min 6 characters"
            secure
          />

          <Field
            label="Confirm Password"
            icon="lock-closed-outline"
            value={form.confirm}
            onChange={set('confirm')}
            placeholder="Re-enter password"
            secure
          />

          {/* ✅ CONNECTED BUTTON */}
          <PrimaryBtn label="Create Faculty Account" onPress={handleReg} />

          <Divider />

          <GoogleBtn onPress={handleReg} />

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────
export function LoginScreen({ navigation, route }) {
  const defaultRole = route?.params?.defaultRole || 'student';
  const [role, setRole] = useState(defaultRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
  if (!email.trim() || !password.trim()) {
    Alert.alert("Missing Fields", "Please enter email and password.");
    return;
  }

  try {
    const data = await loginUser(email, password);

    // Save token
    await saveToken(data.accessToken);

    // Navigate
    navigation.reset({
      index: 0,
      routes: [{ name: "MainApp", params: { role: data.user.role } }],
    });

  } catch (error) {
    Alert.alert("Login Failed", error.message);
  }
};

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[COLORS.primary, COLORS.primaryMid]} style={s.loginHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={21} color={COLORS.secondary} />
          </TouchableOpacity>
          <Image source={require('../assets/logo.png')} style={s.loginLogo} resizeMode="contain" />
          <Text style={s.loginTitle}>Welcome Back</Text>
          <Text style={s.loginSub}>Login to UniVerse</Text>
          <View style={s.toggle}>
            {['student','faculty'].map(r => (
              <TouchableOpacity key={r} style={[s.toggleBtn, role===r && s.toggleActive]} onPress={() => setRole(r)}>
                <Ionicons name={r==='student' ? 'school-outline' : 'person-outline'} size={15} color={role===r ? COLORS.primary : 'rgba(255,255,255,0.65)'} />
                <Text style={[s.toggleText, role===r && s.toggleActiveText]}>{r==='student' ? 'Student' : 'Faculty'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>

        <View style={s.form}>
          <View style={s.roleInfoBanner}>
            <Ionicons name={role==='student' ? 'school' : 'person'} size={16} color={COLORS.accentDark} />
            <Text style={s.roleInfoText}>Logging in as <Text style={{ fontWeight:'800', color:COLORS.primary }}>{role==='student'?'Student':'Faculty'}</Text></Text>
          </View>
          <Field label="Email" icon="mail-outline" value={email} onChange={setEmail}
            placeholder={role==='student' ? 'regnum@andhrauniversity.edu.in' : 'faculty@andhrauniversity.edu.in'}
            keyboard="email-address" />
          <Field label="Password" icon="lock-closed-outline" value={password} onChange={setPassword} placeholder="Enter your password" secure />
          <TouchableOpacity style={s.forgotBtn}><Text style={s.forgotText}>Forgot Password?</Text></TouchableOpacity>
          <PrimaryBtn label={`Login as ${role==='student'?'Student':'Faculty'}`} onPress={handleLogin} />
          <Divider />
          <GoogleBtn onPress={handleLogin} />
          <TouchableOpacity onPress={() => navigation.navigate('RegSelection')} style={s.loginLink}>
            <Text style={s.loginLinkText}>New to UniVerse? <Text style={s.loginLinkBold}>Register</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgLight },
  scrollContent: { paddingBottom: 40 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.16)', justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md },

  // Selection
  selBanner: { paddingTop: 56, paddingBottom: SPACING.xl, paddingHorizontal: SPACING.lg, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, alignItems: 'flex-start' },
  selLogoCircle: { width: 88, height: 88, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm },
  selLogo: { width: 86, height: 86 },
  selTitle: { fontSize: FONTS.sizes.xxxl, fontWeight: '900', color: COLORS.secondary },
  selSub: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  selBody: { padding: SPACING.lg, gap: SPACING.md },
  roleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBg, borderRadius: RADIUS.xl, padding: SPACING.md, ...SHADOWS.card, gap: SPACING.md, borderWidth: 1, borderColor: COLORS.cardBorder },
  roleIcon: { width: 66, height: 66, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  roleLabel: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.textPrimary },
  roleDesc: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: 3 },
  loginLink: { alignItems: 'center', marginTop: SPACING.lg },
  loginLinkText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  loginLinkBold: { color: COLORS.primary, fontWeight: '800' },

  // Form header
  formHeader: { paddingTop: 56, paddingBottom: SPACING.xl, paddingHorizontal: SPACING.lg, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, alignItems: 'flex-start' },
  formHeaderIcon: { width: 62, height: 62, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm },
  formHeaderTitle: { fontSize: FONTS.sizes.xxl, fontWeight: '900', color: COLORS.secondary },
  formHeaderSub: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.6)', marginTop: 3 },

  // Login header
  loginHeader: { paddingTop: 56, paddingBottom: SPACING.xl, paddingHorizontal: SPACING.lg, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, alignItems: 'center' },
  loginLogo: { width: 100, height: 100, marginBottom: SPACING.sm },
  loginTitle: { fontSize: FONTS.sizes.xxl, fontWeight: '900', color: COLORS.secondary },
  loginSub: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.6)', marginTop: 3, marginBottom: SPACING.md },
  toggle: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: RADIUS.full, padding: 4 },
  toggleBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: SPACING.lg, paddingVertical: 10, borderRadius: RADIUS.full },
  toggleActive: { backgroundColor: COLORS.accent },
  toggleText: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: 'rgba(255,255,255,0.65)' },
  toggleActiveText: { color: COLORS.primary },

  // Form
  form: { padding: SPACING.lg, gap: SPACING.sm },
  fieldGroup: { gap: 5 },
  fieldLabel: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.textPrimary },
  fieldWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBg, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: 13, borderWidth: 1.5, borderColor: COLORS.cardBorder },
  fieldInput: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.textPrimary },
  fieldHint: { fontSize: 10, color: COLORS.textMuted, marginTop: 2, marginLeft: 2 },
  row: { flexDirection: 'row' },
  primaryBtn: { borderRadius: RADIUS.full, overflow: 'hidden', marginTop: SPACING.sm, ...SHADOWS.card },
  primaryBtnGrad: { paddingVertical: 15, alignItems: 'center' },
  primaryBtnText: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.secondary },
  divider: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  divLine: { flex: 1, height: 1, backgroundColor: COLORS.cardBorder },
  divText: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, paddingVertical: 14, borderRadius: RADIUS.full, backgroundColor: COLORS.cardBg, borderWidth: 1.5, borderColor: COLORS.cardBorder, ...SHADOWS.card },
  googleBtnText: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.textPrimary },
  forgotBtn: { alignSelf: 'flex-end' },
  forgotText: { fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: '600' },
  roleInfoBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.accent + '18', borderRadius: RADIUS.md, padding: SPACING.sm, borderWidth: 1, borderColor: COLORS.accent + '35' },
  roleInfoText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
});
