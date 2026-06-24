import { Avatar, Loader } from "@mantine/core";
import { useEffect, useState } from "react";
import { getCompanyEmployees } from "../../Services/ProfileService";

const CompanyEmployee = ({ companyName }: { companyName: string }) => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyName) return;
    setLoading(true);
    getCompanyEmployees(companyName)
      .then(setEmployees)
      .catch(() => setEmployees([]))
      .finally(() => setLoading(false));
  }, [companyName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader color="brightSun.4" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-5 mt-10">
        {employees.length > 0 ? (
          employees.slice(0, 6).map((emp, index) => (
            <div
              key={emp.id ?? index}
              className="flex w-full max-w-xs items-center gap-3 rounded-md border border-mine-shaft-800 bg-mine-shaft-900/60 p-4"
            >
              <Avatar
                size="lg"
                src={emp.picture ? `data:image/jpeg;base64,${emp.picture}` : null}
                alt={emp.name || "Employee"}
                color="brightSun.4"
              >
                {(emp.name || "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
              </Avatar>
              <div className="min-w-0">
                <div className="truncate font-semibold text-mine-shaft-100">
                  {emp.name || "Unnamed"}
                </div>
                <div className="truncate text-sm text-mine-shaft-300">
                  {emp.jobTitle || "Employee"}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="w-full rounded-md border border-dashed border-mine-shaft-700 p-8 text-center text-sm text-mine-shaft-300">
            No employees listed for this company yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyEmployee
