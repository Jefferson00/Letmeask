import { useEffect, useState, createContext, ReactNode, useContext } from 'react';
import { auth, firebase } from '../services/firebase';

type User ={
    id:string;
    name:string;
    avatar: string;
}

type AuthContextType = {
    user: User | undefined;
    signInWithGoogle: () => Promise<void>;
}

type AuthProviderProps = {
    children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextType);

export function AuthProvider(props: AuthProviderProps){
    const [user, setUser] = useState<User>();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user){
                const { displayName, photoURL, uid } = user

                if(!displayName || !photoURL){
                    throw new Error('Missing information from Google Account.');
                }

                setUser({
                    id: uid,
                    name: displayName,
                    avatar: photoURL,
                });
            }
        });

        return () => {
            unsubscribe();
        }
    },[]);

    async function signInWithGoogle() {
        console.log(process.env.REACT_APP_API_KEY)
        const provider = new firebase.auth.GoogleAuthProvider();

        const result = await auth.signInWithPopup(provider);
        console.log(result)

        if(result.user){
            const { displayName, photoURL, uid } = result.user

            if(!displayName || !photoURL){
                throw new Error('Missing information from Google Account.');
            }

            setUser({
                id: uid,
                name: displayName,
                avatar: photoURL,
            });
        }
    }


    return(
        <AuthContext.Provider value={{
            signInWithGoogle,
            user,
        }}>
            {props.children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const value = useContext(AuthContext);

    return value;
}