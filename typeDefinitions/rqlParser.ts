export enum QueryTypes {
  FILTER = "FILTER",
  SORT = "SORT",
}

export enum Operators {
  INCLUDE = "INCLUDE",
  EXCLUDE = "EXCLUDE",
}

export interface Queries {
  operator: Operators;
  key: string;
  value: string;
  type: QueryTypes;
}

export interface FilterQueryValue {
  operator: Operators;
  value: string;
}

export interface GroupedFilterQueries {
  [key: string]: FilterQueryValue[];
}

export interface GroupedSortQueries {
  [key: string]: string;
}
