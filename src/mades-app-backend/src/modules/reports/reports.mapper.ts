
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
}