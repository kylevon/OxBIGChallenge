import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  TextInput,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { format, startOfDay } from 'date-fns';
import { useFoodContext } from '../contexts/FoodContext';
import Animated, { useAnimatedScrollHandler } from 'react-native-reanimated';

const HOUR_HEIGHT = 60;
const EVENT_HEIGHT = HOUR_HEIGHT * 0.8;
const FONT_SIZE = 10;
const timeWidth = 40;

const timeSlots = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});

interface PositionedEntry extends FoodEntry {
  column: number;
  totalColumns: number;
}

interface SelectedEntry extends FoodEntry {
  column: number;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  timelineContainer: {
    flexDirection: 'row',
    height: HOUR_HEIGHT * 24,
  },
  timeLine: {
    width: timeWidth,
    backgroundColor: '#F2F2F7',
    padding: 0,
    margin: 0,
  },
  timeSlot: {
    height: HOUR_HEIGHT,
    padding: 0,
    margin: 0,
  },
  timeText: {
    fontSize: FONT_SIZE,
    color: '#666',
    textAlign: 'center',
    padding: 0,
    margin: 0,
  },
  hourLine: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    height: 1,
    backgroundColor: '#E5E5EA',
  },
  eventsContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  eventCard: {
    position: 'absolute',
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  eventDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  eventTime: {
    fontSize: 10,
    color: '#888',
    marginTop: 2,
  },
  scrollContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  deleteText: {
    color: 'white',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
});

export default function JournalScreen() {
  const { entries, deleteEntry, updateEntry } = useFoodContext();
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [selectedEntry, setSelectedEntry] = useState<SelectedEntry | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedFood, setEditedFood] = useState('');
  const [editedDetails, setEditedDetails] = useState('');
  const [editedTime, setEditedTime] = useState('');

  const getPositionedEntries = (entries: FoodEntry[]): PositionedEntry[] => {
    const positioned: PositionedEntry[] = [];
    const timeSlots: { [key: string]: FoodEntry[] } = {};

    // Helper function to convert time string to minutes since midnight
    const getMinutesSinceMidnight = (timeStr: string) => {
      // First, standardize the time format
      const cleanTimeStr = timeStr.trim().toUpperCase();
      const isPM = cleanTimeStr.includes('PM');
      const timeWithoutPeriod = cleanTimeStr.replace(/\s?[AP]M/, '');
      
      let [hours, minutes] = timeWithoutPeriod.split(':').map(Number);
      
      // Convert to 24-hour format
      if (isPM && hours !== 12) {
        hours += 12;
      } else if (!isPM && hours === 12) {
        hours = 0;
      }
      
      return hours * 60 + minutes;
    };

    // Sort entries by time first
    const sortedEntries = [...entries].sort((a, b) => 
      getMinutesSinceMidnight(a.time) - getMinutesSinceMidnight(b.time)
    );

    // Group entries that are within 50 minutes of each other
    sortedEntries.forEach(entry => {
      const entryMinutes = getMinutesSinceMidnight(entry.time);
      
      // Find or create appropriate time slot
      let slotFound = false;
      for (const [key, entries] of Object.entries(timeSlots)) {
        const slotMinutes = getMinutesSinceMidnight(entries[0].time);
        if (Math.abs(entryMinutes - slotMinutes) <= 50) {
          timeSlots[key].push(entry);
          slotFound = true;
          break;
        }
      }
      
      // If no suitable slot found, create new one
      if (!slotFound) {
        timeSlots[entry.time] = [entry];
      }
    });

    // Create positioned entries
    Object.entries(timeSlots).forEach(([time, timeEntries]) => {
      const totalColumns = timeEntries.length;
      timeEntries.forEach((entry, index) => {
        positioned.push({
          ...entry,
          column: index,
          totalColumns: totalColumns
        });
      });
    });

    return positioned;
  };

  const filteredEntries = getPositionedEntries(
    entries.filter(entry => entry.date === format(selectedDate, 'yyyy-MM-dd'))
  );

  console.log('Positioned entries:', filteredEntries);

  const getEntryPosition = (time: string) => {
    // Parse the time string
    const isPM = time.includes('PM');
    const [hourStr, minuteStr] = time.split(':');
    let hour = parseInt(hourStr);
    
    // Convert to 24-hour format for positioning
    if (isPM && hour !== 12) {
      hour += 12;
    } else if (!isPM && hour === 12) {
      hour = 0;
    }
    
    return hour * HOUR_HEIGHT;
  };

  const handleScroll = (event) => {
    if (timelineRef.current) {
      timelineRef.current.scrollTo({ y: event.nativeEvent.contentOffset.y, animated: false });
    }
  };

  const handleEntryPress = (entry: SelectedEntry) => {
    setSelectedEntry(entry);
    setEditedFood(entry.food);
    setEditedDetails(entry.details || '');
    setEditedTime(entry.time);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (selectedEntry) {
      await deleteEntry(selectedEntry.timestamp);
      setShowModal(false);
      setSelectedEntry(null);
    }
  };

  const handleEdit = async () => {
    if (selectedEntry) {
      try {
        await updateEntry(selectedEntry.timestamp, {
          food: editedFood,
          details: editedDetails || ' ',
          time: editedTime,
        });

        // Reset and close modal
        setEditMode(false);
        setShowModal(false);
        setSelectedEntry(null);
      } catch (error) {
        console.error('Error updating entry:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={day => {
          const date = new Date(day.dateString + 'T00:00:00');
          setSelectedDate(startOfDay(date));
        }}
        markedDates={{
          [format(selectedDate, 'yyyy-MM-dd')]: { selected: true }
        }}
        theme={{
          selectedDayBackgroundColor: '#007AFF',
          todayTextColor: '#007AFF',
          arrowColor: '#007AFF',
        }}
      />
      
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={true}
        scrollEventThrottle={16}
      >
        <View style={styles.timelineContainer}>
          <View style={styles.timeLine}>
            {timeSlots.map((time) => (
              <View key={time} style={styles.timeSlot}>
                <Text style={styles.timeText}>{time}</Text>
                <View style={styles.hourLine} />
              </View>
            ))}
          </View>

          <View style={styles.eventsContainer}>
            {filteredEntries.map((entry) => (
              <TouchableOpacity
                key={entry.timestamp}
                style={[
                  styles.eventCard,
                  { 
                    top: getEntryPosition(entry.time),
                    left: `${(entry.column * (100 / entry.totalColumns))}%`,
                    width: `${(100 / entry.totalColumns) - 2}%`,
                    height: EVENT_HEIGHT - 4,
                    marginHorizontal: 4,
                    zIndex: entry.column + 1, // Add zIndex to prevent overlap issues
                  }
                ]}
                onPress={() => handleEntryPress(entry)}
              >
                <Text style={styles.eventTitle} numberOfLines={1} ellipsizeMode="tail">
                  {entry.food}
                </Text>
                <Text style={styles.eventDetails} numberOfLines={2} ellipsizeMode="tail">
                  {entry.details}
                </Text>
                <Text style={styles.eventTime}>{entry.time}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowModal(false);
          setEditMode(false);
        }}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => {
            setShowModal(false);
            setEditMode(false);
          }}
        >
          <View style={styles.modalContent}>
            {!editMode ? (
              <>
                <Text style={styles.modalTitle}>{selectedEntry?.food}</Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.editButton]}
                    onPress={() => setEditMode(true)}
                  >
                    <Text style={styles.buttonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.deleteButton]}
                    onPress={handleDelete}
                  >
                    <Text style={[styles.buttonText, styles.deleteText]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Edit Entry</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editedFood}
                  onChangeText={setEditedFood}
                  placeholder="Food name"
                />
                <TextInput
                  style={styles.modalInput}
                  value={editedDetails}
                  onChangeText={setEditedDetails}
                  placeholder="Details"
                  multiline
                />
                <TextInput
                  style={styles.modalInput}
                  value={editedTime}
                  onChangeText={setEditedTime}
                  placeholder="Time"
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.editButton]}
                    onPress={handleEdit}
                  >
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.deleteButton]}
                    onPress={() => setEditMode(false)}
                  >
                    <Text style={[styles.buttonText, styles.deleteText]}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}