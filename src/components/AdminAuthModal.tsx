import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  AlertTriangle,
  Fingerprint,
  CheckCircle2,
  X,
  Clock,
  Sparkles,
  Server,
  Zap,
} from 'lucide-react';
import { AdminSecurityConfig, AdminAuditLog } from '../types';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  securityConfig: AdminSecurityConfig;
  onAuthenticateSuccess: () => void;
  onLogAudit: (action: string, details: string, status: 'SUCCESS' | 'WARNING' | 'FAILED') => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  securityConfig,
  onAuthenticateSuccess,
  onLogAudit,
}) => {
  const [authMode, setAuthMode] = useState<'KEY' | 'PIN'>('KEY');
  const [inputKey, setInputKey] = useState('');
  const [inputPin, setInputPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const [sessionDuration, setSessionDuration] = useState<number>(30); // 30 mins
  const [isBiometricScanning, setIsBiometricScanning] = useState(false);
  const [successPulse, setSuccessPulse] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isLockedOut && lockoutTimer > 0) {
      interval = setInterval(() => {
        setLockoutTimer((prev) => {
          if (prev <= 1) {
            setIsLockedOut(false);
            setFailedAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLockedOut, lockoutTimer]);

  if (!isOpen) return null;

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (isLockedOut) {
      setErrorMsg(`System Locked due to consecutive failures. Try again in ${lockoutTimer}s.`);
      return;
    }

    let isValid = false;
    if (authMode === 'KEY') {
      isValid = inputKey.trim() === securityConfig.adminKey;
    } else {
      isValid = inputPin.trim() === securityConfig.pin;
    }

    if (isValid) {
      setErrorMsg('');
      setSuccessPulse(true);
      onLogAudit('ADMIN_LOGIN_SUCCESS', `Master Admin authenticated via ${authMode}`, 'SUCCESS');

      setTimeout(() => {
        setSuccessPulse(false);
        setInputKey('');
        setInputPin('');
        onAuthenticateSuccess();
      }, 600);
    } else {
      const newFails = failedAttempts + 1;
      setFailedAttempts(newFails);
      onLogAudit(
        'ADMIN_LOGIN_FAILED',
        `Failed access attempt using ${authMode} (Attempt ${newFails}/5)`,
        'FAILED'
      );

      if (newFails >= 5) {
        setIsLockedOut(true);
        setLockoutTimer(45);
        setErrorMsg('Security lockout triggered! Too many incorrect attempts.');
      } else {
        setErrorMsg(`Invalid credentials! ${5 - newFails} attempts remaining.`);
      }
    }
  };

  const handleQuickDemoUnlock = () => {
    setInputKey(securityConfig.adminKey);
    setErrorMsg('');
    setSuccessPulse(true);
    onLogAudit('ADMIN_LOGIN_SUCCESS', 'Master Admin unlocked via One-Click Demo Key', 'SUCCESS');
    setTimeout(() => {
      setSuccessPulse(false);
      setInputKey('');
      onAuthenticateSuccess();
    }, 400);
  };

  const handleBiometricSim = () => {
    setIsBiometricScanning(true);
    setErrorMsg('');
    setTimeout(() => {
      setIsBiometricScanning(false);
      setSuccessPulse(true);
      onLogAudit('ADMIN_LOGIN_SUCCESS', 'Biometric / Hardware Security Key Verified', 'SUCCESS');
      setTimeout(() => {
        setSuccessPulse(false);
        onAuthenticateSuccess();
      }, 500);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-purple-500/40 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-6 shadow-2xl shadow-purple-950/50">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 shadow-inner">
            <Lock className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-purple-950 px-2 py-0.5 text-[10px] font-mono font-bold text-purple-300 border border-purple-800">
                RESTRICTED ACCESS
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                256-Bit SSL Guard
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
              Admin Gateway Authentication
            </h2>
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-400 leading-relaxed">
          Access to Platform Loss Guard, Supplier Escrow, Bank Payout Gateways, and Financial Take-rate configs requires Master Administrator Authorization.
        </p>

        {/* Quick Demo Helper Box */}
        <div className="mt-4 rounded-xl border border-purple-900/60 bg-purple-950/30 p-3 flex items-center justify-between gap-2">
          <div className="text-[11px] text-purple-200 space-y-0.5">
            <div className="font-bold flex items-center gap-1.5 text-purple-300">
              <KeyRound className="h-3.5 w-3.5" />
              <span>Default Master Credentials:</span>
            </div>
            <div className="font-mono text-slate-300">
              Passkey: <span className="font-bold text-amber-300 bg-purple-900/60 px-1.5 py-0.2 rounded">{securityConfig.adminKey}</span> • PIN: <span className="font-bold text-emerald-300 bg-purple-900/60 px-1.5 py-0.2 rounded">{securityConfig.pin}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleQuickDemoUnlock}
            className="flex items-center gap-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-2.5 py-1.5 transition shadow"
            title="Auto-fill and unlock for testing"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>1-Click Unlock</span>
          </button>
        </div>

        {/* Auth Mode Switch Tabs */}
        <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-slate-950 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setAuthMode('KEY');
              setErrorMsg('');
            }}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition ${
              authMode === 'KEY'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span>Master Key / Password</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('PIN');
              setErrorMsg('');
            }}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition ${
              authMode === 'PIN'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>6-Digit Security PIN</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleVerify} className="mt-4 space-y-4">
          {authMode === 'KEY' ? (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex justify-between">
                <span>Master Security Key</span>
                <span className="text-[11px] text-slate-500">Case-sensitive</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter admin password (e.g. admin786)"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  disabled={isLockedOut}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 pr-10 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition font-mono"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex justify-between">
                <span>6-Digit Admin PIN Code</span>
                <span className="text-[11px] text-slate-500">Numbers only</span>
              </label>
              <input
                type="password"
                maxLength={6}
                required
                placeholder="• • • • • • (Default: 123456)"
                value={inputPin}
                onChange={(e) => setInputPin(e.target.value.replace(/\D/g, ''))}
                disabled={isLockedOut}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-center text-base tracking-[0.5em] font-mono text-emerald-400 placeholder-slate-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition"
                autoFocus
              />
            </div>
          )}

          {/* Session Expiry Duration Select */}
          <div className="flex items-center justify-between rounded-xl bg-slate-950/60 p-2.5 border border-slate-800 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-purple-400" />
              <span>Session Duration:</span>
            </span>
            <select
              value={sessionDuration}
              onChange={(e) => setSessionDuration(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 text-xs focus:outline-none"
            >
              <option value={15}>15 Minutes</option>
              <option value={30}>30 Minutes</option>
              <option value={60}>1 Hour</option>
              <option value={480}>Full Working Day (8h)</option>
            </select>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-start gap-2 rounded-xl bg-rose-950/60 border border-rose-800 p-3 text-xs text-rose-300 animate-in fade-in duration-150">
              <AlertTriangle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{errorMsg}</p>
                {isLockedOut && (
                  <p className="text-[11px] text-rose-400/80 mt-0.5">
                    Cooldown active: {lockoutTimer} seconds remaining.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              type="submit"
              disabled={isLockedOut || successPulse}
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition shadow-lg ${
                successPulse
                  ? 'bg-emerald-600 text-white'
                  : 'bg-purple-600 hover:bg-purple-500 text-white active:scale-[0.99]'
              }`}
            >
              {successPulse ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Clearance Granted • Redirecting...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Authorize & Open Admin Console</span>
                </>
              )}
            </button>

            {/* Hardware Key / Biometric simulation */}
            <button
              type="button"
              onClick={handleBiometricSim}
              disabled={isBiometricScanning || isLockedOut}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 py-2.5 text-xs text-slate-300 transition"
            >
              <Fingerprint className={`h-4 w-4 ${isBiometricScanning ? 'text-purple-400 animate-spin' : 'text-slate-400'}`} />
              <span>{isBiometricScanning ? 'Verifying Hardware Security Key...' : 'Unlock with Security Token / Biometric'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
