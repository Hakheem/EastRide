import { Navbar } from "@/components/general/Navbar";
import { ThemeToggle } from "@/components/general/ThemeToggle";
import Footer from "@/components/general/Footer";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <div className='text-gray-900 dark:text-white'>
                <Navbar />
                {children}
                <Footer/>
            </div>
            <ThemeToggle />
        </>
    );
}
