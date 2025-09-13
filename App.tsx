import React, { useState } from 'react';
import { useWindowDimensions } from 'react-native';
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
import { MaterialIcons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

function extractVideoId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const TRUNCATE_LENGTH = 500;

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
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(false);

  const [urlValid, setUrlValid] = useState(false);

  const validateUrl = (url: string) => {
    if (!url.trim()) return false;
    return url.includes('youtube.com/watch') || url.includes('youtu.be/');
  };

  const handleChangeText = (value: string) => {
    setUrl(value);
    setUrlValid(validateUrl(value));
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        setUrl(text);
        setUrlValid(validateUrl(text));
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to paste');
    }
  };

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

  const { width } = useWindowDimensions();
  const scale = Math.min(width / 375, 1.5);
  const titleFontSize = Math.max(20, 24 * scale);
  const subtitleFontSize = Math.max(14, 16 * scale);

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <StatusBar style="auto" />

      <View style={styles.headerContainer}>
        <View style={styles.logoContainer}>
          <MaterialCommunityIcons name="youtube" size={40} color="red" />
          <View style={styles.brandTitles}>
            <Text style={styles.title}>YouTube Transcript Tool</Text>
            <Text style={styles.subtitle}>
              Paste a YouTube URL to get transcript and AI summary
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>YouTube URL</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInputExpanded}
            value={url}
            onChangeText={handleChangeText}
            placeholder="https://www.youtube.com/watch?v=..."
            placeholderTextColor="#999"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity onPress={pasteFromClipboard} style={styles.pasteButton}>
            <Text style={styles.pasteButtonText}>Paste</Text>
          </TouchableOpacity>
        </View>
        {url.trim() && (
          <View style={styles.validationContainer}>
            <MaterialIcons
              name={urlValid ? 'check-circle' : 'error-outline'}
              size={20}
              color={urlValid ? 'green' : 'red'}
            />
            <Text style={styles.validationText}>
              {urlValid ? 'URL valide' : 'URL invalide'}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Processing...' : 'Get Transcript & Summary'}
        </Text>
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      {hasResults && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="lightbulb" size={24} color="#007AFF" />
            <Text style={styles.sectionTitle}>AI Summary</Text>
          </View>
          <Text style={styles.sectionText}>
            {summary}
          </Text>

          <View style={styles.divider} />

          {keywords.length > 0 && (
            <>
              <View style={styles.subHeader}>
                <MaterialIcons name="local-offer" size={20} color="#007AFF" />
                <Text style={styles.subTitle}>Keywords:</Text>
              </View>
              {keywords.map((keyword, index) => (
                <Text key={index} style={styles.listItem}>
                  • {keyword}
                </Text>
              ))}

              {actions.length > 0 && <View style={styles.divider} />}
            </>
          )}

          {actions.length > 0 && (
            <>
              <View style={styles.subHeader}>
                <MaterialIcons name="list-alt" size={20} color="#007AFF" />
                <Text style={styles.subTitle}>Suggested Actions:</Text>
              </View>
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
          <View style={styles.sectionHeader}>
            <MaterialIcons name="description" size={24} color="#007AFF" />
            <Text style={styles.sectionTitle}>Transcript</Text>
          </View>
          <Text style={styles.transcriptText} selectable={true}>
            {isTranscriptExpanded ? transcript : transcript.substring(0, TRUNCATE_LENGTH) + (transcript.length > TRUNCATE_LENGTH ? '...' : '')}
          </Text>
          {transcript.length > TRUNCATE_LENGTH && (
            <TouchableOpacity onPress={() => setIsTranscriptExpanded(!isTranscriptExpanded)} style={styles.expandButton}>
              <View style={styles.expandButtonContent}>
                <MaterialIcons name={isTranscriptExpanded ? "expand-less" : "expand-more"} size={24} color="#007AFF" />
                <Text style={styles.expandButtonText}>{isTranscriptExpanded ? "Masquer" : "Voir plus"}</Text>
              </View>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleCopy} style={styles.copyButton}>
            <Text style={styles.copyButtonText}>Copy Transcript</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
    <View style={styles.footer}>
      <TouchableOpacity style={styles.footerButton} onPress={() => Alert.alert('Under Development', 'This feature is coming soon!')}>
        <MaterialIcons name="chat" size={24} color="#fff" />
        <Text style={styles.footerButtonText}>Chat</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.footerButton} onPress={() => Alert.alert('Under Development', 'This feature is coming soon!')}>
        <MaterialIcons name="history" size={24} color="#fff" />
        <Text style={styles.footerButtonText}>History</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.footerButton} onPress={() => Alert.alert('Under Development', 'This feature is coming soon!')}>
        <MaterialIcons name="settings" size={24} color="#fff" />
        <Text style={styles.footerButtonText}>Settings</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.footerButton} onPress={() => Alert.alert('Under Development', 'This feature is coming soon!')}>
        <MaterialIcons name="help-outline" size={24} color="#fff" />
        <Text style={styles.footerButtonText}>Help</Text>
      </TouchableOpacity>
    </View>
    </View>
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
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitles: {
    flex: 1,
    alignItems: 'center',
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
    marginLeft: 10,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
    marginBottom: 15,
    marginLeft: 10,
  },
  expandButton: {
    marginVertical: 10,
    alignSelf: 'center',
  },
  expandButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandButtonText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 8,
  },
  menuDropdown: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    padding: 10,
    zIndex: 999,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInputExpanded: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  pasteButton: {
    marginLeft: 10,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  pasteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  validationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  validationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  mainContainer: {
    flex: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  brandTitles: {
    marginLeft: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  footerButton: {
    alignItems: 'center',
  },
  footerButtonText: {
    fontSize: 12,
    color: '#fff',
  },
});
