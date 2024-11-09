import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';

interface FoodEntry {
  food: string;
  details: string;
  time: string;
  timestamp: number;
  date: string;
}

interface FoodContextType {
  entries: FoodEntry[];
  addEntry: (entry: Omit<FoodEntry, 'timestamp' | 'date'>) => Promise<void>;
  deleteEntry: (timestamp: number) => Promise<void>;
  updateEntry: (timestamp: number, updatedEntry: Omit<FoodEntry, 'timestamp' | 'date'>) => Promise<void>;
  clearEntries: () => Promise<void>;
}

const FoodContext = createContext<FoodContextType | undefined>(undefined);

export function FoodProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<FoodEntry[]>([]);

  // Load entries from AsyncStorage when the app starts
  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const storedEntries = await AsyncStorage.getItem('foodEntries');
      if (storedEntries) {
        setEntries(JSON.parse(storedEntries));
      }
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  };

  const addEntry = async (entry: Omit<FoodEntry, 'timestamp' | 'date'>) => {
    try {
      const timestamp = Date.now();
      const newEntry = {
        ...entry,
        details: entry.details || ' ',
        timestamp,
        date: format(new Date(timestamp), 'yyyy-MM-dd'),
      };
      
      const updatedEntries = [...entries, newEntry];
      updatedEntries.sort((a, b) => a.timestamp - b.timestamp);
      
      await AsyncStorage.setItem('foodEntries', JSON.stringify(updatedEntries));
      setEntries(updatedEntries);
    } catch (error) {
      console.error('Error saving entry:', error);
    }
  };

  const deleteEntry = async (timestamp: number) => {
    try {
      const updatedEntries = entries.filter(entry => entry.timestamp !== timestamp);
      await AsyncStorage.setItem('foodEntries', JSON.stringify(updatedEntries));
      setEntries(updatedEntries);
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const updateEntry = async (
    timestamp: number, 
    updatedEntry: Omit<FoodEntry, 'timestamp' | 'date'>
  ) => {
    try {
      const updatedEntries = entries.map(entry => 
        entry.timestamp === timestamp
          ? {
              ...updatedEntry,
              timestamp,
              date: format(new Date(timestamp), 'yyyy-MM-dd'),
            }
          : entry
      );
      
      await AsyncStorage.setItem('foodEntries', JSON.stringify(updatedEntries));
      setEntries(updatedEntries);
    } catch (error) {
      console.error('Error updating entry:', error);
    }
  };

  const clearEntries = async () => {
    try {
      await AsyncStorage.removeItem('foodEntries');
      setEntries([]);
    } catch (error) {
      console.error('Error clearing entries:', error);
    }
  };

  return (
    <FoodContext.Provider 
      value={{ 
        entries, 
        addEntry, 
        deleteEntry, 
        updateEntry,
        clearEntries 
      }}
    >
      {children}
    </FoodContext.Provider>
  );
}

// Custom hook to use the food context
export function useFoodContext() {
  const context = useContext(FoodContext);
  if (context === undefined) {
    throw new Error('useFoodContext must be used within a FoodProvider');
  }
  return context;
}
