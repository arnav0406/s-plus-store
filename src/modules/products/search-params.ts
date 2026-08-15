import { createLoader, parseAsArrayOf, parseAsString, parseAsStringLiteral } from "nuqs/server";

import { DEFAULT_SORT, sortValues } from "./sort";

const params = {

    search: parseAsString
        .withOptions({
            clearOnDefault: true,
        })
        .withDefault(""),

    sort: parseAsStringLiteral(sortValues).withDefault(DEFAULT_SORT),
    minPrice: parseAsString.withOptions({
        clearOnDefault: true,
    }).withDefault(""),
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

export const loadProductFilters = createLoader(params);