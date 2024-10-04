import React, {useMemo} from 'react';
import type {StyleProp, ViewProps, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import * as ReportUtils from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';

type CellRendererComponentProps = ViewProps & {
    index: number;
    style?: StyleProp<ViewStyle>;
    reportID?: string;
    item: any;
};

function CellRendererComponent({reportID, item: action, style, index, ...props}: CellRendererComponentProps) {
    const originalReportID = useMemo(() => ReportUtils.getOriginalReportID(reportID ?? '-1', action) || '-1', [reportID, action]);
    const [draftActionReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${originalReportID}`, {
        selector: (draftMessagesForReport) => draftMessagesForReport?.[action.reportActionID],
    });

    const isEditComposerFullSize = useMemo(() => draftActionReport?.isEditComposerFullSize ?? false, [draftActionReport]);
    return (
        <View
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            style={[
                style,
                /**
                 * To achieve absolute positioning and handle overflows for list items,
                 * it is necessary to assign zIndex values. In the case of inverted lists,
                 * the lower list items will have higher zIndex values compared to the upper
                 * list items. Consequently, lower list items can overflow the upper list items.
                 * See: https://github.com/Expensify/App/issues/20451
                 */
                isEditComposerFullSize ? {position: 'absolute', height: '100%', width: '100%'} : {zIndex: -index, position: 'relative'},
            ]}
        />
    );
}

CellRendererComponent.displayName = 'CellRendererComponent';

export default CellRendererComponent;
