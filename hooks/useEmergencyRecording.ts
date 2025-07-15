import { useState, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import { CameraView } from 'expo-camera';
import { supabaseService, UploadProgress } from '@/services/supabaseService';
import { useSupabaseAuth } from './useSupabaseAuth';

export interface RecordingState {
  isRecording: boolean;
  recordingType: 'video' | null;
  progress: number;
  uploadProgress: UploadProgress | null;
  error: string | null;
}

export function useEmergencyRecording() {
  const { ensureAuthenticated } = useSupabaseAuth();
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    recordingType: null,
    progress: 0,
    uploadProgress: null,
    error: null,
  });

  const cameraRef = useRef<CameraView | null>(null);
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);

  /**
   * Start video recording with audio
   * Returns the download URL of the uploaded video
   */
  const startVideoRecording = async (recordId: string): Promise<string | null> => {
    try {
      // Ensure user is authenticated
      await ensureAuthenticated();

      setState(prev => ({
        ...prev,
        isRecording: true,
        recordingType: 'video',
        error: null,
        progress: 0,
      }));

      let videoUri: string;

      if (Platform.OS === 'web') {
        videoUri = await recordVideoWeb();
      } else {
        videoUri = await recordVideoNative();
      }

      // Upload to Supabase Storage
      const downloadURL = await supabaseService.uploadRecording(
        recordId,
        videoUri,
        (progress) => {
          setState(prev => ({ ...prev, uploadProgress: progress }));
        }
      );

      setState(prev => ({
        ...prev,
        isRecording: false,
        recordingType: null,
        uploadProgress: null,
        progress: 100,
      }));

      return downloadURL;
    } catch (error) {
      console.error('Failed to start video recording:', error);
      setState(prev => ({
        ...prev,
        isRecording: false,
        recordingType: null,
        error: error instanceof Error ? error.message : 'Failed to record video',
      }));
      return null;
    }
  };

  /**
   * Record video using Expo Camera (Native platforms)
   */
  const recordVideoNative = async (): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!cameraRef.current) {
          throw new Error('Camera not available');
        }

        // Start progress timer
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += 10;
          setState(prev => ({ ...prev, progress }));
          if (progress >= 100) {
            clearInterval(progressInterval);
          }
        }, 1000);

        // Start recording
        const video = await cameraRef.current.recordAsync({
          maxDuration: 10,
          quality: '720p',
        });

        // Set timeout to stop recording
        recordingTimer.current = setTimeout(async () => {
          try {
            if (cameraRef.current) {
              await cameraRef.current.stopRecording();
            }
          } catch (error) {
            console.warn('Error stopping recording:', error);
          }
        }, 10000);

        clearInterval(progressInterval);
        resolve(video.uri);
      } catch (error) {
        reject(error);
      }
    });
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

        // Progress tracking
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += 10;
          setState(prev => ({ ...prev, progress }));
          if (progress >= 100) {
            clearInterval(progressInterval);
          }
        }, 1000);

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          clearInterval(progressInterval);
          const blob = new Blob(chunks, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          
          // Stop all tracks to release camera/microphone
          stream.getTracks().forEach(track => track.stop());
          
          resolve(url);
        };

        mediaRecorder.onerror = (error) => {
          clearInterval(progressInterval);
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
   * Reset recording state
   */
  const resetState = () => {
    if (recordingTimer.current) {
      clearTimeout(recordingTimer.current);
      recordingTimer.current = null;
    }

    setState({
      isRecording: false,
      recordingType: null,
      progress: 0,
      uploadProgress: null,
      error: null,
    });
  };

  return {
    state,
    startVideoRecording,
    resetState,
    cameraRef,
  };
}