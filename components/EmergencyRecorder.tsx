import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { CameraView, CameraType } from 'expo-camera';
import { Video, Upload, CircleAlert as AlertCircle, CircleCheck as CheckCircle } from 'lucide-react-native';
import { supabaseService } from '@/services/supabaseService';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import * as FileSystem from 'expo-file-system';

const { width } = Dimensions.get('window');

interface EmergencyRecorderProps {
  recordId: string;
  onRecordingComplete: (mediaUrl: string) => void;
  onError: (error: string) => void;
  onCancel?: () => void;
}

interface RecordingState {
  isRecording: boolean;
  isUploading: boolean;
  progress: number;
  uploadProgress: number;
  error: string | null;
  completed: boolean;
}

export function EmergencyRecorder({ 
  recordId, 
  onRecordingComplete, 
  onError,
  onCancel 
}: EmergencyRecorderProps) {
  // State management
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    isUploading: false,
    progress: 0,
    uploadProgress: 0,
    error: null,
    completed: false,
  });

  // Refs for camera and timers
  const cameraRef = useRef<CameraView | null>(null);
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);
  const progressTimer = useRef<NodeJS.Timeout | null>(null);

  // Animation values
  const pulseScale = useSharedValue(1);
  const recordingOpacity = useSharedValue(1);

  // Cleanup function
  const cleanup = () => {
    if (recordingTimer.current) {
      clearTimeout(recordingTimer.current);
      recordingTimer.current = null;
    }
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
  };

  // Auto-start recording when component mounts
  useEffect(() => {
    startEmergencyRecording();
    
    // Cleanup on unmount
    return cleanup;
  }, []);

  // Pulsing animation for recording indicator
  useEffect(() => {
    if (state.isRecording) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        false
      );
      
      recordingOpacity.value = withRepeat(
        withSequence(
          withTiming(0.7, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        false
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 300 });
      recordingOpacity.value = withTiming(1, { duration: 300 });
    }
  }, [state.isRecording]);

  // Animated styles
  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const animatedRecordingStyle = useAnimatedStyle(() => ({
    opacity: recordingOpacity.value,
  }));

  /**
   * Main function to start emergency recording
   * Handles the complete flow: recording → upload → completion
   */
  const startEmergencyRecording = async () => {
    try {
      setState(prev => ({ 
        ...prev, 
        isRecording: true, 
        error: null,
        progress: 0 
      }));

      // Check if camera is available (mainly for native platforms)
      if (Platform.OS !== 'web' && !cameraRef.current) {
        throw new Error('Camera not available');
      }

      // Start progress tracking (10 seconds = 100%)
      let currentProgress = 0;
      progressTimer.current = setInterval(() => {
        currentProgress += 1; // Increment by 1% every 100ms
        setState(prev => ({ ...prev, progress: Math.min(currentProgress, 100) }));
        
        if (currentProgress >= 100) {
          clearInterval(progressTimer.current!);
        }
      }, 100);

      let videoUri: string;

      if (Platform.OS === 'web') {
        // Web implementation using MediaRecorder API
        videoUri = await recordVideoWeb();
      } else {
        // Native implementation using Expo Camera
        videoUri = await recordVideoNative();
      }

      // Stop recording state and start upload
      setState(prev => ({ 
        ...prev, 
        isRecording: false, 
        isUploading: true,
        progress: 100 
      }));

      // Upload to Supabase Storage
      const downloadURL = await uploadRecording(videoUri);

      // Mark as completed
      setState(prev => ({ 
        ...prev, 
        isUploading: false, 
        completed: true,
        uploadProgress: 100 
      }));

      // Notify parent component
      onRecordingComplete(downloadURL);

    } catch (error) {
      console.error('Emergency recording failed:', error);
      cleanup();
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to record emergency video';
      
      setState(prev => ({ 
        ...prev, 
        isRecording: false, 
        isUploading: false,
        error: errorMessage 
      }));
      
      onError(errorMessage);
    }
  };

  /**
   * Record video using Expo Camera (Native platforms)
   */
  const recordVideoNative = async (): Promise<string> => {
    if (!cameraRef.current) {
      throw new Error('Camera reference not available');
    }

    // 1. Start recording and store the promise. Do NOT await it yet.
    const recordingPromise = cameraRef.current.recordAsync({
      quality: '720p',
      maxDuration: 10, // Fallback safety limit
    });

    // 2. Set a timeout to explicitly stop the recording after 10 seconds.
    // This action will cause the recordingPromise to resolve.
    recordingTimer.current = setTimeout(async () => {
      try {
        // Ensure cameraRef.current exists and recording is still active before stopping
        if (cameraRef.current && state.isRecording) {
          await cameraRef.current.stopRecording();
        }
      } catch (error) {
        console.warn('Error stopping recording:', error);
      }
    }, 10000);

    // 3. Await the promise returned by recordAsync. This will only resolve
    // once stopRecording() has been called (either by our timeout or maxDuration).
    const video = await recordingPromise;

    // Clean up the timer immediately after the recording promise resolves
    // to prevent it from firing if the recording stopped earlier.
    if (recordingTimer.current) {
      clearTimeout(recordingTimer.current);
      recordingTimer.current = null;
    }

    return video.uri;
  };

  /**
   * Record video using MediaRecorder API (Web platform)
   */
  const recordVideoWeb = async (): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        // Request camera and microphone access
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true,
        });

        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp9,opus',
        });

        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          
          // Stop all tracks to release camera/microphone
          stream.getTracks().forEach(track => track.stop());
          
          resolve(url);
        };

        mediaRecorder.onerror = (error) => {
          stream.getTracks().forEach(track => track.stop());
          reject(error);
        };

        // Start recording
        mediaRecorder.start();

        // Stop after 10 seconds
        recordingTimer.current = setTimeout(() => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
          }
        }, 10000);

      } catch (error) {
        reject(new Error('Failed to access camera/microphone'));
      }
    });
  };

  /**
   * Upload recorded video to Supabase Storage
   */
  const uploadRecording = async (videoUri: string): Promise<string> => {
    try {
const fixedUri = Platform.OS !== 'web' && !videoUri.startsWith('file://')
  ? `file://${videoUri}`
  : videoUri;

const downloadURL = await supabaseService.uploadRecording(
  recordId,
  fixedUri,
  (progress) => {
    setState(prev => ({ 
      ...prev, 
      uploadProgress: progress.percentage 
    }));
  }
);

      return downloadURL;
    } catch (error) {
      throw new Error('Failed to upload recording to cloud storage');
    }
  };

  /**
   * Get current status text based on recording state
   */
  const getStatusText = () => {
    if (state.error) {
      return 'Recording Failed';
    }
    if (state.completed) {
      return 'Evidence Secured';
    }
    if (state.isUploading) {
      return `Uploading... ${Math.round(state.uploadProgress)}%`;
    }
    if (state.isRecording) {
      return 'Recording Evidence...';
    }
    return 'Preparing...';
  };

  /**
   * Get status icon based on current state
   */
  const getStatusIcon = () => {
    if (state.error) {
      return <AlertCircle size={32} color="#FFFFFF" strokeWidth={2} />;
    }
    if (state.completed) {
      return <CheckCircle size={32} color="#FFFFFF" strokeWidth={2} />;
    }
    if (state.isUploading) {
      return <Upload size={32} color="#FFFFFF" strokeWidth={2} />;
    }
    return <Video size={32} color="#FFFFFF" strokeWidth={2} />;
  };

  return (
    <View style={styles.container}>
      {/* Camera View for Native Platforms */}
      {Platform.OS !== 'web' && (
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
        />
      )}

      {/* Recording Overlay */}
      <View style={styles.overlay}>
        {/* Status Indicator */}
        <Animated.View style={[styles.statusIndicator, animatedIndicatorStyle]}>
          {getStatusIcon()}
        </Animated.View>
        
        {/* Status Text */}
        <Animated.View style={animatedRecordingStyle}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </Animated.View>
        
        {/* Progress Section */}
        <View style={styles.progressSection}>
          {/* Recording Progress */}
          {(state.isRecording || state.progress > 0) && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressLabel}>Recording Progress</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[styles.progressFill, { width: `${state.progress}%` }]} 
                />
              </View>
              <Text style={styles.progressText}>{Math.round(state.progress)}%</Text>
            </View>
          )}

          {/* Upload Progress */}
          {state.isUploading && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressLabel}>Upload Progress</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[styles.progressFill, { width: `${state.uploadProgress}%` }]} 
                />
              </View>
              <Text style={styles.progressText}>{Math.round(state.uploadProgress)}%</Text>
            </View>
          )}
        </View>

        {/* Details Panel */}
        <View style={styles.detailsPanel}>
          <View style={styles.detailRow}>
            <Video size={16} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.detailText}>
              Duration: 10 seconds
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Upload size={16} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.detailText}>
              Storage: Secure cloud backup
            </Text>
          </View>
          {state.error && (
            <View style={styles.errorPanel}>
              <AlertCircle size={16} color="#FF6B6B" strokeWidth={2} />
              <Text style={styles.errorText}>{state.error}</Text>
            </View>
          )}
        </View>

        {/* Emergency Notice */}
        <View style={styles.emergencyNotice}>
          <Text style={styles.emergencyText}>
            🚨 EMERGENCY RECORDING ACTIVE
          </Text>
          <Text style={styles.emergencySubtext}>
            Evidence is being captured and securely stored
          </Text>
        </View>
      </View>
    </View>
  );
}











const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  statusIndicator: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ad2831',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#ad2831',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  statusText: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 32,
  },
  progressSection: {
    width: '100%',
    marginBottom: 32,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#CCCCCC',
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ad2831',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  detailsPanel: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  errorPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FF6B6B',
    marginLeft: 8,
    flex: 1,
  },
  emergencyNotice: {
    alignItems: 'center',
    backgroundColor: 'rgba(173, 40, 49, 0.9)',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  emergencyText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  emergencySubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
});