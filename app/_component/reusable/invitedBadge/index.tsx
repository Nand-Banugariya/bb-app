import { Badge } from '@components/base_shadcn/badge';
import { cn } from '@lib/utils';

/**
 * Marks a user who was invited to the workspace but hasn't accepted yet, in
 * assignee/creator filters, assignee pickers, mentions and member selects.
 */
const InvitedBadge = ({ className }: { className?: string }) => (
    <Badge variant="outline" className={cn('shrink-0', className)} title="Invite pending">
        Invited
    </Badge>
);

export default InvitedBadge;
