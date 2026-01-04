/**
 * Authentication Helper Utilities
 * Middleware for protecting API routes
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

/**
 * Require authentication for API routes
 * Returns session if authenticated, error response if not
 */
export async function requireAuth() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json(
            {
                success: false,
                error: 'Unauthorized. Please login to access this resource.'
            },
            { status: 401 }
        );
    }

    return session;
}

/**
 * Check if request is authenticated
 * Returns boolean
 */
export async function isAuthenticated(): Promise<boolean> {
    const session = await getServerSession(authOptions);
    return !!session?.user;
}
