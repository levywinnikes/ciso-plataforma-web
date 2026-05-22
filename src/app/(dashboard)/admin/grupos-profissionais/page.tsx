import { OrganizationManagementPage } from "@/features/admin/components/organization-management-page";

export default function AdminProfessionalGroupsPage() {
  return (
    <OrganizationManagementPage
      type="PROFISSIONAL_GROUP"
      namespace="adminGlobal.professionalGroups"
    />
  );
}
