// FrontEnd/src/styles/AppStyles.js
import { StyleSheet } from 'react-native';

export const colors = {
    primary: '#1abc9c',
    secondary: '#1e90ff',
    background: '#2c3e50',
    surface: '#34495e',
    surfaceForm: '#3e5770',
    textPrimary: '#ecf0f1',
    textSecondary: '#bdc3c7',
    error: '#e74c3c',
    warning: '#f1c40f',
    accent: '#2ed573',
    cancel: '#ff4757',
    inputBorder: '#1abc9c',
    inputBackground: '#2c3e50',
    loadingIndicator: '#00ff00',
    cameraBackground: '#000000',
    cameraOverlayText: '#FFFFFF',
};

export const typography = {
    fontSizeTitle: 32,
    fontSizeProductTitle: 22,
    fontSizeSuggestionTitle: 20,
    fontSizeAdminSectionTitle: 24,
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
    scrollContainer: {
        flexGrow: 1,
        backgroundColor: colors.background,
    },
    fullScreenContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.cameraBackground,
    },
    contentContainer: {
        flex: 1,
        padding: spacing.paddingContent,
        alignItems: 'center',
        justifyContent: 'center',
    },
    centeredMessageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.paddingContent,
    },
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
        color: colors.textPrimary,
        textAlign: 'center',
    },
    errorTextDetails: {
        fontSize: typography.fontSizeValue,
        color: colors.textPrimary,
        textAlign: 'center',
        marginTop: spacing.small,
    },
    actionButtonContainer: {
        marginTop: spacing.large,
        width: '80%',
    },
    loadingIndicator: {
        marginVertical: spacing.large,
    },
    adminSectionContainer: {
        width: '100%',
        marginTop: spacing.medium,
    },
    adminSectionTitle: {
        fontSize: typography.fontSizeAdminSectionTitle,
        fontWeight: typography.fontWeightBold,
        color: colors.warning,
        textAlign: 'center',
        marginBottom: spacing.medium,
    },
    suggestionListItem: {
        backgroundColor: colors.surface,
        padding: spacing.medium,
        borderRadius: spacing.small,
        marginBottom: spacing.medium,
        width: '100%',
    },
    suggestionText: {
        fontSize: typography.fontSizeLabel,
        fontWeight: typography.fontWeightBold,
        color: colors.textPrimary,
        marginBottom: spacing.small / 2,
    },
    suggestionTextSmall: {
        fontSize: typography.fontSizeValue,
        color: colors.textSecondary,
        marginBottom: spacing.small / 2,
    },
});

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
        fontSize: 18,
        textAlign: 'center',
    },
    fixedBottomButtonContainer: {
        position: 'absolute',
        bottom: spacing.large,
        left: spacing.paddingContent,
        right: spacing.paddingContent,
    },
});