import { fetch } from '@lib/axiosConfig';
import { SidebarPromoCardForUser } from '@lib/sidebarPromoCard.contract';

export const getSidebarPromoCardsAPI = async ({
    workspaceId
}: {
    workspaceId: string;
}): Promise<SidebarPromoCardForUser[]> => {
    return fetch({
        url: `/workspace/${workspaceId}/sidebar-promo-cards`,
        method: 'GET'
    });
};

export const dismissSidebarPromoCardAPI = async ({
    workspaceId,
    cardId
}: {
    workspaceId: string;
    cardId: string;
}): Promise<{ success: boolean }> => {
    return fetch({
        url: `/workspace/${workspaceId}/sidebar-promo-cards/${cardId}/dismiss`,
        method: 'POST'
    });
};
