import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import { StatusBar } from 'expo-status-bar';
import * as Clipboard from 'expo-clipboard';

function extractVideoId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function App() {
  const [url, setUrl] = useState('');
  const [transcript, setTranscript] = useState('');
  const [token, setToken] = useState('');
  const [summary, setSummary] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [hasResults, setHasResults] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(transcript);
    Alert.alert('Copied', 'Transcript copied to clipboard!');
  };

  const handleSubmit = async () => {
    setError('');
    setTranscript('');
    setSummary('');
    setKeywords([]);
    setActions([]);
    setHasResults(false);
    setToken('');
    setLoading(true);

    if (!url.trim()) {
      setError('Please enter a YouTube URL.');
      setLoading(false);
      return;
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      setError('Invalid YouTube URL.');
      setLoading(false);
      return;
    }

    try {
      // 1. Fetch transcript
      console.log('Fetching transcript for video:', videoId);
      const transcriptRes = await axios.post('https://yt.alanbouo.com/transcript', {
        video_id: videoId
      });

      const transcriptData = transcriptRes.data.transcript;
      setTranscript(transcriptData);

      // 2. Request analysis
      console.log('Requesting analysis...');
      const analyzeRes = await axios.post('https://yt-summary.alanbouo.com/analyze', {
        video_id: videoId,
        transcript: transcriptData
      });

      const analyzeToken = analyzeRes.data.token;
      setToken(analyzeToken);
      if (!analyzeToken) {
        throw new Error('No token received from analysis');
      }

      // Wait 5 seconds instead of 10 for mobile experience
      await delay(5000);

      // 3. Get results with token (try multiple endpoints if needed)
      console.log('Fetching results...');
      let resultRes;

      // Try the result endpoint first
      try {
        resultRes = await axios.get('https://yt-summary.alanbouo.com/result', {
          params: { token: analyzeToken }
        });
      } catch (resultErr: any) {
        console.log('Result endpoint failed, trying alternative endpoints...');

        // Try alternative endpoints
        const endpoints = [
          'https://yt-summary.alanbouo.com/results',
          'https://yt-summary.alanbouo.com/analysis/result',
          'https://yt-summary.alanbouo.com/analyze/result'
        ];

        for (const endpoint of endpoints) {
          try {
            resultRes = await axios.get(endpoint, {
              params: { token: analyzeToken }
            });
            console.log(`Success with endpoint: ${endpoint}`);
            break;
          } catch (altErr: any) {
            console.log(`Alternative endpoint ${endpoint} failed:`, altErr.response?.status);
          }
        }

        if (!resultRes) {
          throw resultErr; // Throw original error if all alternatives failed
        }
      }

      setSummary(resultRes.data.summary || 'No summary available');
      setKeywords(resultRes.data.keywords || []);
      setActions(resultRes.data.actions || []);
      setHasResults(true);

    } catch (err: any) {
      console.error('API Error:', err);
      let errorMessage = 'Unknown error occurred';

      if (err.response) {
        const status = err.response.status;
        const detail = err.response.data?.detail || JSON.stringify(err.response.data);
        errorMessage = `API Error (${status}): ${detail}`;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <StatusBar style="auto" />

      <View style={styles.headerContainer}>
        <Text style={styles.title}>YouTube Transcript Tool</Text>
        <Text style={styles.subtitle}>
          Paste a YouTube URL to get transcript and AI summary
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>YouTube URL</Text>
        <TextInput
          style={styles.textInput}
          value={url}
          onChangeText={setUrl}
          placeholder="https://www.youtube.com/watch?v=..."
          placeholderTextColor="#999"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <View style={styles.buttonContent}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.buttonText}>Traitement en cours...</Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>Get Transcript & Summary</Text>
        )}
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      {hasResults && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Summary</Text>
          <Text style={styles.sectionText}>
            {summary}
          </Text>

          {keywords.length > 0 && (
            <>
              <Text style={styles.sectionSubtitle}>Keywords:</Text>
              {keywords.map((keyword, index) => (
                <Text key={index} style={styles.listItem}>
                  • {keyword}
                </Text>
              ))}
            </>
          )}

          {actions.length > 0 && (
            <>
              <Text style={styles.sectionSubtitle}>Suggested Actions:</Text>
              {actions.map((action, index) => (
                <Text key={index} style={styles.listItem}>
                  • {action}
                </Text>
              ))}
            </>
          )}
        </View>
      )}

      {transcript && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transcript</Text>
          <Text style={styles.transcriptText} selectable={true}>
            {transcript}
          </Text>
          <TouchableOpacity onPress={handleCopy} style={styles.copyButton}>
            <Text style={styles.copyButtonText}>Copy Transcript</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 50,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  sectionSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  transcriptText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  listItem: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    paddingLeft: 10,
  },
  copyButton: {
    marginTop: 15,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  copyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
