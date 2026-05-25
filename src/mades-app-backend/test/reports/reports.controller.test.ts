import request from 'supertest';
import express from 'express';

const getSalesHistoryMock = jest.fn();
const getInventoryAdjustmentsMock = jest.fn();
const getSalesPerDayMock = jest.fn();
const getSalesPerWeekMock = jest.fn();
const getSalesPerMonthMock = jest.fn();
const getSalesPerEmployeeMock = jest.fn();

jest.mock('../../src/modules/reports/reports.service', () => ({
  ReportsService: jest.fn().mockImplementation(() => ({
    getSalesHistory: getSalesHistoryMock,
    getInventoryAdjustments: getInventoryAdjustmentsMock,
    getSalesPerDay: getSalesPerDayMock,
    getSalesPerWeek: getSalesPerWeekMock,
    getSalesPerMonth: getSalesPerMonthMock,
    getSalesPerEmployee: getSalesPerEmployeeMock,
  })),
}));

import { ReportsController } from '../../src/modules/reports/reports.controller';

const buildApp = () => {
  const app = express();
  app.use(express.json());
  const controller = new ReportsController();
  app.get('/api/reports/sales', controller.getSalesHistory.bind(controller));
  app.get('/api/reports/inventory-adjustments', controller.getInventoryAdjustments.bind(controller));
  app.get('/api/reports/sales-per-day', controller.getSalesPerDay.bind(controller));
  app.get('/api/reports/sales-per-week', controller.getSalesPerWeek.bind(controller));
  app.get('/api/reports/sales-per-month', controller.getSalesPerMonth.bind(controller));
  app.get('/api/reports/sales-per-employee', controller.getSalesPerEmployee.bind(controller));
  return app;
};

const MOCK_PAGINATED = { data: [], total: 0, page: 1, pageSize: 20 };
const MOCK_SALES_REPORT = { success: true, period: 'daily', label: '2024-03-15', totalSales: 0, count: 0, data: [] };
const MOCK_EMPLOYEE_REPORT = { success: true, label: 'Rendimiento', total: 0, data: [] };

describe('ReportsController', () => {
  let app: express.Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = buildApp();
  });

  describe('GET /api/reports/sales - Historial de ventas', () => {
    it('debe retornar 200 con el historial de ventas paginado', async () => {
      getSalesHistoryMock.mockResolvedValue(MOCK_PAGINATED);

      const res = await request(app).get('/api/reports/sales');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.meta.total).toBe(0);
    });

    it('debe retornar 500 cuando ocurre un error inesperado', async () => {
      getSalesHistoryMock.mockRejectedValue(new Error('Error de conexión'));

      const res = await request(app).get('/api/reports/sales');

      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/reports/inventory-adjustments - Ajustes de inventario', () => {
    it('debe retornar 200 con los ajustes de inventario paginados', async () => {
      getInventoryAdjustmentsMock.mockResolvedValue(MOCK_PAGINATED);

      const res = await request(app).get('/api/reports/inventory-adjustments');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('debe retornar 500 cuando ocurre un error inesperado', async () => {
      getInventoryAdjustmentsMock.mockRejectedValue(new Error('Error de conexión'));

      const res = await request(app).get('/api/reports/inventory-adjustments');

      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/reports/sales-per-day - Ventas por día', () => {
    it('debe retornar 200 con el reporte del día indicado', async () => {
      getSalesPerDayMock.mockResolvedValue(MOCK_SALES_REPORT);

      const res = await request(app).get('/api/reports/sales-per-day?date=2024-03-15');

      expect(res.status).toBe(200);
      expect(res.body.period).toBe('daily');
    });

    it('debe retornar 400 cuando la fecha tiene formato inválido', async () => {
      const res = await request(app).get('/api/reports/sales-per-day?date=fecha-invalida');

      expect(res.status).toBe(400);
    });

    it('debe retornar 400 cuando se consulta una fecha futura', async () => {
      getSalesPerDayMock.mockRejectedValue(new Error('No se pueden consultar reportes de fechas futuras'));

      const res = await request(app).get('/api/reports/sales-per-day?date=2099-01-01');

      expect(res.status).toBe(400);
    });

    it('debe retornar 500 cuando ocurre un error inesperado', async () => {
      getSalesPerDayMock.mockRejectedValue(new Error('Error de conexión'));

      const res = await request(app).get('/api/reports/sales-per-day?date=2024-03-15');

      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/reports/sales-per-week - Ventas por semana', () => {
    it('debe retornar 200 con el reporte semanal', async () => {
      getSalesPerWeekMock.mockResolvedValue({ ...MOCK_SALES_REPORT, period: 'weekly' });

      const res = await request(app).get('/api/reports/sales-per-week?date=2024-03-15');

      expect(res.status).toBe(200);
      expect(res.body.period).toBe('weekly');
    });

    it('debe retornar 400 cuando la fecha tiene formato inválido', async () => {
      const res = await request(app).get('/api/reports/sales-per-week?date=no-es-fecha');

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/reports/sales-per-month - Ventas por mes', () => {
    it('debe retornar 200 con el reporte mensual', async () => {
      getSalesPerMonthMock.mockResolvedValue({ ...MOCK_SALES_REPORT, period: 'monthly' });

      const res = await request(app).get('/api/reports/sales-per-month?date=2024-03-15');

      expect(res.status).toBe(200);
      expect(res.body.period).toBe('monthly');
    });
  });

  describe('GET /api/reports/sales-per-employee - Ventas por empleado', () => {
    it('debe retornar 200 con el reporte de ventas por empleado', async () => {
      getSalesPerEmployeeMock.mockResolvedValue(MOCK_EMPLOYEE_REPORT);

      const res = await request(app).get('/api/reports/sales-per-employee');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('debe retornar 500 cuando ocurre un error inesperado', async () => {
      getSalesPerEmployeeMock.mockRejectedValue(new Error('Error de conexión'));

      const res = await request(app).get('/api/reports/sales-per-employee');

      expect(res.status).toBe(500);
    });
  });
});