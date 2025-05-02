const Circle = () => <div className="h-1 w-1 rounded-full bg-gray-200 dark:bg-gray-300"></div>

export const BlogSkeleton = () => {
    return (
        <div className="bg-white dark:bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
            <div className="p-6">
                {/* Author info skeleton */}
                <div className="flex items-center mb-4">
                    <div className="h-10 w-10 bg-gray-200 dark:bg-gray-300 rounded-full"></div>
                    <div className="ml-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-300 rounded w-24"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-300 rounded w-16 mt-2"></div>
                    </div>
                </div>
                
                {/* Title skeleton */}
                <div className="h-6 bg-gray-200 dark:bg-gray-300 rounded w-3/4 mb-3"></div>
                
                {/* Content skeleton */}
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-300 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-300 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-300 rounded w-4/6"></div>
                </div>
                
                {/* Button skeleton */}
                <div className="mt-6">
                    <div className="h-8 bg-gray-200 dark:bg-gray-300 rounded w-28"></div>
                </div>
            </div>
        </div>
    );
};