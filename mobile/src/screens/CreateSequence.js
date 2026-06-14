import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, Alert, ActivityIndicator } from 'react-native';
import apiService from '../services/api';

export default function CreateSequence({ navigation }) {
  const [name, setName] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiService.getCategories().then(setCategories).catch(() => {});
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Sequence name is required');
      return;
    }
    setLoading(true);
    try {
      const seqRes = await apiService.request('/sequences', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), color: '#4a90d9', category_id: selectedCategory }),
      });
      const seqId = seqRes.id;
      // Create a default habit in this sequence
      await apiService.request('/habits', {
        method: 'POST',
        body: JSON.stringify({ sequence_id: seqId, step_order: 1, name: 'My Habit', type: 'binary', target_value: 1, cumulative: false }),
      });
      Alert.alert('Success', 'Sequence created!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New Sequence</Text>
        <View style={{ width: 50 }} />
      </View>
      <View style={styles.form}>
        <Text style={styles.label}>Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Morning Routine" />
        <Text style={styles.label}>Category</Text>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(c) => String(c.id)}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.categoryChip, selectedCategory === item.id && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(item.id)}
            >
              <Text style={[styles.categoryText, selectedCategory === item.id && styles.categoryTextActive]}>{item.name}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No categories</Text>}
        />
        <TouchableOpacity style={styles.createBtn} onPress={handleCreate} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.createText}>Create Sequence</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  back: { color: '#2196F3', fontSize: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  form: { padding: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 16 },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 12, fontSize: 16, borderWidth: 1, borderColor: '#ddd' },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e0e0e0', marginRight: 8, marginTop: 8 },
  categoryChipActive: { backgroundColor: '#2196F3' },
  categoryText: { fontSize: 14, color: '#555' },
  categoryTextActive: { color: '#fff' },
  createBtn: { backgroundColor: '#4caf50', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 32 },
  createText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  emptyText: { color: '#999', fontSize: 14, marginTop: 8 },
});
