import type { NextAuthConfig } from 'next-auth';
 
export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            
            const isLoggedIn = !!auth?.user;
            const targetsDashboard = nextUrl.pathname.startsWith('/dashboard');
            
            if ( targetsDashboard && isLoggedIn ) {
                return true;
            }

            if ( targetsDashboard && !isLoggedIn ){
                return false; // Redirect unauthenticated users to login page
            }

            if ( isLoggedIn ){
                return Response.redirect(new URL('/dashboard', nextUrl));
            }
            
            return true
        },
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;