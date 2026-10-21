'use client';
import { useState } from 'react';

/** Default page size for tables and lists. */
export const DEFAULT_TABLE_LIMIT = 10;

type ListQueryParams = {
    take?: number;
    skip?: number;
    search?: string | string[];
    orderBy?: string | string[];
    search_column?: string[];
};

type UseListProps = {
    queryParams?: ListQueryParams;
};

/**
 * skip / take / search / orderBy state for a paginated list, in the API's query-param shape.
 * Pass `apiParam` to the service call; wire the table's change and search handlers.
 */
export const useList = ({
    queryParams = { take: DEFAULT_TABLE_LIMIT, skip: 0, search: [] }
}: UseListProps = {}) => {
    const [apiParam, setApiParam] = useState<ListQueryParams>(() => structuredClone(queryParams));

    const handleOnTableChange = ({
        pagination,
        sorter
    }: {
        pagination?: { skip?: number };
        sorter?: { orderBy?: string | string[] };
    }) => {
        setApiParam((current) => ({
            ...current,
            ...(pagination ? { skip: pagination.skip } : {}),
            ...(sorter?.orderBy ? { orderBy: sorter.orderBy } : {})
        }));
    };

    const onSearchTable = (value: string, searchOption: string[]): void => {
        setApiParam((current) => ({
            ...current,
            search: value?.toString(),
            search_column: searchOption,
            skip: 0
        }));
    };

    return {
        apiParam,
        setApiParam,
        handleOnTableChange,
        onSearchTable
    };
};

export default useList;
