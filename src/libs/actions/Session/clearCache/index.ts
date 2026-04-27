import {clearCachedAttachments} from '@libs/actions/Attachment';
import type ClearCache from './types';

const clearStorage: ClearCache = async () => {
    await clearCachedAttachments();
};

export default clearStorage;
