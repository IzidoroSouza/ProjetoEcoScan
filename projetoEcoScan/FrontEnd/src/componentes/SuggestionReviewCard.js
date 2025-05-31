
import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, Platform } from 'react-native'; // Adicionado Platform
import { Picker } from '@react-native-picker/picker';
import { colors, typography, spacing } from '../styles/AppStyles';
import { MATERIAL_OPTIONS_FOR_FORM as MATERIAL_OPTIONS_FOR_REVIEW } from './SuggestionForm'; // Reutiliza a lista

const SuggestionReviewCard = ({ suggestion, reviewData, onReviewDataChange, onApprove, onCancelReview }) => {
    if (!suggestion || !reviewData) return null;

    return (
        <View style={styles.cardContainer}>
            <Text style={styles.cardTitle}>Analisar e Aprovar Sugestão</Text>
            <Text style={styles.infoText}><Text style={styles.bold}>ID da Sugestão:</Text> {suggestion.id}</Text>
            <Text style={styles.infoText}><Text style={styles.bold}>Barcode:</Text> {suggestion.barcode}</Text>
            
            <Text style={styles.label}>Nome do Produto (confirmar/editar):</Text>
            <TextInput
                style={styles.input}
                value={reviewData.productName}
                onChangeText={(text) => onReviewDataChange('productName', text)}
                placeholder="Nome do Produto"
                placeholderTextColor={colors.textSecondary}
            />

            <Text style={styles.label}>Material Principal (confirmar/editar):</Text>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={reviewData.material}
                    style={styles.picker}
                    onValueChange={(itemValue) => onReviewDataChange('material', itemValue)}
                    dropdownIconColor={colors.textPrimary}
                    prompt="Selecione o Material Principal"
                >
                    {MATERIAL_OPTIONS_FOR_REVIEW.map((opt) => (
                         <Picker.Item 
                            key={opt.value} 
                            label={opt.label} 
                            value={opt.value} 
                            color={Platform.OS === 'android' && opt.value !== "" ? '#000000' : colors.textPrimary} 
                        />
                    ))}
                </Picker>
            </View>
            
            {/* Campos de Dicas foram REMOVIDOS daqui */}
            {/* O backend buscará as dicas do MaterialRecyclingGuide com base no 'material' aprovado. */}

            <View style={styles.buttonWrapper}>
                <Button title="Aprovar e Cadastrar/Atualizar Produto" onPress={onApprove} color={colors.primary} />
            </View>
            <View style={styles.buttonWrapper}>
                <Button title="Cancelar Análise" onPress={onCancelReview} color={colors.textSecondary} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        width: '100%',
        padding: spacing.medium,
        backgroundColor: colors.surface, 
        borderRadius: spacing.small,
        marginBottom: spacing.medium,
        borderWidth: 1,
        borderColor: colors.warning, 
    },
    cardTitle: {
        fontSize: typography.fontSizeSuggestionTitle,
        fontWeight: typography.fontWeightBold,
        color: colors.warning, 
        marginBottom: spacing.medium,
        textAlign: 'center',
    },
    infoText: {
        fontSize: typography.fontSizeValue,
        color: colors.textPrimary,
        marginBottom: spacing.small,
    },
    bold: {
        fontWeight: typography.fontWeightBold,
    },
    label: {
        fontSize: typography.fontSizeLabel, 
        color: colors.textSecondary,
        marginTop: spacing.small,
        marginBottom: spacing.small / 2,
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
    buttonWrapper: {
        marginTop: spacing.marginBottomItem,
    },
    pickerContainer: {
        borderColor: colors.inputBorder,
        borderWidth: 1,
        borderRadius: spacing.small / 2,
        marginBottom: spacing.marginBottomItem,
        backgroundColor: colors.inputBackground,
    },
    picker: {
        height: Platform.OS === 'ios' ? 120 : 50,
        width: '100%',
        color: colors.textPrimary,
    },
});

export default SuggestionReviewCard;