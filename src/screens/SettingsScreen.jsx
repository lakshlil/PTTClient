import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
    return (
        <SafeAreaView style={{
            flex: 1,
            paddingTop: Platform.OS === 'android' ? 4 : 0,
        }}
        >
            <View style={styles.container}>
                <Text variant="titleLarge">⚙️ Settings</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
