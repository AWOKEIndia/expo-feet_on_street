export interface AttendanceRequestFormProps {
  onSubmit: (data: AttendanceRequestData) => void;
  onCancel: () => void;
}

export interface AttendanceRequestData {
  fromDate: Date | null;
  toDate: Date | null;
  isHalfDay: boolean;
  includeHolidays: boolean;
  shift: string;
  reason: string;
  explanation: string;
}
