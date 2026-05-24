"use client";

import { Calendar, User } from "lucide-react";

interface AppointmentFormProps {
  doctor: string;
  onDoctorChange: (val: string) => void;
  appointmentDate: string;
  onAppointmentDateChange: (val: string) => void;
  availableDoctors: { id: string; name: string }[];
}

export function AppointmentForm({
  doctor,
  onDoctorChange,
  appointmentDate,
  onAppointmentDateChange,
  availableDoctors,
}: AppointmentFormProps) {
  return (
    <div className="space-y-5 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-5">
      <h4 className="mb-2 flex items-center text-sm font-bold uppercase tracking-wider text-primary">
        <Calendar className="mr-2 h-4 w-4" />
        Agendamento Especializado
      </h4>

      <p className="mb-4 text-sm text-gray-500">
        Selecione o médico especialista e a data para atender este
        encaminhamento.
      </p>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="flex items-center text-xs font-bold uppercase text-gray-700">
            <User className="mr-2 h-3 w-3" />
            Médico Responsável
          </label>
          <select
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            value={doctor}
            onChange={(e) => onDoctorChange(e.target.value)}
          >
            <option value="">Selecione um médico...</option>
            {availableDoctors.map((doc) => (
              <option key={doc.id} value={doc.name}>
                {doc.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="flex items-center text-xs font-bold uppercase text-gray-700">
            <Calendar className="mr-2 h-3 w-3" />
            Data e Hora do Atendimento
          </label>
          <input
            type="datetime-local"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            value={appointmentDate}
            onChange={(e) => onAppointmentDateChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
