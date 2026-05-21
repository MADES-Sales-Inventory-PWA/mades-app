
export class ReportsMapper {
    static toSalesResponse(movements: any[], period: string, dateLabel: string) {
        const totalSales = movements.reduce((acc, mov) => {
            const invoice = Array.isArray(mov.Invoices) ? mov.Invoices[0] : mov.Invoices;
            return acc + Number(invoice?.total || 0);
        }, 0);

        return {
            success: true,
            period,
            label: dateLabel,
            totalSales,
            count: movements.length,
            data: movements.map(mov => ({
                id: mov.id,
                date: mov.creationDate,
                total: Array.isArray(mov.Invoices) ? mov.Invoices[0]?.total : mov.Invoices?.total,
                seller: mov.Persons ? `${mov.Persons.name} ${mov.Persons.lastName}` : "Cliente General",
            }))
        };
    }
    static toSalesPerEmployee(movements: any[]) {
        const performanceMap: Record<string, any> = {};
        movements.forEach(mov => {
            const workerId = mov.sellerId?.toString() || "Desconocido";
            const workerName = mov.Persons ? `${mov.Persons.name} ${mov.Persons.lastName}` : "Desconocido";
            const saleTotal = Number(mov.Invoices?.[0]?.total || 0);

            if (!performanceMap[workerId]) {
                performanceMap[workerId] = { Vendedor: workerName, ventas_realizadas: 0, total_vendido: 0 };
            }

            performanceMap[workerId].ventas_realizadas += 1;
            performanceMap[workerId].total_vendido += saleTotal;
        });
        return Object.values(performanceMap).sort((a, b) => b.total_vendido - a.total_vendido);
    }
}