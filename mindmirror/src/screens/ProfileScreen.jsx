import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, Modal } from 'react-native';
import { Camera, ChevronLeft, ChevronRight, X } from 'lucide-react-native';

const ProfileScreen = ({ userInfo, onSave, onBack }) => {
  const [name, setName] = useState(userInfo.name);
  const [birthday, setBirthday] = useState(userInfo.birthday); 
  const [hasProfileImage, setHasProfileImage] = useState(!!userInfo.photo);
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date()); 

  const handleBackPress = () => {
    Alert.alert("변경사항 저장", "변경사항을 저장하시겠습니까?", [
      { text: "취소", onPress: () => onBack(), style: "cancel" },
      { text: "저장", onPress: () => onSave({ name, birthday, photo: hasProfileImage }) }
    ]);
  };

  const handleImageChange = () => {
    Alert.alert("프로필 사진", "사진을 변경하시겠습니까?", [
      { text: "취소", style: "cancel" },
      { text: "기본 이미지로", onPress: () => setHasProfileImage(false) },
      { text: "앨범에서 선택 (시뮬레이션)", onPress: () => setHasProfileImage(true) }
    ]);
  };

  const year = pickerDate.getFullYear();
  const month = pickerDate.getMonth(); 
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const changeMonth = (increment) => {
    const newDate = new Date(pickerDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setPickerDate(newDate);
  };

  const changeYear = (increment) => {
    const newDate = new Date(pickerDate);
    newDate.setFullYear(newDate.getFullYear() + increment);
    setPickerDate(newDate);
  };

  const handleDateSelect = (day) => {
    const selectedDateStr = `${year}/${String(month + 1).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
    setBirthday(selectedDateStr);
    setShowDatePicker(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.headerBtn}>
          <Image source={require('../../assets/left.png')} style={styles.icon} resizeMode="contain" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>내 정보</Text>
        <TouchableOpacity onPress={() => onSave({ name, birthday, photo: hasProfileImage })} style={styles.saveTextBtn}>
          <Text style={styles.saveText}>저장</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <TouchableOpacity onPress={handleImageChange} style={styles.profileImageWrapper}>
          <Image source={require('../../assets/profile.png')} style={styles.profileImage} />
          <View style={styles.cameraBadge}>
            <Camera size={16} color="white" />
          </View>
        </TouchableOpacity>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>이름</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="이름을 입력하세요" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>생년월일</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateInputBtn}>
            <Text style={[styles.dateInputText, !birthday && { color: '#9CA3AF' }]}>{birthday || "날짜를 선택해주세요"}</Text>
          </TouchableOpacity>
          <Text style={styles.helperText}>캘린더에 생일이 표시됩니다 🎂</Text>
        </View>
      </View>

      <Modal visible={showDatePicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.datePickerContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>생년월일 선택</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)} style={{ padding: 4 }}>
                <Text style={styles.closeText}>닫기</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.navRow}>
              <View style={styles.navControl}>
                <TouchableOpacity onPress={() => changeYear(-1)} style={styles.navBtn}>
                  <Image source={require('../../assets/left.png')} style={styles.navIcon} resizeMode="contain" />
                </TouchableOpacity>
                <Text style={styles.navText}>{year}년</Text>
                <TouchableOpacity onPress={() => changeYear(1)} style={styles.navBtn}>
                  <Image source={require('../../assets/right.png')} style={styles.navIcon} resizeMode="contain" />
                </TouchableOpacity>
              </View>
              <View style={styles.navControl}>
                <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navBtn}>
                  <Image source={require('../../assets/left.png')} style={styles.navIcon} resizeMode="contain" />
                </TouchableOpacity>
                <Text style={styles.navText}>{month + 1}월</Text>
                <TouchableOpacity onPress={() => changeMonth(1)} style={styles.navBtn}>
                  <Image source={require('../../assets/right.png')} style={styles.navIcon} resizeMode="contain" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.calendarGrid}>
              {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
                <Text key={i} style={styles.dayLabel}>{d}</Text>
              ))}
              {Array(firstDayOfMonth).fill(null).map((_, i) => (<View key={`empty-${i}`} style={styles.dateCell} />))}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                <TouchableOpacity key={day} style={styles.dateCell} onPress={() => handleDateSelect(day)}>
                  <Text style={styles.dateNum}>{day}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffffff' },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#FCE7F3' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  headerBtn: { padding: 8 },
  icon: { width: 24, height: 24 },
  saveTextBtn: { padding: 8 },
  saveText: { fontSize: 16, fontWeight: '600', color: '#F472B6' },
  content: { flex: 1, padding: 24, alignItems: 'center' },
  profileImageWrapper: { marginBottom: 32, position: 'relative' },
  profileImage: { width: 120, height: 120, borderRadius: 60, borderWidth: 1, borderColor: '#E5E7EB' },
  cameraBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#F472B6', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#FFF0F5' },
  inputGroup: { width: '100%', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { backgroundColor: 'white', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#111827', borderWidth: 1, borderColor: '#E5E7EB' },
  dateInputBtn: { backgroundColor: 'white', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  dateInputText: { fontSize: 16, color: '#111827' },
  helperText: { fontSize: 12, color: '#6B7280', marginTop: 6, marginLeft: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  datePickerContainer: { width: '90%', backgroundColor: 'white', borderRadius: 20, padding: 20 },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  pickerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  closeText: { fontSize: 16, color: '#6B7280', fontWeight: '600' },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  navControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 8, padding: 4 },
  navBtn: { padding: 8 },
  navIcon: { width: 16, height: 16 },
  navText: { marginHorizontal: 8, fontWeight: '600', color: '#374151' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayLabel: { width: '14.28%', textAlign: 'center', color: '#9CA3AF', fontSize: 12, marginBottom: 8 },
  dateCell: { width: '14.28%', height: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  dateNum: { fontSize: 16, color: '#374151' },
});

export default ProfileScreen;
