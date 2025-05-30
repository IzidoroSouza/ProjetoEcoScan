// FrontEnd/App.js
import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Alert, Linking, Button, ActivityIndicator, ScrollView, TextInput } from 'react-native';
import { Camera as CameraUtils, CameraView, CameraType as ActualCameraType } from 'expo-camera';

const Camera = CameraView;
const requestCameraPermissions = CameraUtils.requestCameraPermissionsAsync;
const CameraType = ActualCameraType;

// --- ATENÇÃO: Configure esta URL para o seu backend ---
const BACKEND_URL = 'http://ISERIR_IP:5291'; // Substitua pelo seu IP e porta corretos
// --- ---------------------------------------------- ---

const initialSuggestionData = {
    barcode: '',
    productName: '',
    material: '',
    disposalTips: '',
    recyclingInfo: '',
    sustainabilityImpact: ''
};

export default function App() {
    const [hasPermission, setHasPermission] = useState(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [scannedData, setScannedData] = useState(null);
    const [productInfo, setProductInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [userMessage, setUserMessage] = useState(null); // Para mensagens como "Produto não encontrado"

    const [showSuggestionForm, setShowSuggestionForm] = useState(false);
    const [suggestionData, setSuggestionData] = useState(initialSuggestionData);

    useEffect(() => {
        const getPerms = async () => {
            console.log('Solicitando permissão da câmera...');
            try {
                if (typeof requestCameraPermissions !== 'function') {
                    console.error("ERRO: requestCameraPermissions não é uma função!");
                    Alert.alert("Erro de Configuração", "A função para solicitar permissão da câmera não foi encontrada.");
                    setHasPermission(false);
                    return;
                }
                const { status } = await requestCameraPermissions();
                setHasPermission(status === 'granted');
                if (status !== 'granted') {
                    Alert.alert(
                        "Permissão Necessária",
                        "Precisamos da sua permissão para usar a câmera para escanear códigos de barras."
                    );
                }
            } catch (err) {
                console.error('Erro ao solicitar permissões:', err);
                Alert.alert("Erro", "Ocorreu um erro ao solicitar permissão da câmera.");
                setHasPermission(false);
            }
        };
        getPerms();
    }, []);

    const resetState = (keepScannedData = false) => {
        setProductInfo(null);
        if (!keepScannedData) {
            setScannedData(null);
        }
        setError(null);
        setUserMessage(null); // Limpa a mensagem do usuário
        setShowSuggestionForm(false);
        setSuggestionData(initialSuggestionData);
    };

    const handleBarCodeScanned = async ({ type, data }) => {
        if (isLoading) return;

        setCameraActive(false);
        setIsLoading(true);
        resetState(true); // Mantém o scannedData atual (data)
        setScannedData(data);

        console.log(`Código escaneado: ${data} (Tipo: ${type})`);
        const requestUrl = `${BACKEND_URL}/api/productinfo?barcode=${data}`;
        console.log(`Buscando informações: ${requestUrl}`);

        try {
            const response = await fetch(requestUrl);
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Erro na resposta do backend: ${response.status} - ${errorText}`);
                throw new Error(`Erro do servidor: ${response.status} - ${errorText}`);
            }
            const ecoResponse = await response.json();
            console.log('Resposta do backend:', JSON.stringify(ecoResponse, null, 2));

            if (ecoResponse.suggestionNeeded) {
                setProductInfo(null);
                let initialProductName = '';
                let initialMaterial = '';

                // Só preenche nome e material se vier da API e não for um placeholder de "não encontrado"
                if (ecoResponse.dataSource.startsWith("API_")) { // API_No_Guide ou API_No_Guide_For_Material
                    if (ecoResponse.productName && ecoResponse.productName !== "Nome não fornecido pela API" && ecoResponse.productName !== "Produto não encontrado") {
                        initialProductName = ecoResponse.productName;
                    }
                    if (ecoResponse.material && ecoResponse.material !== "Desconhecido (API)" && ecoResponse.material !== "Material não identificado") {
                        initialMaterial = ecoResponse.material;
                    }
                }
                // Se for "Not_Found_Everywhere", productName e material ficam vazios.

                setSuggestionData({
                    ...initialSuggestionData, // Começa com tudo vazio
                    barcode: data,
                    productName: initialProductName,
                    material: initialMaterial
                });

                setShowSuggestionForm(true);
                if (ecoResponse.dataSource === "Not_Found_Everywhere") {
                    setUserMessage("Produto não encontrado em nossas bases. Por favor, ajude-nos cadastrando as informações abaixo!");
                } else { // API_No_Guide ou API_No_Guide_For_Material
                    setUserMessage("Algumas informações sobre este produto ou seu material não foram encontradas. Você pode nos ajudar sugerindo os detalhes.");
                }
            } else {
                setProductInfo(ecoResponse);
                setShowSuggestionForm(false);
                setUserMessage(null);
            }

        } catch (e) {
            console.error("Erro ao buscar informações:", e);
            setError(`Falha ao buscar dados: ${e.message}.`);
            setUserMessage(null); // Limpa mensagem se houver erro
            // Fallback para formulário de sugestão em caso de erro de busca
            setSuggestionData({ ...initialSuggestionData, barcode: data });
            setShowSuggestionForm(true);
            setUserMessage("Ocorreu um erro ao buscar as informações. Se desejar, você pode tentar cadastrar o produto.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendSuggestion = async () => {
        if (!suggestionData.barcode || !suggestionData.productName || !suggestionData.material) {
            Alert.alert("Campos Obrigatórios", "Por favor, preencha Código de Barras, Nome do Produto e Material Principal.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setUserMessage(null);
        try {
            const response = await fetch(`${BACKEND_URL}/api/suggestions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(suggestionData),
            });

            const responseText = await response.text();
            console.log("Resposta do envio da sugestão (texto):", responseText);

            if (!response.ok) {
                 try {
                    const errorData = JSON.parse(responseText);
                    const errorMessage = errorData?.message || errorData?.title || `Erro do servidor: ${response.status}`;
                    throw new Error(errorMessage);
                } catch (parseError) {
                    throw new Error(responseText || `Erro do servidor: ${response.status}`);
                }
            }
            
            const result = JSON.parse(responseText); 
            Alert.alert("Sucesso!", result.message || "Obrigado pela sua colaboração!");
            setShowSuggestionForm(false);
            resetState(); 
        } catch (e) {
            console.error("Erro ao enviar sugestão:", e);
            setError(`Falha ao enviar sugestão: ${e.message}`);
            Alert.alert("Erro ao Enviar", `Não foi possível enviar sua sugestão. Detalhes: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const openCamera = () => {
        if (hasPermission === null) {
            Alert.alert("Aguarde", "Verificando permissões da câmera...");
            return;
        }
        if (hasPermission === false) {
            Alert.alert(
                "Sem Permissão",
                "A permissão da câmera foi negada. Por favor, habilite nas configurações do aplicativo.",
                [{ text: "Abrir Configurações", onPress: () => Linking.openSettings() }, { text: "Cancelar" }]
            );
            return;
        }
        resetState(); 
        setCameraActive(true);
    };

    const cancelSuggestion = () => {
        setShowSuggestionForm(false);
        resetState();
    };

    if (hasPermission === null && !cameraActive) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#00ff00" />
                <Text style={styles.messageText}>Solicitando permissão da câmera...</Text>
            </View>
        );
    }

    if (cameraActive && hasPermission) {
        return (
            <View style={styles.container}>
                <Camera
                    style={styles.camera}
                    type={CameraType && CameraType.back ? CameraType.back : 'back'}
                    onBarcodeScanned={scannedData && isLoading ? undefined : handleBarCodeScanned} // Evita scan múltiplo enquanto processa o anterior
                    barcodeScannerSettings={{
                        barcodeTypes: ["ean13", "ean8", "qr", "upc_a", "upc_e", "code128", "code39", "code93", "codabar", "itf", "pdf417", "aztec", "datamatrix"],
                    }}
                />
                <View style={styles.cameraOverlay}>
                    <Text style={styles.overlayText}>Aponte para o código de barras</Text>
                </View>
                <View style={styles.buttonContainerFixedBottom}>
                    <Button title="Cancelar Scan" onPress={() => { setCameraActive(false); resetState(); }} color="#ff4757" />
                </View>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.content}>
                <Text style={styles.title}>EcoScan</Text>

                {isLoading && (
                    <>
                        <ActivityIndicator size="large" color="#00ff00" style={{ marginVertical: 20 }} />
                        <Text style={styles.messageText}>Buscando informações...</Text>
                    </>
                )}

                {userMessage && !isLoading && ( // Exibe a mensagem do usuário (ex: Produto não encontrado)
                    <Text style={[styles.messageText, styles.userMessageEmphasis]}>{userMessage}</Text>
                )}

                {error && !isLoading && (
                    <View style={styles.errorBox}>
                        <Text style={styles.errorText}>Erro:</Text>
                        <Text style={styles.errorTextDetails}>{error}</Text>
                    </View>
                )}

                {showSuggestionForm && !isLoading && (
                    <View style={styles.suggestionFormContainer}>
                        <Text style={styles.suggestionTitle}>Sugerir Informações do Produto</Text>
                        <Text style={styles.infoLabel}>Código de Barras: {suggestionData.barcode}</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Nome do Produto*"
                            value={suggestionData.productName}
                            onChangeText={text => setSuggestionData(prev => ({ ...prev, productName: text }))}
                            placeholderTextColor="#bdc3c7"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Material Principal*"
                            value={suggestionData.material}
                            onChangeText={text => setSuggestionData(prev => ({ ...prev, material: text }))}
                            placeholderTextColor="#bdc3c7"
                        />
                        <TextInput
                            style={[styles.input, styles.multilineInput]}
                            placeholder="Dicas de Descarte (Opcional)"
                            value={suggestionData.disposalTips}
                            onChangeText={text => setSuggestionData(prev => ({ ...prev, disposalTips: text }))}
                            multiline
                            numberOfLines={3}
                            placeholderTextColor="#bdc3c7"
                        />
                        <TextInput
                            style={[styles.input, styles.multilineInput]}
                            placeholder="Informações de Reciclagem (Opcional)"
                            value={suggestionData.recyclingInfo}
                            onChangeText={text => setSuggestionData(prev => ({ ...prev, recyclingInfo: text }))}
                            multiline
                            numberOfLines={3}
                            placeholderTextColor="#bdc3c7"
                        />
                        <TextInput
                            style={[styles.input, styles.multilineInput]}
                            placeholder="Impacto/Sustentabilidade (Opcional)"
                            value={suggestionData.sustainabilityImpact}
                            onChangeText={text => setSuggestionData(prev => ({ ...prev, sustainabilityImpact: text }))}
                            multiline
                            numberOfLines={3}
                            placeholderTextColor="#bdc3c7"
                        />
                        <View style={styles.formButtonContainer}>
                            <Button title="Enviar Sugestão" onPress={handleSendSuggestion} color="#1abc9c" />
                        </View>
                        <View style={styles.formButtonContainer}>
                            <Button title="Cancelar" onPress={cancelSuggestion} color="#e74c3c" />
                        </View>
                    </View>
                )}

                {productInfo && !isLoading && !showSuggestionForm && (
                    <View style={styles.productInfoContainer}>
                        <Text style={styles.productTitle}>{productInfo.productName}</Text>
                        <InfoRow label="Código:" value={productInfo.barcode} />
                        <InfoRow label="Material Principal:" value={productInfo.material} />
                        <InfoRow label="Dicas de Descarte:" value={productInfo.disposalTips || "Não informado"} />
                        <InfoRow label="Reciclagem:" value={productInfo.recyclingInfo || "Não informado"} />
                        <InfoRow label="Impacto/Sustentabilidade:" value={productInfo.sustainabilityImpact || "Não informado"} />
                        <InfoRow label="Fonte:" value={productInfo.dataSource} />
                    </View>
                )}

                {!isLoading && !productInfo && !showSuggestionForm && hasPermission === false && (
                    <View style={styles.centeredContent}>
                        <Text style={styles.messageText}>Permissão para usar a câmera foi negada.</Text>
                        <Button title="Abrir Configurações" onPress={() => Linking.openSettings().catch(err => console.warn("Não foi possível abrir configurações: ", err))} />
                    </View>
                )}

                {!cameraActive && !isLoading && !showSuggestionForm && (
                    <View style={styles.actionButtons}>
                        {(!productInfo && !error && !userMessage) && ( // Só mostra se não tiver info, erro ou msg de usuário
                            <Button title="Escanear Código de Barras" onPress={openCamera} disabled={hasPermission === false} color="#2ed573" />
                        )}
                        {(productInfo || error || userMessage) && ( // Se tiver info, erro ou msg de usuário, mostra "escanear outro"
                            <View style={{ marginTop: 20 }}>
                                <Button title="Escanear Outro Produto" onPress={openCamera} color="#1e90ff" />
                            </View>
                        )}
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

const InfoRow = ({ label, value }) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || "N/A"}</Text> 
    </View>
);

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        backgroundColor: '#2c3e50',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    content: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    centeredContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ecf0f1',
        marginBottom: 20, // Reduzido um pouco
        textAlign: 'center',
    },
    camera: {
        ...StyleSheet.absoluteFillObject,
    },
    cameraOverlay: {
        position: 'absolute',
        top: '20%',
        left: '10%',
        right: '10%',
        padding: 15,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 10,
        alignItems: 'center',
    },
    overlayText: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
    },
    buttonContainerFixedBottom: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
    },
    messageText: {
        fontSize: 16,
        color: '#bdc3c7',
        textAlign: 'center',
        paddingHorizontal: 10, // Adicionado padding horizontal
        marginVertical: 10, // Adicionado margin vertical
    },
    userMessageEmphasis: { // Estilo para a mensagem do usuário
        color: '#f1c40f', // Um amarelo para destaque
        fontWeight: 'bold',
        marginBottom: 15,
    },
    productInfoContainer: {
        marginTop: 15, // Reduzido
        padding: 15,
        backgroundColor: '#34495e',
        borderRadius: 8,
        width: '100%',
    },
    productTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1abc9c',
        marginBottom: 15,
        textAlign: 'center',
    },
    infoRow: {
        marginBottom: 12,
    },
    infoLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ecf0f1',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 15,
        color: '#bdc3c7',
    },
    errorBox: {
        marginTop: 15, // Reduzido
        padding: 15,
        backgroundColor: '#e74c3c',
        borderRadius: 8,
        width: '100%',
    },
    errorText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    errorTextDetails: {
        fontSize: 14,
        color: 'white',
        textAlign: 'center',
        marginTop: 5,
    },
    actionButtons: {
        marginTop: 20, // Reduzido
        width: '80%',
    },
    suggestionFormContainer: {
        width: '100%',
        padding: 15,
        backgroundColor: '#3e5770', // Um pouco mais claro para diferenciar
        borderRadius: 8,
        marginTop: 10, // Reduzido
        marginBottom: 20,
    },
    suggestionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1abc9c',
        marginBottom: 15,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#2c3e50',
        color: '#ecf0f1',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 5,
        marginBottom: 12, // Aumentado um pouco
        borderWidth: 1,
        borderColor: '#1abc9c',
        fontSize: 15,
    },
    multilineInput: {
        minHeight: 70, // Reduzido um pouco
        textAlignVertical: 'top',
    },
    formButtonContainer: {
        marginTop: 12, // Aumentado um pouco
    }
});