// FrontEnd/App.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, TextInput, StyleSheet, Alert, ActivityIndicator, Platform, Animated } from 'react-native';
import MainAppContent from './MainAppContent';
import { globalStyles, colors, spacing, typography } from './src/styles/AppStyles'; // Certifique-se que 'colors.background' está definido aqui
import AsyncStorage from '@react-native-async-storage/async-storage';

const ADMIN_PASSWORD = "Admin"; // Corrigido para "Admin" (case sensitive) se essa for a senha
const USER_ROLE_KEY = '@userRole';

const TEXT_FADE_IN_DURATION = 800;
const SPLASH_HOLD_DURATION = 1500;
const SCREEN_FADE_OUT_DURATION = 700;

export default function App() {
    const [showSplash, setShowSplash] = useState(true);
    const [currentView, setCurrentView] = useState('loading'); // Mantém 'loading' como estado inicial
    const [userRole, setUserRole] = useState(null);
    const [adminPassword, setAdminPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    const screenOpacity = useRef(new Animated.Value(1)).current;
    const textOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(textOpacity, {
            toValue: 1,
            duration: TEXT_FADE_IN_DURATION,
            useNativeDriver: true,
        }).start(() => {
            setTimeout(() => {
                Animated.timing(screenOpacity, {
                    toValue: 0,
                    duration: SCREEN_FADE_OUT_DURATION,
                    useNativeDriver: true,
                }).start(() => {
                    setShowSplash(false);
                });
            }, SPLASH_HOLD_DURATION);
        });

        return () => {
            textOpacity.stopAnimation();
            screenOpacity.stopAnimation();
        };
    }, []);

    useEffect(() => {
        if (showSplash) return; // Só carrega o role se o splash não estiver mais visível

        const loadStoredRole = async () => {
            try {
                const storedRole = await AsyncStorage.getItem(USER_ROLE_KEY);
                if (storedRole) {
                    setUserRole(storedRole);
                    setCurrentView('appContent');
                } else {
                    setCurrentView('roleSelection');
                }
            } catch (e) {
                console.error("Failed to load user role from storage", e);
                setCurrentView('roleSelection'); // Fallback
            }
        };
        loadStoredRole();
    }, [showSplash]);

    const saveAndSetRole = async (role) => {
        try {
            await AsyncStorage.setItem(USER_ROLE_KEY, role);
            setUserRole(role);
            setCurrentView('appContent');
        } catch (e) {
            console.error("Failed to save user role", e);
            Alert.alert("Erro", "Não foi possível salvar a preferência de perfil.");
            setUserRole(role); // Tenta prosseguir mesmo sem salvar
            setCurrentView('appContent');
        }
    };

    const handleRoleSelection = (role) => {
        if (role === 'ADMIN') {
            setCurrentView('adminLogin');
            setLoginError('');
            setAdminPassword('');
        } else if (role === 'USER') {
            saveAndSetRole('USER');
        }
    };

    const handleAdminLogin = () => {
        if (adminPassword === ADMIN_PASSWORD) {
            saveAndSetRole('ADMIN');
            setLoginError('');
        } else {
            setLoginError('Senha incorreta!');
            Alert.alert("Erro de Login", "Senha incorreta!");
        }
        setAdminPassword('');
    };

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem(USER_ROLE_KEY);
            setUserRole(null);
            setCurrentView('roleSelection');
            setAdminPassword('');
            setLoginError('');
        } catch (e) {
            console.error("Failed to clear user role", e);
            Alert.alert("Erro", "Não foi possível limpar as preferências de perfil.");
            setUserRole(null); // Força visualmente
            setCurrentView('roleSelection');
        }
    };

    const goBackToRoleSelectionFromLogin = () => {
        setCurrentView('roleSelection');
        setAdminPassword('');
        setLoginError('');
    };

    // Função para renderizar o conteúdo principal baseado na view atual
    const renderMainContent = () => {
        if (currentView === 'loading') {
            return (
                <View style={styles.container}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={{ marginTop: spacing.medium, color: colors.textPrimary }}>Carregando...</Text>
                </View>
            );
        }

        if (currentView === 'roleSelection') {
            return (
                <View style={styles.container}>
                    <Text style={styles.title}>Bem-vindo ao EcoScan!</Text>
                    <Text style={styles.question}>Você é ADMIN ou USUÁRIO?</Text>
                    <View style={styles.buttonContainer}>
                        <Button title="ADMIN" onPress={() => handleRoleSelection('ADMIN')} color={colors.primary} />
                    </View>
                    <View style={styles.buttonContainer}>
                        <Button title="USUÁRIO" onPress={() => handleRoleSelection('USER')} color={colors.secondary} />
                    </View>
                </View>
            );
        }

        if (currentView === 'adminLogin') {
            return (
                <View style={styles.container}>
                    <Text style={styles.title}>Login de Administrador</Text>
                    <Text style={styles.label}>Digite a senha para entrar como ADMIN:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Senha"
                        secureTextEntry
                        value={adminPassword}
                        onChangeText={setAdminPassword}
                        placeholderTextColor={colors.textSecondary}
                    />
                    {loginError ? <Text style={styles.errorText}>{loginError}</Text> : null}
                    <View style={styles.buttonContainer}>
                        <Button title="Entrar" onPress={handleAdminLogin} color={colors.primary} />
                    </View>
                    <View style={styles.buttonContainer}>
                        <Button title="Voltar" onPress={goBackToRoleSelectionFromLogin} color={colors.textSecondary} />
                    </View>
                </View>
            );
        }

        if (currentView === 'appContent' && userRole) {
            return <MainAppContent userRole={userRole} onLogoutRequest={handleLogout} />;
        }

        return ( // Fallback
            <View style={styles.container}>
                <Text>Erro inesperado. Por favor, reinicie o aplicativo.</Text>
            </View>
        );
    };

    return (
        // View externa que define a cor de fundo para todo o app
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            {showSplash ? (
                <Animated.View style={[styles.splashContainer, { opacity: screenOpacity }]}>
                    <Animated.Text style={[styles.splashText, { opacity: textOpacity }]}>
                        EcoScan
                    </Animated.Text>
                </Animated.View>
            ) : (
                renderMainContent()
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    splashContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4CAF50', // Cor verde do splash
        // Adicionar position: 'absolute' e zIndex pode ser necessário se o conteúdo por baixo "piscar"
        // position: 'absolute',
        // top: 0,
        // left: 0,
        // right: 0,
        // bottom: 0,
        // zIndex: 999, // Para garantir que o splash fique por cima
    },
    splashText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    container: { // Este container é para as telas internas (roleSelection, adminLogin, loading)
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.large,
        // backgroundColor: colors.background, // A cor de fundo principal agora está na View externa
    },
    title: {
        fontSize: typography.fontSizeTitle,
        fontWeight: typography.fontWeightBold,
        color: colors.textPrimary,
        marginBottom: spacing.extraLarge,
        textAlign: 'center',
    },
    question: {
        fontSize: typography.fontSizeLarge,
        color: colors.textPrimary,
        marginBottom: spacing.large,
        textAlign: 'center',
    },
    label: {
        fontSize: typography.fontSizeRegular,
        color: colors.textSecondary,
        marginBottom: spacing.small,
        alignSelf: 'flex-start',
        marginLeft: '10%',
    },
    input: {
        width: '80%',
        backgroundColor: colors.inputBackground,
        color: colors.textPrimary,
        paddingHorizontal: spacing.inputHorizontalPadding,
        paddingVertical: spacing.inputVerticalPadding,
        borderRadius: spacing.small,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        marginBottom: spacing.medium,
        fontSize: typography.fontSizeInput,
    },
    buttonContainer: {
        width: '80%',
        marginVertical: spacing.small,
    },
    errorText: {
        color: colors.error,
        fontSize: typography.fontSizeSmall,
        marginBottom: spacing.medium,
        textAlign: 'center',
    },
});