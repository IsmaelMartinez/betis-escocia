"use client";

import {
  Users,
  Mail,
  TrendingUp,
  Download,
  Calendar,
} from "lucide-react";
import Card, { CardHeader, CardBody } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DATE_FORMAT } from "@/lib/constants/dateFormats";
import type { AdminStats } from "../hooks/useAdminStats";
import type { ContactSubmission } from "@/lib/api/supabase";

interface DashboardViewProps {
  readonly stats: AdminStats | null;
  readonly showPartidos: boolean;
  readonly onExportRSVPs: () => void;
  readonly onExportContacts: () => void;
  readonly onUpdateContactStatus: (
    id: number,
    status: ContactSubmission["status"],
  ) => void;
  readonly onViewContacts: () => void;
}

export default function DashboardView({
  stats,
  showPartidos,
  onExportRSVPs,
  onExportContacts,
  onUpdateContactStatus,
  onViewContacts,
}: DashboardViewProps) {
  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="hover-lift">
          <CardBody className="text-center">
            <div className="mx-auto w-12 h-12 bg-betis-green/10 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-betis-green" />
            </div>
            <div className="text-3xl font-black text-betis-black mb-2">
              {stats?.totalRSVPs}
            </div>
            <div className="text-sm text-gray-600">RSVPs Totales</div>
          </CardBody>
        </Card>

        <Card className="hover-lift">
          <CardBody className="text-center">
            <div className="mx-auto w-12 h-12 bg-betis-green/10 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-betis-green" />
            </div>
            <div className="text-3xl font-black text-betis-black mb-2">
              {stats?.totalAttendees}
            </div>
            <div className="text-sm text-gray-600">
              Asistentes Confirmados
            </div>
          </CardBody>
        </Card>

        <Card className="hover-lift">
          <CardBody className="text-center">
            <div className="mx-auto w-12 h-12 bg-betis-green/10 rounded-lg flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-betis-green" />
            </div>
            <div className="text-3xl font-black text-betis-black mb-2">
              {stats?.totalContacts}
            </div>
            <div className="text-sm text-gray-600">
              Mensajes de Contacto
            </div>
          </CardBody>
        </Card>

        {showPartidos && (
          <Card className="hover-lift">
            <CardBody className="text-center">
              <div className="mx-auto w-12 h-12 bg-betis-green/10 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-betis-green" />
              </div>
              <div className="text-3xl font-black text-betis-black mb-2">
                {stats?.totalMatches}
              </div>
              <div className="text-sm text-gray-600">
                Partidos Guardados
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Export Actions */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-betis-black">
              Exportar Datos
            </h2>
          </CardHeader>
          <CardBody>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={onExportRSVPs}
                variant="primary"
                leftIcon={<Download className="h-4 w-4" />}
              >
                Exportar RSVPs (CSV)
              </Button>
              <Button
                onClick={onExportContacts}
                variant="secondary"
                leftIcon={<Download className="h-4 w-4" />}
              >
                Exportar Contactos (CSV)
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent RSVPs */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-betis-black">
              RSVPs Recientes
            </h2>
          </CardHeader>
          <CardBody>
            {stats?.recentRSVPs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No hay RSVPs recientes
              </p>
            ) : (
              <div className="space-y-4">
                {stats?.recentRSVPs.map((rsvp) => (
                  <div
                    key={rsvp.id}
                    className="border-l-4 border-betis-green bg-gray-50 p-4 rounded-r-lg"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-betis-black">
                        {rsvp.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(rsvp.created_at), DATE_FORMAT, {
                          locale: es,
                        })}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      {rsvp.email}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Asistentes:</span>{" "}
                      {rsvp.attendees} |
                      <span className="font-medium"> Partido:</span>{" "}
                      {format(new Date(rsvp.match_date), DATE_FORMAT, {
                        locale: es,
                      })}
                    </div>
                    {rsvp.message && (
                      <div className="text-sm text-gray-600 mt-2 italic">
                        &ldquo;{rsvp.message}&rdquo;
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Recent Contacts */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-betis-black">
                Contactos Recientes
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={onViewContacts}
              >
                Ver Todos
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            {stats?.recentContacts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No hay contactos recientes
              </p>
            ) : (
              <div className="space-y-4">
                {stats?.recentContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="border-l-4 border-betis-green bg-gray-50 p-4 rounded-r-lg"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-betis-black">
                        {contact.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(
                          new Date(contact.created_at),
                          DATE_FORMAT,
                          { locale: es },
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      {contact.email}
                    </div>
                    <div className="text-sm mb-2">
                      <select
                        value={contact.status}
                        onChange={(e) =>
                          onUpdateContactStatus(
                            contact.id,
                            e.target.value as ContactSubmission["status"],
                          )
                        }
                        className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium mr-2 focus:outline-none focus:ring-2 focus:ring-betis-green"
                      >
                        <option value="new">New</option>
                        <option value="in progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                      <span className="inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                        {contact.type}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-gray-700 mb-1">
                      {contact.subject}
                    </div>
                    <div className="text-sm text-gray-600 truncate">
                      {contact.message}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
