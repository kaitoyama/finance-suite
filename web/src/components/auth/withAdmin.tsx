'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthStatus } from '@/lib/auth'; // Assuming you have this utility
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

// Define a type for the props that the wrapped component will receive
interface WithAdminProps {
  // Add any specific props you expect the wrapped component to need
  // For example, if you pass down the username:
  // username?: string;
}

export default function withAdmin<P extends WithAdminProps>(WrappedComponent: React.ComponentType<P>) {
  const ComponentWithAdmin = (props: P) => {
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const checkAdminStatus = async () => {
        try {
          // In a real app, getAuthStatus would likely be an API call or check a global state/context
          // For now, it's a placeholder. The `request` object is not available client-side directly.
          // You'd typically have a client-side way to get this, like from a context or a hook.
          // The problem description says: "user認証やadminの確認はmiddlewareでexpressのrequestにusernameとisAdminとして収容しているものを使う"
          // This implies server-side check. For client-side components that need this info,
          // it usually comes from a session context or a specific API endpoint.
          // Let's assume getAuthStatus is adapted or there's a client-side equivalent.
          const auth = await getAuthStatus(); 
          setIsAdmin(auth.isAdmin);
        } catch (error) {
          console.error('Failed to check admin status:', error);
          setIsAdmin(false); // Default to not admin on error
        } finally {
          setIsLoading(false);
        }
      };

      checkAdminStatus();
    }, []);

    if (isLoading) {
      // Show a loading skeleton or spinner while checking auth status
      return (
        <div className="p-4">
          <Skeleton className="h-8 w-1/4 mb-4" />
          <Skeleton className="h-96 w-full" />
        </div>
      );
    }

    if (isAdmin === false) {
      // If not an admin, redirect to a 403 page or show an error message
      // Using Next.js's notFound for a cleaner 403/404 experience
      // You might want to create a specific /403 page instead.
      router.replace('/403'); // Or your custom forbidden page
      return null; // Or a dedicated Forbidden component
    }

    if (isAdmin === true) {
      return <WrappedComponent {...props} />;
    }

    // Fallback for any other state (should ideally not be reached if logic is correct)
    return null;
  };

  ComponentWithAdmin.displayName = `WithAdmin(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return ComponentWithAdmin;
} 