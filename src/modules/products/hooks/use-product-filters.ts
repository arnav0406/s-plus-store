import { useQueryStates, parseAsArrayOf, parseAsString, parseAsStringLiteral } from "nuqs";

import { DEFAULT_SORT, sortValues } from "../sort";

const params = {
    search: parseAsString
        .withOptions({
            clearOnDefault: true,
        })
        .withDefault(""),

    sort: parseAsStringLiteral(sortValues).withDefault(DEFAULT_SORT),
    minPrice: parseAsString.withOptions({
        clearOnDefault: true,
    })
        .withDefault(""),
    maxPrice: parseAsString.withOptions({
        clearOnDefault: true,
    })
        .withDefault(""),
    tags: parseAsArrayOf(parseAsString)
        .withOptions({
            clearOnDefault: true,
        })
        .withDefault([]),
};

export const useProductFilters = () => {
    return useQueryStates(params, {
        shallow: true,
        throttleMs: 500,
    });
};
