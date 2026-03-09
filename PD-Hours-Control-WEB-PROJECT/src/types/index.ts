export interface Squad {
  id: number;
  name: string;
}

export interface Employee {
  id: number;
  name: string;
  estimatedHours: number;
  squadId: number;
  squadName?: string;
}

export interface Report {
  id: number;
  description: string;
  employeeId: number;
  spentHours: number;
  createdAt: string; 
}

export type SquadCreate = Pick<Squad, 'name'>;
export type EmployeeCreate = Omit<Employee, 'id' | 'squadName'>;
export type ReportCreate = Omit<Report, 'id' | 'createdAt'>;

export interface MemberHours {
  employeeId: number;
  employeeName: string;
  totalHours: number;
}

export interface SquadTotalHours {
  squadId: number;
  totalHours: number;
}

export interface SquadAverageHours {
  averageHoursPerDay: number;
}

export interface ReportDetail {
  id: number;
  employeeName: string;
  description: string;
  spentHours: number;
  createdAt: string;
  formattedCreatedAt: string;
}