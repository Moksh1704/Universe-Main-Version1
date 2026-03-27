import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../constants/theme';

const TABS = [
  { name:'Home',       icon:'home',              outline:'home-outline',              label:'Home'       },
  { name:'Feed',       icon:'newspaper',          outline:'newspaper-outline',          label:'Feed'       },
  { name:'Events',     icon:'calendar',           outline:'calendar-outline',           label:'Events'     },
  { name:'Navigation', icon:'map',                outline:'map-outline',                label:'Map'        },
  { name:'Attendance', icon:'checkmark-circle',   outline:'checkmark-circle-outline',   label:'Attend'     },
  { name:'Career',     icon:'briefcase',          outline:'briefcase-outline',          label:'Career'     },
  { name:'Profile',    icon:'person-circle',      outline:'person-circle-outline',      label:'Profile'    },
];

export default function StudentBottomTabBar({ state, navigation }) {
  return (
    <View style={s.bar}>
      {state.routes.map((route, index) => {
        const tab = TABS.find(t => t.name === route.name) || TABS[0];
        const focused = state.index === index;
        return (
          <TouchableOpacity key={route.key} style={s.tab} onPress={() => navigation.navigate(route.name)} activeOpacity={0.7}>
            {focused && <View style={s.indicator} />}
            <Ionicons name={focused ? tab.icon : tab.outline} size={21} color={focused ? COLORS.accent : COLORS.tabBarInactive} />
            <Text style={[s.label, focused && s.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection:'row', backgroundColor: COLORS.primary, paddingBottom:20, paddingTop:10, borderTopLeftRadius:20, borderTopRightRadius:20, shadowColor: COLORS.primary, shadowOffset:{width:0,height:-4}, shadowOpacity:0.4, shadowRadius:20, elevation:20 },
  tab: { flex:1, alignItems:'center', justifyContent:'center', gap:2, position:'relative' },
  indicator: { position:'absolute', top:-10, width:32, height:3, borderRadius:2, backgroundColor: COLORS.accent },
  label: { fontSize:8, fontWeight:'600', color: COLORS.tabBarInactive },
  labelActive: { color: COLORS.accent, fontWeight:'800' },
});
