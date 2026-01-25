"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { User, Lock, Mail, UserCircle, Save, Key, Calendar, Shield, CheckCircle2, MapPin, Phone, FileText } from "lucide-react";
import AboutMeEditor, { AboutMeData } from "@/components/admin/AboutMeEditor";

interface ProfileData {
    username: string;
    name: string;
    email: string;
    contactEmail?: string;
    contactPhone?: string;
    contactLocation?: string;
    createdAt: string;
    updatedAt: string;
}

export default function ProfilePage() {
    const { status } = useSession();
    const router = useRouter();

    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    // Profile form state
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    // Contact info form state
    const [contactEmail, setContactEmail] = useState("");
    const [contactPhone, setContactPhone] = useState("");
    const [contactLocation, setContactLocation] = useState("");
    const [updatingContact, setUpdatingContact] = useState(false);

    // Password form state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // About Me state
    const [aboutMe, setAboutMe] = useState({ paragraph1: '', paragraph2: '' });

    const fetchAboutMe = async () => {
        try {
            const res = await fetch('/api/about');
            const data = await res.json();
            if (data.success) {
                setAboutMe(data.data);
            }
        } catch (error) {
            console.error("Error fetching About Me:", error);
        }
    };

    const handleAboutMeSave = async (data: AboutMeData) => {
        try {
            const res = await fetch('/api/about', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                const result = await res.json();
                setAboutMe(result.data);
                toast.success('About Me updated successfully!');
            } else {
                toast.error('Failed to update About Me');
            }
        } catch (error) {
            console.error('Error updating About Me:', error);
            toast.error('An error occurred while updating About Me');
        }
    };

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            fetchProfile();
            fetchAboutMe();
        }
    }, [status, router]);

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/admin/profile");
            const data = await res.json();

            if (data.success) {
                setProfile(data.data);
                setUsername(data.data.username);
                setName(data.data.name);
                setEmail(data.data.email);
                setContactEmail(data.data.contactEmail || "");
                setContactPhone(data.data.contactPhone || "");
                setContactLocation(data.data.contactLocation || "");
            } else {
                toast.error(data.error || "Failed to fetch profile");
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            toast.error("Failed to fetch profile");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);

        try {
            const res = await fetch("/api/admin/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, name, email })
            });

            const data = await res.json();

            if (data.success) {
                setProfile(data.data);
                toast.success("Profile updated successfully!");
            } else {
                toast.error(data.error || "Failed to update profile");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile");
        } finally {
            setUpdating(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        setChangingPassword(true);

        try {
            const res = await fetch("/api/admin/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
            });

            const data = await res.json();

            if (data.success) {
                toast.success("Password changed successfully!");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                toast.error(data.error || "Failed to change password");
            }
        } catch (error) {
            console.error("Error changing password:", error);
            toast.error("Failed to change password");
        } finally {
            setChangingPassword(false);
        }
    };

    const handleUpdateContactInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdatingContact(true);

        try {
            const res = await fetch("/api/admin/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username,
                    name,
                    email,
                    contactEmail,
                    contactPhone,
                    contactLocation
                })
            });

            const data = await res.json();

            if (data.success) {
                setProfile(data.data);
                toast.success("Contact information updated successfully!");
            } else {
                toast.error(data.error || "Failed to update contact information");
            }
        } catch (error) {
            console.error("Error updating contact info:", error);
            toast.error("Failed to update contact information");
        } finally {
            setUpdatingContact(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg">
                            <UserCircle className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                Profile Settings
                            </h1>
                            <p className="text-muted-foreground mt-1">Manage your account settings and security</p>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Column - Profile Info & Password */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Profile Information Card */}
                        <div className="bg-card border border-border/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-border/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-primary/10 rounded-lg ring-2 ring-primary/20">
                                        <User className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">Profile Information</h2>
                                        <p className="text-sm text-muted-foreground">Update your personal details</p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleUpdateProfile} className="p-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
                                            <User className="h-4 w-4 text-primary" />
                                            Username
                                        </label>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                            placeholder="Enter username"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
                                            <UserCircle className="h-4 w-4 text-primary" />
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                            placeholder="Enter full name"
                                            required
                                        />
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-primary" />
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                            placeholder="Enter email address"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-6 pt-6 border-t border-border/50">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Last updated: {profile ? new Date(profile.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "-"}
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={updating}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/90 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
                                    >
                                        <Save className="h-4 w-4" />
                                        {updating ? "Updating..." : "Update Profile"}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Change Password Card */}
                        <div className="bg-card border border-border/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                            <div className="bg-gradient-to-r from-orange-500/10 via-orange-500/5 to-transparent p-6 border-b border-border/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-orange-500/10 rounded-lg ring-2 ring-orange-500/20">
                                        <Shield className="h-5 w-5 text-orange-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">Security Settings</h2>
                                        <p className="text-sm text-muted-foreground">Update your password to keep your account secure</p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleChangePassword} className="p-6">
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
                                            <Key className="h-4 w-4 text-orange-500" />
                                            Current Password
                                        </label>
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                                            placeholder="Enter your current password"
                                            required
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
                                                <Lock className="h-4 w-4 text-orange-500" />
                                                New Password
                                            </label>
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                                                placeholder="Min. 8 characters"
                                                required
                                                minLength={8}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
                                                <Lock className="h-4 w-4 text-orange-500" />
                                                Confirm Password
                                            </label>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                                                placeholder="Confirm new password"
                                                required
                                                minLength={8}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end mt-6 pt-6 border-t border-border/50">
                                    <button
                                        type="submit"
                                        disabled={changingPassword}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
                                    >
                                        <Key className="h-4 w-4" />
                                        {changingPassword ? "Changing..." : "Change Password"}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Contact Information Card */}
                        <div className="bg-card border border-border/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                            <div className="bg-gradient-to-r from-green-500/10 via-green-500/5 to-transparent p-6 border-b border-border/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-green-500/10 rounded-lg ring-2 ring-green-500/20">
                                        <Mail className="h-5 w-5 text-green-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">Contact Information</h2>
                                        <p className="text-sm text-muted-foreground">Public contact details displayed on your website</p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleUpdateContactInfo} className="p-6">
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-green-500" />
                                            Contact Email
                                        </label>
                                        <input
                                            type="email"
                                            value={contactEmail}
                                            onChange={(e) => setContactEmail(e.target.value)}
                                            className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
                                            placeholder="your-email@domain.com"
                                        />
                                        <p className="text-xs text-muted-foreground">Email displayed in the &quot;Get in Touch&quot; section</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-green-500" />
                                            Contact Phone
                                        </label>
                                        <input
                                            type="text"
                                            value={contactPhone}
                                            onChange={(e) => setContactPhone(e.target.value)}
                                            className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
                                            placeholder="+62 812 3456 7890"
                                        />
                                        <p className="text-xs text-muted-foreground">Phone number displayed publicly</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-green-500" />
                                            Location
                                        </label>
                                        <input
                                            type="text"
                                            value={contactLocation}
                                            onChange={(e) => setContactLocation(e.target.value)}
                                            className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
                                            placeholder="Jakarta, Indonesia"
                                        />
                                        <p className="text-xs text-muted-foreground">Your location or city</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end mt-6 pt-6 border-t border-border/50">
                                    <button
                                        type="submit"
                                        disabled={updatingContact}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
                                    >
                                        <Save className="h-4 w-4" />
                                        {updatingContact ? "Updating..." : "Update Contact Info"}
                                    </button>
                                </div>
                            </form>
                        </div>
                        {/* About Me Editor Card */}
                        <div className="bg-card border border-border/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-transparent p-6 border-b border-border/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-purple-500/10 rounded-lg ring-2 ring-purple-500/20">
                                        <FileText className="h-5 w-5 text-purple-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">About Me Content</h2>
                                        <p className="text-sm text-muted-foreground">Edit your biography and introduction</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <AboutMeEditor
                                    initialData={aboutMe}
                                    onSave={handleAboutMeSave}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Account Info */}
                    <div className="space-y-6">
                        {/* Account Information Card */}
                        {profile && (
                            <div className="bg-card border border-border/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden sticky top-6">
                                <div className="bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent p-6 border-b border-border/50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-blue-500/10 rounded-lg ring-2 ring-blue-500/20">
                                            <Calendar className="h-5 w-5 text-blue-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold">Account Details</h3>
                                            <p className="text-sm text-muted-foreground">Your account information</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-background to-primary/5 rounded-xl border border-border/30">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Calendar className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Account Created</p>
                                            <p className="text-sm font-semibold mt-1">
                                                {new Date(profile.createdAt).toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-background to-blue-500/5 rounded-xl border border-border/30">
                                        <div className="p-2 bg-blue-500/10 rounded-lg">
                                            <CheckCircle2 className="h-4 w-4 text-blue-500" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Last Modified</p>
                                            <p className="text-sm font-semibold mt-1">
                                                {new Date(profile.updatedAt).toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-background to-green-500/5 rounded-xl border border-border/30">
                                        <div className="p-2 bg-green-500/10 rounded-lg">
                                            <Shield className="h-4 w-4 text-green-500" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Account Status</p>
                                            <p className="text-sm font-semibold mt-1 flex items-center gap-2">
                                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                                Active
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
