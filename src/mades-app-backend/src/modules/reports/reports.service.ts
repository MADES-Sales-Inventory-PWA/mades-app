import { ReportFiltersDTO, SalesPerDayDTO } from "./reports.schema";
import { ReportsRepository } from "./reports.repository";
import { ReportsMapper } from "./reports.mapper";

export class ReportsService {
  constructor(private readonly repository = new ReportsRepository()) { }

  async getSalesHistory(filters: ReportFiltersDTO) {
    return await this.repository.findSalesHistory(filters);
  }

  async getInventoryAdjustments(filters: ReportFiltersDTO) {
    return await this.repository.findInventoryAdjustments(filters);
  }
  async getSalesPerDay(data: SalesPerDayDTO) {
    const { date } = data;
    if (date > new Date()) {
      throw new Error("No se pueden consultar reportes de fechas futuras")
    }
    const startDay = new Date(date.setUTCHours(0, 0, 0, 0));
    const endDay = new Date(date.setUTCHours(23, 59, 59, 999));
    const movements = await this.repository.findSalesPerDay(startDay, endDay);
    const label = startDay.toISOString().split('T')[0];
    return ReportsMapper.toSalesResponse(movements, "daily", label);
  }
  async getSalesPerWeek(data: SalesPerDayDTO) {
    const { date } = data;
    const start = new Date(date);
    const dayOfWeek = start.getDay();
    const diffToMonday = start.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    start.setDate(diffToMonday);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setUTCHours(23, 59, 59, 999);
    const movements = await this.repository.findSalesPerDay(start, end);
    const label = `Semana del ${start.getDate()} al ${end.getDate()} de ${start.toLocaleString('es-ES', { month: 'long' })}`;

    return ReportsMapper.toSalesResponse(movements, "weekly", label);
  }
  async getSalesPerMonth(data: SalesPerDayDTO) {
    const { date } = data;
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
    const movements = await this.repository.findSalesPerDay(start, end);
    const label = start.toLocaleString('es-ES', {
      month: 'long', year: 'numeric',
      timeZone: 'UTC'
    });
    return ReportsMapper.toSalesResponse(movements, "monthly", label);
  }
  async getSalesPerEmployee() {
    const data = await this.repository.salesPerEmployee();
    const processedData = ReportsMapper.toSalesPerEmployee(data);
    const total = processedData.reduce((acc, curr) => acc + curr.total_vendido, 0);

    return {
      success: true,
      label: "Rendimiento General de Empleados",
      total: total,
      data: processedData
    };
  }
}