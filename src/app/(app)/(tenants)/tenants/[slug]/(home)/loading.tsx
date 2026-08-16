import { ProductListSkeleton } from "@/modules/products/ui/components/product-list";

/**
 * Instant navigation boundary for every route under (home) — the storefront
 * index, /[category] and /[category]/[subcategory].
 *
 * Every page here is `force-dynamic`, so the App Router has nothing cached to
 * show on click. Without a loading.tsx it keeps the previous page on screen
 * until the server responds, which reads as "the click did nothing".
 */
const Loading = () => {
    return (
        <div className="px-4 lg:px-12 py-8 flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-y-2 lg:gap-y-0 justify-between">
                <div className="h-8 w-52 bg-neutral-200 rounded animate-pulse" />
                <div className="h-8 w-64 bg-neutral-200 rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-6 xl:grid-cols-8 gap-y-6 gap-x-12">
                <div className="lg:col-span-2 xl:col-span-2">
                    <div className="h-56 bg-neutral-200 rounded-lg animate-pulse" />
                </div>
                <div className="lg:col-span-4 xl:col-span-6">
                    <ProductListSkeleton />
                </div>
            </div>
        </div>
    );
};

export default Loading;
