// FrontEnd/src/components/SuggestionForm.js
import React from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../styles/AppStyles';

const SuggestionForm = ({ suggestionData, onSuggestionDataChange, onSubmit, onCancel }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sugerir Informações do Produto</Text>
            <Text style={styles.barcodeLabel}>Código de Barras: {suggestionData.barcode}</Text>

            <TextInput
                style={styles.input}
                placeholder="Nome do Produto*"
                value={suggestionData.productName}
                onChangeText={text => onSuggestionDataChange('productName', text)}
                placeholderTextColor={colors.textSecondary}
            />
            <TextInput
                style={styles.input}
                placeholder="Material Principal*"
                value={suggestionData.material}
                onChangeText={text => onSuggestionDataChange('material', text)}
                placeholderTextColor={colors.textSecondary}
            />
            <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Dicas de Descarte (Opcional)"
                value={suggestionData.disposalTips}
                onChangeText={text => onSuggestionDataChange('disposalTips', text)}
                multiline
                numberOfLines={3}
                placeholderTextColor={colors.textSecondary}
            />
            <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Informações de Reciclagem (Opcional)"
                value={suggestionData.recyclingInfo}
                onChangeText={text => onSuggestionDataChange('recyclingInfo', text)}
                multiline
                numberOfLines={3}
                placeholderTextColor={colors.textSecondary}
            />
            <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Impacto/Sustentabilidade (Opcional)"
                value={suggestionData.sustainabilityImpact}
                onChangeText={text => onSuggestionDataChange('sustainabilityImpact', text)}
                multiline
                numberOfLines={3}
                placeholderTextColor={colors.textSecondary}
            />
            <View style={styles.buttonWrapper}>
                <Button title="Enviar Sugestão" onPress={onSubmit} color={colors.primary} />
            </View>
            <View style={styles.buttonWrapper}>
                <Button title="Cancelar" onPress={onCancel} color={colors.cancel} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        padding: spacing.medium,
        backgroundColor: colors.surfaceForm,
        borderRadius: spacing.small,
        marginTop: spacing.small,
        marginBottom: spacing.medium,
    },
    title: {
        fontSize: typography.fontSizeSuggestionTitle,
        fontWeight: typography.fontWeightBold,
        color: colors.primary,
        marginBottom: spacing.medium,
        textAlign: 'center',
    },
    barcodeLabel: {
        fontSize: typography.fontSizeLabel,
        color: colors.textSecondary,
        marginBottom: spacing.medium,
    },
    input: {
        backgroundColor: colors.inputBackground,
        color: colors.textPrimary,
        paddingHorizontal: spacing.inputHorizontalPadding,
        paddingVertical: spacing.inputVerticalPadding,
        borderRadius: spacing.small / 2,
        marginBottom: spacing.marginBottomItem,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        fontSize: typography.fontSizeInput,
    },
    multilineInput: {
        minHeight: 70,
        textAlignVertical: 'top', // Para Android alinhar texto no topo
    },
    buttonWrapper: { // Adicionado para dar margem entre os botões
        marginTop: spacing.marginBottomItem,
    },
});

export default SuggestionForm;