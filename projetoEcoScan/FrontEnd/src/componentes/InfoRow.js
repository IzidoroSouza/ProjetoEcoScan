// FrontEnd/src/components/InfoRow.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../styles/AppStyles';

const InfoRow = ({ label, value }) => (
    <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value || "N/A"}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.marginBottomItem,
    },
    label: {
        fontSize: typography.fontSizeLabel,
        fontWeight: typography.fontWeightBold,
        color: colors.textPrimary,
        marginBottom: spacing.small / 2,
    },
    value: {
        fontSize: typography.fontSizeValue,
        color: colors.textSecondary,
    },
});

export default InfoRow;