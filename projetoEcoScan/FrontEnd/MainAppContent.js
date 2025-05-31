// FrontEnd/MainAppContent.js
import React, { useState, useEffect } from 'react';
import {View,Text,Alert,Linking,Button,ActivityIndicator,ScrollView,Platform,StyleSheet,TouchableOpacity,TextInput} from 'react-native';
import { Camera as CameraUtils, CameraView, CameraType as ActualCameraType } from 'expo-camera';

import ProductDisplay from './src/componentes/ProductDisplay';
import SuggestionForm from './src/componentes/SuggestionForm';
import SuggestionReviewCard from './src/componentes/SuggestionReviewCard';
import { globalStyles, cameraScreenStyles, colors, spacing, typography } from './src/styles/AppStyles';

const ExpoCameraComponent = CameraView;
const requestCameraPermissions = CameraUtils.requestCameraPermissionsAsync;
const ExpoCameraType = ActualCameraType;

const BACKEND_URL = 'http://IP_DA_MAQUINA:5291'; // CONFIRME SEU IP E PORTA

const initialNewProductSuggestionDataState = {
    barcode: '', productName: '', material: '',
};

const initialReviewFormDataState = {
    barcode: '',
    productName: '',
    material: '',
};

export default function MainAppContent({ userRole, onLogoutRequest }) {
    const [showReviewSection, setShowReviewSection] = useState(false);
    const [pendingSuggestions, setPendingSuggestions] = useState([]);
    const [selectedSuggestionForReview, setSelectedSuggestionForReview] = useState(null);
    const [reviewFormData, setReviewFormData] = useState(initialReviewFormDataState);
    const [hasPermission, setHasPermission] = useState(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [scannedData, setScannedData] = useState(null);
    const [productInfo, setProductInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [userMessage, setUserMessage] = useState(null);
    const [showSuggestionForm, setShowSuggestionForm] = useState(false);
    const [newProductSuggestionData, setNewProductSuggestionData] = useState(initialNewProductSuggestionDataState);
    const [barcodeInput, setBarcodeInput] = useState('');
    const [showManualInput, setShowManualInput] = useState(false);

    useEffect(() => {
        const getCameraPermissions = async () => {
            try {
                if (typeof requestCameraPermissions !== 'function') {
                    Alert.alert("Erro Config.", "Permissão câmera não encontrada.");
                    setHasPermission(false); return;
                }
                const { status } = await requestCameraPermissions();
                setHasPermission(status === 'granted');
                if (status !== 'granted') Alert.alert("Permissão Necessária", "Câmera é necessária para escanear.");
            } catch (err) {
                Alert.alert("Erro Permissão", "Erro ao solicitar permissão da câmera.");
                setHasPermission(false);
            }
        };
        getCameraPermissions();
    }, []);

    const resetUIState = (keepLastScan = false) => {
        setProductInfo(null);
        if (!keepLastScan) setScannedData(null);
        setError(null);
        setUserMessage(null);
        setShowSuggestionForm(false);
        setNewProductSuggestionData(initialNewProductSuggestionDataState);
        setSelectedSuggestionForReview(null);
        setReviewFormData(initialReviewFormDataState);
        setBarcodeInput('');
        // Não resetar showManualInput aqui, pois o usuário pode querer continuar digitando
        // ou o botão de review pode ser clicado, o que deve esconder o input manual.
        // Se a seção de review for aberta, o !showReviewSection no render vai esconder o input manual.
    };

    const fetchProductInformation = async (barcode) => {
        const requestUrl = `${BACKEND_URL}/api/productinfo?barcode=${barcode}`;
        const response = await fetch(requestUrl);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro do servidor: ${response.status} - ${errorText}`);
        }
        return await response.json();
    };

    const submitNewProductSuggestion = async (dataToSubmit) => {
        const payload = {
            barcode: dataToSubmit.barcode,
            productName: dataToSubmit.productName,
            material: dataToSubmit.material,
        };
        const response = await fetch(`${BACKEND_URL}/api/suggestions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const responseText = await response.text();
        if (!response.ok) {
            try {
                const errorData = JSON.parse(responseText);
                throw new Error(errorData?.message || errorData?.title || `Erro: ${response.status}`);
            } catch {
                throw new Error(responseText || `Erro: ${response.status}`);
            }
        }
        return JSON.parse(responseText);
    };

    const fetchPendingSuggestions = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${BACKEND_URL}/api/suggestions`);
            if (!response.ok) throw new Error(`Erro ao buscar sugestões: ${response.status}`);
            const data = await response.json();
            setPendingSuggestions(data);
            setError(null);
        } catch (e) {
            setError(`Falha ao buscar sugestões: ${e.message}`);
            setPendingSuggestions([]);
            Alert.alert("Erro", `Não foi possível carregar as sugestões pendentes.`);
        } finally {
            setIsLoading(false);
        }
    };

    const approveSuggestionOnBackend = async (suggestionId, approvalData) => {
        const payloadForApproval = {
            barcode: approvalData.barcode,
            productName: approvalData.productName,
            material: approvalData.material,
        };
        const response = await fetch(`${BACKEND_URL}/api/suggestions/${suggestionId}/approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payloadForApproval),
        });
        const responseText = await response.text();
        if (!response.ok) {
            try {
                const errorData = JSON.parse(responseText);
                throw new Error(errorData?.message || errorData?.title || `Erro: ${response.status}`);
            } catch {
                throw new Error(responseText || `Erro: ${response.status}`);
            }
        }
        return JSON.parse(responseText);
    };

    const processBarcode = async (barcode) => {
        setIsLoading(true);
        resetUIState(true); // Limpa UI mas mantém o scannedData (barcode) para referência
        setScannedData(barcode);
        try {
            const ecoResponse = await fetchProductInformation(barcode);
            if (ecoResponse.suggestionNeeded) {
                let initialProductName = '';
                if (ecoResponse.dataSource.startsWith("API_") && ecoResponse.productName && !["Nome não fornecido pela API", "Produto não encontrado", "Produto não cadastrado no banco de dados"].includes(ecoResponse.productName)) {
                    initialProductName = ecoResponse.productName;
                }
                setNewProductSuggestionData({ ...initialNewProductSuggestionDataState, barcode: barcode, productName: initialProductName });
                setShowSuggestionForm(true);
                setUserMessage(ecoResponse.dataSource === "Not_Found_Everywhere" ? "Produto não encontrado. Ajude-nos cadastrando!" : "Informações incompletas. Sugira os detalhes.");
            } else {
                setProductInfo(ecoResponse);
            }
        } catch (e) {
            setError(`Falha ao buscar dados: ${e.message}.`);
            setNewProductSuggestionData({ ...initialNewProductSuggestionDataState, barcode: barcode });
            setShowSuggestionForm(true);
            setUserMessage("Erro ao buscar. Tente cadastrar o produto.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleBarcodeScanned = async ({ data }) => {
        if (isLoading) return;
        setCameraActive(false);
        await processBarcode(data);
    };

    const handleManualBarcodeSubmit = async () => {
        if (isLoading) return;
        if (!barcodeInput.trim()) {
            Alert.alert("Campo Vazio", "Por favor, digite um código de barras.");
            return;
        }
        await processBarcode(barcodeInput.trim());
    };

    const handleNewProductSuggestionSubmit = async () => {
        if (!newProductSuggestionData.productName || !newProductSuggestionData.material) {
            Alert.alert("Campos Obrigatórios", "Nome do Produto e Material são obrigatórios."); return;
        }
        setIsLoading(true); setError(null); setUserMessage(null);
        try {
            const result = await submitNewProductSuggestion(newProductSuggestionData);
            Alert.alert("Sucesso!", result.message || "Obrigado pela colaboração!");
            setShowSuggestionForm(false); resetUIState(); // Limpa tudo após sucesso
        } catch (e) {
            setError(`Falha ao enviar: ${e.message}`); Alert.alert("Erro ao Enviar", `Detalhes: ${e.message}`);
        } finally { setIsLoading(false); }
    };

    const handleNewProductSuggestionDataChange = (field, value) => {
        setNewProductSuggestionData(prev => ({ ...prev, [field]: value }));
    };

    const handleToggleReviewSection = () => {
        const openingReview = !showReviewSection;
        setShowReviewSection(openingReview);
        if (openingReview) {
            resetUIState(); // Limpa a UI principal
            setShowManualInput(false); // Garante que input manual não esteja visível
            fetchPendingSuggestions();
        } else { // Fechando a seção de review
            setPendingSuggestions([]);
            setSelectedSuggestionForReview(null);
            setReviewFormData(initialReviewFormDataState);
        }
    };

    const handleSelectSuggestionForReview = (suggestion) => {
        setSelectedSuggestionForReview(suggestion);
        setReviewFormData({
            barcode: suggestion.barcode,
            productName: suggestion.productName,
            material: suggestion.material,
        });
    };

    const handleReviewFormChange = (field, value) => {
        setReviewFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleApproveSuggestion = async () => {
        if (!selectedSuggestionForReview || !reviewFormData) return;
        if (!reviewFormData.productName || !reviewFormData.material) {
            Alert.alert("Campos Obrigatórios", "Nome e Material são obrigatórios para aprovar."); return;
        }
        setIsLoading(true);
        try {
            await approveSuggestionOnBackend(selectedSuggestionForReview.id, reviewFormData);
            Alert.alert("Sucesso", "Sugestão aprovada e produto processado!");
            setSelectedSuggestionForReview(null); setReviewFormData(initialReviewFormDataState);
            fetchPendingSuggestions(); // Atualiza a lista
        } catch (e) {
            Alert.alert("Erro ao Aprovar", `Detalhes: ${e.message}`);
        } finally { setIsLoading(false); }
    };

    const cancelReview = () => {
        setSelectedSuggestionForReview(null); setReviewFormData(initialReviewFormDataState);
    };

    const openScanner = () => {
        if (hasPermission === null) { Alert.alert("Aguarde", "Verificando permissões..."); return; }
        if (hasPermission === false) {
            Alert.alert("Sem Permissão", "Habilite a câmera nas configurações.",
                [{ text: "Configurações", onPress: () => Linking.openSettings() }, { text: "Cancelar" }]
            ); return;
        }
        resetUIState(); // Limpa UI antes de abrir a câmera
        setCameraActive(true);
    };

    const cancelCurrentAction = () => { // Usado para cancelar formulário de sugestão ou scan
        setCameraActive(false);
        setShowSuggestionForm(false);
        resetUIState(); // Reseta a UI principal
    };

    const toggleManualInput = () => {
        setShowManualInput(!showManualInput);
        if (!showManualInput) { // Se estiver abrindo o input manual
            resetUIState(); // Limpa outros elementos da UI (produto, erro, msg)
        }
    };

    if (hasPermission === null && !cameraActive) {
        return (
            <View style={globalStyles.fullScreenContainer}>
                <ActivityIndicator size="large" color={colors.loadingIndicator} />
                <Text style={globalStyles.messageText}>Solicitando permissão da câmera...</Text>
            </View>
        );
    }

    if (cameraActive && hasPermission) {
        return (
            <View style={globalStyles.fullScreenContainer}>
                <ExpoCameraComponent
                    style={cameraScreenStyles.camera}
                    type={ExpoCameraType?.back}
                    onBarcodeScanned={isLoading ? undefined : handleBarcodeScanned}
                    barcodeScannerSettings={{
                        barcodeTypes: ["ean13", "ean8", "qr", "upc_a", "upc_e", "code128", "code39", "code93", "codabar", "itf", "pdf417", "aztec", "datamatrix"],
                    }}
                />
                <View style={cameraScreenStyles.overlay}>
                    <Text style={cameraScreenStyles.overlayText}>Aponte para o código de barras</Text>
                </View>
                <View style={cameraScreenStyles.fixedBottomButtonContainer}>
                    <Button title="Cancelar Scan" onPress={cancelCurrentAction} color={colors.cancel} />
                </View>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={onLogoutRequest} style={styles.logoutButton}>
                    <Text style={styles.logoutButtonText}>Modificar Acesso</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={globalStyles.scrollContainer}>
                <View style={globalStyles.contentContainer}>
                    <Text style={globalStyles.appTitle}>EcoScan</Text>
                    <Text style={styles.currentUserRoleText}>Perfil: {userRole}</Text>

                    {userRole === 'ADMIN' && (
                        <View style={styles.actionButtonContainer}>
                            <Button
                                title={showReviewSection ? "Voltar ao Scan/Digitação" : "Analisar Sugestões"}
                                onPress={handleToggleReviewSection}
                                color={colors.warning}
                            />
                        </View>
                    )}

                    {showReviewSection && userRole === 'ADMIN' ? (
                        <View style={globalStyles.adminSectionContainer}>
                            <Text style={globalStyles.adminSectionTitle}>Sugestões Pendentes</Text>
                            {isLoading && pendingSuggestions.length === 0 && !selectedSuggestionForReview && <ActivityIndicator size="small" color={colors.loadingIndicator} />}
                            {selectedSuggestionForReview && reviewFormData ? (
                                <SuggestionReviewCard
                                    suggestion={selectedSuggestionForReview}
                                    reviewData={reviewFormData}
                                    onReviewDataChange={handleReviewFormChange}
                                    onApprove={handleApproveSuggestion}
                                    onCancelReview={cancelReview}
                                />
                            ) : (
                                !isLoading && pendingSuggestions.length > 0 ? (
                                    pendingSuggestions.map(sugg => (
                                        <View key={sugg.id} style={globalStyles.suggestionListItem}>
                                            <Text style={globalStyles.suggestionText}>ID: {sugg.id} - {sugg.productName}</Text>
                                            <Text style={globalStyles.suggestionTextSmall}>Barcode: {sugg.barcode}</Text>
                                            <Text style={globalStyles.suggestionTextSmall}>Material: {sugg.material}</Text>
                                            <Button title="Analisar/Aprovar" onPress={() => handleSelectSuggestionForReview(sugg)} color={colors.secondary}/>
                                        </View>
                                    ))
                                ) : (
                                    !isLoading && <Text style={globalStyles.messageText}>Nenhuma sugestão pendente.</Text>
                                )
                            )}
                            {error && <Text style={{color: colors.error, textAlign: 'center', marginTop: 10, width: '100%'}}>{error}</Text>}
                        </View>
                    ) : (
                        <>
                            {showManualInput && (
                                <View style={styles.manualInputContainer}>
                                    <TextInput
                                        style={styles.manualInput}
                                        placeholder="Digite o código de barras"
                                        keyboardType="numeric"
                                        value={barcodeInput}
                                        onChangeText={setBarcodeInput}
                                        placeholderTextColor={colors.textSecondary}
                                        onSubmitEditing={handleManualBarcodeSubmit} // Permite submeter com o "enter" do teclado
                                    />
                                    <Button title="Buscar" onPress={handleManualBarcodeSubmit} color={colors.primary} disabled={isLoading || !barcodeInput.trim()} />
                                </View>
                            )}

                            {!showSuggestionForm && ( // Não mostrar botões de ação se o formulário de sugestão estiver ativo
                                <>
                                    {!showManualInput && (
                                        <View style={styles.actionButtonContainer}>
                                            <Button
                                                title={(productInfo || error || userMessage) ? "Escanear Outro" : "Escanear Código"}
                                                onPress={openScanner}
                                                disabled={hasPermission === false || isLoading}
                                                color={(productInfo || error || userMessage) ? colors.secondary : colors.accent}
                                            />
                                        </View>
                                    )}
                                    <View style={styles.actionButtonContainer}>
                                        <Button
                                            title={showManualInput ? "Cancelar Digitação" : "Digitar Código"}
                                            onPress={toggleManualInput}
                                            color={showManualInput ? colors.cancel : colors.secondary}
                                            disabled={isLoading}
                                        />
                                    </View>
                                </>
                            )}

                            {isLoading && <ActivityIndicator size="large" color={colors.loadingIndicator} style={globalStyles.loadingIndicator} />}
                            
                            {/* Mensagens de usuário, erros, etc. só se não estiver carregando e nenhum form ativo */}
                            {!isLoading && !showSuggestionForm && (
                                <>
                                    {userMessage && <Text style={[globalStyles.messageText, globalStyles.userMessageEmphasis]}>{userMessage}</Text>}
                                    {error && (
                                        <View style={globalStyles.errorBox}>
                                            <Text style={globalStyles.errorText}>Erro:</Text>
                                            <Text style={globalStyles.errorTextDetails}>{error}</Text>
                                        </View>
                                    )}
                                </>
                            )}

                            {showSuggestionForm && !isLoading && (
                                <SuggestionForm
                                    suggestionData={newProductSuggestionData}
                                    onSuggestionDataChange={handleNewProductSuggestionDataChange}
                                    onSubmit={handleNewProductSuggestionSubmit}
                                    onCancel={cancelCurrentAction}
                                />
                            )}

                            {productInfo && !isLoading && !showSuggestionForm && (
                                <ProductDisplay productInfo={productInfo} />
                            )}

                            {!isLoading && !productInfo && !showSuggestionForm && hasPermission === false && (
                                <View style={globalStyles.centeredMessageContainer}>
                                    <Text style={globalStyles.messageText}>Permissão para câmera negada.</Text>
                                    <Button title="Abrir Configurações" onPress={() => Linking.openSettings().catch(err => console.warn("Não foi possível abrir config:", err))} />
                                </View>
                            )}
                        </>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: spacing.medium,
        paddingTop: Platform.OS === 'ios' ? spacing.large + 10 : spacing.medium, // Aumentei o paddingTop para iOS
        paddingBottom: spacing.small,
        backgroundColor: colors.background,
    },
    logoutButton: {
        paddingVertical: spacing.small,
        paddingHorizontal: spacing.medium,
    },
    logoutButtonText: {
        color: colors.primary,
        fontSize: typography.fontSizeRegular,
        fontWeight: typography.fontWeightMedium,
    },
    currentUserRoleText: {
        fontSize: typography.fontSizeSmall,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.medium,
    },
    manualInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.medium,
        width: '90%',
        alignSelf: 'center',
    },
    manualInput: {
        flex: 1,
        height: 44,
        borderColor: colors.inputBorder,
        borderWidth: 1,
        borderRadius: spacing.small,
        paddingHorizontal: spacing.inputHorizontalPadding,
        marginRight: spacing.small,
        backgroundColor: colors.inputBackground,
        color: colors.textPrimary,
        fontSize: typography.fontSizeInput,
    },
    actionButtonContainer: {
        width: '80%',
        alignSelf: 'center',
        marginVertical: spacing.small,
    },
});
