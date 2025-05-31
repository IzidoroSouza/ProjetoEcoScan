// FrontEnd/App.js
import React, { useState, useEffect } from 'react';
import { View, Text, Alert, Linking, Button, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { Camera as CameraUtils, CameraView, CameraType as ActualCameraType } from 'expo-camera';

// Importações de Componentes e Estilos
import ProductDisplay from './src/componentes/ProductDisplay';
import SuggestionForm from './src/componentes/SuggestionForm';
import SuggestionReviewCard from './src/componentes/SuggestionReviewCard';
import { globalStyles, cameraScreenStyles, colors, spacing, typography } from './src/styles/AppStyles';

// Expo Camera specific imports
const ExpoCameraComponent = CameraView;
const requestCameraPermissions = CameraUtils.requestCameraPermissionsAsync;
const ExpoCameraType = ActualCameraType;

// --- Configurações ---
const BACKEND_URL = 'http://INSERIR_IP_DA_MAQUINA:5291'; // CONFIRME SEU IP E PORTA

const initialNewProductSuggestionDataState = {
    barcode: '', productName: '', material: '',
    // Dicas não são mais parte da sugestão inicial do usuário
};

const initialReviewFormDataState = { // Para o formulário de revisão/aprovação
    barcode: '',
    productName: '',
    material: '',
    // Dicas não são editadas aqui, virão do backend com base no material
};

// --- Componente Principal ---
export default function App() {
    // Estados da Aplicação
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
        // Não resetar showReviewSection aqui diretamente, mas sim seus dados internos
        setSelectedSuggestionForReview(null);
        setReviewFormData(initialReviewFormDataState);
    };

    // --- Lógica de Interação com Backend ---
    const fetchProductInformation = async (barcode) => {
        const requestUrl = `${BACKEND_URL}/api/productinfo?barcode=${barcode}`;
        console.log(`FETCH: ${requestUrl}`);
        const response = await fetch(requestUrl);
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Backend Error: ${response.status} - ${errorText}`);
            throw new Error(`Erro do servidor: ${response.status}`);
        }
        return await response.json();
    };

    const submitNewProductSuggestion = async (dataToSubmit) => {
        console.log("SUBMIT NEW PRODUCT SUGGESTION:", dataToSubmit);
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
        console.log("Submit New Product Suggestion Response (text):", responseText);
        if (!response.ok) {
            try {
                const errorData = JSON.parse(responseText);
                throw new Error(errorData?.message || errorData?.title || `Erro no servidor: ${response.status}`);
            } catch {
                throw new Error(responseText || `Erro no servidor: ${response.status}`);
            }
        }
        return JSON.parse(responseText);
    };

    const fetchPendingSuggestions = async () => {
        console.log("FETCHING PENDING SUGGESTIONS");
        setIsLoading(true);
        try {
            const response = await fetch(`${BACKEND_URL}/api/suggestions`);
            if (!response.ok) {
                throw new Error(`Erro ao buscar sugestões: ${response.status}`);
            }
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
        console.log("APPROVING SUGGESTION:", suggestionId, approvalData);
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
        console.log("Approve Suggestion Response (text):", responseText);
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
    // --- Fim da Lógica Backend ---

    const handleBarcodeScanned = async ({ data }) => {
        if (isLoading) return;
        setCameraActive(false); setIsLoading(true); resetUIState(true); setScannedData(data);
        try {
            const ecoResponse = await fetchProductInformation(data);
            console.log('Backend Response:', JSON.stringify(ecoResponse, null, 2));
            if (ecoResponse.suggestionNeeded) {
                let initialProductName = '';
                if (ecoResponse.dataSource.startsWith("API_") && ecoResponse.productName && !["Nome não fornecido pela API", "Produto não encontrado", "Produto não cadastrado no banco de dados"].includes(ecoResponse.productName)) {
                    initialProductName = ecoResponse.productName;
                }
                setNewProductSuggestionData({ ...initialNewProductSuggestionDataState, barcode: data, productName: initialProductName });
                setShowSuggestionForm(true);
                setUserMessage(ecoResponse.dataSource === "Not_Found_Everywhere" ? "Produto não encontrado. Ajude-nos cadastrando!" : "Informações incompletas. Sugira os detalhes.");
            } else {
                setProductInfo(ecoResponse);
            }
        } catch (e) {
            setError(`Falha ao buscar dados: ${e.message}.`);
            setNewProductSuggestionData({ ...initialNewProductSuggestionDataState, barcode: data });
            setShowSuggestionForm(true);
            setUserMessage("Erro ao buscar. Tente cadastrar o produto.");
        } finally { setIsLoading(false); }
    };

    const handleNewProductSuggestionSubmit = async () => {
        if (!newProductSuggestionData.productName || !newProductSuggestionData.material) {
            Alert.alert("Campos Obrigatórios", "Nome do Produto e Material são obrigatórios."); return;
        }
        setIsLoading(true); setError(null); setUserMessage(null);
        try {
            const result = await submitNewProductSuggestion(newProductSuggestionData);
            Alert.alert("Sucesso!", result.message || "Obrigado pela colaboração!");
            setShowSuggestionForm(false); resetUIState();
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
            resetUIState(); // Limpa UI principal de scan
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
            fetchPendingSuggestions();
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
        resetUIState(); setCameraActive(true);
    };

    const cancelCurrentAction = () => { // Usado para cancelar scan ou formulário de nova sugestão
        setCameraActive(false); setShowSuggestionForm(false); resetUIState();
    };

    // --- Renderização ---
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
        <ScrollView contentContainerStyle={globalStyles.scrollContainer}>
            <View style={globalStyles.contentContainer}>
                <Text style={globalStyles.appTitle}>EcoScan</Text>

                <View style={{ marginBottom: spacing.medium, width: '80%' }}>
                    <Button
                        title={showReviewSection ? "Voltar ao Scan de Produtos" : "Revisar Sugestões Pendentes"}
                        onPress={handleToggleReviewSection}
                        color={colors.warning}
                    />
                </View>

                {showReviewSection && (
                    <View style={globalStyles.adminSectionContainer}>
                        <Text style={globalStyles.adminSectionTitle}>Sugestões Pendentes para Revisão</Text>
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
                                        <Text style={globalStyles.suggestionTextSmall}>Material Sugerido: {sugg.material}</Text>
                                        <Button title="Analisar/Aprovar" onPress={() => handleSelectSuggestionForReview(sugg)} color={colors.secondary}/>
                                    </View>
                                ))
                            ) : (
                                !isLoading && <Text style={globalStyles.messageText}>Nenhuma sugestão pendente para revisão.</Text>
                            )
                        )}
                        {error && <Text style={{color: colors.error, textAlign: 'center', marginTop: 10, width: '100%'}}>{error}</Text>}
                    </View>
                )}

                {/* Bloco da UI de Scan Normal - SÓ MOSTRA SE NÃO ESTIVER NA SEÇÃO DE REVISÃO */}
                {!showReviewSection && (
                    <>
                        {isLoading && (
                            <>
                                <ActivityIndicator size="large" color={colors.loadingIndicator} style={globalStyles.loadingIndicator} />
                                <Text style={globalStyles.messageText}>Buscando informações...</Text>
                            </>
                        )}
                        {userMessage && !isLoading && (
                            <Text style={[globalStyles.messageText, globalStyles.userMessageEmphasis]}>{userMessage}</Text>
                        )}
                        {error && !isLoading && (
                            <View style={globalStyles.errorBox}>
                                <Text style={globalStyles.errorText}>Erro:</Text>
                                <Text style={globalStyles.errorTextDetails}>{error}</Text>
                            </View>
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
                                <Text style={globalStyles.messageText}>Permissão para usar a câmera foi negada.</Text>
                                <Button title="Abrir Configurações" onPress={() => Linking.openSettings().catch(err => console.warn("Não foi possível abrir config:", err))} />
                            </View>
                        )}
                        
                        {/* Botão de Scan Principal - Condição corrigida para só aparecer se não estiver na câmera,
                            não estiver carregando, não estiver mostrando o formulário de sugestão de NOVO produto,
                            E NÃO ESTIVER NA SEÇÃO DE REVISÃO */}
                        {!cameraActive && !isLoading && !showSuggestionForm && !showReviewSection && (
                             <View style={globalStyles.actionButtonContainer}>
                                <Button
                                    title={(productInfo || error || userMessage) ? "Escanear Outro Produto" : "Escanear Código de Barras"}
                                    onPress={openScanner}
                                    disabled={hasPermission === false}
                                    color={(productInfo || error || userMessage) ? colors.secondary : colors.accent}
                                />
                            </View>
                        )}
                    </>
                )}
            </View>
        </ScrollView>
    );
}