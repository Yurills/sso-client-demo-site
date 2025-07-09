import AccountSelectionDialog from "@/components/AccountSelectionDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { parseJwt } from "@/lib/jwt";
import { parse } from "path";

const SessionPrompt = () => {
    const {isLoggedIn, userInfo, login, logout} = useAuth();
    const [user, setUser] = useState<any>(null);
    const tokenData = localStorage.getItem('pending_oauth_user') ? JSON.parse(localStorage.getItem('pending_oauth_user')!) : null;

    // console.log(tokenData)
    
    const handleSwitch = async () => {
        const data = await fetch('/api/auth/session/switch', {
            method: 'POST',
            credentials: 'include',
        });
        if (!data.ok) {
            console.error('Failed to switch session:', data.statusText);
            return;
        }

        const user = parseJwt(tokenData?.access_token) || null;

        login({
            user: {
                id: user.sub,
                name: user.preferred_name,
                email: user.email,
            },
            method: 'jwt',
            token_type: 'Bearer',
            access_token: tokenData.access_token,
        });
        console.log('Switching to SSO user:', tokenData);
        //clear local storage
        localStorage.removeItem('pending_oauth_user');
        window.location.href = '/';
    }

    const handleStay = async () => {
        await fetch('/api/auth/session/stay-internal', {
            method: 'POST',
        })
        localStorage.removeItem('pending_oauth_user');
        //remove jwt
        document.cookie = 'jwt_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

        window.location.href = '/';

    }

    useEffect(() => {
        //create ssoUser
        const user = parseJwt(tokenData?.access_token) || null;
        
        setUser(user);
    }, []);

    return (
        <AccountSelectionDialog
            onSelectLocal = {handleStay}
            onSelectSSO = {handleSwitch}
            localUser={userInfo?.user}
            ssoUser={tokenData?.user || user}
            open={isLoggedIn}
            onOpenChange={() => {}}
        />
    );
};

export default SessionPrompt;