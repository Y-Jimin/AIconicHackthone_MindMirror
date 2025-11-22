import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

const Header = ({ title, onBack }) => (
  <View style={styles.header}>
    {onBack ? (
      <TouchableOpacity onPress={onBack} style={styles.headerBtn}>
        {/* [이미지 적용] 뒤로가기 */}
        <Image 
          source={require('../../assets/left.png')} 
          style={styles.icon} 
          resizeMode="contain"
        />
      </TouchableOpacity>
    ) : (
      <View style={{ width: 24 }} />
    )}
    <Text style={styles.headerTitle}>{title}</Text>
    <View style={{ width: 24 }} />
  </View>
);

const styles = StyleSheet.create({
  header: { 
    height: 56, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    backgroundColor: 'white', 
    borderBottomWidth: 1, 
    borderBottomColor: '#F3F4F6' 
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  headerBtn: { padding: 4 },
  icon: { width: 24, height: 24 } // 아이콘 크기
});

export default Header;