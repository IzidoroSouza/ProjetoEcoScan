// FrontEnd/App.js
import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Alert, Linking, Button, ActivityIndicator, ScrollView } from 'react-native';
import { Camera as CameraUtils, CameraView, CameraType as ActualCameraType } from 'expo-camera';

const Camera = CameraView;
const requestCameraPermissions = CameraUtils.requestCameraPermissionsAsync;
const CameraType = ActualCameraType;

// --- ATENÇÃO: Configure esta URL para o seu backend ---
// Se estiver usando emulador Android: http://10.0.2.2:PORTA_DO_BACKEND
// Se estiver usando emulador iOS ou dispositivo físico na mesma rede: http://SEU_IP_LOCAL:PORTA_DO_BACKEND
// Exemplo com HTTPS e porta padrão do `dotnet run`:
const BACKEND_URL = 'http://COLOCAR_IP:5291'; // Para emulador Android, se o backend está em localhost:5000
// const BACKEND_URL = 'https://SEU_IP_DA_REDE_LOCAL:5001'; // Para dispositivo físico
// --- ---------------------------------------------- ---


export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [productInfo, setProductInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Solicitar permissão apenas uma vez ao carregar o app
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

  const handleBarCodeScanned = async ({ type, data }) => {
    if (isLoading || productInfo) return; // Evita múltiplos scans ou processamentos

    setScannedData(data);
    setCameraActive(false); // Fecha a câmera após o scan
    setIsLoading(true);
    setError(null);
    setProductInfo(null);

    console.log(`Código escaneado: ${data} (Tipo: ${type})`);

    try {
      // Ajuste a URL conforme necessário
      const response = await fetch(`${BACKEND_URL}/api/productinfo?barcode=${data}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro do servidor: ${response.status} - ${errorText}`);
      }
      const product = await response.json();
      setProductInfo(product);
    } catch (e) {
      console.error("Erro ao buscar informações do produto:", e);
      setError(`Falha ao buscar dados: ${e.message}. Verifique a URL do backend e se ele está rodando.`);
      Alert.alert("Erro de Rede", `Não foi possível conectar ao servidor. Detalhes: ${e.message}`);
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
    setProductInfo(null);
    setScannedData(null);
    setError(null);
    setCameraActive(true);
  };

  const resetScan = () => {
    setProductInfo(null);
    setScannedData(null);
    setError(null);
    setCameraActive(false); // Volta para a tela inicial com o botão de escanear
  };

  // Tela de carregamento de permissão
  if (hasPermission === null && !cameraActive && !productInfo) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00ff00" />
        <Text style={styles.messageText}>Solicitando permissão da câmera...</Text>
      </View>
    );
  }

  // Tela da Câmera
  if (cameraActive && hasPermission) {
    return (
      <View style={styles.container}>
        <Camera
          style={styles.camera}
          type={CameraType && CameraType.back ? CameraType.back : 'back'}
          onBarcodeScanned={scannedData ? undefined : handleBarCodeScanned} // Evita scan múltiplo
          barcodeScannerSettings={{
            barcodeTypes: ["qr", "ean13", "ean8", "upc_a", "upc_e", "code128", "code39", "code93", "codabar", "itf", "pdf417", "aztec", "datamatrix"], // Adicione os tipos que precisar
          }}
        />
        <View style={styles.cameraOverlay}>
            <Text style={styles.overlayText}>Aponte para o código de barras</Text>
        </View>
        <View style={styles.buttonContainerFixedBottom}>
            <Button title="Cancelar" onPress={() => setCameraActive(false)} color="#ff4757"/>
        </View>
      </View>
    );
  }

  // Tela de Resultados ou Tela Inicial
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.content}>
        <Text style={styles.title}>EcoScan</Text>

        {isLoading && (
          <>
            <ActivityIndicator size="large" color="#00ff00" style={{ marginVertical: 20 }}/>
            <Text style={styles.messageText}>Buscando informações do produto...</Text>
          </>
        )}

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>Erro:</Text>
            <Text style={styles.errorTextDetails}>{error}</Text>
          </View>
        )}

        {productInfo && !isLoading && (
          <View style={styles.productInfoContainer}>
            <Text style={styles.productTitle}>{productInfo.productName}</Text>
            <InfoRow label="Código:" value={productInfo.barcode} />
            <InfoRow label="Material Principal:" value={productInfo.material} />
            <InfoRow label="Dicas de Descarte:" value={productInfo.disposalTips} />
            <InfoRow label="Reciclagem:" value={productInfo.recyclingInfo} />
            <InfoRow label="Impacto/Sustentabilidade:" value={productInfo.sustainabilityImpact} />
          </View>
        )}

        {!isLoading && !productInfo && hasPermission === false && (
             <View style={styles.centeredContent}>
                <Text style={styles.messageText}>Permissão para usar a câmera foi negada.</Text>
                <Button title="Abrir Configurações" onPress={() => Linking.openSettings().catch(err => console.warn("Não foi possível abrir configurações: ", err))} />
             </View>
        )}

        {/* Botões de Ação */}
        {!cameraActive && ( // Mostra os botões apenas se a câmera não estiver ativa
            <View style={styles.actionButtons}>
            {(!productInfo && !isLoading) && ( // Se não há produto ou loading, mostra botão de escanear
                <Button title="Escanear Código de Barras" onPress={openCamera} disabled={hasPermission === false} color="#2ed573"/>
            )}
            {(productInfo || error) && !isLoading && ( // Se já tem produto ou erro, mostra botão de escanear novamente
                <View style={{marginTop: 20}}>
                    <Button title="Escanear Outro Produto" onPress={openCamera} color="#1e90ff"/>
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
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#2c3e50', // Um fundo mais escuro
  },
  container: { // Usado para a câmera e tela de permissão negada
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  content: { // Conteúdo principal na ScrollView
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centeredContent: { // Para centralizar mensagens específicas
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ecf0f1',
    marginBottom: 30,
    textAlign: 'center',
  },
  camera: {
    ...StyleSheet.absoluteFillObject, // Ocupa toda a tela
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
    padding: 10,
    marginTop: 10,
  },
  productInfoContainer: {
    marginTop: 20,
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
    marginTop: 20,
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
    marginTop: 30,
    width: '80%',
  }
});