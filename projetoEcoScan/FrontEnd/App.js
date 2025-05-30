// FrontEnd/App.js
import React, { useState, useEffect } from 'react';
import { View, Text, Alert, Linking, Button, ActivityIndicator, ScrollView } from 'react-native';
import { Camera as CameraUtils, CameraView, CameraType as ActualCameraType } from 'expo-camera';

// Importações de Componentes e Estilos
import ProductDisplay from './src/components/ProductDisplay';
import SuggestionForm from './src/components/SuggestionForm';
import { globalStyles, cameraScreenStyles, colors } from './src/styles/AppStyles';

// Expo Camera specific imports
const ExpoCameraComponent = CameraView;
const requestCameraPermissions = CameraUtils.requestCameraPermissionsAsync;
const ExpoCameraType = ActualCameraType;

// --- Configurações ---
const BACKEND_URL = 'http://INSERIR_IP:5291'; // CONFIRME SEU IP E PORTA
const initialSuggestionDataState = {
    barcode: '', productName: '', material: '',
    disposalTips: '', recyclingInfo: '', sustainabilityImpact: ''
};

// --- Componente Principal ---
export default function App() {
    // Estados da Aplicação
    const [hasPermission, setHasPermission] = useState(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [scannedData, setScannedData] = useState(null); // Último barcode escaneado
    const [productInfo, setProductInfo] = useState(null); // Dados do produto para exibição
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [userMessage, setUserMessage] = useState(null); // Mensagens para o usuário
    const [showSuggestionForm, setShowSuggestionForm] = useState(false);
    const [suggestionData, setSuggestionData] = useState(initialSuggestionDataState);

    // Efeito para solicitar permissão da câmera
    useEffect(() => {
        const getCameraPermissions = async () => {
            try {
                if (typeof requestCameraPermissions !== 'function') {
                    Alert.alert("Erro de Configuração", "Função de permissão da câmera não encontrada.");
                    setHasPermission(false); return;
                }
                const { status } = await requestCameraPermissions();
                setHasPermission(status === 'granted');
                if (status !== 'granted') {
                    Alert.alert("Permissão Necessária", "A permissão da câmera é necessária para escanear códigos.");
                }
            } catch (err) {
                Alert.alert("Erro de Permissão", "Ocorreu um erro ao solicitar permissão da câmera.");
                setHasPermission(false);
            }
        };
        getCameraPermissions();
    }, []);

    // Função para resetar estados
    const resetUIState = (keepLastScan = false) => {
        setProductInfo(null);
        if (!keepLastScan) setScannedData(null);
        setError(null);
        setUserMessage(null);
        setShowSuggestionForm(false);
        setSuggestionData(initialSuggestionDataState);
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

    const submitProductSuggestion = async (dataToSubmit) => {
        console.log("SUBMIT SUGGESTION:", dataToSubmit);
        const response = await fetch(`${BACKEND_URL}/api/suggestions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToSubmit),
        });
        const responseText = await response.text(); // Ler como texto para depuração
        console.log("Submit Suggestion Response (text):", responseText);
        if (!response.ok) {
            try { // Tenta parsear erro JSON do backend
                const errorData = JSON.parse(responseText);
                throw new Error(errorData?.message || errorData?.title || `Erro no servidor: ${response.status}`);
            } catch { // Se não for JSON, usa o texto
                throw new Error(responseText || `Erro no servidor: ${response.status}`);
            }
        }
        return JSON.parse(responseText); // Sucesso, espera JSON
    };
    // --- Fim da Lógica Backend ---


    // Manipulador de código escaneado
    const handleBarcodeScanned = async ({ data }) => { // type não está sendo usado
        if (isLoading) return; // Evita processamento múltiplo

        setCameraActive(false);
        setIsLoading(true);
        resetUIState(true); // Mantém o 'data' escaneado para uso no formulário
        setScannedData(data);

        try {
            const ecoResponse = await fetchProductInformation(data);
            console.log('Backend Response:', JSON.stringify(ecoResponse, null, 2));

            if (ecoResponse.suggestionNeeded) {
                let initialProductName = '';
                let initialMaterial = '';
                if (ecoResponse.dataSource.startsWith("API_")) {
                    if (ecoResponse.productName && !["Nome não fornecido pela API", "Produto não encontrado", "Produto não cadastrado no banco de dados"].includes(ecoResponse.productName)) {
                        initialProductName = ecoResponse.productName;
                    }
                    if (ecoResponse.material && !["Desconhecido (API)", "Material não identificado", "Desconhecido (DB)"].includes(ecoResponse.material)) {
                        initialMaterial = ecoResponse.material;
                    }
                }
                setSuggestionData({
                    ...initialSuggestionDataState, barcode: data,
                    productName: initialProductName, material: initialMaterial
                });
                setShowSuggestionForm(true);
                setUserMessage(ecoResponse.dataSource === "Not_Found_Everywhere"
                    ? "Produto não encontrado. Ajude-nos cadastrando as informações!"
                    : "Informações incompletas. Você pode nos ajudar sugerindo os detalhes.");
            } else {
                setProductInfo(ecoResponse);
            }
        } catch (e) {
            setError(`Falha ao buscar dados: ${e.message}.`);
            setSuggestionData({ ...initialSuggestionDataState, barcode: data }); // Prepara para sugestão mesmo em erro
            setShowSuggestionForm(true);
            setUserMessage("Ocorreu um erro ao buscar as informações. Se desejar, pode tentar cadastrar o produto.");
        } finally {
            setIsLoading(false);
        }
    };

    // Manipulador de envio de sugestão
    const handleSuggestionSubmit = async () => {
        if (!suggestionData.productName || !suggestionData.material) { // Barcode já vem do scan
            Alert.alert("Campos Obrigatórios", "Nome do Produto e Material Principal são obrigatórios.");
            return;
        }
        setIsLoading(true); setError(null); setUserMessage(null);
        try {
            const result = await submitProductSuggestion(suggestionData);
            Alert.alert("Sucesso!", result.message || "Obrigado pela sua colaboração!");
            setShowSuggestionForm(false);
            resetUIState();
        } catch (e) {
            setError(`Falha ao enviar sugestão: ${e.message}`);
            Alert.alert("Erro ao Enviar", `Não foi possível enviar. Detalhes: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Atualiza os dados do formulário de sugestão
    const handleSuggestionDataChange = (field, value) => {
        setSuggestionData(prev => ({ ...prev, [field]: value }));
    };

    // Abre a câmera
    const openScanner = () => {
        if (hasPermission === null) { Alert.alert("Aguarde", "Verificando permissões..."); return; }
        if (hasPermission === false) {
            Alert.alert("Sem Permissão", "Habilite a câmera nas configurações do app.",
                [{ text: "Configurações", onPress: () => Linking.openSettings() }, { text: "Cancelar" }]
            ); return;
        }
        resetUIState();
        setCameraActive(true);
    };

    // Cancela a ação atual (scan ou formulário) e reseta
    const cancelCurrentAction = () => {
        setCameraActive(false);
        setShowSuggestionForm(false);
        resetUIState();
    };


    // --- Renderização ---
    if (hasPermission === null && !cameraActive) { // Tela de Carregamento de Permissão
        return (
            <View style={globalStyles.fullScreenContainer}>
                <ActivityIndicator size="large" color={colors.loadingIndicator} />
                <Text style={globalStyles.messageText}>Solicitando permissão da câmera...</Text>
            </View>
        );
    }

    if (cameraActive && hasPermission) { // Tela da Câmera
        return (
            <View style={globalStyles.fullScreenContainer}>
                <ExpoCameraComponent
                    style={cameraScreenStyles.camera}
                    type={ExpoCameraType?.back} // Usar o ExpoCameraType.back diretamente
                    onBarcodeScanned={isLoading ? undefined : handleBarcodeScanned} // Evita scan se já estiver carregando
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

    // Tela Principal: Resultados, Formulário ou Inicial
    return (
        <ScrollView contentContainerStyle={globalStyles.scrollContainer}>
            <View style={globalStyles.contentContainer}>
                <Text style={globalStyles.appTitle}>EcoScan</Text>

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
                        suggestionData={suggestionData}
                        onSuggestionDataChange={handleSuggestionDataChange}
                        onSubmit={handleSuggestionSubmit}
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

                {/* Botões de Ação Principais */}
                {!cameraActive && !isLoading && !showSuggestionForm && (
                    <View style={globalStyles.actionButtonContainer}>
                        <Button
                            title={(productInfo || error || userMessage) ? "Escanear Outro Produto" : "Escanear Código de Barras"}
                            onPress={openScanner}
                            disabled={hasPermission === false}
                            color={(productInfo || error || userMessage) ? colors.secondary : colors.accent}
                        />
                    </View>
                )}
            </View>
        </ScrollView>
    );
}