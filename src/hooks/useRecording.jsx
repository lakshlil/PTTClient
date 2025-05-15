import { useState, useRef } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

const useRecording = (socket) => {
  const [recording, setRecording] = useState(false);
  const [audioUri, setAudioUri] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async (permissionGranted) => {
    if (!permissionGranted) {
      throw new Error('Audio recording permission is required.');
    }

    setRecording(true);

    if (Platform.OS === 'web') {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result.split(',')[1];
          socket.emit('send_audio', { audioBase64: base64, senderId: socket.id });
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorder.start();
    } else {
      const recordingInstance = new Audio.Recording();
      await recordingInstance.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recordingInstance.startAsync();
      setAudioUri(recordingInstance);
    }
  };

  const stopRecording = async (socket) => {
    setRecording(false);

    setTimeout(async () => {
      if (Platform.OS === 'web') {
        mediaRecorderRef.current.stop();
      } else if (audioUri) {
        await audioUri.stopAndUnloadAsync();
        const uri = audioUri.getURI();
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        socket.emit('send_audio', { audioBase64: base64, senderId: socket.id });
        setAudioUri(null);
      }
    }, 250);
  };

  return { recording, startRecording, stopRecording };
};

export default useRecording;
