"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { User, Lock, Mail, UserCircle, Save, Key } from "lucide-react";

interface ProfileData {
    username: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
}

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    // Profile form state
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    // Password form state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            fetchProfile();
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
                <p className="text-muted-foreground">Manage your account settings and preferences</p>
            </div>

            <div className="grid gap-6">
                {/* Profile Information */}
                <div className="bg-card border rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <UserCircle className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">Profile Information</h2>
                            <p className="text-sm text-muted-foreground">Update your account details</p>
                        </div>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                <User className="inline h-4 w-4 mr-2" />
                                Username
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                <UserCircle className="inline h-4 w-4 mr-2" />
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                <Mail className="inline h-4 w-4 mr-2" />
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                            <div className="text-sm text-muted-foreground">
                                Last updated: {profile ? new Date(profile.updatedAt).toLocaleDateString() : "-"}
                            </div>
                            <button
                                type="submit"
                                disabled={updating}
                                className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Save className="h-4 w-4" />
                                {updating ? "Updating..." : "Update Profile"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Change Password */}
                <div className="bg-card border rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Lock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">Change Password</h2>
                            <p className="text-sm text-muted-foreground">Update your password to keep your account secure</p>
                        </div>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                <Key className="inline h-4 w-4 mr-2" />
                                Current Password
                            </label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                                placeholder="Enter your current password"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                <Lock className="inline h-4 w-4 mr-2" />
                                New Password
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                                placeholder="Enter new password (min. 8 characters)"
                                minLength={8}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                <Lock className="inline h-4 w-4 mr-2" />
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                                placeholder="Confirm your new password"
                                minLength={8}
                            />
                        </div>

                        <div className="flex items-center justify-end pt-4 border-t">
                            <button
                                type="submit"
                                disabled={changingPassword}
                                className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Key className="h-4 w-4" />
                                {changingPassword ? "Changing..." : "Change Password"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Account Info */}
                {profile && (
                    <div className="bg-card border rounded-lg p-6">
                        <h3 className="font-semibold mb-4">Account Information</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">Account Created:</span>
                                <p className="font-medium">{new Date(profile.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Last Modified:</span>
                                <p className="font-medium">{new Date(profile.updatedAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
