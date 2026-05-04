import type {ImageSource} from 'expo-image';
import {useContext, useEffect, useRef, useState} from 'react';
import {AttachmentIDContext} from '@components/Attachments/AttachmentIDContext';
import useOnyx from '@hooks/useOnyx';
import {getCachedAttachment} from '@libs/actions/Attachment';
import Log from '@libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';

function useRevokePreviousURL(url: string | null | undefined) {
    const ref = useRef(url);
    useEffect(() => {
        if (ref.current && ref.current !== url) {
            URL.revokeObjectURL(ref.current);
        }
        ref.current = url;
        return () => {
            if (url) {
                URL.revokeObjectURL(url);
            }
        };
    }, [url]);
}

function useCachedImageSource(source: ImageSource | undefined): ImageSource | null | undefined {
    const uri = typeof source === 'object' ? source.uri : undefined;
    const hasHeaders = typeof source === 'object' && !!source.headers;
    const {attachmentID} = useContext(AttachmentIDContext);
    const [hasError, setHasError] = useState(false);
    const [cachedUri, setCachedUri] = useState<string | null>(null);
    const [attachment, attachmentMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`);
    // const isRevoked = useRef(false);
    const objectURL = useRef<string | null>(null);

    useRevokePreviousURL(objectURL.current);

    useEffect(() => {
        setCachedUri(null);
        setHasError(false);

        if ((!hasHeaders && !attachmentID) || !uri) {
            return;
        }

        if (attachmentMetadata.status === 'loading') {
            return;
        }

        getCachedAttachment({attachmentID, attachment, source})
            .then((cachedSource) => {
                if (!cachedSource) {
                    // if (!isRevoked.current) {
                    setHasError(true);
                    // }
                    return;
                }
                objectURL.current = cachedSource;
                // if (!isRevoked.current) {
                setCachedUri(objectURL.current);
                // } else {
                // URL.revokeObjectURL(objectURL.current);
                // }
            })
            .catch((error) => {
                // if (!isRevoked.current) {
                setHasError(true);
                // }
                Log.hmmm('[AttachmentCache] Failed to get cached attachment', {message: (error as Error).message});
            });
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

    if (uri?.startsWith('blob:') && !cachedUri) {
        return source;
    }

    if (!cachedUri) {
        return null;
    }

    return {uri: cachedUri};
}

export default useCachedImageSource;
