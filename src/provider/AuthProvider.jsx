import React, { createContext, useEffect, useState } from 'react';
import { createUserWithEmailAndPassword, deleteUser, getAdditionalUserInfo, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from 'firebase/auth';
import { auth } from '../firebase/firebase.init';
import useAxiosPublic from '../pages/hooks/useAxiosPublic';

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const axiosPublic = useAxiosPublic();

    const provider = new GoogleAuthProvider();

    const createNewUser = (email, password) => {
        setLoading(true);
        return createUserWithEmailAndPassword(auth, email, password);
    };

    const userLogin = (email, password) => {
        setLoading(true);
        return signInWithEmailAndPassword(auth, email, password);
    };

    const logOut = () => {
        setLoading(true);
        return signOut(auth);
    };

    const updateUserProfile = (updatedData) => {
        return updateProfile(auth.currentUser, updatedData);
    };

    const handleGoogle = () => {
        setLoading(true);
        return signInWithPopup(auth, provider);
    };

    const isNewAccount = (result) => {
        return !!getAdditionalUserInfo(result)?.isNewUser;
    };

    const discardNewAccount = async () => {
        if (!auth.currentUser) return;
        try {
            await deleteUser(auth.currentUser);
        } catch {
            await signOut(auth);
        }
    };

    const registerUserRecord = async (userInfo) => {
        try {
            await axiosPublic.post('/users', userInfo);
            return true;
        } catch {
            return false;
        }
    };

    const authInfo = {
        user,
        setUser,
        createNewUser,
        userLogin,
        logOut,
        updateUserProfile,
        loading,
        handleGoogle,
        registerUserRecord,
        isNewAccount,
        discardNewAccount,
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                try {
                    const res = await axiosPublic.post('/jwt', { email: currentUser.email });
                    if (res.data?.token) {
                        localStorage.setItem('access-token', res.data.token);
                    } else {
                        localStorage.removeItem('access-token');
                    }
                } catch {
                    localStorage.removeItem('access-token');
                }
            } else {
                localStorage.removeItem('access-token');
            }

            setLoading(false);
        });
        return () => unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
