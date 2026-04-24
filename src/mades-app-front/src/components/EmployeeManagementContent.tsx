import React from "react";
import { Users, Search, ShieldCheck, ShieldOff, Phone, Mail, CreditCard } from "lucide-react";
import { Button } from "./Button";
import { Input } from "./Input";
import { BasicButton } from "./BasicButton";
import { changeEmployeeStatus, fetchEmployees, type EmployeeItem } from "../services/users";

const documentTypeLabels: Record<string, string> = {
  CC: "Cédula",
  CE: "Extranjería",
  PASSPORT: "Pasaporte",
};

function toSafeText(value: unknown) {
  return String(value ?? "").toLowerCase();
}

export const EmployeeManagementContent = () => {
  const [employees, setEmployees] = React.useState<EmployeeItem[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isUpdatingId, setIsUpdatingId] = React.useState<number | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const loadEmployees = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const data = await fetchEmployees();
      setEmployees(data);
    } catch {
      setErrorMessage("No se pudieron cargar los empleados desde el backend.");
      setEmployees([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadEmployees();
  }, [loadEmployees]);

  const filteredEmployees = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return employees;
    }

    return employees.filter((employee) => {
      const fullName = toSafeText(`${employee.name ?? ""} ${employee.lastName ?? ""}`);
      return (
        fullName.includes(term) ||
        toSafeText(employee.email).includes(term) ||
        toSafeText(employee.documentNumber).includes(term) ||
        toSafeText(employee.phoneNumber).includes(term)
      );
    });
  }, [employees, searchTerm]);

  console.log("Empleados filtrados:", filteredEmployees);
  const activeEmployees = filteredEmployees.filter((employee) => Boolean(employee.state) === true);
  const inactiveEmployees = filteredEmployees.filter((employee) => Boolean(employee.state) === false);

  const handleToggleStatus = async (employee: EmployeeItem) => {
    try {
      setIsUpdatingId(employee.id);
      await changeEmployeeStatus(employee.user?.id ?? employee.id, !employee.state);
      await loadEmployees();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo cambiar el estado del empleado.");
    } finally {
      setIsUpdatingId(null);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-10">
      <div className="flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold text-gray-800 sm:text-3xl">Gestión de empleados</h2>
          <p className="mt-2 text-gray-600">Consulta empleados activos, busca por documento o correo, y cambia su estado.</p>
        </div>
        <Button className="w-full md:w-auto" onClick={() => {}}>
          Crear empleado
        </Button>
      </div>

      <div className="mt-4 rounded-lg bg-white p-3 shadow-sm">
        <Input
          type="text"
          placeholder="Buscar por nombre, correo, documento o teléfono..."
          onChange={setSearchTerm}
          value={searchTerm}
          icon={<Search />}
          height="h-8"
        />
      </div>

      {errorMessage && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-600">
          Cargando empleados...
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="mt-5 rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-600">
          No hay empleados que coincidan con la búsqueda.
        </div>
      ) : (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Users size={18} className="text-primary-blue" />
              <h3 className="text-lg font-semibold text-slate-900">Activos</h3>
              <span className="ml-auto rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-primary-blue">{activeEmployees.length}</span>
            </div>

            <div className="space-y-3">
              {activeEmployees.map((employee) => (
                <article key={employee.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h4 className="truncate text-base font-semibold text-slate-900">{employee.name} {employee.lastName}</h4>
                      <p className="mt-1 flex items-center gap-2 text-sm text-slate-600"><Mail size={14} />{employee.email}</p>
                      <p className="mt-1 flex items-center gap-2 text-sm text-slate-600"><CreditCard size={14} />{documentTypeLabels[employee.documentType] ?? employee.documentType} {employee.documentNumber}</p>
                      <p className="mt-1 flex items-center gap-2 text-sm text-slate-600"><Phone size={14} />{employee.phoneNumber}</p>
                    </div>
                    <div className="flex flex-col items-start gap-2 sm:items-end">
                      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        <ShieldCheck size={14} />
                        Activo
                      </span>
                      <BasicButton
                        onClick={() => void handleToggleStatus(employee)}
                        className="px-3 py-2 text-sm"
                      >
                        {isUpdatingId === employee.id ? "Cambiando..." : "Desactivar"}
                      </BasicButton>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Users size={18} className="text-slate-500" />
              <h3 className="text-lg font-semibold text-slate-900">Inactivos</h3>
              <span className="ml-auto rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">{inactiveEmployees.length}</span>
            </div>

            <div className="space-y-3">
              {inactiveEmployees.map((employee) => (
                <article key={employee.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h4 className="truncate text-base font-semibold text-slate-900">{employee.name} {employee.lastName}</h4>
                      <p className="mt-1 flex items-center gap-2 text-sm text-slate-600"><Mail size={14} />{employee.email}</p>
                      <p className="mt-1 flex items-center gap-2 text-sm text-slate-600"><CreditCard size={14} />{documentTypeLabels[employee.documentType] ?? employee.documentType} {employee.documentNumber}</p>
                      <p className="mt-1 flex items-center gap-2 text-sm text-slate-600"><Phone size={14} />{employee.phoneNumber}</p>
                    </div>
                    <div className="flex flex-col items-start gap-2 sm:items-end">
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        <ShieldOff size={14} />
                        Inactivo
                      </span>
                      <BasicButton
                        onClick={() => void handleToggleStatus(employee)}
                        className="px-3 py-2 text-sm"
                      >
                        {isUpdatingId === employee.id ? "Cambiando..." : "Activar"}
                      </BasicButton>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
