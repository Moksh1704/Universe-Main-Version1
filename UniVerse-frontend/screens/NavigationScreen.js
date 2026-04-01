import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Modal, TouchableOpacity,
  Linking, StatusBar, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SearchBar } from '../components/UIComponents';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

const CAMPUS_LOCATIONS = [
  { id: 'c1', name: `Algorithm`, description: `CSE classes`, category: 'academic', lat: 17.7303553153865, lng: 83.318259654478, keywords: `classes, Cse classes, cse dept` },
  { id: 'c2', name: `Department of Computer science and Systems Engineering`, description: `Cse dept`, category: 'academic', lat: 17.7300571933786, lng: 83.3178629956212, keywords: `classes, Cse classes, cse dept` },
  { id: 'c3', name: `Department of Information Technology and Computer Applications`, description: `it dept`, category: 'academic', lat: 17.7303612187876, lng: 83.3176832595767, keywords: `classes, It classes, it dept` },
  { id: 'c4', name: `Library`, description: `library and knowledge center`, category: 'library', lat: 17.7301191791835, lng: 83.3189352140935, keywords: `Library, knowledge center` },
  { id: 'c5', name: `Department of Electronics and Communication Engineering`, description: `ece dept`, category: 'academic', lat: 17.7302461024361, lng: 83.3195735869917, keywords: `classes, ece classes, ece dept` },
  { id: 'c6', name: `The Digifac / Codeiam`, description: `student club`, category: 'innovation', lat: 17.7304350112897, lng: 83.3196758506032, keywords: `classes, Student classes, student dept` },
  { id: 'c7', name: `Nasscom`, description: `Center of Excellence`, category: 'innovation', lat: 17.7300483382667, lng: 83.3201623774823, keywords: `nasscom` },
  { id: 'c8', name: `Department of Naval Architecture and Marine Engineering`, description: `marine dept`, category: 'academic', lat: 17.7305855479032, lng: 83.3199795425463, keywords: `classes, Marine classes, marine dept` },
  { id: 'c9', name: `Andhra University Incubation Hub (a - hub)`, description: `a hub`, category: 'innovation', lat: 17.7322304155373, lng: 83.3211205911226, keywords: `incubation, a hub` },
  { id: 'c10', name: `Department of Instrumentation Engineering`, description: `instrumentation dept`, category: 'academic', lat: 17.7289058537745, lng: 83.3237052486849, keywords: `classes, Instrumentation classes, instrumentation dept` },
  { id: 'c11', name: `Placement Office, Andhra University College of Engineering`, description: `placements office`, category: 'administration', lat: 17.7284941749465, lng: 83.3225091103808, keywords: `classes, Placements classes, placements dept` },
  { id: 'c12', name: `Department of Chemical Engineering`, description: `chemical dept`, category: 'academic', lat: 17.7284394869141, lng: 83.3217037106461, keywords: `classes, Chemical classes, chemical dept` },
  { id: 'c13', name: `Department of Civil Engineering`, description: `civil dept`, category: 'academic', lat: 17.7272682745528, lng: 83.3198814160729, keywords: `classes, Civil classes, civil dept` },
  { id: 'c14', name: `Department of Metallurgical Engineering`, description: `metallurical dept`, category: 'academic', lat: 17.7276765088209, lng: 83.3194545418147, keywords: `classes, Metallurical classes, metallurical dept` },
  { id: 'c15', name: `Department of Mechanical Engineering`, description: `mech dept`, category: 'academic', lat: 17.7279179854716, lng: 83.3190125403997, keywords: `classes, Mech classes, mech dept` },
  { id: 'c16', name: `Department of Electrical and Electronics Engineering.`, description: `eee dept`, category: 'academic', lat: 17.728915212601, lng: 83.3184097688413, keywords: `classes, eee classes, eee dept` },
  { id: 'c17', name: `Department of Geo-Engineering`, description: `geo dept`, category: 'academic', lat: 17.7267789910535, lng: 83.3208858268795, keywords: `classes, geo classes, geo dept` },
  { id: 'c18', name: `New Class Room Complex`, description: `ncrc`, category: 'academic', lat: 17.7291552315372, lng: 83.3174018230348, keywords: `classes, ncrc classes, ncrc ncrc` },
  { id: 'c19', name: `Siemens Centre of Excellence Andhra University`, description: `skill development center`, category: 'innovation', lat: 17.728311430328, lng: 83.3194497404863, keywords: `siemens centre of excellence andhra university` },
  { id: 'c20', name: `Examination Block`, description: `examination hall`, category: 'administration', lat: 17.7284263978216, lng: 83.3187470017059, keywords: `classes, Examination classes, examination dept` },
  { id: 'c21', name: `A U Health Centre`, description: `hospital`, category: 'health', lat: 17.7272789125115, lng: 83.3207601770985, keywords: `hospital, health center` },
  { id: 'c22', name: `Department of Architecture`, description: `arch dept`, category: 'academic', lat: 17.7263939774306, lng: 83.3201321417151, keywords: `classes, arch classes, arch dept` },
  { id: 'c23', name: `Hotspot`, description: `hotspot canteen`, category: 'food', lat: 17.729055663928, lng: 83.3190576113853, keywords: `classes, Hotspot classes, hotspot dept` },
  { id: 'c24', name: `CSE Breeze`, description: `cse canteer`, category: 'food', lat: 17.7299953217735, lng: 83.3179877563838, keywords: `classes, Cse classes, cse dept` },
  { id: 'c25', name: `Chemical Dept Canteen`, description: `chem canteen`, category: 'food', lat: 17.728593701316, lng: 83.3210688133808, keywords: `dept canteen, chem canteen` },
  { id: 'c26', name: `Mechanical Dept Canteen`, description: `mech canteen`, category: 'food', lat: 17.727728743949, lng: 83.3192392846236, keywords: `dept canteen, mech canteen` },
  { id: 'c27', name: `Union Bank`, description: `atm`, category: 'bank', lat: 17.7280779602653, lng: 83.3208692137961, keywords: `bank, atm` },
  { id: 'c28', name: `Indian Institute of Petroleum and Energy`, description: `ipe`, category: 'academic', lat: 17.7335826788892, lng: 83.3202205748435, keywords: `classes, ipe classes, ipe ipe` },
  { id: 'c29', name: `Dr YVS Murty Auditorium`, description: `auditorium`, category: 'entertainment', lat: 17.7318531066938, lng: 83.3206013627947, keywords: `classes, auditorium classes, auditorium auditorium` },
  { id: 'c30', name: `AUCE Basketball Court`, description: `bb court`, category: 'sports', lat: 17.7300423160455, lng: 83.3204820113914, keywords: `basketball court, bb court` },
  { id: 'c31', name: `AUCE Volleyball Court`, description: `volleyball court`, category: 'sports', lat: 17.7293954073385, lng: 83.3203711850379, keywords: `volleyball court, volleyball court` },
  { id: 'c32', name: `Administrative Office`, description: `principle office`, category: 'administration', lat: 17.7286564669053, lng: 83.3198227366575, keywords: `classes, Principle classes, principle dept` },
  { id: 'c33', name: `A.U Engineering College Ground`, description: `ground`, category: 'sports', lat: 17.7296815207826, lng: 83.3219599960119, keywords: `Au ground, ground` },
  { id: 'c34', name: `Bezawada ruchulu`, description: `canteen`, category: 'food', lat: 17.7295749466663, lng: 83.3197548432895, keywords: `canteen , food` },
  { id: 'c35', name: `Department of Engineering Chemistry(Applied Chemistry)`, description: `chem dept`, category: 'academic', lat: 17.72826255, lng: 83.32025062, keywords: `classes, dept classes, chem dept` },
  { id: 'c36', name: `AU Girls Hostel`, description: `girls hostel`, category: 'hostel', lat: 17.72952719, lng: 83.32436513, keywords: `hostel, rooms, girls hostel` },
  { id: 'c37', name: `AU College of Engineering Hostel(Boys)`, description: `boys hostel`, category: 'hostel', lat: 17.7299352, lng: 83.32819633, keywords: `hostel, rooms, boys hostel` },
  { id: 'c38', name: `Samatha Hostel`, description: `boys hostel`, category: 'hostel', lat: 17.73106253, lng: 83.32698714, keywords: `hostel, rooms, boys hostel` },
  { id: 'c39', name: `PG Block Boys Hostel`, description: `boys hostel`, category: 'hostel', lat: 17.73249818, lng: 83.32355416, keywords: `hostel, rooms, boys hostel` },
  { id: 'c40', name: `Block 6, Isaac Newton Boys Hostel`, description: `boys hostel`, category: 'hostel', lat: 17.73159537, lng: 83.32523795, keywords: `hostel, rooms, boys hostel` },
  { id: 'c41', name: `Swami Vivekanand Boys Hostel (Block-7)`, description: `boys hostel`, category: 'hostel', lat: 17.73078649, lng: 83.32493836, keywords: `hostel, rooms, boys hostel` },
];

const INDOOR_LOCATIONS = [
  { id: 'i1', name: `cse lab 1`, category: 'lab', building: `CSE Main Building`, floor: `Ground Floor`, room: `lab1`, department: `CSE`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept office gate`, steps: `in case entering from the main gate the lab is just opoosite t the entrance\nin case entering from the office gate go straighttill the end and go right.\nIn case entering from the back entrance go straight till the end and go left`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i2', name: `cse lab 2`, category: 'lab', building: `CSE Main Building`, floor: `Ground Floor`, room: `lab 2`, department: `CSE`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept office gate`, steps: `in case entering from the main gate, go to the 1st floor the lab is seen to the left \nin case entering from the office gate go straight till the main entrance and take stairs to 1st floor and the lab is to the ur left\nIn case entering from the back entrance go straight till the main entrance and go to 1st floor and the lab is seen to ur left`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i3', name: `Algorithm A 01`, category: 'classroom', building: `Algorithm`, floor: `Ground Floor`, room: `1`, department: `CSE`, lat: 17.7303316611071, lng: 83.318212078584, entrance: `Enter from Algorithm Main Gate`, steps: `1st classroom to the right once u enter the building.\nIt has 2 entrances`, landmark: `Algorithm main entrance` },
  { id: 'i4', name: `Algorithm A 02`, category: 'classroom', building: `Algorithm`, floor: `Ground Floor`, room: `2`, department: `CSE`, lat: 17.7303316611071, lng: 83.318212078584, entrance: `Enter from Algorithm Main Gate`, steps: `2nd classroom to the right once you enter into the building.\nIt has 2 entrances.`, landmark: `Algorithm main entrance` },
  { id: 'i5', name: `Algorithm A 03`, category: 'classroom', building: `Algorithm`, floor: `Ground Floor`, room: `3`, department: `CSE`, lat: 17.7303316611071, lng: 83.318212078584, entrance: `Enter from Algorithm Main Gate`, steps: `once u enter the building, go straight and to the\n left u can see stairs and lift -> classroom beside the lift.`, landmark: `Algorithm main entrance` },
  { id: 'i6', name: `Algorithm A 11`, category: 'classroom', building: `Algorithm`, floor: `First Floor`, room: `11`, department: `CSE`, lat: 17.7303316611071, lng: 83.318212078584, entrance: `Enter from Algorithm Main Gate`, steps: `Enter from main gate or algorithm building, take stairs go to 1st floor\nto the right`, landmark: `Algorithm main entrance` },
  { id: 'i7', name: `Algorithm A 12`, category: 'classroom', building: `Algorithm`, floor: `First Floor`, room: `12`, department: `CSE`, lat: 17.7303316611071, lng: 83.318212078584, entrance: `Enter from Algorithm Main Gate`, steps: `Enter from main  gate or algorithm building, take stairs go to 1st floor\nto the right`, landmark: `Algorithm main entrance` },
  { id: 'i8', name: `Algorithm A 13`, category: 'classroom', building: `Algorithm`, floor: `First Floor`, room: `13`, department: `CSE`, lat: 17.7303316611071, lng: 83.318212078584, entrance: `Enter from Algorithm Main Gate`, steps: `Enter from main  gate or algorithm building, take stairs go to 1st floor\nto the left`, landmark: `Algorithm main entrance` },
  { id: 'i9', name: `Algorithm A 14`, category: 'seminar hall', building: `Algorithm`, floor: `First Floor`, room: `14`, department: `CSE`, lat: 17.7303316611071, lng: 83.318212078584, entrance: `Enter from Algorithm Main Gate`, steps: `Enter from main  gate or algorithm building, take stairs go to 1st floor\nto the left`, landmark: `Algorithm main entrance` },
  { id: 'i10', name: `Algorithm A 15`, category: 'classroom', building: `Algorithm`, floor: `First Floor`, room: `15`, department: `CSE`, lat: 17.7303316611071, lng: 83.318212078584, entrance: `Enter from Algorithm Main Gate`, steps: `Enter from main  gate or algorithm building, take stairs go to 1st floor\nto the left`, landmark: `Algorithm main entrance` },
  { id: 'i11', name: `Algorithm A 31`, category: 'classroom', building: `Algorithm`, floor: `Third Floor`, room: `31`, department: `CSE`, lat: 17.7303316611071, lng: 83.318212078584, entrance: `Enter from Algorithm Main Gate`, steps: `Enter from main  gate or algorithm building, take stairs or the lift go to 3rd floor\nto the right`, landmark: `Algorithm main entrance` },
  { id: 'i12', name: `Algorithm A 32`, category: 'classroom', building: `Algorithm`, floor: `Third Floor`, room: `32`, department: `CSE`, lat: 17.7303316611071, lng: 83.318212078584, entrance: `Enter from Algorithm Main Gate`, steps: `Enter from main  gate or algorithm building, take stairs or the lift go to 3rd floor\nto the right`, landmark: `Algorithm main entrance` },
  { id: 'i13', name: `Algorithm A33`, category: 'classroom', building: `Algorithm`, floor: `Third Floor`, room: `33`, department: `CSE`, lat: 17.7303316611071, lng: 83.318212078584, entrance: `Enter from Algorithm Main Gate`, steps: `Enter from main  gate or algorithm building, take stairs or the lift go to 3rd floor\nto the left`, landmark: `Algorithm main entrance` },
  { id: 'i14', name: `Algorithm A34`, category: 'classroom', building: `Algorithm`, floor: `Third Floor`, room: `34`, department: `CSE`, lat: 17.7303316611071, lng: 83.318212078584, entrance: `Enter from Algorithm Main Gate`, steps: `Enter from main  gate or algorithm building, take stairs or the lift go to 3rd floor\nto the left`, landmark: `Algorithm main entrance` },
  { id: 'i15', name: `Algorithm A 35`, category: 'classroom', building: `Algorithm`, floor: `Third Floor`, room: `35`, department: `CSE`, lat: 17.7303316611071, lng: 83.318212078584, entrance: `Enter from Algorithm Main Gate`, steps: `Enter from main  gate or algorithm building, take stairs or the lift go to 3rd floor\nto the left`, landmark: `Algorithm main entrance` },
  { id: 'i16', name: `Algorithm A 41`, category: 'classroom', building: `Algorithm`, floor: `Fourth Floor`, room: `41`, department: `CSE`, lat: 17.7303316611071, lng: 83.318212078584, entrance: `Enter from Algorithm Main Gate`, steps: `Enter from main  gate or algorithm building, take stairs or the lift go to 4th floor\nto the right`, landmark: `Algorithm main entrance` },
  { id: 'i17', name: `Algorithm A 42`, category: 'classroom', building: `Algorithm`, floor: `Fourth Floor`, room: `42`, department: `CSE`, lat: 17.7303316611071, lng: 83.318212078584, entrance: `Enter from Algorithm Main Gate`, steps: `Enter from main  gate or algorithm building, take stairs or the lift go to 4th floor\nto the right`, landmark: `Algorithm main entrance` },
  { id: 'i18', name: `Algorithm A 43`, category: 'classroom', building: `Algorithm`, floor: `Fourth Floor`, room: `43`, department: `CSE`, lat: 17.7303316611071, lng: 83.318212078584, entrance: `Enter from Algorithm Main Gate`, steps: `Enter from main  gate or algorithm building, take stairs or the lift go to 4th floor\nto the left`, landmark: `Algorithm main entrance` },
  { id: 'i19', name: `Algorithm A 44`, category: 'classroom', building: `Algorithm`, floor: `Fourth Floor`, room: `44`, department: `CSE`, lat: 17.7303316611071, lng: 83.318212078584, entrance: `Enter from Algorithm Main Gate`, steps: `Enter from main  gate or algorithm building, take stairs or the lift go to 4th floor\nto the left`, landmark: `Algorithm main entrance` },
  { id: 'i20', name: `Algorithm A 45`, category: 'classroom', building: `Algorithm`, floor: `Fourth Floor`, room: `45`, department: `CSE`, lat: 17.7303316611071, lng: 83.318212078584, entrance: `Enter from Algorithm Main Gate`, steps: `Enter from main  gate or algorithm building, take stairs or the lift go to 4th floor\nto the left`, landmark: `Algorithm main entrance` },
  { id: 'i21', name: `Girls Washroom`, category: 'washroom', building: `Algorithm`, floor: `Ground Floor`, room: `ws1`, department: `CSE`, lat: 17.7303316611071, lng: 83.318212078584, entrance: `Enter from Algorithm Main Gate`, steps: `Enter from the main gate of algorithm building, go straight and opposite to the stairs`, landmark: `Algorithm main entrance` },
  { id: 'i22', name: `Girls Washroom`, category: 'washroom', building: `Algorithm`, floor: `Third Floor`, room: `ws2`, department: `CSE`, lat: 17.7303316611071, lng: 83.318212078584, entrance: `Enter from Algorithm Main Gate`, steps: `Enter from the main gate of algorithm building, go to the 3rd floor and its oppo to stairs`, landmark: `Algorithm main entrance` },
  { id: 'i23', name: `Boys Washroom`, category: 'washroom', building: `Algorithm`, floor: `Second floor`, room: `ws3`, department: `CSE`, lat: 17.7303316611071, lng: 83.318212078584, entrance: `Enter from Algorithm Main Gate`, steps: `Enter from the main gate of algorithm building,\n go to the 3rd floor and its oppo to stairs`, landmark: `Algorithm main entrance` },
  { id: 'i24', name: `Boys Washroom`, category: 'washroom', building: `Algorithm`, floor: `Fourth Floor`, room: `ws4`, department: `CSE`, lat: 17.7303316611071, lng: 83.318212078584, entrance: `Enter from Algorithm Main Gate`, steps: `Enter from the main gate of algorithm building,\n go to the 3rd floor and its oppo to stairs`, landmark: `Algorithm main entrance` },
  { id: 'i25', name: `Dr. A. Gauthami Latha`, category: 'cabin', building: `Algorithm`, floor: `Third Floor`, room: `cab1`, department: `CSE`, lat: 17.7303316611071, lng: 83.318212078584, entrance: `Enter from Algorithm Main Gate`, steps: `Enter from the main gate of algorithm building,\n go to the 3rd floor , to the left , go straight another steps , to your left oppo to the steps is madams cabin`, landmark: `Algorithm main entrance` },
  { id: 'i26', name: `Dr Sandhya Devi Gogula`, category: 'cabin', building: `Algorithm`, floor: `Third Floor`, room: `cab2`, department: `CSE`, lat: 17.7303316611071, lng: 83.318212078584, entrance: `Enter from Algorithm Main Gate`, steps: `Enter from the main gate of the Algorithm building, \ngo straight and then left, keep going straight till the very end`, landmark: `Algorithm main entrance` },
  { id: 'i27', name: `Dr. B. Prakash`, category: 'cabin', building: `Algorithm`, floor: `Ground Floor`, room: `cab3`, department: `CSE`, lat: 17.7303316611071, lng: 83.318212078584, entrance: `Enter from Algorithm Main Gate`, steps: `Enter from the main gate of the Algorithm building, \ngo straight and then left, keep going straight till the very end`, landmark: `Algorithm main entrance` },
  { id: 'i28', name: `Dr. D. Paul Joseph`, category: 'cabin', building: `Algorithm`, floor: `Ground Floor`, room: `cab4`, department: `CSE`, lat: 17.7303316611071, lng: 83.318212078584, entrance: `Enter from Algorithm Main Gate`, steps: `Enter from the main gate of the Algorithm building, \ngo straight and then left, keep going straight till the very end`, landmark: `Algorithm main entrance` },
  { id: 'i29', name: `Dr. Y. Vishnu Tej`, category: 'cabin', building: `Algorithm`, floor: `Ground Floor`, room: `cab5`, department: `CSE`, lat: 17.7303316611071, lng: 83.318212078584, entrance: `Enter from Algorithm Main Gate`, steps: `Enter from the main gate of the Algorithm building, \ngo straight and then left, keep going straight till the very end`, landmark: `Algorithm main entrance` },
  { id: 'i30', name: `Mrs. A. Tulasi`, category: 'cabin', building: `Algorithm`, floor: `Ground Floor`, room: `cab6`, department: `CSE`, lat: 17.7303316611071, lng: 83.318212078584, entrance: `Enter from Algorithm Main Gate`, steps: `Enter from the main gate of the Algorithm building, \ngo straight and then left, keep going straight till the very end`, landmark: `Algorithm main entrance` },
  { id: 'i31', name: `Mrs. Sweta Balakrishna Ramteke`, category: 'cabin', building: `Algorithm`, floor: `Ground Floor`, room: `cab7`, department: `CSE`, lat: 17.7303316611071, lng: 83.318212078584, entrance: `Enter from Algorithm Main Gate`, steps: `Enter from the main gate of the Algorithm building, \ngo straight and then left, keep going straight till the very end`, landmark: `Algorithm main entrance` },
  { id: 'i32', name: `Mrs. S. Priyanja`, category: 'cabin', building: `Algorithm`, floor: `Ground Floor`, room: `cab8`, department: `CSE`, lat: 17.7303316611071, lng: 83.318212078584, entrance: `Enter from Algorithm Main Gate`, steps: `Enter from the main gate of the Algorithm building, \ngo straight and then left, keep going straight till the very end`, landmark: `Algorithm main entrance` },
  { id: 'i33', name: `Mr. B.J.M. Ravi Kumar`, category: 'cabin', building: `Algorithm`, floor: `Ground Floor`, room: `cab9`, department: `CSE`, lat: 17.7303316611071, lng: 83.318212078584, entrance: `Enter from Algorithm Main Gate`, steps: `Enter from the main gate of the Algorithm building, \ngo straight and then left, keep going straight till the very end`, landmark: `Algorithm main entrance` },
  { id: 'i34', name: `Prof. Ch.Satyananda Reddy`, category: 'cabin', building: `CSE Main Building`, floor: `Ground Floor`, room: `cab 10`, department: `CSE`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept office gate`, steps: `In case entering from the main entrance go left and and it’s the last room just beside the office entrance side to the left.\nIn case entering from the office entrance the 1st room to the right.`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i35', name: `Dept Office`, category: 'office', building: `CSE Main Building`, floor: `Ground Floor`, room: `Ofc`, department: `CSE`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept office gate`, steps: `In case entering from the main entrance go left and and it’s the second last room just beside the office entrance side to the left.\nIn case entering from the office entrance the 2nd room to the right.`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i36', name: `GFCL2`, category: 'classroom', building: `CSE Main Building`, floor: `Ground Floor`, room: `cl2`, department: `CSE`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept office gate`, steps: `In case entering from the main entrance go left and and it’s the Third room on the left side \nIn case entering from the office entrance the 3rd room to the right.`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i37', name: `Prof. M.Shashi`, category: 'cabin', building: `CSE Main Building`, floor: `Ground Floor`, room: `cab 11`, department: `CSE`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept office gate`, steps: `In case entering from the main entrance go left and and it’s the second room on the left side \nIn case entering from the office entrance the 4th room to the right.`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i38', name: `Dr. S.Jhansi Rani`, category: 'cabin', building: `CSE Main Building`, floor: `Ground Floor`, room: `cab 12`, department: `CSE`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept office gate`, steps: `In case entering from the main entrance go left and and it’s the first room on the left side \nIn case entering from the office entrance the last room to the right.`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i39', name: `Student Counselling Center / Lobby`, category: 'office', building: `CSE Main Building`, floor: `Ground Floor`, room: `Ofc`, department: `CSE`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept office gate`, steps: `In case entering from the main entrance go left and and it’s the last room to the right just beside the office entrance\nIn case entering from the office entrance the 1st  room to the left.`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i40', name: `HOB Cabin`, category: 'cabin', building: `CSE Main Building`, floor: `Ground Floor`, room: `cab 13`, department: `CSE`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept office gate`, steps: `In case entering from the main entrance go left and and it’s the second last room to the right just beside the office entrance\nIn case entering from the office entrance the 2nd  room to the left.`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i41', name: `GFCL1`, category: 'classroom', building: `CSE Main Building`, floor: `Ground Floor`, room: `cl1`, department: `CSE`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept office gate`, steps: `In case entering from the main entrance go left and and it’s the third room to the right.\nIn case entering from the office entrance the 3rd room to the left.`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i42', name: `Prof. K.Venkata Rao`, category: 'cabin', building: `CSE Main Building`, floor: `Ground Floor`, room: `cab 14`, department: `CSE`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept office gate`, steps: `In case entering from the main entrance go left and and it’s the second room to the right.\nIn case entering from the office entrance the 4th room to the left.`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i43', name: `Dr. K.Raja Kumar`, category: 'cabin', building: `CSE Main Building`, floor: `Ground Floor`, room: `cab 15`, department: `CSE`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept office gate`, steps: `In case entering from the main entrance go left and and it’s the first room to the right.\nIn case entering from the office entrance the 5th room to the left.`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i44', name: `Boys Washroom`, category: 'washroom', building: `CSE Main Building`, floor: `Ground Floor`, room: `ws5`, department: `CSE`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept office gate`, steps: `In case entering from the main entrance go left it is there after the black gate \nIn case entering from the office entrance go straight it is there to the left before the black gate`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i45', name: `Girls Washroom`, category: 'washroom', building: `CSE Main Building`, floor: `Ground Floor`, room: `ws6`, department: `CSE`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept back gate`, steps: `In case entering from the main entrance go right it is there before the black gate. \nIn case entering from the Dept back gate go straight it is there after the black gate to the right.`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i46', name: `Prof. D.Lalitha Bhaskari`, category: 'cabin', building: `CSE Main Building`, floor: `Ground Floor`, room: `cab 16`, department: `CSE`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept back gate`, steps: `In case entering from the main entrance go right it is the 1st room after the black gate to the left. \nIn case entering from the Dept back gate go straight it is the last room to the right just before the black gate`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i47', name: `Computer Engineering Workshop Lab`, category: 'lab', building: `CSE Main Building`, floor: `Ground Floor`, room: `lab 3`, department: `CSE`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept back gate`, steps: `In case entering from the main entrance go right it is the 2nd room after the stairs to the left.\nIn case entering from the Dept back gate go straight it is the  last room to the right just before the stairs.`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i48', name: `Embedded Systems and IOT lab`, category: 'lab', building: `CSE Main Building`, floor: `Ground Floor`, room: `lab 4`, department: `CSE`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept back gate`, steps: `In case entering from the main entrance go right it is the 3rd room after the stairs to the right.\nIn case entering from the Dept back gate go straight it is the  last room to the left just before the stairs.`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i49', name: `e - class room`, category: 'classroom', building: `CSE Main Building`, floor: `Ground Floor`, room: `cl3`, department: `CSE`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept back gate`, steps: `In case entering from the main entrance go right it is the 4th room after the stairs to the right.\nIn case entering from the Dept back gate go straight it is the 2nd room to the left.`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i50', name: `Computer architecture and organization lab`, category: 'lab', building: `CSE Main Building`, floor: `Ground Floor`, room: `lab 5`, department: `CSE`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept back gate`, steps: `In case entering from the main entrance go right it is the 4th room after the stairs to the left.\nIn case entering from the Dept back gate go straight it is the 2nd room to the right.`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i51', name: `Smt. K.S.S. Soujanya Kumari`, category: 'cabin', building: `CSE Main Building`, floor: `Ground Floor`, room: `cab 17`, department: `CSE`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept back gate`, steps: `In case entering from the main entrance go right it is the last room after the stairs to the left.\nIn case entering from the Dept back gate go straight it is the 1st room to the right.`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i52', name: `Mr. M. Bala Naga Bhushanamu`, category: 'cabin', building: `CSE Main Building`, floor: `Ground Floor`, room: `cab 22`, department: `CSE`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept back gate`, steps: `In case entering from the main entrance go right it is the last room after the stairs to the left.\nIn case entering from the Dept back gate go straight it is the 1st room to the right.`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i53', name: `Mrs. L. Yamini Swathi`, category: 'cabin', building: `CSE Main Building`, floor: `Ground Floor`, room: `cab 18`, department: `CSE`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept back gate`, steps: `In case entering from the main entrance go right it is the last room after the stairs to the left.\nIn case entering from the Dept back gate go straight it is the 1st room to the right.`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i54', name: `projects Lab`, category: 'lab', building: `CSE Main Building`, floor: `First Floor`, room: `lab6`, department: `CSE`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept back gate`, steps: `In case entering from main entrance take stairs to the left once u enter go to 1st floor, go left it’s the last room before the faculty washroom to the left. \nIn case entering from the back entrance go straight and left till the main entrance take the stairs near the main entrance and go to 1st floor , go left its the last room before the faculty washroom to the left.\nin case entering from the office entrance, u will find steps before the office entrance but sometimes the door maybe closed above in 1st floor \nso check for that. if open go straight and its the 1st room to the right after faculty washroomif closed go straight and go right till the main entrance take the stairs just beside main entrance and go to 1st floor , go left its the last room before the faculty washroom to the left`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i55', name: `Prof. Prasad Reddy P.V.G.D.`, category: 'cabin', building: `CSE Main Building`, floor: `First Floor`, room: `cab 19`, department: `CSE`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept back gate`, steps: `In case entering from main entrance take stairs to the left once u enter go to 1st floor, go left it’s the third room to the left. \nIn case entering from the back entrance go straight and left till the main entrance take the stairs near the main entrance and go to 1st floor , go left its the third room to the left.\nin case entering from the office entrance, u will find steps before the office entrance but sometimes the door maybe closed above in 1st floor \nso check for that, if open its the 3rd room to the right.  if closed go straight and go right till the main entrance take the stairs just beside main entrance and go to 1st floor , go left its the third room to the left`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i56', name: `Dr. G.Lavanya Devi`, category: 'cabin', building: `CSE Main Building`, floor: `First Floor`, room: `cab 20`, department: `CSE`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept back gate`, steps: `In case entering from main entrance take stairs to the left once u enter go to 1st floor, go left it’s the second room to the left. \nIn case entering from the back entrance go straight and left till the main entrance take the stairs near the main entrance and go to 1st floor , go left its the second room to the left.\nin case entering from the office entrance, u will find steps before the office entrance but sometimes the door maybe closed above in 1st floor \nso check for that, if open its the 4th room to the right.  if closed go straight and go right till the main entrance take the stairs just beside main entrance and go to 1st floor , go left its the second room to the left`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i57', name: `Prof. Kunjam Nageswara Rao`, category: 'cabin', building: `CSE Main Building`, floor: `First Floor`, room: `cab 21`, department: `CSE`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept back gate`, steps: `In case entering from main entrance take stairs to the left once u enter go to 1st floor, go left it’s the 1st room to the left. \nIn case entering from the back entrance go straight and left till the main entrance take the stairs near the main entrance and go to 1st floor , go left its the 1st room to the left.\nin case entering from the office entrance, u will find steps before the office entrance but sometimes the door maybe closed above in 1st floor \nso check for that, if open its the 5th room to the right.  if closed go straight and go right till the main entrance take the stairs just beside main entrance and go to 1st floor , go left its the first room to the left`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i58', name: `Mrs. N. Padmaja Lavanya Kumari`, category: 'cabin', building: `CSE Main Building`, floor: `First Floor`, room: `cab 23`, department: `CSE`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept back gate`, steps: `In case entering from main entrance take stairs to the left once u enter go to 1st floor, go right it’s the 1st room to the left. \nIn case entering from the back entrance go straight and left till the main entrance take the stairs near the main entrance and go to 1st floor , go right its the 1st room to the left.\nin case entering from the office entrance, u will find steps before the office entrance but sometimes the door maybe closed above in 1st floor \nso check for that, if open its the go straight cross the lab and its the 1st room to the left.  if closed go straight and go right till the main entrance take the stairs just beside main entrance and go right to 1st floor , go left its the first room to the left`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i59', name: `Dr. G. Sharmila Sujatha`, category: 'cabin', building: `CSE Main Building`, floor: `First Floor`, room: `cab 24`, department: `CSE`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept back gate`, steps: `In case entering from main entrance take stairs to the left once u enter go to 1st floor, go right it’s the 2nd room to the left. \nIn case entering from the back entrance go straight and left till the main entrance take the stairs near the main entrance and go to 1st floor , go right its the 2nd room to the left.\nin case entering from the office entrance, u will find steps before the office entrance but sometimes the door maybe closed above in 1st floor \nso check for that, if open its the go straight cross the lab and its the 2nd room to the left.  if closed go straight and go right till the main entrance take the stairs just beside main entrance and go right to 1st floor , go left its the first room to the left`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i60', name: `Prof. Kuda Nageswara Rao`, category: 'cabin', building: `CSE Main Building`, floor: `First Floor`, room: `cab 25`, department: `CSE`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept back gate`, steps: `In case entering from main entrance take stairs to the left once u enter go to 1st floor, go right it’s the 3rd room to the left. \nIn case entering from the back entrance go straight and left till the main entrance take the stairs near the main entrance and go to 1st floor , go right its the 3rd room to the left.\nin case entering from the office entrance, u will find steps before the office entrance but sometimes the door maybe closed above in 1st floor \nso check for that, if open its the go straight cross the lab and its the 3rd room to the left.  if closed go straight and go right till the main entrance take the stairs just beside main entrance and go right to 1st floor , go left its the first room to the left`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i61', name: `Dr. A. Mary Sowjanya`, category: 'cabin', building: `CSE Main Building`, floor: `First Floor`, room: `cab 26`, department: `CSE`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept back gate`, steps: `In case entering from main entrance take stairs to the left once u enter go to 1st floor, go left it’s the 2nd last room to the right before faculty washroom. \nIn case entering from the back entrance go straight and left till the main entrance take the stairs near the main entrance and go to 1st floor , go left its the 2nd last room to the right just before the faculty washroom.\nin case entering from the office entrance, u will find steps before the office entrance but sometimes the door maybe closed above in 1st floor \nso check for that, if open its the go straight 2nd room to the left after faculty washroom.  if closed go straight and go right till the main entrance take the stairs just beside main entrance and go left to 1st floor , go left its the second last room to the right before faculty washroom.`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i62', name: `Prof. V.Valli Kumari`, category: 'cabin', building: `CSE Main Building`, floor: `First Floor`, room: `cab 27`, department: `CSE`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept back gate`, steps: `In case entering from main entrance take stairs to the left once u enter go to 1st floor, go left it’s the 3rd room to the right. \nIn case entering from the back entrance go straight and left till the main entrance take the stairs near the main entrance and go to 1st floor , go left its the 3rd room to the right\nin case entering from the office entrance, u will find steps before the office entrance but sometimes the door maybe closed above in 1st floor \nso check for that, if open its the go straight 2nd room to the left after faculty washroom.  if closed go straight and go right till the main entrance take the stairs just beside main entrance and go left to 1st floor , go left its the 3rd room to the right.`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i63', name: `Prof. S.Viziananda Row`, category: 'cabin', building: `CSE Main Building`, floor: `First Floor`, room: `cab 28`, department: `CSE`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept back gate`, steps: `In case entering from main entrance take stairs to the left once u enter go to 1st floor, go left it’s the 1st room to the right. \nIn case entering from the back entrance go straight and left till the main entrance take the stairs near the main entrance and go to 1st floor , go left its the 1st room to the right\nin case entering from the office entrance, u will find steps before the office entrance but sometimes the door maybe closed above in 1st floor \nso check for that, if open its the go straight last room to the left after faculty washroom.  if closed go straight and go right till the main entrance take the stairs just beside main entrance and go left to 1st floor , go left its the 1st room to the right.`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i64', name: `M ramjee`, category: 'nan', building: `CSE Main Building`, floor: `First Floor`, room: `nan`, department: `nan`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept back gate`, steps: `In case entering from main entrance take stairs to the left once u enter go to 1st floor, go left it’s the 1st room to the right. \nIn case entering from the back entrance go straight and left till the main entrance take the stairs near the main entrance and go to 1st floor , go left its the 1st room to the right\nin case entering from the office entrance, u will find steps before the office entrance but sometimes the door maybe closed above in 1st floor \nso check for that, if open its the go straight last room to the left after faculty washroom.  if closed go straight and go right till the main entrance take the stairs just beside main entrance and go left to 1st floor , go left its the 1st room to the right.`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i65', name: `R & D`, category: 'lab', building: `CSE Main Building`, floor: `First Floor`, room: `lab 5`, department: `lab`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept back gate`, steps: `In case entering from main entrance take stairs to the left once u enter go to 1st floor, go left it’s the last room to the right before faculty washroom. \nIn case entering from the back entrance go straight and left till the main entrance take the stairs near the main entrance and go to 1st floor , go left its the last room to the right before faculty washroom.\nin case entering from the office entrance, u will find steps before the office entrance but sometimes the door maybe closed above in 1st floor \nso check for that, if open its the go straight 1st room to the left after faculty washroom.  if closed go straight and go right till the main entrance take the stairs just beside main entrance and go left to 1st floor , go left its the last room to the right before faculty washroom.`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i66', name: `FFCL 1`, category: 'classroom', building: `CSE Main Building`, floor: `First Floor`, room: `cl3`, department: `classroom`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept back gate`, steps: `In case entering from main entrance take stairs to the left once u enter go to 1st floor, go right it’s the 1st room to the right after the black gate. \nIn case entering from the back entrance go straight and left till the main entrance take the stairs near the main entrance and go to 1st floor , go right its the 1st room to the right after the black gate.\nin case entering from the office entrance, u will find steps before the office entrance but sometimes the door maybe closed above in 1st floor \nso check for that, if open its the go straight cross the lab and o straight from the black gate its the 1st room to the right after the little straight.  if closed go straight and go right till the main entrance take the stairs just beside main entrance and go left to 1st floor , go right its the 1st room to the right after the black gate.`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i67', name: `FFCL 2`, category: 'classroom', building: `CSE Main Building`, floor: `First Floor`, room: `cl4`, department: `classroom`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept back gate`, steps: `In case entering from main entrance take stairs to the left once u enter go to 1st floor, go right it’s the 2nd room to the right after the black gate. \nIn case entering from the back entrance go straight and left till the main entrance take the stairs near the main entrance and go to 1st floor , go right its the 2nd room to the right after the black gate.\nin case entering from the office entrance, u will find steps before the office entrance but sometimes the door maybe closed above in 1st floor \nso check for that, if open its the go straight cross the lab and o straight from the black gate its the 2nd room to the right after the little straight.  if closed go straight and go right till the main entrance take the stairs just beside main entrance and go left to 1st floor , go right its the 2nd room to the right after the black gate.`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i68', name: `FFCL 3`, category: 'classroom', building: `CSE Main Building`, floor: `First Floor`, room: `cl5`, department: `classroom`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept back gate`, steps: `In case entering from main entrance take stairs to the left once u enter go to 1st floor, go right it’s the 3rd room to the right after the black gate. \nIn case entering from the back entrance go straight and left till the main entrance take the stairs near the main entrance and go to 1st floor , go right its the 3rd room to the right after the black gate.\nin case entering from the office entrance, u will find steps before the office entrance but sometimes the door maybe closed above in 1st floor \nso check for that, if open its the go straight cross the lab and o straight from the black gate its the 3rd room to the right after the little straight.  if closed go straight and go right till the main entrance take the stairs just beside main entrance and go left to 1st floor , go right its the 3rd room to the right after the black gate.`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i69', name: `FFCL 4`, category: 'classroom', building: `CSE Main Building`, floor: `First Floor`, room: `cl6`, department: `classroom`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept back gate`, steps: `In case entering from main entrance take stairs to the left once u enter go to 1st floor, go right it’s the 1st room to the left after the black gate. \nIn case entering from the back entrance go straight and left till the main entrance take the stairs near the main entrance and go to 1st floor , go right its the 1st room to the left after the black gate.\nin case entering from the office entrance, u will find steps before the office entrance but sometimes the door maybe closed above in 1st floor \nso check for that, if open its the go straight cross the lab and o straight from the black gate its the 1st room to the left after the little straight.  if closed go straight and go right till the main entrance take the stairs just beside main entrance and go left to 1st floor , go right its the 1st room to the left after the black gate.`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i70', name: `FFCL 5`, category: 'classroom', building: `CSE Main Building`, floor: `First Floor`, room: `cl7`, department: `classroom`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept back gate`, steps: `In case entering from main entrance take stairs to the left once u enter go to 1st floor, go right it’s the 2nd room to the left after the black gate. \nIn case entering from the back entrance go straight and left till the main entrance take the stairs near the main entrance and go to 1st floor , go right its the 2nd room to the left after the black gate.\nin case entering from the office entrance, u will find steps before the office entrance but sometimes the door maybe closed above in 1st floor \nso check for that, if open its the go straight cross the lab and o straight from the black gate its the 2nd room to the left after the little straight.  if closed go straight and go right till the main entrance take the stairs just beside main entrance and go left to 1st floor , go right its the 2nd room to the left after the black gate.`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i71', name: `FFCL 6`, category: 'classroom', building: `CSE Main Building`, floor: `First Floor`, room: `cl8`, department: `classroom`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept back gate`, steps: `In case entering from main entrance take stairs to the left once u enter go to 1st floor, go right it’s the 3rd room to the left after the black gate. \nIn case entering from the back entrance go straight and left till the main entrance take the stairs near the main entrance and go to 1st floor , go right its the 3rd room to the left after the black gate.\nin case entering from the office entrance, u will find steps before the office entrance but sometimes the door maybe closed above in 1st floor \nso check for that, if open its the go straight cross the lab and o straight from the black gate its the 3rd room to the left after the little straight.  if closed go straight and go right till the main entrance take the stairs just beside main entrance and go left to 1st floor , go right its the 3rd room to the left after the black gate.`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i72', name: `Dr. K.Venkata Ramana`, category: 'cabin', building: `CSE Main Building`, floor: `Second floor`, room: `cab`, department: `cabin`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept back gate`, steps: `in case entering from the main entrance take stairs to the left once u enter go to the 2nd floor , go right it’s the 1st room to the left. \nIn case entering from the back gate go till the main entrance and take the stairs to the 2nd floor go right and its the 1st room to the left.\nin case entering from the office entrance go till the main entrance and take the stairs go to the 2nd floor take right its the 1st room to the left.`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i73', name: `Prof. B.Prajna`, category: 'cabin', building: `CSE Main Building`, floor: `Second floor`, room: `cab`, department: `cabin`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept back gate`, steps: `in case entering from the main entrance take stairs to the left once u enter go to the 2nd floor , go right it’s the 1st room to the right. \nIn case entering from the back gate go till the main entrance and take the stairs to the 2nd floor go right and its the 1st room to the right.\nin case entering from the office entrance go till the main entrance and take the stairs go to the 2nd floor take right its the 1st room to the right.`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i74', name: `NSFCL 1`, category: 'classroom', building: `CSE Main Building`, floor: `Second floor`, room: `cl 9`, department: `classroom`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept back gate`, steps: `in case entering from the main entrance take stairs to the left once u enter go to the 2nd floor , go right it’s the 2nd room to the left. \nIn case entering from the back gate go till the main entrance and take the stairs to the 2nd floor go right and its the 2nd room to the left.\nin case entering from the office entrance go till the main entrance and take the stairs go to the 2nd floor take right its the 2nd room to the left.`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i75', name: `NSFCL 3`, category: 'classroom', building: `CSE Main Building`, floor: `Second floor`, room: `cl 10`, department: `classroom`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept back gate`, steps: `in case entering from the main entrance take stairs to the left once u enter go to the 2nd floor , go right it’s the 3rd room to the left. \nIn case entering from the back gate go till the main entrance and take the stairs to the 2nd floor go right and its the 3rd room to the left.\nin case entering from the office entrance go till the main entrance and take the stairs go to the 2nd floor take right its the 3rd room to the left.`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i76', name: `NSFCL 5`, category: 'classroom', building: `CSE Main Building`, floor: `Second floor`, room: `cl 11`, department: `classroom`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept back gate`, steps: `in case entering from the main entrance take stairs to the left once u enter go to the 2nd floor , go right it’s the 4th room to the left. \nIn case entering from the back gate go till the main entrance and take the stairs to the 2nd floor go right and its the 4th room to the left.\nin case entering from the office entrance go till the main entrance and take the stairs go to the 2nd floor take right its the 4th room to the left.`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i77', name: `NSFCL 2`, category: 'classroom', building: `CSE Main Building`, floor: `Second floor`, room: `cl 12`, department: `classroom`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept back gate`, steps: `in case entering from the main entrance take stairs to the left once u enter go to the 2nd floor , go right it’s the 2nd room to the right. \nIn case entering from the back gate go till the main entrance and take the stairs to the 2nd floor go right and its the 2nd room to the right.\nin case entering from the office entrance go till the main entrance and take the stairs go to the 2nd floor take right its the 2nd room to the right.`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i78', name: `NSFCL 4`, category: 'classroom', building: `CSE Main Building`, floor: `Second floor`, room: `cl 13`, department: `classroom`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept back gate`, steps: `in case entering from the main entrance take stairs to the left once u enter go to the 2nd floor , go right it’s the 3rd room to the right. \nIn case entering from the back gate go till the main entrance and take the stairs to the 2nd floor go right and its the 3rd room to the right.\nin case entering from the office entrance go till the main entrance and take the stairs go to the 2nd floor take right its the 3rd room to the right.`, landmark: `CSE Main entrance or 
CSE dept entrance` },
  { id: 'i79', name: `NSFCL 6`, category: 'classroom', building: `CSE Main Building`, floor: `Second floor`, room: `cl 14`, department: `classroom`, lat: 17.7299687494293, lng: 83.318021708325, entrance: `Enter from Dept Main gate or\n Enter from the Dept back gate`, steps: `in case entering from the main entrance take stairs to the left once u enter go to the 2nd floor , go right it’s the 4th room to the right. \nIn case entering from the back gate go till the main entrance and take the stairs to the 2nd floor go right and its the 4th room to the right.\nin case entering from the office entrance go till the main entrance and take the stairs go to the 2nd floor take right its the 4th room to the right.`, landmark: `CSE Main entrance or 
CSE dept entrance` },
];

// ─── Category configs ─────────────────────────────────────────────────────────
const CAMPUS_CAT = {
  academic:       { icon: 'school-outline',        color: '#2471A3', label: 'Academic'    },
  library:        { icon: 'library-outline',        color: '#117A65', label: 'Library'     },
  innovation:     { icon: 'bulb-outline',           color: '#784212', label: 'Innovation'  },
  administration: { icon: 'business-outline',       color: '#6C3483', label: 'Admin'       },
  health:         { icon: 'medkit-outline',         color: '#C0392B', label: 'Health'      },
  food:           { icon: 'restaurant-outline',     color: '#D68910', label: 'Food'        },
  bank:           { icon: 'card-outline',           color: '#1A5276', label: 'Bank'        },
  entertainment:  { icon: 'musical-notes-outline',  color: '#7D6608', label: 'Events'      },
  sports:         { icon: 'football-outline',       color: '#1E8449', label: 'Sports'      },
  hostel:         { icon: 'home-outline',           color: '#5D6D7E', label: 'Hostel'      },
};

const INDOOR_CAT = {
  classroom:    { icon: 'school-outline',    color: '#2471A3', label: 'Classroom' },
  lab:          { icon: 'flask-outline',     color: '#117A65', label: 'Lab'       },
  cabin:        { icon: 'person-outline',    color: '#6C3483', label: 'Faculty'   },
  washroom:     { icon: 'water-outline',     color: '#5D6D7E', label: 'Washroom'  },
  office:       { icon: 'briefcase-outline', color: '#784212', label: 'Office'    },
  'seminar hall':{ icon: 'people-outline',  color: '#C0392B', label: 'Seminar'   },
};

const CAMPUS_FILTER_CATS  = ['All', 'academic', 'food', 'hostel', 'sports', 'innovation', 'administration', 'health', 'library', 'bank', 'entertainment'];
const INDOOR_FILTER_CATS  = ['All', 'classroom', 'lab', 'cabin', 'washroom', 'office'];
const INDOOR_BUILDINGS    = ['All', 'Algorithm', 'CSE Main Building'];
const INDOOR_FLOORS       = ['All', 'Ground Floor', 'First Floor', 'Second Floor', 'Third Floor', 'Fourth Floor'];

// ─── Campus Location Card ─────────────────────────────────────────────────────
const CampusCard = ({ loc, onPress }) => {
  const cat = CAMPUS_CAT[loc.category] || { icon: 'location-outline', color: COLORS.primary };
  return (
    <TouchableOpacity style={st.locCard} onPress={() => onPress(loc)} activeOpacity={0.85}>
      <View style={[st.locIcon, { backgroundColor: cat.color + '18' }]}>
        <Ionicons name={cat.icon} size={20} color={cat.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={st.locName} numberOfLines={1}>{loc.name}</Text>
        <Text style={st.locMeta}>{loc.description}</Text>
      </View>
      <Ionicons name="navigate-circle-outline" size={26} color={COLORS.accent} />
    </TouchableOpacity>
  );
};

// ─── Indoor Location Card ─────────────────────────────────────────────────────
const IndoorCard = ({ loc, onPress }) => {
  const catKey = (loc.category || '').toLowerCase();
  const cat = INDOOR_CAT[catKey] || { icon: 'location-outline', color: COLORS.primary };
  return (
    <TouchableOpacity style={st.locCard} onPress={() => onPress(loc)} activeOpacity={0.85}>
      <View style={[st.locIcon, { backgroundColor: cat.color + '18' }]}>
        <Ionicons name={cat.icon} size={20} color={cat.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={st.locName} numberOfLines={1}>{loc.name}</Text>
        <Text style={st.locMeta}>{loc.building}  ·  {loc.floor}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function NavigationScreen() {
  const [tab,      setTab]      = useState('campus');   // 'campus' | 'indoor'
  const [search,   setSearch]   = useState('');
  const [selected, setSelected] = useState(null);
  const [selType,  setSelType]  = useState(null);       // 'campus' | 'indoor'

  const openDetail = (loc, type) => { setSelected(loc); setSelType(type); };
  const openMaps   = loc => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`);

  // ── Filtered campus list ────────────────────────────────────────────────────
  const filteredCampus = CAMPUS_LOCATIONS.filter(l => {
    const q = search.toLowerCase().trim();
    return !q || l.name.toLowerCase().includes(q) ||
      l.description.toLowerCase().includes(q) || l.keywords.toLowerCase().includes(q);
  });

  // ── Filtered indoor list ────────────────────────────────────────────────────
  const filteredIndoor = INDOOR_LOCATIONS.filter(l => {
    const q = search.toLowerCase().trim();
    return !q || l.name.toLowerCase().includes(q) ||
      l.building.toLowerCase().includes(q) || l.floor.toLowerCase().includes(q) ||
      (l.room || '').toLowerCase().includes(q) || (l.department || '').toLowerCase().includes(q) ||
      (l.landmark || '').toLowerCase().includes(q);
  });

  const currentList  = tab === 'campus' ? filteredCampus : filteredIndoor;
  const resultCount  = currentList.length;

  // ── Detail modal data ───────────────────────────────────────────────────────
  const isCampusSel  = selType === 'campus';
  const campusCatCfg = isCampusSel && selected ? CAMPUS_CAT[selected.category] : null;
  const indoorCatCfg = !isCampusSel && selected ? INDOOR_CAT[(selected.category || '').toLowerCase()] : null;
  const catCfg       = campusCatCfg || indoorCatCfg;

  return (
    <View style={st.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={st.header}>
        <Text style={st.headerTitle}>Campus Map</Text>
        <Text style={st.headerSub}>Navigate Andhra University · {CAMPUS_LOCATIONS.length + INDOOR_LOCATIONS.length} locations</Text>
      </LinearGradient>

      <View style={st.body}>
        {/* Search */}
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search locations, rooms, faculty..." />

        {/* Tab switcher */}
        <View style={st.tabSwitcher}>
          <TouchableOpacity
            style={[st.tabBtn, tab === 'campus' && st.tabBtnActive]}
            onPress={() => { setTab('campus'); setSearch(''); }}
            activeOpacity={0.8}
          >
            <Ionicons name="map-outline" size={15} color={tab === 'campus' ? COLORS.secondary : COLORS.textSecondary} />
            <Text style={[st.tabBtnTxt, tab === 'campus' && st.tabBtnTxtActive]}>
              Campus  ({CAMPUS_LOCATIONS.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[st.tabBtn, tab === 'indoor' && st.tabBtnActive]}
            onPress={() => { setTab('indoor'); setSearch(''); }}
            activeOpacity={0.8}
          >
            <Ionicons name="business-outline" size={15} color={tab === 'indoor' ? COLORS.secondary : COLORS.textSecondary} />
            <Text style={[st.tabBtnTxt, tab === 'indoor' && st.tabBtnTxtActive]}>
              Indoor  ({INDOOR_LOCATIONS.length})
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={st.resultCount}>{resultCount} location{resultCount !== 1 ? 's' : ''} found</Text>

        <FlatList
          key={tab}
          data={currentList}
          keyExtractor={i => i.id}
          renderItem={({ item }) =>
            tab === 'campus'
              ? <CampusCard  loc={item} onPress={l => openDetail(l, 'campus')} />
              : <IndoorCard  loc={item} onPress={l => openDetail(l, 'indoor')} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={st.list}
          ListEmptyComponent={
            <View style={st.emptyWrap}>
              <Ionicons name="search-outline" size={38} color={COLORS.textMuted} />
              <Text style={st.emptyTxt}>No locations found</Text>
            </View>
          }
        />
      </View>

      {/* ── Detail Modal ── */}
      <Modal visible={!!selected} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelected(null)}>
        <View style={st.modal}>
          <View style={st.modalHead}>
            <TouchableOpacity onPress={() => setSelected(null)} style={st.closeBtn}>
              <Ionicons name="close" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={st.modalTitle} numberOfLines={2}>{selected?.name}</Text>
          </View>

          <ScrollView contentContainerStyle={st.modalBody} showsVerticalScrollIndicator={false}>

            {/* Map placeholder */}
            <View style={st.mapView}>
              <LinearGradient colors={['#dce8f5', '#c8dbee']} style={st.mapViewGrad}>
                {[...Array(6)].map((_,i) => <View key={`h${i}`} style={[st.gridLine,  { top: i * 50 }]} />)}
                {[...Array(5)].map((_,i) => <View key={`v${i}`} style={[st.gridLineV, { left: i * 76 }]} />)}
                <View style={st.mapPin}><Ionicons name="location" size={44} color={COLORS.danger} /><View style={st.pinShadow} /></View>
                <View style={st.mapLabel}><Text style={st.mapLabelTxt} numberOfLines={1}>{isCampusSel ? selected?.name : selected?.building}</Text></View>
              </LinearGradient>
            </View>

            {/* Category badge + info */}
            <View style={st.infoSection}>
              <View style={st.badgeRow}>
                {catCfg && (
                  <View style={[st.catBadge, { backgroundColor: catCfg.color + '18' }]}>
                    <Ionicons name={catCfg.icon} size={13} color={catCfg.color} />
                    <Text style={[st.catBadgeTxt, { color: catCfg.color }]}>{catCfg.label}</Text>
                  </View>
                )}
              </View>

              {/* Campus: description + coords */}
              {isCampusSel && (
                <>
                  <View style={st.infoRow}>
                    <Ionicons name="information-circle-outline" size={17} color={COLORS.primary} />
                    <Text style={st.infoTxt}>{selected?.description}</Text>
                  </View>
                  <View style={st.infoRow}>
                    <Ionicons name="pricetag-outline" size={17} color={COLORS.textMuted} />
                    <Text style={st.infoTxt}>{selected?.keywords}</Text>
                  </View>
                </>
              )}

              {/* Indoor: floor / room / dept grid */}
              {!isCampusSel && (
                <>
                  <View style={st.infoGrid}>
                    <View style={st.infoItem}><Text style={st.infoLabel}>Building</Text><Text style={st.infoVal} numberOfLines={2}>{selected?.building}</Text></View>
                    <View style={st.infoItem}><Text style={st.infoLabel}>Floor</Text><Text style={st.infoVal}>{selected?.floor}</Text></View>
                    <View style={st.infoItem}><Text style={st.infoLabel}>Room</Text><Text style={st.infoVal}>{selected?.room || '—'}</Text></View>
                  </View>
                  {!!selected?.landmark && (
                    <View style={st.landmarkRow}>
                      <Ionicons name="flag-outline" size={15} color={COLORS.textMuted} />
                      <Text style={st.landmarkTxt}>{selected.landmark}</Text>
                    </View>
                  )}
                </>
              )}
            </View>

            {/* Indoor: entrance + steps */}
            {!isCampusSel && !!selected?.entrance && (
              <View style={st.stepsCard}>
                <View style={st.stepsHead}>
                  <Ionicons name="enter-outline" size={18} color={COLORS.primary} />
                  <Text style={st.stepsTitle}>Entrance</Text>
                </View>
                <Text style={st.entranceTxt}>{selected.entrance}</Text>
              </View>
            )}
            {!isCampusSel && !!selected?.steps && (
              <View style={st.stepsCard}>
                <View style={st.stepsHead}>
                  <Ionicons name="footsteps-outline" size={18} color={COLORS.primary} />
                  <Text style={st.stepsTitle}>How to reach</Text>
                </View>
                {selected.steps.split('\n').filter(s => s.trim()).map((step, i) => (
                  <View key={i} style={st.stepRow}>
                    <View style={st.stepNum}><Text style={st.stepNumTxt}>{i + 1}</Text></View>
                    <Text style={st.stepTxt}>{step.trim()}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* GPS */}
            <View style={st.stepsCard}>
              <View style={st.stepsHead}>
                <Ionicons name="compass-outline" size={18} color={COLORS.primary} />
                <Text style={st.stepsTitle}>GPS Coordinates</Text>
              </View>
              <View style={st.coordRow}>
                <View style={st.coordBox}><Text style={st.coordLabel}>Latitude</Text><Text style={st.coordVal}>{selected?.lat?.toFixed(6)}</Text></View>
                <View style={st.coordDivider} />
                <View style={st.coordBox}><Text style={st.coordLabel}>Longitude</Text><Text style={st.coordVal}>{selected?.lng?.toFixed(6)}</Text></View>
              </View>
            </View>

          </ScrollView>

          <View style={st.bottomBar}>
            <TouchableOpacity style={st.mapsBtn} onPress={() => { setSelected(null); openMaps(selected); }} activeOpacity={0.88}>
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

// ─── Styles ───────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.bgLight },
  header:       { paddingTop: 62, paddingBottom: SPACING.xl, paddingHorizontal: SPACING.lg },
  headerTitle:  { fontSize: FONTS.sizes.xxxl, fontWeight: '900', color: COLORS.secondary },
  headerSub:    { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  body:         { flex: 1, padding: SPACING.md, gap: SPACING.sm },

  // Tab switcher
  tabSwitcher:     { flexDirection: 'row', backgroundColor: COLORS.cardBg, borderRadius: RADIUS.full, padding: 3, borderWidth: 1, borderColor: COLORS.cardBorder },
  tabBtn:          { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 9, borderRadius: RADIUS.full },
  tabBtnActive:    { backgroundColor: COLORS.primary },
  tabBtnTxt:       { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.textSecondary },
  tabBtnTxtActive: { color: COLORS.secondary },

  resultCount:  { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.textMuted },
  list:         { paddingBottom: 100 },
  emptyWrap:    { alignItems: 'center', paddingTop: 40, gap: 8 },
  emptyTxt:     { fontSize: FONTS.sizes.md, color: COLORS.textMuted, fontWeight: '600' },

  // Cards
  locCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBg, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: 7, ...SHADOWS.card, borderWidth: 1, borderColor: COLORS.cardBorder, gap: SPACING.sm },
  locIcon: { width: 44, height: 44, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  locName: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.textPrimary },
  locMeta: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2 },

  // Modal
  modal:      { flex: 1, backgroundColor: COLORS.bgLight },
  modalHead:  { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, paddingTop: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder, gap: SPACING.md },
  closeBtn:   { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.bgLight, justifyContent: 'center', alignItems: 'center' },
  modalTitle: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.textPrimary, flex: 1, lineHeight: 23 },
  modalBody:  { paddingBottom: 24 },

  mapView:    { height: 200, overflow: 'hidden' },
  mapViewGrad:{ flex: 1, position: 'relative', justifyContent: 'center', alignItems: 'center' },
  gridLine:   { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(10,22,40,0.08)' },
  gridLineV:  { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(10,22,40,0.08)' },
  mapPin:     { alignItems: 'center' },
  pinShadow:  { width: 18, height: 5, borderRadius: 9, backgroundColor: 'rgba(0,0,0,0.18)', marginTop: -4 },
  mapLabel:   { position: 'absolute', bottom: 12, backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: RADIUS.full, paddingHorizontal: 14, paddingVertical: 5, maxWidth: '80%' },
  mapLabelTxt:{ fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.textPrimary },

  infoSection: { padding: SPACING.md, gap: SPACING.sm },
  badgeRow:    { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  catBadge:    { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: RADIUS.full, paddingHorizontal: 12, paddingVertical: 5 },
  catBadgeTxt: { fontSize: FONTS.sizes.xs, fontWeight: '700' },
  infoRow:     { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  infoTxt:     { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, flex: 1, lineHeight: 20 },
  infoGrid:    { flexDirection: 'row', gap: SPACING.sm },
  infoItem:    { flex: 1, backgroundColor: COLORS.cardBg, borderRadius: RADIUS.md, padding: SPACING.sm, alignItems: 'center', borderWidth: 1, borderColor: COLORS.cardBorder },
  infoLabel:   { fontSize: 10, color: COLORS.textMuted, fontWeight: '600', marginBottom: 3 },
  infoVal:     { fontSize: FONTS.sizes.sm, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center' },
  landmarkRow: { flexDirection: 'row', alignItems: 'center', gap: 7, padding: SPACING.sm, backgroundColor: COLORS.primary + '08', borderRadius: RADIUS.md },
  landmarkTxt: { fontSize: FONTS.sizes.xs, color: COLORS.primary, fontWeight: '600', flex: 1 },

  stepsCard:   { marginHorizontal: SPACING.md, marginBottom: SPACING.sm, backgroundColor: COLORS.cardBg, borderRadius: RADIUS.lg, padding: SPACING.md, ...SHADOWS.card, borderWidth: 1, borderColor: COLORS.cardBorder },
  stepsHead:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.sm, paddingBottom: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder },
  stepsTitle:  { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.textPrimary },
  entranceTxt: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 21 },
  stepRow:     { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginTop: SPACING.sm },
  stepNum:     { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginTop: 1, flexShrink: 0 },
  stepNumTxt:  { fontSize: 11, fontWeight: '800', color: COLORS.accent },
  stepTxt:     { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, flex: 1, lineHeight: 20 },

  coordRow:    { flexDirection: 'row', alignItems: 'center' },
  coordBox:    { flex: 1, alignItems: 'center', paddingVertical: 6 },
  coordLabel:  { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, fontWeight: '600', marginBottom: 3 },
  coordVal:    { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.primary },
  coordDivider:{ width: 1, height: 36, backgroundColor: COLORS.cardBorder },

  bottomBar:   { padding: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.cardBorder, backgroundColor: COLORS.cardBg },
  mapsBtn:     { borderRadius: RADIUS.full, overflow: 'hidden', ...SHADOWS.button },
  mapsBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, paddingVertical: 16 },
  mapsBtnTxt:  { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.primary },
});
