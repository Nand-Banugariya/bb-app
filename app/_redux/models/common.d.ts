import type { ReactElement } from 'react';

export interface TableFilterObject {
    text: string;
    value: string;
}

export interface TableColumnsProps {
    title: string;
    dataIndex: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sorter?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render?: any;
    width?: string;
    className?: string;
    filters?: TableFilterObject[];
}

export interface FiltersObject {
    priorityArray: Array<string>;
    startDate: string;
    endDate: string;
}

export type DateRangeObject = Omit<FiltersObject, 'priorityArray'>;

export interface FilterPriorityObject {
    value: string;
    isChecked: boolean;
    icon: ReactElement;
}

export interface DropdownObject {
    value: string;
    label: string;
    customAbbreviation?: string;
}

// Api common types
export interface QueryParams {
    skip?: number;
    take?: number;
    orderBy?: string | string[] | [];
    include?: string[] | [];
    search_column?: string[] | [];
    search?: string[] | string | [];
    hasApiKey?: boolean | string;
}

export interface PaginateSuccessResponse {
    count: number;
    total: number;
    hasMany: boolean;
}
