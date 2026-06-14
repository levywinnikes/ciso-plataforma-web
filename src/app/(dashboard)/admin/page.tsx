"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Field } from "@/components/forms/field";
import {
  Button,
  CardSection,
  FloatingInput,
  Modal,
  PageHeader,
  Select,
  Skeleton,
  TableCard,
  TableShell,
} from "@/components/ui";
import { ReferralStatusBadge } from "@/features/referrals/components/referral-status-badge";
import type { Referral } from "@/features/referrals/types";
import { formatDate, formatDateTime } from "@/features/referrals/utils";
import { useAppToast } from "@/hooks/use-app-toast";
import { useFormError } from "@/i18n/use-form-error";

const scheduleSchema = z.object({
  clinicId: z.string().min(1, "errors.required"),
  doctorUserId: z.string().min(1, "errors.required"),
  appointmentDate: z.string().min(1, "errors.required"),
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

interface ClinicOption {
  id: string;
  name: string;
}

interface DoctorOption {
  id: string;
  name: string;
  role: string;
}

export default function AdminPage() {
  const t = useTranslations("adminDashboard");
  const common = useTranslations("common");
  const toast = useAppToast();
  const tError = useFormError();

  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [clinics, setClinics] = useState<ClinicOption[]>([]);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(
    null,
  );

  const scheduleForm = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      clinicId: "",
      doctorUserId: "",
      appointmentDate: "",
    },
  });

  const selectedClinicId = scheduleForm.watch("clinicId");

  const cards = [
    {
      title: t("professionalGroupsTitle"),
      description: t("professionalGroupsDescription"),
      href: "/admin/grupos-profissionais",
    },
    {
      title: t("clinicsTitle"),
      description: t("clinicsDescription"),
      href: "/admin/clinicas",
    },
    {
      title: "Convênios",
      description: "Gerencie os convênios parceiros aceitos pelas clínicas.",
      href: "/admin/convenios",
    },
    {
      title: t("usersTitle"),
      description: t("usersDescription"),
      href: "/admin/usuarios",
    },
    {
      title: t("servicesTitle"),
      description: t("servicesDescription"),
      href: "/admin/servicos",
    },
    {
      title: t("nucleiTitle"),
      description: t("nucleiDescription"),
      href: "/admin/nucleos",
    },
    {
      title: t("financialTitle"),
      description: t("financialDescription"),
      href: "/admin/financeiro",
    },
  ];

  async function loadDoctors(clinicId: string) {
    if (!clinicId) {
      setDoctors([]);
      return;
    }

    try {
      const response = await fetch(
        `/api/users/organization?organizationId=${clinicId}`,
        {
          cache: "no-store",
        },
      );

      if (!response.ok) {
        toast.error(tError("errors.genericRequestFailed") ?? "");
        return;
      }

      const users = (await response.json()) as DoctorOption[];
      setDoctors(users.filter((user) => user.role === "MEDICO"));
    } catch {
      toast.error(tError("errors.genericRequestFailed") ?? "");
    }
  }

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [referralsRes, clinicsRes] = await Promise.all([
          fetch("/api/referrals", { cache: "no-store" }),
          fetch("/api/organizations?type=CLINICA", { cache: "no-store" }),
        ]);

        if (!referralsRes.ok || !clinicsRes.ok) {
          toast.error(tError("errors.genericRequestFailed") ?? "");
          return;
        }

        const referralsData = (await referralsRes.json()) as Referral[];
        const clinicsData = (await clinicsRes.json()) as ClinicOption[];

        setReferrals(referralsData);
        setClinics(clinicsData);
      } catch {
        toast.error(tError("errors.genericRequestFailed") ?? "");
      } finally {
        setIsLoading(false);
      }
    }

    void loadData();
  }, []);

  useEffect(() => {
    if (!isModalOpen) return;
    void loadDoctors(selectedClinicId);
  }, [selectedClinicId, isModalOpen]);

  const sortedReferrals = useMemo(() => {
    const priority: Record<string, number> = {
      Encaminhado: 0,
      Agendado: 1,
      Atendido: 2,
    };

    return [...referrals].sort((a, b) => {
      const priorityDiff =
        (priority[a.status] ?? 99) - (priority[b.status] ?? 99);
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [referrals]);

  const encaminhadosCount = useMemo(
    () => referrals.filter((item) => item.status === "Encaminhado").length,
    [referrals],
  );

  const agendadosCount = useMemo(
    () => referrals.filter((item) => item.status === "Agendado").length,
    [referrals],
  );

  const concluidosCount = useMemo(
    () => referrals.filter((item) => item.status === "Atendido").length,
    [referrals],
  );

  function openScheduleModal(referral: Referral) {
    setSelectedReferral(referral);
    scheduleForm.reset({
      clinicId: referral.clinicId ?? "",
      doctorUserId: "",
      appointmentDate: referral.appointmentDate
        ? new Date(referral.appointmentDate).toISOString().slice(0, 16)
        : "",
    });
    setIsModalOpen(true);
  }

  async function onSubmitSchedule(data: ScheduleFormData) {
    if (!selectedReferral) return;

    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/referrals/${selectedReferral.id}/schedule`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clinicId: data.clinicId,
            doctorUserId: data.doctorUserId,
            appointmentDate: new Date(data.appointmentDate).toISOString(),
          }),
        },
      );

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        toast.error(tError(body.error ?? "errors.genericRequestFailed") ?? "");
        return;
      }

      const selectedClinic = clinics.find(
        (clinic) => clinic.id === data.clinicId,
      );
      const selectedDoctor = doctors.find(
        (doctor) => doctor.id === data.doctorUserId,
      );

      setReferrals((current) =>
        current.map((item) =>
          item.id === selectedReferral.id
            ? {
                ...item,
                clinicId: data.clinicId,
                clinicName: selectedClinic?.name,
                doctor: selectedDoctor?.name,
                appointmentDate: new Date(data.appointmentDate).toISOString(),
                status: "Agendado",
              }
            : item,
        ),
      );

      toast.success(t("scheduleSuccess"));
      setIsModalOpen(false);
      setSelectedReferral(null);
    } catch {
      toast.error(tError("errors.genericRequestFailed") ?? "");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="grid gap-4 md:grid-cols-3">
        <CardSection title={t("pendingStatus")}>
          <p className="text-3xl font-bold text-amber-700">
            {encaminhadosCount}
          </p>
        </CardSection>
        <CardSection title={t("scheduledStatus")}>
          <p className="text-3xl font-bold text-blue-700">{agendadosCount}</p>
        </CardSection>
        <CardSection title={t("completedStatus")}>
          <p className="text-3xl font-bold text-green-700">{concluidosCount}</p>
        </CardSection>
      </div>

      <TableCard title={t("referralsTitle")}>
        <TableShell
          columns={
            <tr>
              <th className="px-6 py-3">{common("patient")}</th>
              <th className="px-6 py-3">{common("status")}</th>
              <th className="px-6 py-3">{t("clinicColumn")}</th>
              <th className="px-6 py-3">{common("doctor")}</th>
              <th className="px-6 py-3">{t("appointmentColumn")}</th>
              <th className="px-6 py-3">{t("createdColumn")}</th>
              <th className="px-6 py-3 text-right">{t("actionsColumn")}</th>
            </tr>
          }
        >
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <tr key={index} className="ui-table-row">
                <td className="ui-table-cell">
                  <Skeleton className="h-4 w-40" />
                </td>
                <td className="ui-table-cell">
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="ui-table-cell">
                  <Skeleton className="h-4 w-36" />
                </td>
                <td className="ui-table-cell">
                  <Skeleton className="h-4 w-32" />
                </td>
                <td className="ui-table-cell">
                  <Skeleton className="h-4 w-36" />
                </td>
                <td className="ui-table-cell">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="ui-table-cell">
                  <Skeleton className="ml-auto h-8 w-24" />
                </td>
              </tr>
            ))
          ) : sortedReferrals.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="ui-table-cell py-8 text-center text-gray-500"
              >
                {t("emptyReferrals")}
              </td>
            </tr>
          ) : (
            sortedReferrals.map((referral) => (
              <tr key={referral.id} className="ui-table-row">
                <td className="ui-table-cell font-medium text-gray-900">
                  {referral.patientName}
                </td>
                <td className="ui-table-cell">
                  <ReferralStatusBadge status={referral.status} />
                </td>
                <td className="ui-table-cell">
                  {referral.clinicName ?? common("notAvailable")}
                </td>
                <td className="ui-table-cell">
                  {referral.doctor ?? common("notAvailable")}
                </td>
                <td className="ui-table-cell">
                  {referral.appointmentDate
                    ? formatDateTime(referral.appointmentDate)
                    : common("notAvailable")}
                </td>
                <td className="ui-table-cell">
                  {formatDate(referral.createdAt)}
                </td>
                <td className="ui-table-cell text-right">
                  {referral.status === "Encaminhado" ? (
                    <Button
                      variant="outline"
                      onClick={() => openScheduleModal(referral)}
                    >
                      {t("scheduleAction")}
                    </Button>
                  ) : null}
                </td>
              </tr>
            ))
          )}
        </TableShell>
      </TableCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.href} href={card.href}>
            <CardSection
              title={card.title}
              className="h-full transition hover:shadow-md"
            >
              <p className="text-sm text-gray-600">{card.description}</p>
            </CardSection>
          </Link>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t("scheduleModalTitle")}
        maxWidth="max-w-md"
      >
        <form
          onSubmit={scheduleForm.handleSubmit(onSubmitSchedule)}
          className="space-y-4 pt-4"
        >
          <Field
            label={""}
            error={tError(scheduleForm.formState.errors.clinicId?.message)}
          >
            <Select {...scheduleForm.register("clinicId")}>
              <option value="">{t("selectClinic")}</option>
              {clinics.map((clinic) => (
                <option key={clinic.id} value={clinic.id}>
                  {clinic.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label={""}
            error={tError(scheduleForm.formState.errors.doctorUserId?.message)}
          >
            <Select {...scheduleForm.register("doctorUserId")}>
              <option value="">{t("selectDoctor")}</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label={""}
            error={tError(
              scheduleForm.formState.errors.appointmentDate?.message,
            )}
          >
            <FloatingInput
              required
              type="datetime-local"
              label={t("appointmentDateLabel")}
              {...scheduleForm.register("appointmentDate")}
            />
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSaving}
            >
              {common("cancel")}
            </Button>
            <Button type="submit" isLoading={isSaving}>
              {t("saveScheduleAction")}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
