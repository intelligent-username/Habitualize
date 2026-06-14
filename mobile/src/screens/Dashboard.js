import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, SectionList, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import apiService from '../services/api';

function getToday() {
  return new Date().toISOString().split('T')[0];
}

export default function Dashboard({ navigation }) {
  const [sequences, setSequences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSequences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getSequencesByDate(getToday());
      setSequences(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSequences(); }, [fetchSequences]);

  const toggleHabit = async (habitId, currentCompleted) => {
    try {
      await apiService.updateHabitCompletion(habitId, {
        completed: currentCompleted ? 0 : 1,
        value: 1,
        date: getToday(),
      });
      fetchSequences();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading habits...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchSequences}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const sections = sequences.map(seq => ({
    title: seq.name,
    color: seq.color || '#4a90d9',
    data: seq.steps || [],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Habitualize</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => {}}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>
      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item.id)}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: section.color }]} />
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.habitRow}>
            <TouchableOpacity
              style={[styles.checkbox, item.completed && styles.checked]}
              onPress={() => toggleHabit(item.id, item.completed)}
            >
              {item.completed && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
            <View style={styles.habitInfo}>
              <Text style={styles.habitName}>{item.name}</Text>
            </View>
            {item.type === 'counter' && (
              <Text style={styles.value}>{item.value}/{item.target_value}</Text>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No habits yet</Text>
            <Text style={styles.emptySubtitle}>Tap + to create your first sequence</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2196F3', justifyContent: 'center', alignItems: 'center' },
  addBtnText: { color: '#fff', fontSize: 24, fontWeight: 'bold', lineHeight: 28 },
  habitRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    marginHorizontal: 12, marginVertical: 4, padding: 12, borderRadius: 8,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  checkbox: {
    width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#ccc',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  checked: { backgroundColor: '#4caf50', borderColor: '#4caf50' },
  checkmark: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  habitInfo: { flex: 1 },
  habitName: { fontSize: 16, fontWeight: '600', color: '#333' },
  sequenceName: { fontSize: 12, color: '#999', marginTop: 2 },
  value: { fontSize: 14, color: '#666' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
  sectionDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#555', textTransform: 'uppercase' },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#999' },
  emptySubtitle: { fontSize: 14, color: '#bbb', marginTop: 8 },
  errorText: { color: 'red', fontSize: 16, marginBottom: 12 },
  retryBtn: { backgroundColor: '#2196F3', padding: 10, borderRadius: 6 },
  retryText: { color: '#fff', fontSize: 16 },
});
