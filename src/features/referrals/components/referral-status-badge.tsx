import type { ReferralStatus } from "@/features/referrals/types";

const STATUS_MAP: Record<ReferralStatus, string> = {
  Bloqueado: "bg-orange-100 text-orange-800",
  Encaminhado: "bg-yellow-100 text-yellow-800",
  Agendado: "bg-blue-100 text-blue-800",
  Atendido: "bg-green-100 text-green-800",
};

export function ReferralStatusBadge({
  status,
  justificativaBloqueio,
}: {
  status: ReferralStatus;
  justificativaBloqueio?: string | null;
}) {
  const showJustification =
    status === "Bloqueado" && Boolean(justificativaBloqueio?.trim());

  return (
    <div className="flex min-w-0 max-w-[16rem] flex-col gap-1">
      <span
        className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_MAP[status]}`}
      >
        {status}
      </span>
      {showJustification ? (
        <p
          className="text-xs leading-snug text-orange-900/80"
          title={justificativaBloqueio ?? undefined}
        >
          {justificativaBloqueio}
        </p>
      ) : null}
    </div>
  );
}
