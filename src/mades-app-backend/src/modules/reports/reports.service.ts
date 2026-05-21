import { ReportFiltersDTO } from "./reports.schema";
import { ReportsRepository } from "./reports.repository";

export class ReportsService {
  constructor(private readonly repository = new ReportsRepository()) {}

  async getSalesHistory(filters: ReportFiltersDTO) {
    return this.repository.findSalesHistory(filters);
  }

  async getInventoryAdjustments(filters: ReportFiltersDTO) {
    return this.repository.findInventoryAdjustments(filters);
  }
}