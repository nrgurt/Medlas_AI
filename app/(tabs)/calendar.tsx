// Calendar view for medication schedules with multiple view modes - Sept 30, 2025
// Shows medication events, completion rates, and conflict warnings - Oct 12, 2025
// Cursor AI assisted with the calendar grid layout and view mode switching - Oct 1, 2025
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Calendar as CalendarIcon, Clock, Pill, ChevronLeft, ChevronRight, Bot, ListFilter as Filter, Grid3x2 as Grid, List } from 'lucide-react-native';
import { router } from 'expo-router';
import { storageService, Senior, Medication, DoseEvent } from '@/services/storage';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  medications: Array<{
    medication: Medication;
    senior: Senior;
    times: string[];
    events: DoseEvent[];
  }>;
}

type ViewMode = 'month' | 'week' | 'day';
export default function CalendarScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [seniors, setSeniors] = useState<Senior[]>([]);
  const [loading, setLoading] = useState(true);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    loadCalendarData();
  }, [currentDate]);

  const loadCalendarData = async () => {
    try {
      const seniorsData = await storageService.getSeniors();
      setSeniors(seniorsData);

      const days = generateCalendarDays(currentDate);
      
      // Load medication data for each day
      for (const day of days) {
        const dayMedications: CalendarDay['medications'] = [];
        
        for (const senior of seniorsData) {
          const medications = await storageService.getMedications(senior.id);
          const doseEvents = await storageService.getDoseEvents(senior.id);
          
          for (const medication of medications) {
            const dayEvents = doseEvents.filter(event => {
              const eventDate = new Date(event.scheduledTimeISO);
              return eventDate.toDateString() === day.date.toDateString();
            });

            if (medication.times.length > 0) {
              dayMedications.push({
                medication,
                senior,
                times: medication.times,
                events: dayEvents,
              });
            }
          }
        }
        
        day.medications = dayMedications;
      }

      setCalendarDays(days);
    } catch (error) {
      console.error('Failed to load calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCalendarDays = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const today = new Date();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDay[] = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push({
        date: new Date(currentDate),
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: currentDate.toDateString() === today.toDateString(),
        medications: [],
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const getDayMedicationCount = (day: CalendarDay) => {
    return day.medications.reduce((total, med) => total + med.times.length, 0);
  };

  const getDayCompletionRate = (day: CalendarDay) => {
    const totalDoses = day.medications.reduce((total, med) => total + med.times.length, 0);
    const takenDoses = day.medications.reduce((total, med) => 
      total + med.events.filter(event => event.status === 'taken').length, 0
    );
    
    return totalDoses > 0 ? (takenDoses / totalDoses) * 100 : 100;
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      
      const calendarDay = calendarDays.find(d => 
        d.date.toDateString() === day.toDateString()
      );
      
      weekDays.push(calendarDay || {
        date: day,
        isCurrentMonth: day.getMonth() === currentDate.getMonth(),
        isToday: day.toDateString() === new Date().toDateString(),
        medications: [],
      });
    }
    
    return weekDays;
  };

  const navigateView = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (viewMode) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setCurrentDate(newDate);
  };

  const getViewTitle = () => {
    switch (viewMode) {
      case 'month':
        return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      case 'week':
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      case 'day':
        return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    }
  };
  const getCompletionColor = (rate: number) => {
    if (rate >= 90) return '#10b981';
    if (rate >= 70) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading calendar...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendar</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowViewModal(true)}
          >
            <Filter size={20} color="#374151" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => router.push('/(tabs)/agent')}
          >
            <Bot size={20} color="#3b82f6" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.calendarHeader}>
        <TouchableOpacity style={styles.navButton} onPress={() => navigateView('prev')}>
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
        
        <Text style={styles.monthYear}>
          {getViewTitle()}
        </Text>
        
        <TouchableOpacity style={styles.navButton} onPress={() => navigateView('next')}>
          <ChevronRight size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.calendar}>
        {viewMode === 'month' && (
          <>
            <View style={styles.weekDays}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                <Text key={day} style={styles.weekDay}>{day}</Text>
              ))}
            </View>
          <View style={styles.calendarGrid}>
            {calendarDays.map((day, index) => {
              const medicationCount = getDayMedicationCount(day);
              const completionRate = getDayCompletionRate(day);
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.calendarDay,
                    !day.isCurrentMonth && styles.otherMonth,
                    day.isToday && styles.today,
                    selectedDay?.date.toDateString() === day.date.toDateString() && styles.selected,
                  ]}
                  onPress={() => setSelectedDay(day)}
                >
                  <Text style={[
                    styles.dayNumber,
                    !day.isCurrentMonth && styles.otherMonthText,
                    day.isToday && styles.todayText,
                  ]}>
                    {day.date.getDate()}
                  </Text>
                  
                  {medicationCount > 0 && (
                    <View style={styles.medicationIndicators}>
                      <View style={[
                        styles.medicationDot,
                        { backgroundColor: getCompletionColor(completionRate) }
                      ]} />
                      <Text style={styles.medicationCount}>{medicationCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          </>
        )}

        {viewMode === 'week' && (
          <View style={styles.weekView}>
            {getWeekDays().map((day, index) => {
              const medicationCount = getDayMedicationCount(day);
              const completionRate = getDayCompletionRate(day);
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.weekDay,
                    day.isToday && styles.todayWeek,
                    selectedDay?.date.toDateString() === day.date.toDateString() && styles.selectedWeek,
                  ]}
                  onPress={() => setSelectedDay(day)}
                >
                  <Text style={styles.weekDayName}>
                    {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </Text>
                  <Text style={[
                    styles.weekDayNumber,
                    day.isToday && styles.todayText,
                  ]}>
                    {day.date.getDate()}
                  </Text>
                  
                  {medicationCount > 0 && (
                    <View style={styles.weekMedicationIndicator}>
                      <View style={[
                        styles.medicationDot,
                        { backgroundColor: getCompletionColor(completionRate) }
                      ]} />
                      <Text style={styles.medicationCount}>{medicationCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {viewMode === 'day' && (
          <View style={styles.dayView}>
            {(() => {
              const dayData = calendarDays.find(d => 
                d.date.toDateString() === currentDate.toDateString()
              ) || {
                date: currentDate,
                isCurrentMonth: true,
                isToday: currentDate.toDateString() === new Date().toDateString(),
                medications: [],
              };
              
              return (
                <View style={styles.dayViewContent}>
                  <Text style={styles.dayViewTitle}>
                    {dayData.medications.length} medications scheduled
                  </Text>
                  
                  {dayData.medications.length === 0 ? (
                    <Text style={styles.noMedicationsDay}>No medications scheduled for this day</Text>
                  ) : (
                    <View style={styles.dayMedicationsList}>
                      {dayData.medications.map((medData, index) => (
                        <View key={index} style={styles.dayMedicationItem}>
                          <View style={styles.medicationHeader}>
                            <Text style={styles.seniorName}>
                              {medData.senior.firstName} {medData.senior.lastName}
                            </Text>
                            <Text style={styles.medicationName}>{medData.medication.name}</Text>
                          </View>
                          
                          <View style={styles.medicationTimes}>
                            {medData.times.map((time, timeIndex) => {
                              const event = medData.events.find(e => {
                                const eventTime = new Date(e.scheduledTimeISO);
                                return eventTime.getHours().toString().padStart(2, '0') + ':' + 
                                       eventTime.getMinutes().toString().padStart(2, '0') === time;
                              });
                              
                              return (
                                <View key={timeIndex} style={styles.timeSlot}>
                                  <Clock size={16} color="#6b7280" />
                                  <Text style={styles.timeText}>{time}</Text>
                                  <View style={[
                                    styles.statusDot,
                                    { backgroundColor: event?.status === 'taken' ? '#10b981' : 
                                                      event?.status === 'skipped' ? '#6b7280' :
                                                      event?.status === 'delayed' ? '#f59e0b' : '#e5e7eb' }
                                  ]} />
                                </View>
                              );
                            })}
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })()}
          </View>
        )}

        {selectedDay && viewMode !== 'day' && (
          <View style={styles.dayDetails}>
            <Text style={styles.dayDetailsTitle}>
              {selectedDay.date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
            
            {selectedDay.medications.length === 0 ? (
              <Text style={styles.noMedications}>No medications scheduled</Text>
            ) : (
              <View style={styles.medicationsList}>
                {selectedDay.medications.map((medData, index) => (
                  <View key={index} style={styles.medicationItem}>
                    <View style={styles.medicationHeader}>
                      <Text style={styles.seniorName}>
                        {medData.senior.firstName} {medData.senior.lastName}
                      </Text>
                      <Text style={styles.medicationName}>{medData.medication.name}</Text>
                    </View>
                    
                    <View style={styles.medicationTimes}>
                      {medData.times.map((time, timeIndex) => {
                        const event = medData.events.find(e => {
                          const eventTime = new Date(e.scheduledTimeISO);
                          return eventTime.getHours().toString().padStart(2, '0') + ':' + 
                                 eventTime.getMinutes().toString().padStart(2, '0') === time;
                        });
                        
                        return (
                          <View key={timeIndex} style={styles.timeSlot}>
                            <Clock size={16} color="#6b7280" />
                            <Text style={styles.timeText}>{time}</Text>
                            <View style={[
                              styles.statusDot,
                              { backgroundColor: event?.status === 'taken' ? '#10b981' : 
                                                event?.status === 'skipped' ? '#6b7280' :
                                                event?.status === 'delayed' ? '#f59e0b' : '#e5e7eb' }
                            ]} />
                          </View>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* View Mode Selection Modal */}
      <Modal
        visible={showViewModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowViewModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Calendar View</Text>
            
            <View style={styles.viewOptions}>
              <TouchableOpacity
                style={[styles.viewOption, viewMode === 'month' && styles.selectedViewOption]}
                onPress={() => {
                  setViewMode('month');
                  setShowViewModal(false);
                }}
              >
                <Grid size={24} color={viewMode === 'month' ? '#3b82f6' : '#6b7280'} />
                <Text style={[
                  styles.viewOptionText,
                  viewMode === 'month' && styles.selectedViewOptionText
                ]}>
                  Month View
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.viewOption, viewMode === 'week' && styles.selectedViewOption]}
                onPress={() => {
                  setViewMode('week');
                  setShowViewModal(false);
                }}
              >
                <List size={24} color={viewMode === 'week' ? '#3b82f6' : '#6b7280'} />
                <Text style={[
                  styles.viewOptionText,
                  viewMode === 'week' && styles.selectedViewOptionText
                ]}>
                  Week View
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.viewOption, viewMode === 'day' && styles.selectedViewOption]}
                onPress={() => {
                  setViewMode('day');
                  setShowViewModal(false);
                }}
              >
                <CalendarIcon size={24} color={viewMode === 'day' ? '#3b82f6' : '#6b7280'} />
                <Text style={[
                  styles.viewOptionText,
                  viewMode === 'day' && styles.selectedViewOptionText
                ]}>
                  Day View
                </Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowViewModal(false)}
            >
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthYear: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1e293b',
  },
  weekDays: {
    flexDirection: 'row',
    paddingVertical: 16,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    minWidth: 50,
    letterSpacing: 0,
    lineHeight: 16,
  },
  calendar: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 0.9,
    padding: 12,
    borderWidth: 0.5,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  otherMonth: {
    backgroundColor: '#f9fafb',
  },
  today: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  selected: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
    borderWidth: 2,
  },
  dayNumber: {
    fontSize: 17,
    fontWeight: '500',
    color: '#1e293b',
  },
  otherMonthText: {
    color: '#9ca3af',
  },
  todayText: {
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  medicationIndicators: {
    alignItems: 'center',
    gap: 4,
  },
  medicationDot: {
    width: 10,
    height: 10,
    borderRadius: 4,
  },
  medicationCount: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
  },
  dayDetails: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#f8fafc',
  },
  dayDetailsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 20,
  },
  noMedications: {
    fontSize: 17,
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 32,
  },
  medicationsList: {
    gap: 16,
  },
  medicationItem: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  medicationHeader: {
    marginBottom: 16,
  },
  seniorName: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 6,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  medicationTimes: {
    gap: 12,
  },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeText: {
    fontSize: 15,
    color: '#374151',
    flex: 1,
    fontWeight: '500',
  },
  statusDot: {
    width: 14,
    height: 14,
    borderRadius: 6,
  },
  weekView: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
  },
  weekDay: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    minHeight: 140,
  },
  todayWeek: {
    backgroundColor: '#eff6ff',
  },
  selectedWeek: {
    backgroundColor: '#dbeafe',
  },
  weekDayName: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 6,
    fontWeight: '500',
  },
  weekDayNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  weekMedicationIndicator: {
    alignItems: 'center',
    gap: 6,
  },
  dayView: {
    backgroundColor: '#ffffff',
    padding: 20,
  },
  dayViewContent: {
    gap: 20,
  },
  dayViewTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
  },
  noMedicationsDay: {
    fontSize: 17,
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 40,
  },
  dayMedicationsList: {
    gap: 16,
  },
  dayMedicationItem: {
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 32,
  },
  viewOptions: {
    gap: 16,
    marginBottom: 32,
  },
  viewOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    gap: 16,
  },
  selectedViewOption: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  viewOptionText: {
    fontSize: 17,
    color: '#6b7280',
    fontWeight: '500',
  },
  selectedViewOptionText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  closeModalButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeModalButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#374151',
  },
});