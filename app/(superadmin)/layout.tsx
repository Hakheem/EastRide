import { ThemeToggle } from "@/components/general/ThemeToggle";
// Removed requireSuperAdmin() - middleware handles auth now

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
    // Auth is now handled by middleware, no need to check here
    
    return (
        <>
            <div className='text-gray-900 dark:text-white'>
                {children} 
            </div>
            <ThemeToggle />
        </>
    );
}

