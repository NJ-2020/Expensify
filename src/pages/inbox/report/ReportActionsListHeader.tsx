import useThemeStyles from '@hooks/useThemeStyles';

import ConciergeThinkingMessage from '@pages/home/report/ConciergeThinkingMessage';

import React from 'react';
import {Platform, View} from 'react-native';

type ReportActionsListHeaderProps = {
    /** The ID of the report being displayed */
    reportID: string;

    /** Whether a Concierge draft is still streaming in — hides the thinking indicator only while the reply is actively revealing, not after it completes */
    isDraftPendingCompletion?: boolean;
};

function ReportActionsListHeader({reportID, isDraftPendingCompletion}: ReportActionsListHeaderProps) {
    const styles = useThemeStyles();

    if (isDraftPendingCompletion) {
        return null;
    }

    // Inverted lists put the header at the visual bottom. A drag that
    // overshoots the oldest message can extend into it, which re-anchors the
    // selection to DOM order and copies unrelated newer messages. Making the
    // header unselectable clamps the drag instead.
    if (Platform.OS !== 'web') {
        return <ConciergeThinkingMessage reportID={reportID} />;
    }

    return (
        <View style={styles.userSelectNone}>
            <ConciergeThinkingMessage reportID={reportID} />
        </View>
    );
}

export default ReportActionsListHeader;
