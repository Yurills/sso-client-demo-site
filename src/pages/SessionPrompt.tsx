import AccountSelectionDialog from "@/components/AccountSelectionDialog";
import { useAuth } from "@/contexts/AuthContext";

const SessionPrompt = () => {
    const {isLoggedIn, userInfo} = useAuth();

    const handleSwitch = async () => {
        await fetch('/api/auth/switch-session', {
            method: 'POST',
    });
        window.location.href = '/';  
    }

    const handleStay = async () => {
        await fetch('/api/auth/stay-internal', {
            method: 'POST',
        })
        window.location.href = '/';
    }

    return (
        <AccountSelectionDialog
            onSelectLocal = {handleStay}
            onSelectSSO = {handleSwitch}
            localUser={userInfo?.user}
            ssoUser={null} // Assuming SSO user info is not available here
            open={!isLoggedIn}
            onOpenChange={() => {}}
        />
    );
};

export default SessionPrompt;