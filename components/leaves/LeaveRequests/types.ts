export interface LeaveRequestData {
  leaveType: string;
  leaveTypeName: string;
  fromDate: Date | null;
  toDate: Date | null;
  isHalfDay: boolean;
  reason: string;
  leaveApprover: string;
  attachments: any[];
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
