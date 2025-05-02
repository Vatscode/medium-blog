import { useState, useEffect } from 'react';

export const ThemeToggle = () => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [isHovering, setIsHovering] = useState<'light' | 'dark' | null>(null);

    useEffect(() => {
        // Set initial theme
        if (!localStorage.getItem('theme')) {
            localStorage.setItem('theme', 'light');
        }
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    const handleThemeChange = (newTheme: 'light' | 'dark') => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    // Preview theme on hover
    useEffect(() => {
        if (isHovering) {
            document.documentElement.classList.toggle('dark', isHovering === 'dark');
        } else {
            document.documentElement.classList.toggle('dark', theme === 'dark');
        }
    }, [isHovering]);

    return (
        <div className="relative flex items-center">
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 gap-1">
                {/* Light theme button */}
                <button
                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200
                        ${theme === 'light' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'}
                    `}
                    onMouseEnter={() => setIsHovering('light')}
                    onMouseLeave={() => setIsHovering(null)}
                    onClick={() => handleThemeChange('light')}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
                        />
                    </svg>
                    <span className="text-sm font-medium">Light</span>
                </button>

                {/* Dark theme button */}
                <button
                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200
                        ${theme === 'dark' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'}
                    `}
                    onMouseEnter={() => setIsHovering('dark')}
                    onMouseLeave={() => setIsHovering(null)}
                    onClick={() => handleThemeChange('dark')}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
                        />
                    </svg>
                    <span className="text-sm font-medium">Dark</span>
                </button>
            </div>
        </div>
    );
}; 