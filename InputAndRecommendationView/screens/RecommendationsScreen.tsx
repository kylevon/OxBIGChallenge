import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { format } from 'date-fns';
import { useFoodContext } from '../contexts/FoodContext';

export default function RecommendationsScreen() {
  const { entries } = useFoodContext();
  const [considerations, setConsiderations] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [hasAttemptedUpdate, setHasAttemptedUpdate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState({
    great: [],
    improve: [],
    try: []
  });

  const formatJournalEntries = (entries) => {
    // Group entries by date
    const entriesByDate = entries.reduce((acc, entry) => {
      const date = format(new Date(entry.timestamp), 'EEEE d MMMM yyyy');
      if (!acc[date]) acc[date] = [];
      
      // Format time to only show hours and minutes
      const timeParts = entry.time.split(':');
      const period = entry.time.includes('PM') ? 'PM' : 'AM';
      const timeFormatted = `${timeParts[0]}:${timeParts[1]} ${period}`; // HH:MM AM/PM
      
      acc[date].push({
        ...entry,
        time: timeFormatted
      });
      return acc;
    }, {});

    // Format into text
    let journalText = '';
    Object.entries(entriesByDate).forEach(([date, dayEntries]) => {
      journalText += `${date} I ate: `;
      dayEntries.forEach((entry, index) => {
        journalText += `${entry.food} at ${entry.time}`;
        if (index < dayEntries.length - 1) {
          journalText += ', ';
        }
      });
      journalText += '. ';
    });

    console.log('Formatted journal text:', journalText);  // Debug log
    return journalText;
  };

  const handleUpdateRecommendations = async () => {
    setHasAttemptedUpdate(true);
    
    if (!apiKey) {
      console.log('API key is required');
      return;
    }

    setIsLoading(true);

    try {
      // Format the journal entries into text
      const journalText = formatJournalEntries(entries);
      console.log('Formatted journal text:', journalText);

      const externalUserId = Math.floor(Math.random() * 1000000).toString();

      // Function to make API call with specific prompt
      const makeQuery = async (prompt: string) => {
        const response = await fetch('https://api.on-demand.io/chat/v1/sessions/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': apiKey,
          },
          body: JSON.stringify({
            endpointId: 'predefined-openai-gpt4o',
            query: prompt,
            pluginIds: ['plugin-1712327325', 'plugin-1713962163'],
            responseMode: 'sync',
            externalUserId: externalUserId,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data); // Debug log
        
        if (!data.data?.answer) {
          throw new Error('Invalid API response format');
        }
        
        return data.data.answer;
      };

      // Make three separate queries
      const [greatResponse, improveResponse, tryResponse] = await Promise.all([
        // What you did great
        makeQuery(`Based on this food journal: ${journalText}
                  Additional considerations: ${considerations}
                  
                  Analyze what I did great in my nutrition choices.
                  Use a personal, encouraging tone (e.g., "You made great choices by..." instead of "The person...").
                  Focus on specific positive patterns and healthy choices I made.
                  Include timing of meals, food combinations, and nutritional value.
                  Respond with 3-5 bullet points, each starting with "•".
                  Keep each point specific and encouraging.`),

        // What could be improved
        makeQuery(`Based on this food journal: ${journalText}
                  Additional considerations: ${considerations}
                  
                  Analyze what I could improve in my nutrition, focusing specifically on:
                  1. Missing or underrepresented macronutrients (proteins, carbs, fats)
                  2. Missing or underrepresented micronutrients (vitamins, minerals)
                  3. Meal timing and portion distribution
                  
                  For each point:
                  - Specify which exact nutrients are missing
                  - Explain why they're important
                  - Reference specific meals where they could have been added
                  
                  Respond with 3-5 bullet points, each starting with "•".
                  Keep the tone constructive and specific.`),

        // Things to try
        makeQuery(`Based on this food journal: ${journalText}
                  Additional considerations: ${considerations}
                  
                  Suggest exactly 2 concrete meal or snack ideas I could try.
                  For each suggestion:
                  1. Make it a complete, detailed meal/snack description
                  2. Explain why it would work well with my current eating patterns
                  3. List the specific macro and micronutrients it would add to my diet
                  4. Reference how it complements or improves upon a specific meal in my journal
                  
                  Format as 2 bullet points, each starting with "•".
                  Make each suggestion detailed but practical.
                  Keep the tone personal and encouraging.`)
      ]);

      console.log('Responses:', { greatResponse, improveResponse, tryResponse }); // Debug log

      // Process responses and update state
      setRecommendations({
        great: greatResponse ? greatResponse.split('\n').filter(item => item.trim().startsWith('•')) : [],
        improve: improveResponse ? improveResponse.split('\n').filter(item => item.trim().startsWith('•')) : [],
        try: tryResponse ? tryResponse.split('\n').filter(item => item.trim().startsWith('•')) : []
      });

    } catch (error) {
      console.error('Error updating recommendations:', error);
      Alert.alert(
        'Error',
        'Failed to update recommendations. Please check your API key and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Considerations Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Considerations</Text>
        <TextInput
          style={styles.input}
          value={considerations}
          onChangeText={setConsiderations}
          placeholder="Enter any dietary restrictions, preferences, or goals..."
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          editable={true}
        />

        {/* API Key Input */}
        <Text style={[styles.label, { marginTop: 16 }]}>OnDemand API Key</Text>
        <TextInput
          style={[
            styles.input, 
            { minHeight: 40 },
            hasAttemptedUpdate && !apiKey && styles.inputError
          ]}
          value={apiKey}
          onChangeText={setApiKey}
          placeholder="Enter your API key..."
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Update Button */}
        <TouchableOpacity 
          style={[
            styles.button,
            !apiKey && styles.buttonDisabled
          ]}
          onPress={handleUpdateRecommendations}
        >
          <Text style={styles.buttonText}>Update Recommendations</Text>
        </TouchableOpacity>
      </View>

      {/* Great Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: '#2ECC71' }]}>What you did great!</Text>
        <View style={[styles.card, styles.greatCard]}>
          {isLoading ? (
            <ActivityIndicator color="#2ECC71" />
          ) : (
            <Markdown 
              style={{
                body: styles.cardText,
                bullet: styles.greatText,
                paragraph: styles.greatText
              }}
            >
              {recommendations.great.join('\n')}
            </Markdown>
          )}
        </View>
      </View>

      {/* Improve Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: '#E74C3C' }]}>What you could improve upon</Text>
        <View style={[styles.card, styles.improveCard]}>
          {isLoading ? (
            <ActivityIndicator color="#E74C3C" />
          ) : (
            <Markdown 
              style={{
                body: styles.cardText,
                bullet: styles.improveText,
                paragraph: styles.improveText
              }}
            >
              {recommendations.improve.join('\n')}
            </Markdown>
          )}
        </View>
      </View>

      {/* Try Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: '#3498DB' }]}>Things you could try</Text>
        <View style={[styles.card, styles.tryCard]}>
          {isLoading ? (
            <ActivityIndicator color="#3498DB" />
          ) : (
            <Markdown 
              style={{
                body: styles.cardText,
                bullet: styles.tryText,
                paragraph: styles.tryText
              }}
            >
              {recommendations.try.join('\n')}
            </Markdown>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#E74C3C',
    borderWidth: 2,
    backgroundColor: '#FFF5F5',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
  },
  cardText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    lineHeight: 24,
  },
  greatCard: {
    borderLeftColor: '#2ECC71',
    backgroundColor: '#F0FFF4',
  },
  greatText: {
    color: '#2C7A44',
  },
  improveCard: {
    borderLeftColor: '#E74C3C',
    backgroundColor: '#FFF5F5',
  },
  improveText: {
    color: '#C53030',
  },
  tryCard: {
    borderLeftColor: '#3498DB',
    backgroundColor: '#EBF8FF',
  },
  tryText: {
    color: '#2B6CB0',
  },
  markdownBody: {
    fontSize: 16,
    lineHeight: 24,
  },
});
