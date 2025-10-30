// Historical dose tracking with filtering and status indicators - Oct 9, 2025
// Groups dose events by date and shows completion patterns - Oct 16, 2025
// Filter chips and history timeline styling done with Cursor AI - Oct 10, 2025
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Clock, FileText, ListFilter as Filter } from 'lucide-react-native';
import { storageService, DoseEvent, Medication } from '@/services/storage';

interface DoseHistoryTabProps {
  seniorId: string;
  largeText: boolean;
}

interface DoseHistoryItem {
  event: DoseEvent;
  medication: Medication;
}

type FilterType = 'all' | 'taken' | 'skipped' | 'delayed';

export function DoseHistoryTab({ seniorId, largeText }: DoseHistoryTabProps) {
  const [history, setHistory] = useState<DoseHistoryItem[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);

  const textScale = largeText ? 1.2 : 1;

  useEffect(() => {
    loadHistory();
  }, [seniorId]);

  const loadHistory = async () => {
    try {
      const events = await storageService.getDoseEvents(seniorId);
      const medications = await storageService.getMedications(seniorId);
      
      const historyItems: DoseHistoryItem[] = events
        .map(event => {
          const medication = medications.find(m => m.id === event.medicationId);
          return medication ? { event, medication } : null;
        })
        .filter(Boolean) as DoseHistoryItem[];
      
      // Sort by recorded time, most recent first
      historyItems.sort((a, b) => 
        new Date(b.event.recordedTimeISO).getTime() - new Date(a.event.recordedTimeISO).getTime()
      );
      
      setHistory(historyItems);
    } catch (error) {
      console.error('Failed to load dose history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredHistory = (): DoseHistoryItem[] => {
    if (filter === 'all') return history;
    return history.filter(item => item.event.status === filter);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'taken':
        return '#10b981';
      case 'skipped':
        return '#6b7280';
      case 'delayed':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'taken':
        return 'Taken';
      case 'skipped':
        return 'Skipped';
      case 'delayed':
        return 'Delayed';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const groupHistoryByDate = (items: DoseHistoryItem[]) => {
    const groups: { [date: string]: DoseHistoryItem[] } = {};
    
    items.forEach(item => {
      const date = new Date(item.event.recordedTimeISO).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(item);
    });
    
    return groups;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.loadingText, { fontSize: 16 * textScale }]}>Loading dose history...</Text>
      </View>
    );
  }

  const filteredHistory = getFilteredHistory();
  const groupedHistory = groupHistoryByDate(filteredHistory);

  return (
    <View style={styles.container}>
      <View style={styles.filterHeader}>
        <View style={styles.filterChips}>
          {(['all', 'taken', 'skipped', 'delayed'] as FilterType[]).map((filterType) => (
            <TouchableOpacity
              key={filterType}
              style={[
                styles.filterChip,
                filter === filterType && styles.activeFilterChip
              ]}
              onPress={() => setFilter(filterType)}
            >
              <Text style={[
                styles.filterChipText,
                { fontSize: 14 * textScale },
                filter === filterType && styles.activeFilterChipText
              ]}>
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {filteredHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Clock size={48} color="#9ca3af" />
          <Text style={[styles.emptyTitle, { fontSize: 18 * textScale }]}>
            {filter === 'all' ? 'No doses recorded yet' : `No ${filter} doses`}
          </Text>
          <Text style={[styles.emptyDescription, { fontSize: 16 * textScale }]}>
            Dose history will appear here as medications are administered.
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.historyList}>
          {Object.entries(groupedHistory)
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
            .map(([date, items]) => (
              <View key={date} style={styles.dateSection}>
                <Text style={[styles.dateHeader, { fontSize: 16 * textScale }]}>
                  {formatDate(items[0].event.recordedTimeISO)}
                </Text>
                
                {items.map((item) => (
                  <View key={item.event.id} style={styles.historyItem}>
                    <View style={styles.historyTime}>
                      <Text style={[styles.timeText, { fontSize: 14 * textScale }]}>
                        {formatTime(item.event.recordedTimeISO)}
                      </Text>
                    </View>
                    
                    <View style={styles.historyContent}>
                      <View style={styles.historyMain}>
                        <Text style={[styles.medicationName, { fontSize: 16 * textScale }]}>
                          {item.medication.name}
                        </Text>
                        <Text style={[styles.medicationDose, { fontSize: 14 * textScale }]}>
                          {item.medication.dose}
                        </Text>
                      </View>
                      
                      <View style={styles.historyMeta}>
                        <View 
                          style={[
                            styles.statusBadge,
                            { backgroundColor: getStatusColor(item.event.status) }
                          ]}
                        >
                          <Text style={[styles.statusText, { fontSize: 12 * textScale }]}>
                            {getStatusText(item.event.status)}
                          </Text>
                        </View>
                        
                        {item.event.note && (
                          <View style={styles.noteIndicator}>
                            <FileText size={14} color="#6b7280" />
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  filterHeader: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterChips: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeFilterChip: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterChipText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeFilterChipText: {
    color: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  historyList: {
    flex: 1,
    padding: 16,
  },
  dateSection: {
    marginBottom: 24,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  historyItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  historyTime: {
    minWidth: 60,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  historyContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyMain: {
    flex: 1,
    gap: 2,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  medicationDose: {
    fontSize: 14,
    color: '#64748b',
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  noteIndicator: {
    padding: 4,
  },
});