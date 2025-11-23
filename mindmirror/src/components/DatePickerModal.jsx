import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Image } from 'react-native';

const DatePickerModal = ({ visible, onClose, onSelect, initialDate }) => {
  // 기본값: 오늘 날짜
  const [pickerDate, setPickerDate] = useState(new Date());

  // 모달이 열릴 때 초기 날짜 설정 (유효성 검사 포함)
  useEffect(() => {
    if (visible) {
      let d = new Date();
      if (initialDate) {
        // 문자열이나 객체가 들어올 수 있으므로 처리
        const parsed = new Date(initialDate);
        // 유효한 날짜인지 확인 (!isNaN)
        if (!isNaN(parsed.getTime())) {
          d = parsed;
        }
      }
      setPickerDate(d);
    }
  }, [visible, initialDate]);

  const year = pickerDate.getFullYear();
  const month = pickerDate.getMonth(); 
  
  // [핵심 수정] getDay() 결과가 NaN이면 0으로 처리하여 에러 방지
  let firstDayOfMonth = new Date(year, month, 1).getDay();
  if (isNaN(firstDayOfMonth)) firstDayOfMonth = 0;

  // [핵심 수정] getDate() 결과가 NaN이면 30으로 처리
  let daysInMonth = new Date(year, month + 1, 0).getDate();
  if (isNaN(daysInMonth)) daysInMonth = 30;

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
    // YYYY/MM/DD 포맷 문자열 반환
    const selectedDateStr = `${year}/${String(month + 1).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
    onSelect(selectedDateStr);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.datePickerContainer}>
          {/* 헤더 */}
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>날짜 선택</Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <Text style={styles.closeText}>닫기</Text>
            </TouchableOpacity>
          </View>

          {/* 네비게이션 */}
          <View style={styles.navRow}>
            <View style={styles.navControl}>
              <TouchableOpacity onPress={() => changeYear(-1)} style={styles.navBtn}>
                <Image source={require('../../assets/left.png')} style={styles.navIcon} resizeMode="contain" />
              </TouchableOpacity>
              <Text style={styles.navText}>{isNaN(year) ? '----' : year}년</Text>
              <TouchableOpacity onPress={() => changeYear(1)} style={styles.navBtn}>
                <Image source={require('../../assets/right.png')} style={styles.navIcon} resizeMode="contain" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.navControl}>
              <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navBtn}>
                <Image source={require('../../assets/left.png')} style={styles.navIcon} resizeMode="contain" />
              </TouchableOpacity>
              <Text style={styles.navText}>{isNaN(month) ? '--' : month + 1}월</Text>
              <TouchableOpacity onPress={() => changeMonth(1)} style={styles.navBtn}>
                <Image source={require('../../assets/right.png')} style={styles.navIcon} resizeMode="contain" />
              </TouchableOpacity>
            </View>
          </View>

          {/* 달력 그리드 */}
          <View style={styles.calendarGrid}>
            {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
              <Text key={i} style={styles.dayLabel}>{d}</Text>
            ))}
            {/* 안전하게 필터링된 firstDayOfMonth 사용 */}
            {Array(firstDayOfMonth).fill(null).map((_, i) => (
              <View key={`empty-${i}`} style={styles.dateCell} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
              <TouchableOpacity 
                key={day} 
                style={styles.dateCell}
                onPress={() => handleDateSelect(day)}
              >
                <Text style={styles.dateNum}>{day}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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

export default DatePickerModal;