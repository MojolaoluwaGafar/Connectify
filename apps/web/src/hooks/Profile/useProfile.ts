import { useCallback } from 'react';
import { useApiQuery } from '../useApiQuery';
import {
    ProfileServices,
    type ProfileListFilters,
} from '../../API/Services/Profile/Profile';

export const useProfile = (filters: ProfileListFilters = {}) => {
    const request = useCallback(
        () => ProfileServices.listAllProfiles(filters),
        [
            filters.search,
            filters.tab,
            filters.page,
            filters.pageSize,
            filters.excludeUserId,
        ],
    );

    return useApiQuery(
        request,
        'Failed to load all Profiles',
    );
};