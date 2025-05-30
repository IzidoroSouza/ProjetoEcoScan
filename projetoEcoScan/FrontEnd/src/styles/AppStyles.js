// FrontEnd/src/styles/AppStyles.js
import { StyleSheet } from 'react-native';

export const colors = {
    primary: '#1abc9c',       // Verde água (para destaques, títulos de formulário)
    secondary: '#1e90ff',     // Azul (para botões secundários como "Escanear Outro")
    background: '#2c3e50',    // Azul escuro (fundo principal da tela)
    surface: '#34495e',       // Azul um pouco mais claro (para cards de informação do produto)
    surfaceForm: '#3e5770',   // Um tom diferente para o container do formulário
    textPrimary: '#ecf0f1',    // Branco/Cinza bem claro (para a maioria dos textos)
    textSecondary: '#bdc3c7',  // Cinza mais escuro (para textos menos importantes, placeholders)
    error: '#e74c3c',         // Vermelho (para caixas de erro)
    warning: '#f1c40f',       // Amarelo (para mensagens de aviso/usuário)
    accent: '#2ed573',        // Verde limão (para o botão principal "Escanear")
    cancel: '#ff4757',        // Vermelho/Rosa (para botões de cancelar)
    inputBorder: '#1abc9c',    // Cor da borda dos inputs
    inputBackground: '#2c3e50', // Fundo dos inputs (pode ser o mesmo do app)
    loadingIndicator: '#00ff00', // Cor do ActivityIndicator
    cameraBackground: '#000000', // Fundo da tela da câmera
    cameraOverlayText: '#FFFFFF', // Texto no overlay da câmera
};

export const typography = {
    fontSizeTitle: 32,
    fontSizeProductTitle: 22,
    fontSizeSuggestionTitle: 20,
    fontSizeLabel: 16,
    fontSizeValue: 15,
    fontSizeMessage: 16,
    fontSizeInput: 15,
    fontWeightBold: 'bold',
};

export const spacing = {
    small: 8,
    medium: 16,
    large: 24,
    paddingContent: 20,
    marginBottomTitle: 20,
    marginBottomSection: 15,
    marginBottomItem: 12,
    inputVerticalPadding: 10,
    inputHorizontalPadding: 15,
};

export const globalStyles = StyleSheet.create({
    // Containers e Layout
    scrollContainer: {
        flexGrow: 1,
        backgroundColor: colors.background,
    },
    fullScreenContainer: { // Para câmera, loading inicial
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.cameraBackground,
    },
    contentContainer: { // Conteúdo principal dentro da ScrollView
        flex: 1, // Tenta ocupar o máximo, mas permite scroll se necessário
        padding: spacing.paddingContent,
        alignItems: 'center',
        justifyContent: 'center', // Para quando o conteúdo é menor que a tela
    },
    centeredMessageContainer: { // Para mensagens como permissão negada
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.paddingContent,
    },
    // Textos Globais
    appTitle: {
        fontSize: typography.fontSizeTitle,
        fontWeight: typography.fontWeightBold,
        color: colors.textPrimary,
        marginBottom: spacing.marginBottomTitle,
        textAlign: 'center',
    },
    messageText: {
        fontSize: typography.fontSizeMessage,
        color: colors.textSecondary,
        textAlign: 'center',
        paddingHorizontal: spacing.small,
        marginVertical: spacing.medium,
    },
    userMessageEmphasis: {
        color: colors.warning,
        fontWeight: typography.fontWeightBold,
        marginBottom: spacing.marginBottomSection,
    },
    // Caixas e Botões
    errorBox: {
        marginTop: spacing.marginBottomSection,
        padding: spacing.medium,
        backgroundColor: colors.error,
        borderRadius: spacing.small,
        width: '100%',
    },
    errorText: {
        fontSize: typography.fontSizeMessage,
        fontWeight: typography.fontWeightBold,
        color: colors.textPrimary, // Branco para contraste no fundo vermelho
        textAlign: 'center',
    },
    errorTextDetails: {
        fontSize: typography.fontSizeValue,
        color: colors.textPrimary,
        textAlign: 'center',
        marginTop: spacing.small,
    },
    actionButtonContainer: { // Para os botões "Escanear" / "Escanear Outro"
        marginTop: spacing.large,
        width: '80%',
    },
    // Activity Indicator
    loadingIndicator: {
        marginVertical: spacing.large,
    },
});

// Estilos específicos que podem ser importados por componentes
export const cameraScreenStyles = StyleSheet.create({
    camera: {
        ...StyleSheet.absoluteFillObject,
    },
    overlay: {
        position: 'absolute',
        top: '20%',
        left: '10%',
        right: '10%',
        padding: spacing.medium,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: spacing.small,
        alignItems: 'center',
    },
    overlayText: {
        color: colors.cameraOverlayText,
        fontSize: 18, // Pode ser um typography.fontSizeOverlay
        textAlign: 'center',
    },
    fixedBottomButtonContainer: {
        position: 'absolute',
        bottom: spacing.large,
        left: spacing.paddingContent,
        right: spacing.paddingContent,
    },
});