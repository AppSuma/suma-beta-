import React, { useState, useEffect, useCallback } from 'react';
import ActivationScreen from './components/ActivationScreen';
import RoleSelectionScreen from './components/RoleSelectionScreen';
import CaseScreen from './components/CaseScreen';
import HistoryScreen from './components/HistoryScreen';
import ExpirationBar from './components/ExpirationBar';
import type { UserRole, Case } from './types';
import { getCase } from './services/db';

enum View {
    Activation,
    RoleSelection,
    Main,
    History,
}

const App: React.FC = () => {
    const [view, setView] = useState<View>(View.Activation);
    const [activeCase, setActiveCase] = useState<Case | null>(null);
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
    const [isExpired, setIsExpired] = useState<boolean>(false);

    const handleSelectCaseFromHistory = async (caseId: number) => {
        const caseData = await getCase(caseId);
        if (caseData) {
            setActiveCase(caseData);
            setView(View.Main);
        }
    };

    const handleStartNewCase = () => {
        localStorage.removeItem('lastActiveCaseId');
        setActiveCase(null);
        setView(View.Main);
    }

    const initializeSession = useCallback(async () => {
        const expiryDateStr = localStorage.getItem('sumaActivationExpiry');
        const savedRole = localStorage.getItem('sumaUserRole') as UserRole;

        if (expiryDateStr) {
            const expiryDate = new Date(expiryDateStr);
            const now = new Date();
            const timeDiff = expiryDate.getTime() - now.getTime();
            const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
            
            setDaysRemaining(daysLeft);

            if (daysLeft <= 0) {
                localStorage.removeItem('sumaActivationExpiry');
                localStorage.removeItem('sumaUserRole');
                localStorage.removeItem('lastActiveCaseId');
                setIsExpired(true);
                setView(View.Activation);
                return;
            }
            
            setIsExpired(false);
            const lastCaseIdStr = localStorage.getItem('lastActiveCaseId');
            
            if (savedRole) {
                setUserRole(savedRole);
                if (lastCaseIdStr) {
                    await handleSelectCaseFromHistory(parseInt(lastCaseIdStr, 10));
                } else {
                    setView(View.Main);
                }
            } else {
                setView(View.RoleSelection);
            }
        } else {
            setIsExpired(false);
            setView(View.Activation);
        }
    }, []);

    useEffect(() => {
        initializeSession();
    }, [initializeSession]);

    useEffect(() => {
        if (activeCase?.id) {
            localStorage.setItem('lastActiveCaseId', activeCase.id.toString());
        }
    }, [activeCase]);

    const handleActivation = () => {
        initializeSession();
    };
    
    const handleRoleSelect = (role: UserRole) => {
        localStorage.setItem('sumaUserRole', role);
        setUserRole(role);
        handleStartNewCase();
    };
    
    const renderView = () => {
        switch (view) {
            case View.Activation:
                return <ActivationScreen onActivate={handleActivation} isExpired={isExpired} />;
            case View.RoleSelection:
                 return <RoleSelectionScreen onRoleSelect={handleRoleSelect} />;
            case View.Main:
                if (!userRole) return <RoleSelectionScreen onRoleSelect={handleRoleSelect} />;
                return <CaseScreen 
                    key={activeCase?.id || 'new'}
                    userRole={userRole}
                    initialCase={activeCase || undefined}
                    onShowHistory={() => setView(View.History)} 
                    onStartNewCase={handleStartNewCase}
                />;
            case View.History:
                return <HistoryScreen 
                    onBack={handleStartNewCase} 
                    onSelectCase={handleSelectCaseFromHistory} 
                />;
            default:
                return <ActivationScreen onActivate={handleActivation} isExpired={isExpired} />;
        }
    };

    return (
        <div className="h-screen w-screen bg-white text-black font-sans">
            {daysRemaining !== null && daysRemaining <= 7 && view !== View.Activation && !isExpired && <ExpirationBar daysRemaining={daysRemaining} />}
            {renderView()}
        </div>
    );
};

export default App;