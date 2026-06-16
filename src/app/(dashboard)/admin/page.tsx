"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Field } from "@/components/forms/field";
import {
  Button,
  CardSection,
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

const editReferralSchema = z.object({
  patientName: z.string().min(1, "errors.required"),
  patientBirthDate: z.string().min(1, "errors.required"),
  patientPhone: z.string().min(1, "errors.required"),
  patientDocument: z.string().optional().nullable(),
  systemicDiseases: z.string().optional().nullable(),
  clinicalNotes: z.string().optional().nullable(),
  clinicalSuspicion: z.string().optional().nullable(),
  nucleusId: z.string().min(1, "errors.required"),
  clinicId: z.string().min(1, "errors.required"),
  agreementId: z.string().optional().nullable(),
  status: z.enum(["Encaminhado", "Agendado", "Atendido"]),
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

  const [nuclei, setNuclei] = useState<any[]>([]);
  const [surgeries, setSurgeries] = useState<any[]>([]);
  const [agreements, setAgreements] = useState<any[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingReferral, setEditingReferral] = useState<Referral | null>(null);
  const [pendingDeleteReferral, setPendingDeleteReferral] =
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
      appointmentDate: "",
      doctor: "",
      specialistNotes: "",
      specialistConduct: "",
      surgeryId: "",
      surgeryPrice: "",
    },
  });

  const editClinicId = editForm.watch("clinicId");

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
        const [
          referralsRes,
          clinicsRes,
          nucleiRes,
          surgeriesRes,
          agreementsRes,
        ] = await Promise.all([
          fetch("/api/referrals", { cache: "no-store" }),
          fetch("/api/organizations?type=CLINICA", { cache: "no-store" }),
          fetch("/api/nuclei", { cache: "no-store" }),
          fetch("/api/surgeries?active=true", { cache: "no-store" }),
          fetch("/api/agreements?active=true", { cache: "no-store" }),
        ]);

        if (!referralsRes.ok || !clinicsRes.ok) {
          toast.error(tError("errors.genericRequestFailed") ?? "");
          return;
        }

        const referralsData = (await referralsRes.json()) as Referral[];
        const clinicsData = (await clinicsRes.json()) as ClinicOption[];
        const nucleiData = nucleiRes.ok ? await nucleiRes.json() : [];
        const surgeriesData = surgeriesRes.ok ? await surgeriesRes.json() : [];
        const agreementsData = agreementsRes.ok
          ? await agreementsRes.json()
          : [];

        setReferrals(referralsData);
        setClinics(clinicsData);
        setNuclei(nucleiData);
        setSurgeries(surgeriesData);
        setAgreements(agreementsData);
      } catch {
        toast.error(tError("errors.genericRequestFailed") ?? "");
      } finally {
        setIsLoading(false);
      }
    }

    void loadData();
  }, []);

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

  function openEditReferralModal(referral: Referral) {
    setEditingReferral(referral);
    editForm.reset({
      patientName: referral.patientName || "",
      patientBirthDate: referral.patientBirthDate
        ? new Date(referral.patientBirthDate).toISOString().slice(0, 10)
        : "",
      patientPhone: referral.patientPhone || "",
      patientDocument: referral.patientDocument || "",
      systemicDiseases: referral.systemicDiseases || "",
      clinicalNotes: referral.clinicalNotes || "",
      clinicalSuspicion: referral.clinicalSuspicion || "",
      nucleusId: referral.nucleusId || "",
      clinicId: referral.clinicId || "",
      agreementId: referral.agreementId || "",
      status: referral.status || "Encaminhado",
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
          surgeryPrice: data.surgeryPrice ? Number(data.surgeryPrice) : null,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        toast.error(tError(body.error ?? "errors.genericRequestFailed") ?? "");
        return;
      }

      const updated = await response.json();

      setReferrals((current) =>
        current.map((item) =>
          item.id === editingReferral.id ? updated : item,
        ),
      );

      toast.success("Encaminhamento atualizado com sucesso!");
      setIsEditModalOpen(false);
      setEditingReferral(null);
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

      setReferrals((current) => current.filter((item) => item.id !== id));
      toast.success("Encaminhamento excluído com sucesso!");
    } catch {
      toast.error(tError("errors.genericRequestFailed") ?? "");
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
                  <div className="flex items-center justify-end gap-2">
                    {referral.status === "Encaminhado" ? (
                      <Button
                        variant="outline"
                        onClick={() => openScheduleModal(referral)}
                      >
                        {t("scheduleAction")}
                      </Button>
                    ) : null}
                    <Button
                      variant="ghost"
                      className="p-2"
                      onClick={() => openEditReferralModal(referral)}
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4 text-amber-600" />
                    </Button>
                    {referral.status !== "Atendido" ? (
                      <Button
                        variant="ghost"
                        className="p-2"
                        onClick={() => setPendingDeleteReferral(referral)}
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    ) : null}
                  </div>
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

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Encaminhamento"
        maxWidth="max-w-4xl"
      >
        <form
          onSubmit={editForm.handleSubmit(onSubmitEdit)}
          className="space-y-6 pt-4 text-left"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Nome do Paciente"
              error={tError(editForm.formState.errors.patientName?.message)}
            >
              <FloatingInput
                required
                label="Nome do Paciente"
                {...editForm.register("patientName")}
              />
            </Field>

            <Field
              label="Nascimento"
              error={tError(
                editForm.formState.errors.patientBirthDate?.message,
              )}
            >
              <FloatingInput
                type="date"
                required
                label="Nascimento"
                {...editForm.register("patientBirthDate")}
              />
            </Field>

            <Field
              label="Telefone"
              error={tError(editForm.formState.errors.patientPhone?.message)}
            >
              <FloatingInput
                required
                label="Telefone"
                {...editForm.register("patientPhone")}
              />
            </Field>

            <Field
              label="Documento (Opcional)"
              error={tError(editForm.formState.errors.patientDocument?.message)}
            >
              <FloatingInput
                label="Documento (Opcional)"
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
                <option value="Encaminhado">Encaminhado</option>
                <option value="Agendado">Agendado</option>
                <option value="Atendido">Atendido</option>
              </Select>
            </Field>
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
              Salvar Alterações
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={pendingDeleteReferral !== null}
        onClose={() => setPendingDeleteReferral(null)}
        onConfirm={async () => {
          if (!pendingDeleteReferral) return;
          await onDeleteReferral(pendingDeleteReferral.id);
          setPendingDeleteReferral(null);
        }}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o encaminhamento de ${pendingDeleteReferral?.patientName}?`}
        hint="Esta ação é irreversível."
        cancelLabel="Cancelar"
        confirmLabel="Excluir"
      />
    </div>
  );
}
