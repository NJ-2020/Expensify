import React, {useMemo} from 'react';
import {useSearchContext} from '@components/Search/SearchContext';
import type {ListItem} from '@components/SelectionList/types';
import useOnyx from '@hooks/useOnyx';
import {changeTransactionsReport} from '@libs/actions/Transaction';
import Navigation from '@libs/Navigation/Navigation';
import IOURequestEditReportCommon from '@pages/iou/request/step/IOURequestEditReportCommon';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

type TransactionGroupListItem = ListItem & {
    /** reportID of the report */
    value: string;
};

function SearchTransactionsChangeReport() {
    const {selectedTransactions, clearSelectedTransactions} = useSearchContext();
    const selectedTransactionsKeys = useMemo(() => Object.keys(selectedTransactions), [selectedTransactions]);

    const firstTransactionKey = selectedTransactionsKeys.at(0);
    const firstTransactionReportID = firstTransactionKey ? selectedTransactions[firstTransactionKey]?.reportID : undefined;
    const firstTransactionPolicyID = firstTransactionKey ? selectedTransactions[firstTransactionKey]?.policyID : undefined;
    const selectedReportID =
        Object.values(selectedTransactions).every((transaction) => transaction.reportID === firstTransactionReportID) && firstTransactionReportID !== CONST.REPORT.UNREPORTED_REPORT_ID
            ? firstTransactionReportID
            : undefined;
    const selectedPolicyID = Object.values(selectedTransactions).every((transaction) => transaction.policyID === firstTransactionPolicyID) ? firstTransactionPolicyID : undefined;

    const selectReport = (item: TransactionGroupListItem) => {
        if (selectedTransactionsKeys.length === 0) {
            return;
        }

        changeTransactionsReport(selectedTransactionsKeys, item.value);
        clearSelectedTransactions();

        Navigation.goBack();
    };

    return (
        <IOURequestEditReportCommon
            backTo={undefined}
            selectedReportID={selectedReportID}
            selectedPolicyID={selectedPolicyID}
            selectReport={selectReport}
        />
    );
}

SearchTransactionsChangeReport.displayName = 'SearchTransactionsChangeReport';

export default SearchTransactionsChangeReport;
