export interface LeaveRequestData {
  leaveType: string;
  leaveTypeName: string;
  fromDate: Date | null;
  toDate: Date | null;
  isHalfDay: boolean;
  halfDayDate: Date | null;
  reason: string;
  leaveApprover: string;
  attachments: Attachment[];
}

export interface LeaveRequestFormProps {
  onSubmit: (data: LeaveRequestData) => void;
  onCancel: () => void;
}

export interface LeaveType {
  name: string;
  leave_type_name: string;
  is_leave_without_pay?: boolean;
}

export interface ApproverDetails {
  leave_approvers: Array<{ name: string }>;
  department_approvers: Array<{ name: string }>;
}

export interface Attachment {
  uri: string;
  name: string;
  type: string;
  size?: number;
}
