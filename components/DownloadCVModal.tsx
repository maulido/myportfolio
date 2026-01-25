"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Mail, CheckCircle, X } from "lucide-react";

interface DownloadCVModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function DownloadCVModal({ isOpen, onClose }: DownloadCVModalProps) {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Success
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/otp/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (data.success) {
                setStep(2);
            } else {
                setError(data.error || "Failed to send OTP");
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/otp/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });
            const data = await res.json();
            if (data.success) {
                setStep(3);
                window.open(data.downloadUrl, "_blank");
            } else {
                setError(data.error || "Invalid OTP");
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold">Secure CV Download</h3>
                                <button onClick={onClose} className="text-muted-foreground hover:text-primary transition-colors">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            {step === 1 && (
                                <form onSubmit={handleSendOtp} className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        Please enter your email address to receive a verification code. We protect our documents to ensure they reach the right hands.
                                    </p>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-muted/30 border border-primary/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                placeholder="name@example.com"
                                            />
                                        </div>
                                    </div>
                                    {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0"
                                    >
                                        {loading ? "Sending..." : "Send Verification Code"}
                                    </button>
                                </form>
                            )}

                            {step === 2 && (
                                <form onSubmit={handleVerifyOtp} className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        A 6-digit code has been sent to <span className="text-primary font-medium">{email}</span>. Please enter it below.
                                    </p>
                                    <div className="space-y-2 text-center">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Verification Code</label>
                                        <input
                                            type="text"
                                            maxLength={6}
                                            required
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className="w-full text-center text-3xl tracking-[1rem] font-bold py-4 bg-muted/30 border border-primary/10 rounded-xl focus:outline-none focus:border-primary transition-all"
                                            placeholder="000000"
                                        />
                                    </div>
                                    {error && <p className="text-xs text-red-500 font-medium text-center">{error}</p>}
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="flex-1 py-3 bg-muted border border-white/5 rounded-xl font-bold hover:bg-muted/80 transition-all text-sm"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-[2] py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all disabled:opacity-50"
                                        >
                                            {loading ? "Verifying..." : "Verify & Download"}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {step === 3 && (
                                <div className="text-center py-8 space-y-4">
                                    <div className="flex justify-center">
                                        <div className="p-4 rounded-full bg-green-500/10 text-green-500 animate-bounce">
                                            <CheckCircle className="h-12 w-12" />
                                        </div>
                                    </div>
                                    <h4 className="text-xl font-bold">Verification Successful!</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Your download should have started automatically. If not, click the button below.
                                    </p>
                                    <button
                                        onClick={() => window.open("/cv.pdf", "_blank")}
                                        className="w-full py-3 bg-green-500 text-white rounded-xl font-bold shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all"
                                    >
                                        Download CV Again
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="text-sm text-muted-foreground hover:text-primary underline"
                                    >
                                        Close
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
