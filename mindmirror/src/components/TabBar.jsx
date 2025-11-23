import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';

const TabBar = ({ currentTab, setCurrentTab }) => (
  <View style={styles.tabBar}>
    <TouchableOpacity onPress={() => setCurrentTab('home')} style={styles.tabItem}>
      <Image 
        source={require('../../assets/home.png')} 
        style={[
          styles.icon, 
          { tintColor: currentTab === 'home' ? '#F472B6' : '#9CA3AF' }
        ]} 
      />
      <Text style={[styles.tabText, currentTab === 'home' && styles.activeTabText]}>홈</Text>
    </TouchableOpacity>
    
    <TouchableOpacity onPress={() => setCurrentTab('write')} style={styles.writeBtnWrapper}>
      <View style={styles.writeBtn}>
        <Image 
          source={require('../../assets/plus.png')} 
          style={styles.plusIcon} 
        />
      </View>
    </TouchableOpacity>

    <TouchableOpacity onPress={() => setCurrentTab('report')} style={styles.tabItem}>
      <Image 
        source={require('../../assets/file.png')} 
        style={[
          styles.icon, 
          { tintColor: currentTab === 'report' ? '#F472B6' : '#9CA3AF' }
        ]} 
      />
      <Text style={[styles.tabText, currentTab === 'report' && styles.activeTabText]}>리포트</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  tabBar: { 
    flexDirection: 'row', 
    height: 60, 
    backgroundColor: 'white', 
    borderTopWidth: 1, 
    borderTopColor: '#F3F4F6', 
    paddingBottom: Platform.OS === 'ios' ? 0 : 10,
    justifyContent: 'space-around', 
    alignItems: 'center' 
  },
  tabItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  tabText: { fontSize: 10, marginTop: 4, color: '#9CA3AF', fontWeight: '500' },
  activeTabText: { color: '#F472B6' },
  
  icon: { width: 24, height: 24, resizeMode: 'contain' },
  
  // [수정] 버튼 위치 미세 조정
  writeBtnWrapper: { top: -20 }, 
  writeBtn: { 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    backgroundColor: '#F472B6', 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#F472B6', 
    shadowOpacity: 0.3, 
    shadowOffset: { width: 0, height: 4 }, 
    elevation: 5
  },
  plusIcon: { width: 24, height: 24, tintColor: 'white', resizeMode: 'contain' }
});

export default TabBar;
