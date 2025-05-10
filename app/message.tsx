// App.tsx or HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Linking,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const App = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<{ to: string; message: string; time: string }[]>([]);

  // Load message history on mount
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('smsHistory');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    })();
  }, []);

  const sendSMS = async () => {
    if (!phoneNumber || !message) {
      Alert.alert('Error', 'Please enter both phone number and message.');
      return;
    }

    const url = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;

    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);

      const newEntry = {
        to: phoneNumber,
        message,
        time: new Date().toLocaleString(),
      };

      const updatedHistory = [newEntry, ...history];
      setHistory(updatedHistory);
      await AsyncStorage.setItem('smsHistory', JSON.stringify(updatedHistory));

      setMessage('');
      setPhoneNumber('');
    } else {
      Alert.alert('Error', 'SMS not supported on this device.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Send SMS</Text>
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        keyboardType="phone-pad"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Message"
        multiline
        value={message}
        onChangeText={setMessage}
      />
      <TouchableOpacity style={styles.button} onPress={sendSMS}>
        <Text style={styles.buttonText}>Send SMS</Text>
      </TouchableOpacity>

      <Text style={styles.historyTitle}>Message History</Text>
      <FlatList
        data={history}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.historyItem}>
            <Text style={styles.historyTo}>To: {item.to}</Text>
            <Text>{item.message}</Text>
            <Text style={styles.historyTime}>{item.time}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  historyTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  historyItem: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  historyTo: { fontWeight: 'bold', marginBottom: 5 },
  historyTime: { color: '#777', fontSize: 12, marginTop: 5 },
});
