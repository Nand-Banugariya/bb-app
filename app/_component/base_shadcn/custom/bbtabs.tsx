'use client';

import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs';
import { cn } from '@lib/utils';

/**
 * Tabs. `BBTabsList` defaults to the segmented control; pass `variant="line"` for underline tabs
 * (dev tools: Console, Network, Info).
 */
const BBTabsRoot = ({ className, ...props }: React.ComponentProps<typeof Tabs>) => (
    <Tabs className={cn('w-full', className)} {...props} />
);
BBTabsRoot.displayName = 'BBTabs';

const BBTabsList = ({ className, ...props }: React.ComponentProps<typeof TabsList>) => (
    <TabsList className={cn('my-4', className)} {...props} />
);
BBTabsList.displayName = 'BBTabsList';

const BBTabsTrigger = (props: React.ComponentProps<typeof TabsTrigger>) => (
    <TabsTrigger {...props} />
);
BBTabsTrigger.displayName = 'BBTabsTrigger';

const BBTabsContent = (props: React.ComponentProps<typeof TabsContent>) => (
    <TabsContent {...props} />
);
BBTabsContent.displayName = 'BBTabsContent';

export { BBTabsRoot as BBTabs, BBTabsList, BBTabsTrigger, BBTabsContent };
