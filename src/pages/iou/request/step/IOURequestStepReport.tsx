import React from 'react';
import type {ListItem} from '@components/SelectionList/types';
import useOnyx from '@hooks/useOnyx';
import {changeTransactionsReport, setTransactionReport} from '@libs/actions/Transaction';
import Navigation from '@libs/Navigation/Navigation';
import {getReportOrDraftReport, isPolicyExpenseChat, isReportOutstanding} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import IOURequestEditReportCommon from './IOURequestEditReportCommon';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

type TransactionGroupListItem = ListItem & {
    /** reportID of the report */
    value: string;
};

type IOURequestStepReportProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_REPORT> & WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_REPORT>;

function IOURequestStepReport({route, transaction}: IOURequestStepReportProps) {
    const {backTo, action, iouType, transactionID, reportID: reportIDFromRoute} = route.params;

    const [allReports] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}`, {canBeMissing: false});
    const isTransactionUnreported = transaction?.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
    const transactionReport = Object.values(allReports ?? {}).find((report) => report?.reportID === transaction?.reportID);
    const participantReportID = transaction?.participants?.at(0)?.reportID;
    const participantReport = Object.values(allReports ?? {}).find((report) => report?.reportID === participantReportID);
    const shouldUseTransactionReport = (!!transactionReport && isReportOutstanding(transactionReport, transactionReport?.policyID)) || isTransactionUnreported;
    const outstandingReportID = isPolicyExpenseChat(participantReport) ? participantReport?.iouReportID : participantReportID;
    const selectedReportID = shouldUseTransactionReport ? transactionReport?.reportID : outstandingReportID;
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isCreateReport = action === CONST.IOU.ACTION.CREATE;
    const isFromGlobalCreate = !!transaction?.isFromGlobalCreate;
    const reportOrDraftReport = getReportOrDraftReport(reportIDFromRoute);

    const handleGoBackWithReportID = (id: string) => {
        if (isEditing) {
            Navigation.dismissModalWithReport({reportID: id});
        } else {
            Navigation.goBack(backTo);
        }
    };

    const handleGlobalCreateReport = (item: TransactionGroupListItem) => {
        if (!transaction) {
            return;
        }
        const reportOrDraftReportFromValue = getReportOrDraftReport(item.value);
        const participants = [
            {
                selected: true,
                accountID: 0,
                isPolicyExpenseChat: true,
                reportID: reportOrDraftReportFromValue?.chatReportID,
                policyID: reportOrDraftReportFromValue?.policyID,
            },
        ];

        setTransactionReport(
            transaction.transactionID,
            {
                reportID: item.value,
                participants,
            },
            true,
        );

        const iouConfirmationPageRoute = ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(action, iouType, transactionID, reportOrDraftReportFromValue?.chatReportID);
        // If the backTo parameter is set, we should navigate back to the confirmation screen that is already on the stack.
        if (backTo) {
            Navigation.goBack(iouConfirmationPageRoute, {compareParams: false});
        } else {
            Navigation.navigate(iouConfirmationPageRoute);
        }
    };

    const handleRegularReportSelection = (item: TransactionGroupListItem) => {
        if (!transaction) {
            return;
        }
        setTransactionReport(
            transaction.transactionID,
            {
                reportID: item.value,
            },
            !isEditing,
        );

        if (isEditing) {
            changeTransactionsReport([transaction.transactionID], item.value);
        }

        handleGoBackWithReportID(item.value);
    };

    const selectReport = (item: TransactionGroupListItem) => {
        if (!transaction) {
            return;
        }

        const isSameReport = item.value === transaction.reportID;

        // Early return for same report selection
        if (isSameReport) {
            handleGoBackWithReportID(item.value);
            return;
        }

        // Handle global create report
        if (isCreateReport && isFromGlobalCreate) {
            handleGlobalCreateReport(item);
            return;
        }

        // Handle regular report selection
        handleRegularReportSelection(item);
    };

    return (
        <IOURequestEditReportCommon
            backTo={backTo}
            selectedReportID={selectedReportID}
            selectedPolicyID={!isEditing && !isFromGlobalCreate ? reportOrDraftReport?.policyID : undefined}
            selectReport={selectReport}
        />
    );
}

IOURequestStepReport.displayName = 'IOURequestStepReport';

export default withWritableReportOrNotFound(withFullTransactionOrNotFound(IOURequestStepReport));
