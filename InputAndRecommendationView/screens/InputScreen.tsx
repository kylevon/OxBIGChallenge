import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Button, 
  Platform, 
  TouchableOpacity,
  Modal,
  StyleSheet
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFoodContext } from '../contexts/FoodContext';

export default function InputScreen() {
  const { addEntry } = useFoodContext();
  const [food, setFood] = useState('');
  const [details, setDetails] = useState('');
  const [date, setDate] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleAddFood = async () => {
    try {
      await addEntry({
        food,
        details,
        time: date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
      });
      
      // Clear inputs after successful add
      setFood('');
      setDetails('');
      setDate(new Date());
    } catch (error) {
      console.error('Error adding food:', error);
    }
  };

  const onTimeChange = (event, selectedDate) => {
    setShowTimePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={food}
        onChangeText={setFood}
        placeholder="Food name"
        style={styles.input}
        placeholderTextColor="#666"
      />
      <TextInput
        value={details}
        onChangeText={setDetails}
        placeholder="Details"
        style={styles.input}
        placeholderTextColor="#666"
        multiline
      />
      <TouchableOpacity 
        onPress={() => setShowTimePicker(true)}
        style={styles.timeInput}
      >
        <Text style={styles.timeText}>
          {date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })}
        </Text>
      </TouchableOpacity>

      {showTimePicker && (
        <DateTimePicker
          value={date}
          mode="time"
          is24Hour={false}
          display="spinner"
          onChange={onTimeChange}
        />
      )}

      <Button title="Add Food" onPress={handleAddFood} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timeInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 16,
    color: '#000',
  },
});

