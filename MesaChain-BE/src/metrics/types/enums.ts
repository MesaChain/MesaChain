export enum MetricCategory {
  SALES = "SALES",
  CUSTOMER = "CUSTOMER",
  STAFF = "STAFF",
  INVENTORY = "INVENTORY",
  FINANCIAL = "FINANCIAL",
  OPERATIONAL = "OPERATIONAL",
}

export enum AggregationPeriod {
  HOURLY = "HOURLY",
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  QUARTERLY = "QUARTERLY",
  YEARLY = "YEARLY",
}

export enum ReportFormat {
  PDF = "PDF",
  CSV = "CSV",
  EXCEL = "EXCEL",
  JSON = "JSON",
  HTML = "HTML",
}

export enum ReportExecutionStatus {
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}
