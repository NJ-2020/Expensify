/** Model of a report action draft */
type ReportActionsDraft = {
    /** Chat message content */
    message: string;

    /** Whether the composer is in full size */
    isEditComposerFullSize?: boolean;
};

export default ReportActionsDraft;
