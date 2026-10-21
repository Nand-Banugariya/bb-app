import { fetch } from '@lib/axiosConfig';
import { QueryParams } from '../models/common';
import { ReactionSuccessResponse } from '../slices/reactions';

export const getReactionsAPI = async ({
    queryParams
}: {
    queryParams: QueryParams;
}): Promise<ReactionSuccessResponse> => {
    return fetch({
        url: `/common-data/reactions`,
        method: 'GET',
        params: queryParams
    });
};
