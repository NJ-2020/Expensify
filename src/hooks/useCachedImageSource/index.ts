import type {ImageSource} from 'expo-image';
import {useContext, useEffect, useState} from 'react';
import {AttachmentIDContext} from '@components/Attachments/AttachmentIDContext';
import useOnyx from '@hooks/useOnyx';
import {getCachedAttachment} from '@libs/actions/Attachment';
import Log from '@libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';

function useCachedImageSource(source: ImageSource | undefined): ImageSource | null | undefined {
    const uri = typeof source === 'object' ? source.uri : undefined;
    const hasHeaders = typeof source === 'object' && !!source.headers;
    const {attachmentID} = useContext(AttachmentIDContext);
    const [cachedUri, setCachedUri] = useState<string | null>(null);
    const [hasError, setHasError] = useState(false);
    const [attachment, attachmentMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`);

    useEffect(() => {
        // setCachedUri(null);
        setHasError(false);

        if ((!hasHeaders && !attachmentID) || !uri) {
            return;
        }

        if (attachmentMetadata.status === 'loading') {
            return;
        }

        let revoked = false;
        let objectURL: string | undefined;

        getCachedAttachment({attachmentID, attachment, source})
            .then((cachedSource) => {
                if (!cachedSource) {
                    if (!revoked) {
                        setHasError(true);
                    }
                    return;
                }
                if (!revoked) {
                    setCachedUri(cachedSource);
                } else {
                    URL.revokeObjectURL(cachedSource);
                }
            })
            .catch((error) => {
                if (!revoked) {
                    setHasError(true);
                }
                Log.hmmm('[AttachmentCache] Failed to get cached attachment', {message: (error as Error).message});
            });

        return () => {
            revoked = true;
            if (objectURL) {
                URL.revokeObjectURL(objectURL);
            }
        };
    }, [uri, hasHeaders, source?.headers, attachment, attachmentMetadata.status, attachmentID, source]);

    // Skip if there's no attachmentID and headers
    if (!hasHeaders && !attachmentID) {
        return source;
    }

    // If caching failed, fall back to the original source so expo-image
    // handles it normally (including error reporting via onError)
    if (hasError) {
        return source;
    }

    // Cache fetch is still in progress — return null so expo-image doesn't
    // render the image with headers (which would bypass our cache)
    if (!cachedUri) {
        return null;
    }

    return {uri: cachedUri};
}

export default useCachedImageSource;
