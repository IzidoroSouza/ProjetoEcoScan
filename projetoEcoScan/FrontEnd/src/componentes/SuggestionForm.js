// FrontEnd/src/components/SuggestionForm.js
import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, Platform } from 'react-native'; // Adicionado Platform
import { Picker } from '@react-native-picker/picker';
import { colors, typography, spacing } from '../styles/AppStyles';

// Esta lista deve corresponder às MaterialNameKey "amigáveis" no seu AppDbContext
export const MATERIAL_OPTIONS_FOR_FORM = [
    { label: "Selecione um material*", value: "" },
    { label: "Plástico", value: "Plástico" },
    { label: "Vidro", value: "Vidro" },
    { label: "Papel", value: "Papel" },
    { label: "Papelão", value: "Papelão" },
    { label: "Metal (Aço/Ferro)", value: "Metal" },
    { label: "Alumínio", value: "Alumínio" },
    { label: "Borracha", value: "Borracha" },
    { label: "Orgânico", value: "Orgânico" },
    { label: "Lixo Eletrônico", value: "Eletrônico" },
    // Adicione mais materiais amigáveis conforme necessário
    { label: "Outro (descreva se necessário)", value: "Outro" },
];

const SuggestionForm = ({ suggestionData, onSuggestionDataChange, onSubmit, onCancel }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sugerir Novo Produto</Text>
            <Text style={styles.barcodeLabel}>Código de Barras: {suggestionData.barcode}</Text>

            <TextInput
                style={styles.input}
                placeholder="Nome do Produto*"
                value={suggestionData.productName}
                onChangeText={text => onSuggestionDataChange('productName', text)}
                placeholderTextColor={colors.textSecondary}
            />
            
            <Text style={styles.label}>Material Principal*:</Text>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={suggestionData.material}
                    style={styles.picker}
                    onValueChange={(itemValue) => onSuggestionDataChange('material', itemValue)}
                    dropdownIconColor={colors.textPrimary} 
                    prompt="Selecione o Material Principal" // Para Android
                >
                    {MATERIAL_OPTIONS_FOR_FORM.map((opt) => (
                        <Picker.Item 
                            key={opt.value} 
                            label={opt.label} 
                            value={opt.value} 
                            // Tenta usar preto para itens no dropdown Android, primário para outros
                            color={Platform.OS === 'android' && opt.value !== "" ? '#000000' : colors.textPrimary} 
                        />
                    ))}
                </Picker>
            </View>

            {/* Campos de Dicas Removidos deste formulário */}

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
    label: { 
        fontSize: typography.fontSizeLabel,
        color: colors.textSecondary,
        marginBottom: spacing.small / 2,
        marginTop: spacing.small,
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
    pickerContainer: { 
        borderColor: colors.inputBorder,
        borderWidth: 1,
        borderRadius: spacing.small / 2,
        marginBottom: spacing.marginBottomItem,
        backgroundColor: colors.inputBackground, 
    },
    picker: {
        height: Platform.OS === 'ios' ? 120 : 50, // iOS precisa de mais altura para o picker inline
        width: '100%',
        color: colors.textPrimary, 
    },
    buttonWrapper: { 
        marginTop: spacing.marginBottomItem,
    },
});

export default SuggestionForm;