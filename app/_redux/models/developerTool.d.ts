/* eslint-disable @typescript-eslint/no-explicit-any -- ported from bb-app as-is; typed when its feature moves over */
// network logs tab interfaces

import { BugHasNetwork } from '@redux/slices/sessionDetails';

export interface FilterCallbackParams {
    filter: NetworkFiltersObject;
    status: string | NetworkMethodObject | null;
    method: string | NetworkMethodObject | null;
}

export interface PriorityObject {
    title: string;
    value: string;
}

export interface ConsoleFilterObject {
    key: string;
    label: string;
}

export interface NetworkDetailsTabsObject {
    key: string;
    label: string;
    sections: NetworkMethodObject[];
}

export interface NetworkDefaultColumnsObject {
    Header: string;
    accessor: keyof BugHasNetwork;
    hasTime?: boolean;
    Cell?: (data?: any) => JSX.Element;
}

export interface NetworkFiltersObject {
    key: string;
    label: string;
    values: string[];
}

export interface NetworkMethodAndStatusObject {
    key: string;
    label: string;
}

export interface LogsMethodsAndStatusesObject {
    statuses: NetworkMethodObject[] | [];
    methods: NetworkMethodObject[] | [];
}

// session details screen left side toolbar interfaces

export interface ToolbarItemsObject {
    id?: string;
    name: string;
    icon?: JSX.Element;
    type?: string;
    configs?: unknown;
    isDisabled?: boolean;
    isTooltip?: boolean;
    tooltipText?: string;
    onConfirm?: () => Promise<void>;
    onClick?: () => void;
}
