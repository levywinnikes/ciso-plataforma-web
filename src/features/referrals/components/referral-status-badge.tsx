import type { ReferralStatus } from "@/features/referrals/types";

const STATUS_MAP: Record<ReferralStatus, string> = {
  Encaminhado: "bg-yellow-100 text-yellow-800",
  Agendado: "bg-blue-100 text-blue-800",
  Atendido: "bg-green-100 text-green-800",
};

export function ReferralStatusBadge({ status }: { status: ReferralStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_MAP[status]}`}
    >
      {status}
    </span>
  );
}
