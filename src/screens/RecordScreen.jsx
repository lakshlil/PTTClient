import React, { useState, useEffect, useRef } from 'react';
import { View, Platform, Alert, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Button, Text, ActivityIndicator, IconButton } from 'react-native-paper';
import socket from '../Socket';

const RecordScreen = () => {
    const [recording, setRecording] = useState(false);
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [audioUri, setAudioUri] = useState(null);
    const [socketId, setSocketId] = useState(null);
    const isConnected = socket.active;

    const scale = 2; // Change this to scale the button (1 = default size)
    const baseSize = 160;
    const circleSize = baseSize * scale;


    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    useEffect(() => {
        if (Platform.OS !== 'web') {
            (async () => {
                const { status } = await Audio.requestPermissionsAsync();
                setPermissionGranted(status === 'granted');
            })();
        } else {
            setPermissionGranted(true);
        }
    }, []);

    useEffect(() => {
        socket.on('connect', () => {
            setSocketId(socket.id);
        });

        socket.on('receive_audio', (data) => {
            if (data.senderId !== socket.id) {
                playAudio(data.audioBase64);
            }
        });

        return () => {
            socket.off('receive_audio');
            socket.off('connect');
            socket.off('disconnect');
        };
    }, []);

    const playAudio = async (base64) => {
        const uri = `data:audio/webm;base64,${base64}`;
        const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true });
        await sound.playAsync();
    };

    const startRecording = async () => {
        if (!permissionGranted) {
            Alert.alert('Permission Denied', 'Audio recording permissions are required.');
            return;
        }

        setRecording(true);

        if (Platform.OS === 'web') {
            try {
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
            } catch (err) {
                Alert.alert('Error', 'Web recording failed. This may require HTTPS and permissions.');
                console.error(err);
            }
        } else {
            const recordingInstance = new Audio.Recording();
            await recordingInstance.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
            await recordingInstance.startAsync();
            setAudioUri(recordingInstance);
        }
    };

    const stopRecording = async () => {
        setRecording(false);

        if (Platform.OS === 'web') {
            mediaRecorderRef.current?.stop();
        } else if (audioUri) {
            await audioUri.stopAndUnloadAsync();
            const uri = audioUri.getURI();
            const base64 = await FileSystem.readAsStringAsync(uri, {
                encoding: FileSystem.EncodingType.Base64,
            });
            socket.emit('send_audio', { audioBase64: base64, senderId: socket.id });
            setAudioUri(null);
        }
    };

    return (

        <SafeAreaView style={styles.safeArea}>
            <View style={[styles.statusBar, { backgroundColor: isConnected ? '#2ecc71' : '#e74c3c' }]}>
                <Text style={styles.statusText}>
                    {isConnected ? 'Connected to Server' : 'Disconnected'}
                </Text>
            </View>
            <View style={styles.micContainer}>
                <Pressable
                    onPressIn={startRecording}
                    onPressOut={stopRecording}
                    style={({ pressed }) => [
                        styles.micCircle,
                        {
                            width: circleSize,
                            height: circleSize,
                            borderRadius: circleSize / 2,
                            borderColor: pressed ? '#06402B' : '#FF0000',
                            
                        },
                    ]}
                >
                    <IconButton
                        icon="microphone"
                        size={32 * scale}
                        iconColor="#000"
                        style={{ margin: 0 }}
                    />
                </Pressable>
            </View>


            {!isConnected && (
                <ActivityIndicator animating={true} style={{ marginTop: 20 }} />
            )}
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f2f2',
    },

    safeArea: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 4 : 0,
    },

    statusBar: {
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2ecc71',
    },

    statusText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },

    micContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    micCircle: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        backgroundColor: 'transparent',
        transition: 'border-color 0.2s',
        cursor: Platform.OS === 'web' ? 'pointer' : 'default',
    },

    micIcon: {
        margin: 0,
        alignSelf: 'center',
    },
});

export default RecordScreen;
