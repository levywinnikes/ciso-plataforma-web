import { OrganizationManagementPage } from "@/features/admin/components/organization-management-page";

export default function AdminClinicsPage() {
  return (
    <OrganizationManagementPage
      type="CLINICA"
      namespace="adminGlobal.clinics"
    />
  );
}
