import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function LifeChangesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Life Changes</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/new-change')}
        >
          <Plus color="#00D1FF" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.changesList}>
        <View style={styles.changeCard}>
          <View style={styles.changeHeader}>
            <Text style={styles.changeType}>Stopped</Text>
            <Text style={styles.changeDate}>Jan 15, 2024</Text>
          </View>
          <Text style={styles.changeTitle}>Late-night screens</Text>
          <View style={[styles.impactIndicator, styles.positiveImpact]}>
            <Text style={styles.impactText}>+15% Body Battery improvement</Text>
          </View>
        </View>

        <View style={styles.changeCard}>
          <View style={styles.changeHeader}>
            <Text style={styles.changeType}>Started</Text>
            <Text style={styles.changeDate}>Jan 10, 2024</Text>
          </View>
          <Text style={styles.changeTitle}>Meditation</Text>
          <View style={[styles.impactIndicator, styles.positiveImpact]}>
            <Text style={styles.impactText}>+8% Body Battery improvement</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  addButton: {
    backgroundColor: '#1A1A1A',
    padding: 12,
    borderRadius: 12,
  },
  changesList: {
    padding: 16,
  },
  changeCard: {
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  changeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  changeType: {
    color: '#00D1FF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  changeDate: {
    color: '#888',
    fontSize: 14,
  },
  changeTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  impactIndicator: {
    padding: 8,
    borderRadius: 8,
  },
  positiveImpact: {
    backgroundColor: 'rgba(0, 209, 255, 0.1)',
  },
  negativeImpact: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  impactText: {
    color: '#00D1FF',
    fontSize: 14,
  },
});