"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Field } from "@/components/forms/field";
import {
  Button,
  CardSection,
  cn,
  ConfirmDialog,
  FloatingInput,
  Modal,
  PageHeader,
  Select,
  Skeleton,
  TableCard,
  TableShell,
  Textarea,
} from "@/components/ui";
import {
  birthDateSchema,
  toBirthDateInputValue,
} from "@/features/referrals/birth-date";
import { withBlockJustification } from "@/features/referrals/block-status-schema";
import { AppointmentCalendar } from "@/features/referrals/components/appointment-calendar";
import { MarkAttendedDialog } from "@/features/referrals/components/mark-attended-dialog";
import { ReferralStatusBadge } from "@/features/referrals/components/referral-status-badge";
import { fetchReferralsPage } from "@/features/referrals/fetch-referrals";
import type {
  ReferralCounts,
  ReferralSortDir,
  ReferralSortField,
} from "@/features/referrals/list-query";
import {
  canAdminMarkAsAttended,
  isReferralOverdue,
} from "@/features/referrals/overdue";
import type { Referral } from "@/features/referrals/types";
import { formatDate, formatDateTime } from "@/features/referrals/utils";
import { useAppToast } from "@/hooks/use-app-toast";
import { useFormError } from "@/i18n/use-form-error";

const ITEMS_PER_PAGE = 10;

type AdminListTab =
  | "active"
  | "blocked"
  | "overdue"
  | "calendar"
  | "pending"
  | "scheduled"
  | "attended";

type ListFilters = {
  patient: string;
  office: string;
  clinic: string;
  doctor: string;
  createdBy: string;
  status: string;
};

const EMPTY_FILTERS: ListFilters = {
  patient: "",
  office: "",
  clinic: "",
  doctor: "",
  createdBy: "",
  status: "",
};

const scheduleSchema = z.object({
  clinicId: z.string().min(1, "errors.required"),
  doctorUserId: z.string().min(1, "errors.required"),
  appointmentDate: z.string().min(1, "errors.required"),
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

const editReferralSchema = withBlockJustification({
  patientName: z.string().min(1, "errors.required"),
  patientBirthDate: birthDateSchema,
  patientPhone: z.string().min(1, "errors.required"),
  patientDocument: z.string().optional().nullable(),
  systemicDiseases: z.string().optional().nullable(),
  clinicalNotes: z.string().optional().nullable(),
  clinicalSuspicion: z.string().optional().nullable(),
  nucleusId: z.string().min(1, "errors.required"),
  clinicId: z.string().min(1, "errors.required"),
  agreementId: z.string().optional().nullable(),
  status: z.enum(["Bloqueado", "Encaminhado", "Agendado", "Atendido"]),
  justificativaBloqueio: z.string().optional().nullable(),
  appointmentDate: z.string().optional().nullable(),
  doctor: z.string().optional().nullable(),
  specialistNotes: z.string().optional().nullable(),
  specialistConduct: z.string().optional().nullable(),
  surgeryId: z.string().optional().nullable(),
  surgeryPrice: z.union([z.number(), z.string(), z.null()]).optional(),
});

type EditReferralFormData = z.infer<typeof editReferralSchema>;

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
  const tNew = useTranslations("newReferral");
  const toast = useAppToast();
  const tError = useFormError();
  const searchParams = useSearchParams();

  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [listTab, setListTab] = useState<AdminListTab>("calendar");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [calendarRefreshKey, setCalendarRefreshKey] = useState(0);
  const [draftFilters, setDraftFilters] = useState<ListFilters>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<ListFilters>(EMPTY_FILTERS);
  const [sortBy, setSortBy] = useState<ReferralSortField>("createdAt");
  const [sortDir, setSortDir] = useState<ReferralSortDir>("desc");
  const [counts, setCounts] = useState<ReferralCounts>({
    encaminhado: 0,
    agendado: 0,
    atendido: 0,
    bloqueado: 0,
    overdue: 0,
    active: 0,
  });
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

  const [nuclei, setNuclei] = useState<any[]>([]);
  const [surgeries, setSurgeries] = useState<any[]>([]);
  const [agreements, setAgreements] = useState<any[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingReferral, setEditingReferral] = useState<Referral | null>(null);
  const [pendingDeleteReferral, setPendingDeleteReferral] =
    useState<Referral | null>(null);
  const [pendingCompleteReferral, setPendingCompleteReferral] =
    useState<Referral | null>(null);
  const [editDoctors, setEditDoctors] = useState<DoctorOption[]>([]);

  const editForm = useForm<EditReferralFormData>({
    resolver: zodResolver(editReferralSchema),
    defaultValues: {
      patientName: "",
      patientBirthDate: "",
      patientPhone: "",
      patientDocument: "",
      systemicDiseases: "",
      clinicalNotes: "",
      clinicalSuspicion: "",
      nucleusId: "",
      clinicId: "",
      agreementId: "",
      status: "Encaminhado",
      justificativaBloqueio: "",
      appointmentDate: "",
      doctor: "",
      specialistNotes: "",
      specialistConduct: "",
      surgeryId: "",
      surgeryPrice: "",
    },
  });

  const editClinicId = editForm.watch("clinicId");

  useEffect(() => {
    const aba = searchParams.get("aba");
    if (aba === "atrasados") setListTab("overdue");
    if (aba === "bloqueados") setListTab("blocked");
    if (aba === "ativos") setListTab("active");
    if (aba === "encaminhados") setListTab("pending");
    if (aba === "agendados") setListTab("scheduled");
    if (aba === "atendidos") setListTab("attended");
  }, [searchParams]);

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
    async function loadLookups() {
      try {
        const [clinicsRes, nucleiRes, surgeriesRes, agreementsRes] =
          await Promise.all([
            fetch("/api/organizations?type=CLINICA", { cache: "no-store" }),
            fetch("/api/nuclei", { cache: "no-store" }),
            fetch("/api/surgeries?active=true", { cache: "no-store" }),
            fetch("/api/agreements?active=true", { cache: "no-store" }),
          ]);

        if (!clinicsRes.ok) {
          toast.error(tError("errors.genericRequestFailed") ?? "");
          return;
        }

        setClinics((await clinicsRes.json()) as ClinicOption[]);
        setNuclei(nucleiRes.ok ? await nucleiRes.json() : []);
        setSurgeries(surgeriesRes.ok ? await surgeriesRes.json() : []);
        setAgreements(agreementsRes.ok ? await agreementsRes.json() : []);
      } catch {
        toast.error(tError("errors.genericRequestFailed") ?? "");
      }
    }

    void loadLookups();
  }, []);

  const bumpCalendar = useCallback(() => {
    setCalendarRefreshKey((key) => key + 1);
  }, []);

  const reloadReferrals = useCallback(async () => {
    setIsLoading(true);
    try {
      if (listTab === "calendar") {
        const result = await fetchReferralsPage({
          page: 1,
          pageSize: 1,
          includeCounts: true,
        });
        if (result.counts) setCounts(result.counts);
        setReferrals([]);
        setTotalPages(1);
        return;
      }

      const result = await fetchReferralsPage({
        page: currentPage,
        pageSize: ITEMS_PER_PAGE,
        tab: listTab,
        includeCounts: true,
        patient: appliedFilters.patient || undefined,
        office: appliedFilters.office || undefined,
        clinic: appliedFilters.clinic || undefined,
        doctor: appliedFilters.doctor || undefined,
        createdBy: appliedFilters.createdBy || undefined,
        status:
          listTab === "active" && appliedFilters.status
            ? appliedFilters.status
            : undefined,
        sortBy,
        sortDir,
      });
      setReferrals(result.items);
      setTotalPages(result.totalPages);
      if (result.counts) setCounts(result.counts);
    } catch {
      toast.error(tError("errors.genericRequestFailed") ?? "");
      setReferrals([]);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- toast/tError instáveis a cada render
  }, [listTab, currentPage, appliedFilters, sortBy, sortDir]);

  useEffect(() => {
    void reloadReferrals();
  }, [reloadReferrals]);

  useEffect(() => {
    setCurrentPage(1);
  }, [listTab, appliedFilters, sortBy, sortDir]);

  function applyListFilters() {
    setAppliedFilters(draftFilters);
    setCurrentPage(1);
  }

  function clearListFilters() {
    setDraftFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setCurrentPage(1);
  }

  function toggleSort(field: ReferralSortField) {
    if (sortBy === field) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir(
        field === "appointmentDate" || field === "createdAt" ? "desc" : "asc",
      );
    }
    setCurrentPage(1);
  }

  function SortHeader({
    field,
    label,
  }: {
    field: ReferralSortField;
    label: string;
  }) {
    const active = sortBy === field;
    const Icon = !active
      ? ArrowUpDown
      : sortDir === "asc"
        ? ArrowUp
        : ArrowDown;
    return (
      <button
        type="button"
        className="inline-flex items-center gap-1 font-semibold uppercase tracking-wide text-gray-600 hover:text-primary"
        onClick={() => toggleSort(field)}
      >
        {label}
        <Icon className="h-3.5 w-3.5" />
      </button>
    );
  }

  useEffect(() => {
    if (!isEditModalOpen || !editClinicId) {
      setEditDoctors([]);
      return;
    }
    async function loadEditClinicDoctors() {
      try {
        const response = await fetch(
          `/api/users/organization?organizationId=${editClinicId}`,
          { cache: "no-store" },
        );
        if (response.ok) {
          const users = (await response.json()) as DoctorOption[];
          const filteredDoctors = users.filter(
            (user) => user.role === "MEDICO",
          );
          setEditDoctors(filteredDoctors);
        }
      } catch (err) {
        console.error("Failed to load doctors", err);
      }
    }
    void loadEditClinicDoctors();
  }, [editClinicId, isEditModalOpen]);

  useEffect(() => {
    if (editingReferral && editingReferral.doctor && editDoctors.length > 0) {
      const doctorExists = editDoctors.some(
        (d) => d.name === editingReferral.doctor,
      );
      if (doctorExists) {
        editForm.setValue("doctor", editingReferral.doctor);
      }
    }
  }, [editDoctors, editingReferral, editForm]);

  useEffect(() => {
    if (!isModalOpen) return;
    void loadDoctors(selectedClinicId);
  }, [selectedClinicId, isModalOpen]);

  const sortedReferrals = referrals;
  const encaminhadosCount = counts.encaminhado;
  const agendadosCount = counts.agendado;
  const concluidosCount = counts.atendido;
  const bloqueadosCount = counts.bloqueado;
  const atrasadosCount = counts.overdue;

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

      toast.success(t("scheduleSuccess"));
      setIsModalOpen(false);
      setSelectedReferral(null);
      bumpCalendar();
      await reloadReferrals();
    } catch {
      toast.error(tError("errors.genericRequestFailed") ?? "");
    } finally {
      setIsSaving(false);
    }
  }

  function openEditReferralModal(referral: Referral) {
    setEditingReferral(referral);
    editForm.reset({
      patientName: referral.patientName || "",
      patientBirthDate: toBirthDateInputValue(referral.patientBirthDate),
      patientPhone: referral.patientPhone || "",
      patientDocument: referral.patientDocument || "",
      systemicDiseases: referral.systemicDiseases || "",
      clinicalNotes: referral.clinicalNotes || "",
      clinicalSuspicion: referral.clinicalSuspicion || "",
      nucleusId: referral.nucleusId || "",
      clinicId: referral.clinicId || "",
      agreementId: referral.agreementId || "",
      status: referral.status || "Encaminhado",
      justificativaBloqueio: referral.justificativaBloqueio || "",
      appointmentDate: referral.appointmentDate
        ? new Date(referral.appointmentDate).toISOString().slice(0, 16)
        : "",
      doctor: referral.doctor || "",
      specialistNotes: referral.specialistNotes || "",
      specialistConduct: referral.specialistConduct || "",
      surgeryId: referral.surgeryId || "",
      surgeryPrice:
        referral.surgeryPrice !== undefined && referral.surgeryPrice !== null
          ? String(referral.surgeryPrice)
          : "",
    });
    setIsEditModalOpen(true);
  }

  async function onSubmitEdit(data: EditReferralFormData) {
    if (!editingReferral) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/referrals/${editingReferral.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          justificativaBloqueio:
            data.status === "Bloqueado"
              ? data.justificativaBloqueio?.trim() || null
              : data.justificativaBloqueio || null,
          surgeryPrice: data.surgeryPrice ? Number(data.surgeryPrice) : null,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        toast.error(
          body.message ||
            tError(body.error ?? "errors.genericRequestFailed") ||
            "",
        );
        return;
      }

      toast.success(t("updateSuccess"));
      setIsEditModalOpen(false);
      setEditingReferral(null);
      bumpCalendar();
      await reloadReferrals();
    } catch {
      toast.error(tError("errors.genericRequestFailed") ?? "");
    } finally {
      setIsSaving(false);
    }
  }

  async function onDeleteReferral(id: string) {
    try {
      const response = await fetch(`/api/referrals/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        toast.error(
          body.message || tError("errors.genericRequestFailed") || "",
        );
        return;
      }

      toast.success(t("deleteSuccess"));
      bumpCalendar();
      await reloadReferrals();
    } catch {
      toast.error(tError("errors.genericRequestFailed") ?? "");
    }
  }

  async function onMarkAttended(referral: Referral) {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/referrals/${referral.id}/complete`, {
        method: "PATCH",
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        toast.error(tError(body.error ?? "errors.genericRequestFailed") ?? "");
        return;
      }

      toast.success(t("markAttendedSuccess"));
      setPendingCompleteReferral(null);
      bumpCalendar();
      await reloadReferrals();
    } catch {
      toast.error(tError("errors.genericRequestFailed") ?? "");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        action={
          <Link href="/admin/novo">
            <Button>{t("newReferralAction")}</Button>
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-5">
        {(
          [
            {
              tab: "pending" as const,
              title: t("pendingStatus"),
              value: encaminhadosCount,
              valueClass: "text-amber-700",
              activeClass: "ring-2 ring-amber-500 border-amber-300",
            },
            {
              tab: "scheduled" as const,
              title: t("scheduledStatus"),
              value: agendadosCount,
              valueClass: "text-blue-700",
              activeClass: "ring-2 ring-blue-500 border-blue-300",
            },
            {
              tab: "attended" as const,
              title: t("completedStatus"),
              value: concluidosCount,
              valueClass: "text-green-700",
              activeClass: "ring-2 ring-emerald-500 border-emerald-300",
            },
            {
              tab: "blocked" as const,
              title: t("blockedStatus"),
              value: bloqueadosCount,
              valueClass: "text-orange-700",
              activeClass: "ring-2 ring-orange-500 border-orange-300",
            },
            {
              tab: "overdue" as const,
              title: t("overdueStatus"),
              value: atrasadosCount,
              valueClass: "text-rose-700",
              activeClass: "ring-2 ring-rose-500 border-rose-300",
            },
          ] as const
        ).map((card) => {
          const active = listTab === card.tab;
          return (
            <button
              key={card.tab}
              type="button"
              className="text-left"
              aria-pressed={active}
              onClick={() => setListTab(card.tab)}
            >
              <CardSection
                title={card.title}
                className={cn(
                  "h-full cursor-pointer transition hover:shadow-md",
                  active ? card.activeClass : "hover:border-gray-300",
                )}
              >
                <p className={cn("text-3xl font-bold", card.valueClass)}>
                  {card.value}
                </p>
              </CardSection>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-200">
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium ${
            listTab === "calendar"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-500"
          }`}
          onClick={() => setListTab("calendar")}
        >
          {t("tabCalendar")}
        </button>
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium ${
            listTab === "active"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-500"
          }`}
          onClick={() => setListTab("active")}
        >
          {t("tabActive")}
        </button>
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium ${
            listTab === "pending"
              ? "border-b-2 border-amber-600 text-amber-700"
              : "text-gray-500"
          }`}
          onClick={() => setListTab("pending")}
        >
          {t("tabPending")}
          {encaminhadosCount > 0 ? (
            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
              {encaminhadosCount}
            </span>
          ) : null}
        </button>
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium ${
            listTab === "scheduled"
              ? "border-b-2 border-blue-600 text-blue-700"
              : "text-gray-500"
          }`}
          onClick={() => setListTab("scheduled")}
        >
          {t("tabScheduled")}
          {agendadosCount > 0 ? (
            <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
              {agendadosCount}
            </span>
          ) : null}
        </button>
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium ${
            listTab === "attended"
              ? "border-b-2 border-emerald-600 text-emerald-700"
              : "text-gray-500"
          }`}
          onClick={() => setListTab("attended")}
        >
          {t("tabAttended")}
          {concluidosCount > 0 ? (
            <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">
              {concluidosCount}
            </span>
          ) : null}
        </button>
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium ${
            listTab === "blocked"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-500"
          }`}
          onClick={() => setListTab("blocked")}
        >
          {t("tabBlocked")}
          {bloqueadosCount > 0 ? (
            <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-800">
              {bloqueadosCount}
            </span>
          ) : null}
        </button>
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium ${
            listTab === "overdue"
              ? "border-b-2 border-rose-600 text-rose-700"
              : "text-gray-500"
          }`}
          onClick={() => setListTab("overdue")}
        >
          {t("tabOverdue")}
          {atrasadosCount > 0 ? (
            <span className="ml-2 rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-800">
              {atrasadosCount}
            </span>
          ) : null}
        </button>
      </div>

      {listTab === "calendar" ? (
        <AppointmentCalendar
          onSelectReferral={openEditReferralModal}
          refreshKey={calendarRefreshKey}
          actions={{
            policy: "admin",
            onEdit: openEditReferralModal,
            onDelete: (referral) => setPendingDeleteReferral(referral),
            onMarkAttended: (referral) => setPendingCompleteReferral(referral),
            onSchedule: openScheduleModal,
          }}
        />
      ) : (
        <TableCard
          title={
            listTab === "overdue"
              ? t("overdueReferralsTitle")
              : listTab === "pending"
                ? t("pendingReferralsTitle")
                : listTab === "scheduled"
                  ? t("scheduledReferralsTitle")
                  : listTab === "attended"
                    ? t("attendedReferralsTitle")
                    : t("referralsTitle")
          }
        >
          <div className="mb-4 space-y-3 rounded-lg border border-gray-100 bg-gray-50/80 p-3">
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                applyListFilters();
              }}
            >
              <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-6">
                <input
                  className="ui-field"
                  placeholder={t("filterPatient")}
                  value={draftFilters.patient}
                  onChange={(e) =>
                    setDraftFilters((prev) => ({
                      ...prev,
                      patient: e.target.value,
                    }))
                  }
                />
                {listTab === "active" ? (
                  <select
                    className="ui-field"
                    value={draftFilters.status}
                    onChange={(e) =>
                      setDraftFilters((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                  >
                    <option value="">{t("filterStatusAll")}</option>
                    <option value="Encaminhado">{t("pendingStatus")}</option>
                    <option value="Agendado">{t("scheduledStatus")}</option>
                    <option value="Atendido">{t("completedStatus")}</option>
                  </select>
                ) : null}
                <input
                  className="ui-field"
                  placeholder={t("filterOffice")}
                  value={draftFilters.office}
                  onChange={(e) =>
                    setDraftFilters((prev) => ({
                      ...prev,
                      office: e.target.value,
                    }))
                  }
                />
                <input
                  className="ui-field"
                  placeholder={t("filterCreatedBy")}
                  value={draftFilters.createdBy}
                  onChange={(e) =>
                    setDraftFilters((prev) => ({
                      ...prev,
                      createdBy: e.target.value,
                    }))
                  }
                />
                <input
                  className="ui-field"
                  placeholder={t("filterClinic")}
                  value={draftFilters.clinic}
                  onChange={(e) =>
                    setDraftFilters((prev) => ({
                      ...prev,
                      clinic: e.target.value,
                    }))
                  }
                />
                <input
                  className="ui-field"
                  placeholder={t("filterDoctor")}
                  value={draftFilters.doctor}
                  onChange={(e) =>
                    setDraftFilters((prev) => ({
                      ...prev,
                      doctor: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="submit">{t("filterSearch")}</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearListFilters}
                >
                  {t("filterClear")}
                </Button>
              </div>
            </form>
          </div>
          <TableShell
            columns={
              <tr>
                <th className="px-6 py-3">
                  <SortHeader field="patientName" label={common("patient")} />
                </th>
                <th className="px-6 py-3">
                  <SortHeader field="status" label={common("status")} />
                </th>
                <th className="px-6 py-3">
                  <SortHeader field="office" label={t("officeColumn")} />
                </th>
                <th className="px-6 py-3">
                  <SortHeader field="createdBy" label={t("createdByColumn")} />
                </th>
                <th className="px-6 py-3">
                  <SortHeader field="clinic" label={t("clinicColumn")} />
                </th>
                <th className="px-6 py-3">
                  <SortHeader field="doctor" label={common("doctor")} />
                </th>
                <th className="px-6 py-3">
                  <SortHeader
                    field="appointmentDate"
                    label={t("appointmentColumn")}
                  />
                </th>
                <th className="px-6 py-3">
                  <SortHeader field="createdAt" label={t("createdColumn")} />
                </th>
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
                  colSpan={9}
                  className="ui-table-cell py-8 text-center text-gray-500"
                >
                  {listTab === "overdue"
                    ? t("emptyOverdueReferrals")
                    : t("emptyReferrals")}
                </td>
              </tr>
            ) : (
              sortedReferrals.map((referral) => {
                const overdue = isReferralOverdue(referral);
                return (
                  <tr
                    key={referral.id}
                    className={cn(
                      "ui-table-row",
                      overdue &&
                        "!bg-rose-50 shadow-[inset_4px_0_0_0_rgb(225,29,72)] hover:!bg-rose-100/80",
                    )}
                  >
                    <td className="ui-table-cell font-medium text-gray-900">
                      <div className="flex flex-wrap items-center gap-2">
                        <span>{referral.patientName}</span>
                        {overdue ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-rose-800">
                            <Clock className="h-3 w-3" />
                            {t("overdueBadge")}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="ui-table-cell">
                      <ReferralStatusBadge
                        status={referral.status}
                        justificativaBloqueio={referral.justificativaBloqueio}
                      />
                    </td>
                    <td className="ui-table-cell">
                      {referral.officeName ?? common("notAvailable")}
                    </td>
                    <td className="ui-table-cell">
                      {referral.createdByUserName ?? common("notAvailable")}
                    </td>
                    <td className="ui-table-cell">
                      {referral.clinicName ?? common("notAvailable")}
                    </td>
                    <td className="ui-table-cell">
                      {referral.doctor ?? common("notAvailable")}
                    </td>
                    <td
                      className={cn(
                        "ui-table-cell",
                        overdue && "font-medium text-rose-800",
                      )}
                    >
                      {referral.appointmentDate
                        ? formatDateTime(referral.appointmentDate)
                        : common("notAvailable")}
                    </td>
                    <td className="ui-table-cell">
                      {formatDate(referral.createdAt)}
                    </td>
                    <td className="ui-table-cell whitespace-nowrap text-right">
                      <div className="inline-flex items-center justify-end gap-0.5">
                        {canAdminMarkAsAttended(referral.status) ? (
                          <Button
                            variant="ghost"
                            className="h-9 w-9 p-0 text-emerald-700 hover:bg-emerald-50"
                            onClick={() => setPendingCompleteReferral(referral)}
                            title={t("markAttendedAction")}
                            aria-label={t("markAttendedAction")}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        ) : null}
                        {referral.status === "Encaminhado" ? (
                          <Button
                            variant="ghost"
                            className="h-9 w-9 p-0 text-primary hover:bg-primary/5"
                            onClick={() => openScheduleModal(referral)}
                            title={t("scheduleAction")}
                            aria-label={t("scheduleAction")}
                          >
                            <CalendarDays className="h-4 w-4" />
                          </Button>
                        ) : null}
                        <Button
                          variant="ghost"
                          className="h-9 w-9 p-0"
                          onClick={() => openEditReferralModal(referral)}
                          title={common("edit")}
                          aria-label={common("edit")}
                        >
                          <Pencil className="h-4 w-4 text-amber-600" />
                        </Button>
                        {referral.status !== "Atendido" ? (
                          <Button
                            variant="ghost"
                            className="h-9 w-9 p-0"
                            onClick={() => setPendingDeleteReferral(referral)}
                            title={common("delete")}
                            aria-label={common("delete")}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </TableShell>
          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-3">
            <p className="text-sm text-gray-500">
              Página{" "}
              <span className="font-medium text-gray-900">{currentPage}</span>{" "}
              de <span className="font-medium text-gray-900">{totalPages}</span>
            </p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="px-2 py-1"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="px-2 py-1"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TableCard>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t("scheduleModalTitle")}
        maxWidth="max-w-md"
      >
        <form
          noValidate
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

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={t("editReferralTitle")}
        maxWidth="max-w-4xl"
      >
        <form
          noValidate
          onSubmit={editForm.handleSubmit(onSubmitEdit)}
          className="space-y-6 pt-4 text-left"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label=""
              error={tError(editForm.formState.errors.patientName?.message)}
            >
              <FloatingInput
                required
                label={tNew("patientName")}
                {...editForm.register("patientName")}
              />
            </Field>

            <Field
              label=""
              error={tError(
                editForm.formState.errors.patientBirthDate?.message,
              )}
            >
              <FloatingInput
                mask="date"
                inputMode="numeric"
                autoComplete="bday"
                required
                label={tNew("birthDate")}
                {...editForm.register("patientBirthDate")}
              />
            </Field>

            <Field
              label=""
              error={tError(editForm.formState.errors.patientPhone?.message)}
            >
              <FloatingInput
                mask="phone"
                required
                label={tNew("phone")}
                {...editForm.register("patientPhone")}
              />
            </Field>

            <Field
              label=""
              error={tError(editForm.formState.errors.patientDocument?.message)}
            >
              <FloatingInput
                label={`${tNew("document")} (${tNew("optional")})`}
                {...editForm.register("patientDocument")}
              />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Clínica"
              error={tError(editForm.formState.errors.clinicId?.message)}
            >
              <Select {...editForm.register("clinicId")}>
                <option value="">Selecione uma clínica</option>
                {clinics.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              label="Núcleo de Atendimento"
              error={tError(editForm.formState.errors.nucleusId?.message)}
            >
              <Select {...editForm.register("nucleusId")}>
                <option value="">Selecione um núcleo</option>
                {nuclei.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              label="Convênio"
              error={tError(editForm.formState.errors.agreementId?.message)}
            >
              <Select {...editForm.register("agreementId")}>
                <option value="">Sem convênio</option>
                {agreements.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              label="Status"
              error={tError(editForm.formState.errors.status?.message)}
            >
              <Select {...editForm.register("status")}>
                <option value="Bloqueado">Bloqueado</option>
                <option value="Encaminhado">Encaminhado</option>
                <option value="Agendado">Agendado</option>
                <option value="Atendido">Atendido</option>
              </Select>
            </Field>

            {editForm.watch("status") === "Bloqueado" ? (
              <Field
                label="Justificativa"
                required
                error={tError(
                  editForm.formState.errors.justificativaBloqueio?.message,
                )}
              >
                <Textarea
                  {...editForm.register("justificativaBloqueio")}
                  maxLength={500}
                  placeholder="Ex.: Cliente ainda não decidiu horário"
                  rows={3}
                />
              </Field>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Médico Responsável"
              error={tError(editForm.formState.errors.doctor?.message)}
            >
              <Select {...editForm.register("doctor")}>
                <option value="">Selecione um médico</option>
                {editDoctors.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              label="Data do Agendamento"
              error={tError(editForm.formState.errors.appointmentDate?.message)}
            >
              <FloatingInput
                type="datetime-local"
                label="Data do Agendamento"
                {...editForm.register("appointmentDate")}
              />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Cirurgia Vinculada (Opcional)"
              error={tError(editForm.formState.errors.surgeryId?.message)}
            >
              <Select {...editForm.register("surgeryId")}>
                <option value="">Nenhuma cirurgia</option>
                {surgeries.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.defaultPrice})
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              label="Preço da Cirurgia"
              error={tError(editForm.formState.errors.surgeryPrice?.message)}
            >
              <FloatingInput
                type="number"
                step="0.01"
                label="Preço da Cirurgia"
                {...editForm.register("surgeryPrice")}
              />
            </Field>
          </div>

          <div className="space-y-4">
            <Field label="Doenças Sistêmicas">
              <Textarea {...editForm.register("systemicDiseases")} />
            </Field>

            <Field label="Notas Clínicas">
              <Textarea {...editForm.register("clinicalNotes")} />
            </Field>

            <Field label="Suspeita Clínica">
              <Textarea {...editForm.register("clinicalSuspicion")} />
            </Field>

            <Field label="Notas do Especialista">
              <Textarea {...editForm.register("specialistNotes")} />
            </Field>

            <Field label="Conduta do Especialista">
              <Textarea {...editForm.register("specialistConduct")} />
            </Field>
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              disabled={isSaving}
            >
              {common("cancel")}
            </Button>
            <Button type="submit" isLoading={isSaving}>
              {common("save")}
            </Button>
          </div>
        </form>
      </Modal>

      <MarkAttendedDialog
        referral={pendingCompleteReferral}
        isSaving={isSaving}
        onClose={() => setPendingCompleteReferral(null)}
        onConfirm={async () => {
          if (!pendingCompleteReferral) return;
          await onMarkAttended(pendingCompleteReferral);
        }}
      />

      <ConfirmDialog
        isOpen={pendingDeleteReferral !== null}
        onClose={() => setPendingDeleteReferral(null)}
        onConfirm={async () => {
          if (!pendingDeleteReferral) return;
          await onDeleteReferral(pendingDeleteReferral.id);
          setPendingDeleteReferral(null);
        }}
        title={common("confirmDeleteTitle")}
        message={t("confirmDeleteReferral", {
          name: pendingDeleteReferral?.patientName ?? "",
        })}
        hint={common("irreversibleAction")}
        cancelLabel={common("cancel")}
        confirmLabel={common("delete")}
      />
    </div>
  );
}
