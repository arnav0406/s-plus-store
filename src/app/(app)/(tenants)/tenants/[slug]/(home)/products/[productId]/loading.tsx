import { ProductViewSkeleton } from "@/modules/products/ui/views/product-view";

/**
 * Rendered instantly by the App Router the moment a <Link> to this route is
 * clicked, while the RSC payload streams in.
 *
 * Without this file the router has nothing to show during navigation, so it
 * keeps the previous page on screen until the server responds. On a
 * force-dynamic route backed by several database round trips that reads as
 * "the click did nothing" — which is why clicking two or three times appeared
 * to be required. The <Suspense> inside page.tsx does not cover this: it only
 * applies once the response has already started streaming.
 */
const Loading = () => {
    return <ProductViewSkeleton />;
};

export default Loading;
