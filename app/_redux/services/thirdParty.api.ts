import { logger } from '@lib/logger';

export const searchJiraField = async (url: string, searchText: string, authorization: string) => {
    try {
        const URL = `${url}${searchText}`;
        const data = await fetch(URL, {
            method: 'GET',
            headers: {
                Authorization: authorization
            }
        });
        const result = data.json();
        return result;
    } catch (error) {
        logger.error('error jira search :', error);
    }
};
