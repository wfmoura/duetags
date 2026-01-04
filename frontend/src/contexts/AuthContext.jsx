import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import supabase from '../utils/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('token') || null);
    const [isLoading, setIsLoading] = useState(true);

    const handleLogout = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('pendingCustomization');
    }, []);

    const login = useCallback(async (email, password) => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            if (data.session) {
                localStorage.setItem('token', data.session.access_token);
                localStorage.setItem('refreshToken', data.session.refresh_token);
                setToken(data.session.access_token);

                const userData = {
                    id: data.user.id,
                    email: data.user.email,
                    role: data.user.user_metadata?.role || 'user',
                    name: data.user.user_metadata?.name || data.user.user_metadata?.full_name,
                    phone: data.user.user_metadata?.phone,
                    cpf: data.user.user_metadata?.cpf
                };
                setUser(userData);
                return userData;
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const register = useCallback(async (email, password, metadata, options = {}) => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: metadata,
                    emailRedirectTo: options.redirectTo
                }
            });
            if (error) throw error;

            // Log registration
            if (data.user) {
                await supabase.from('access_logs').insert({
                    user_id: data.user.id,
                    event_type: 'registration',
                    description: `Novo usuário cadastrado: ${email}`
                });
            }

            return data;
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const signInWithSocial = useCallback(async (provider) => {
        setIsLoading(true);
        try {
            const hasPending = localStorage.getItem('pendingCustomization');
            const redirectTo = hasPending
                ? `${window.location.origin}/Customize`
                : `${window.location.origin}/`;

            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    }
                }
            });
            if (error) throw error;
        } catch (error) {
            console.error(`${provider} login error:`, error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateUserProfile = useCallback(async (metadata) => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.auth.updateUser({
                data: metadata
            });
            if (error) throw error;

            setUser(prev => ({
                ...prev,
                ...data.user.user_metadata,
                name: data.user.user_metadata?.name,
                phone: data.user.user_metadata?.phone,
                cpf: data.user.user_metadata?.cpf
            }));

            return data.user;
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        setIsLoading(true);
        try {
            await supabase.auth.signOut();
            handleLogout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsLoading(false);
        }
    }, [handleLogout]);

    useEffect(() => {
        let authSubscription = null;

        const setupAuth = async () => {
            // 1. Get initial session
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    setToken(session.access_token);
                    setUser({
                        id: session.user.id,
                        email: session.user.email,
                        role: session.user.user_metadata?.role || 'user',
                        name: session.user.user_metadata?.name || session.user.user_metadata?.full_name,
                        phone: session.user.user_metadata?.phone,
                        cpf: session.user.user_metadata?.cpf
                    });
                }
            } catch (err) {
                console.error("Error getting initial session:", err);
            } finally {
                setIsLoading(false);
            }

            // 2. Listen for auth changes
            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
                console.log("Auth State Change:", event, session ? "Session active" : "No session");

                if (session) {
                    const userData = {
                        id: session.user.id,
                        email: session.user.email,
                        role: session.user.user_metadata?.role || 'user',
                        name: session.user.user_metadata?.name || session.user.user_metadata?.full_name,
                        phone: session.user.user_metadata?.phone,
                        cpf: session.user.user_metadata?.cpf
                    };

                    setToken(session.access_token);
                    localStorage.setItem('token', session.access_token);
                    localStorage.setItem('refreshToken', session.refresh_token);
                    setUser(userData);

                    if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
                        try {
                            await supabase.from('profiles').upsert({
                                id: session.user.id,
                                email: session.user.email,
                                name: userData.name,
                                role: userData.role
                            }, { onConflict: 'id' });
                        } catch (syncErr) {
                            console.error("Error syncing profile:", syncErr);
                        }
                    }
                } else if (event === 'SIGNED_OUT') {
                    handleLogout();
                } else if (event === 'INITIAL_SESSION' && !session) {
                    setIsLoading(false);
                }
            });

            authSubscription = subscription;
        };

        setupAuth();

        return () => {
            if (authSubscription) {
                authSubscription.unsubscribe();
            }
        };
    }, [handleLogout]);

    return (
        <AuthContext.Provider value={{ user, token, login, logout, register, signInWithSocial, updateUserProfile, isLoading, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
