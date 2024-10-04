import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type ReportActionItemDraftProps = ChildrenProps & {
    /** Whether the composer is in full size */
    isEditComposerFullSize?: boolean;
};

function ReportActionItemDraft({children, isEditComposerFullSize}: ReportActionItemDraftProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.chatItemDraft, isEditComposerFullSize && styles.chatItemFullComposeRow]}>
            <View style={styles.flex1}>{children}</View>
        </View>
    );
}

ReportActionItemDraft.displayName = 'ReportActionItemDraft';
export default ReportActionItemDraft;
