'use client';
import React from 'react';
import { LockIcon } from '@components/icons/material';
import { EmptyState } from '@components/patterns/EmptyState';

/** Shown when the viewer opens a session they can't access. */
const NoPermission = ({ className }: { className?: string }) => (
    <EmptyState
        size="lg"
        tone="danger"
        icon={<LockIcon />}
        title="You don’t have access to this session"
        description="Ask the person who shared it to invite you to the project."
        className={className}
    />
);

export default NoPermission;
