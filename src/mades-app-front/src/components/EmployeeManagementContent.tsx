import React from "react";
import { Users, Search, ShieldCheck, ShieldOff, Phone, Mail, CreditCard, Pencil, X } from "lucide-react";
import { Button } from "./Button";
import { Input } from "./Input";
import { BasicButton } from "./BasicButton";
import { InputPassword } from "./InputPassword";
import { changeEmployeeStatus, createEmployee, fetchEmployees, updateEmployee, type EmployeeItem } from "../services/users";
import { constants } from "../constants/Constants";

const documentTypeLabels: Record<string, string> = {
  CC: "Cédula",
  CE: "Extranjería",
  PASSPORT: "Pasaporte",
};

function toSafeText(value: unknown) {
  return String(value ?? "").toLowerCase();
}

type EmployeeFormState = {
  name: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  documentType: "CC" | "CE" | "PASSPORT";
  documentNumber: string;
  password: string;
};

type EmployeeSortOption =
  | "recent"
  | "oldest";

const emptyForm: EmployeeFormState = {
  name: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  documentType: "CC",
  documentNumber: "",
  password: "",
};

export const EmployeeManagementContent = () => {
  const [employees, setEmployees] = React.useState<EmployeeItem[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [sortOption, setSortOption] = React.useState<EmployeeSortOption>("recent");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isUpdatingId, setIsUpdatingId] = React.useState<number | null>(null);
  const [isSavingEmployee, setIsSavingEmployee] = React.useState(false);
  const [isEmployeeFormOpen, setIsEmployeeFormOpen] = React.useState(false);
  const [employeeToEdit, setEmployeeToEdit] = React.useState<EmployeeItem | null>(null);
  const [employeeForm, setEmployeeForm] = React.useState<EmployeeFormState>(emptyForm);
  const [employeeFormError, setEmployeeFormError] = React.useState<string | null>(null);
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

  const sortedEmployees = React.useMemo(() => {
    const getDateRank = (employee: EmployeeItem) => {
      const updatedAt = employee.updatedAt ? Date.parse(employee.updatedAt) : Number.NaN;
      if (Number.isFinite(updatedAt)) {
        return updatedAt;
      }

      const createdAt = employee.createdAt ? Date.parse(employee.createdAt) : Number.NaN;
      if (Number.isFinite(createdAt)) {
        return createdAt;
      }

      return employee.id;
    };

    const sorted = [...filteredEmployees];

    sorted.sort((a, b) => {
      switch (sortOption) {
        case "oldest":
          return getDateRank(a) - getDateRank(b);
        case "recent":
        default:
          return getDateRank(b) - getDateRank(a);
      }
    });

    return sorted;
  }, [filteredEmployees, sortOption]);

  const activeEmployees = sortedEmployees.filter((employee) => Boolean(employee.state) === true);
  const inactiveEmployees = sortedEmployees.filter((employee) => Boolean(employee.state) === false);

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

  const openCreateEmployee = () => {
    setEmployeeToEdit(null);
    setEmployeeForm(emptyForm);
    setEmployeeFormError(null);
    setIsEmployeeFormOpen(true);
  };

  const openEditEmployee = (employee: EmployeeItem) => {
    setEmployeeToEdit(employee);
    setEmployeeForm({
      name: employee.name ?? "",
      lastName: employee.lastName ?? "",
      email: employee.email ?? "",
      phoneNumber: employee.phoneNumber ?? "",
      documentType: (employee.documentType as "CC" | "CE" | "PASSPORT") ?? "CC",
      documentNumber: employee.documentNumber ?? "",
      password: "",
    });
    setEmployeeFormError(null);
    setIsEmployeeFormOpen(true);
  };

  const closeEmployeeForm = () => {
    if (isSavingEmployee) {
      return;
    }
    setIsEmployeeFormOpen(false);
    setEmployeeToEdit(null);
    setEmployeeFormError(null);
  };

  const handleSaveEmployee = async () => {
    const trimmedName = employeeForm.name.trim();
    const trimmedLastName = employeeForm.lastName.trim();
    const trimmedEmail = employeeForm.email.trim();
    const trimmedPhone = employeeForm.phoneNumber.trim();
    const trimmedDocument = employeeForm.documentNumber.trim();
    const trimmedPassword = employeeForm.password.trim();

    if (!trimmedName || !trimmedLastName || !trimmedEmail || !trimmedPhone || !trimmedDocument) {
      setEmployeeFormError("Completa todos los campos obligatorios.");
      return;
    }

    if (!employeeToEdit && !trimmedPassword) {
      setEmployeeFormError("La contraseña es obligatoria para crear empleados.");
      return;
    }

    try {
      setIsSavingEmployee(true);
      setEmployeeFormError(null);

      if (!employeeToEdit) {
        await createEmployee({
          name: trimmedName,
          lastName: trimmedLastName,
          email: trimmedEmail,
          phoneNumber: trimmedPhone,
          documentType: employeeForm.documentType,
          documentNumber: trimmedDocument,
          state: true,
          rolId: constants.EMPLOYEE_ROLE_ID,
          password: trimmedPassword,
        });
      } else {
        await updateEmployee(employeeToEdit.user.id, {
          name: trimmedName,
          lastName: trimmedLastName,
          email: trimmedEmail,
          phoneNumber: trimmedPhone,
          documentType: employeeForm.documentType,
          documentNumber: trimmedDocument,
          ...(trimmedPassword ? { password: trimmedPassword } : {}),
        });
      }

      await loadEmployees();
      closeEmployeeForm();
    } catch (error) {
      setEmployeeFormError(error instanceof Error ? error.message : "No se pudo guardar el empleado.");
    } finally {
      setIsSavingEmployee(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-10">
      <div className="flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold text-gray-800 sm:text-3xl">Gestión de empleados</h2>
          <p className="mt-2 text-gray-600">Consulta empleados activos, busca por documento o correo, y cambia su estado.</p>
        </div>
        <Button className="w-full md:w-auto" onClick={openCreateEmployee}>
          Crear empleado
        </Button>
      </div>

      <div className="mt-4 rounded-lg bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="min-w-0 flex-1">
            <span className="mb-1 block text-sm font-medium text-slate-700">Buscar empleado</span>
            <Input
              type="text"
              placeholder="Buscar por nombre, correo, documento o teléfono..."
              onChange={setSearchTerm}
              value={searchTerm}
              icon={<Search />}
              height="h-8"
            />
          </div>
          <label className="w-full md:w-72">
            <span className="mb-1 block text-sm font-medium text-slate-700">Ordenar por</span>
            <select
              value={sortOption}
              onChange={(event) => setSortOption(event.target.value as EmployeeSortOption)}
              className="h-10 w-full rounded-default border border-input-border bg-input-login px-3 text-sm text-gray-700 shadow-sm focus:border-primary focus:outline-none focus:ring focus:ring-primary focus:ring-opacity-50"
            >
              <option value="recent">Más recientes</option>
              <option value="oldest">Más antiguos</option>
            </select>
          </label>
        </div>
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
      ) : sortedEmployees.length === 0 ? (
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
                      <BasicButton
                        onClick={() => openEditEmployee(employee)}
                        className="px-3 py-2 text-sm"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Pencil size={14} />
                          Editar
                        </span>
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
                      <BasicButton
                        onClick={() => openEditEmployee(employee)}
                        className="px-3 py-2 text-sm"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Pencil size={14} />
                          Editar
                        </span>
                      </BasicButton>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}

      {isEmployeeFormOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:items-center">
          <section className="my-4 w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                  {employeeToEdit ? "Editar empleado" : "Crear empleado"}
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  {employeeToEdit ? "Actualiza los datos del colaborador." : "Registra un nuevo colaborador en el sistema."}
                </p>
              </div>
              <button
                type="button"
                onClick={closeEmployeeForm}
                className="rounded-full p-2 text-slate-600 transition hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Nombres"
                type="text"
                placeholder="Ej: Ana"
                value={employeeForm.name}
                onChange={(value) => setEmployeeForm((current) => ({ ...current, name: value }))}
              />
              <Input
                label="Apellidos"
                type="text"
                placeholder="Ej: Pérez"
                value={employeeForm.lastName}
                onChange={(value) => setEmployeeForm((current) => ({ ...current, lastName: value }))}
              />
              <Input
                label="Correo"
                type="email"
                placeholder="empleado@correo.com"
                value={employeeForm.email}
                onChange={(value) => setEmployeeForm((current) => ({ ...current, email: value }))}
              />
              <Input
                label="Teléfono"
                type="text"
                placeholder="3001234567"
                value={employeeForm.phoneNumber}
                onChange={(value) => setEmployeeForm((current) => ({ ...current, phoneNumber: value }))}
              />

              <label className="space-y-1">
                <span className="block text-m font-medium text-surface-variant"><b>Tipo de documento</b></span>
                <select
                  value={employeeForm.documentType}
                  onChange={(event) => setEmployeeForm((current) => ({ ...current, documentType: event.target.value as "CC" | "CE" | "PASSPORT" }))}
                  className="font-sans text-s text-gray-500 bg-input-login border border-input-border border-[1.5px] mt-1 h-13 px-2 block w-full rounded-default shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                >
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="CE">Cédula de Extranjería</option>
                  <option value="PASSPORT">Pasaporte</option>
                </select>
              </label>

              <Input
                label="Número de documento"
                type="text"
                placeholder="1020304050"
                value={employeeForm.documentNumber}
                onChange={(value) => setEmployeeForm((current) => ({ ...current, documentNumber: value }))}
              />
            </div>

            <div className="mt-4">
              <InputPassword
                label={employeeToEdit ? "Nueva contraseña (opcional)" : "Contraseña"}
                type="password"
                placeholder={employeeToEdit ? "Solo si deseas cambiarla" : "Mínimo 8 caracteres"}
                value={employeeForm.password}
                onChange={(value) => setEmployeeForm((current) => ({ ...current, password: value }))}
              />
            </div>

            {employeeFormError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {employeeFormError}
              </div>
            )}

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <BasicButton onClick={closeEmployeeForm}>
                Cancelar
              </BasicButton>
              <Button className="w-full sm:w-auto" onClick={() => void handleSaveEmployee()}>
                {isSavingEmployee ? "Guardando..." : employeeToEdit ? "Guardar cambios" : "Crear empleado"}
              </Button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
