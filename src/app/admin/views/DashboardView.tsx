import { Users, Mail, TrendingUp, Download, RefreshCw, Calendar } from 'lucide-react';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DATE_FORMAT } from '@/lib/constants/dateFormats';
import type { AdminStats } from '../hooks/useAdminStats';
import clsx from 'clsx';

interface DashboardViewProps {
  stats: AdminStats | null;
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onExportRSVPs: () => void;
  onExportContacts: () => void;
  showPartidos: boolean;
}

export function DashboardView({
  stats,
  loading,
  refreshing,
  onRefresh,
  onExportRSVPs,
  onExportContacts,
  showPartidos,
}: DashboardViewProps) {
  if (loading || !stats) {
    return null; // Loading state handled by parent
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Total RSVPs</h3>
              <Users className="h-5 w-5 text-betis-verde" />
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold text-betis-verde">
              {stats.totalRSVPs}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Total Attendees
              </h3>
              <TrendingUp className="h-5 w-5 text-betis-verde" />
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold text-betis-verde">
              {stats.totalAttendees}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Contact Submissions
              </h3>
              <Mail className="h-5 w-5 text-betis-verde" />
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold text-betis-verde">
              {stats.totalContacts}
            </p>
          </CardBody>
        </Card>

        {showPartidos && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Total Matches
                </h3>
                <Calendar className="h-5 w-5 text-betis-verde" />
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-3xl font-bold text-betis-verde">
                {stats.totalMatches}
              </p>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          onClick={onRefresh}
          disabled={refreshing}
          variant="secondary"
          className={clsx(refreshing && 'opacity-50 cursor-not-allowed')}
        >
          <RefreshCw
            className={clsx('h-4 w-4 mr-2', refreshing && 'animate-spin')}
          />
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
        <Button onClick={onExportRSVPs} variant="secondary">
          <Download className="h-4 w-4 mr-2" />
          Export RSVPs
        </Button>
        <Button onClick={onExportContacts} variant="secondary">
          <Download className="h-4 w-4 mr-2" />
          Export Contacts
        </Button>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent RSVPs */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Recent RSVPs</h3>
          </CardHeader>
          <CardBody>
            {stats.recentRSVPs.length === 0 ? (
              <p className="text-gray-500">No RSVPs yet</p>
            ) : (
              <div className="space-y-3">
                {stats.recentRSVPs.map((rsvp) => (
                  <div
                    key={rsvp.id}
                    className="flex justify-between items-center border-b border-gray-200 pb-2"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{rsvp.name}</p>
                      <p className="text-sm text-gray-500">
                        {rsvp.attendees} {rsvp.attendees === 1 ? 'person' : 'people'}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {format(new Date(rsvp.created_at), DATE_FORMAT, {
                        locale: es,
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Recent Contacts */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Contact Submissions
            </h3>
          </CardHeader>
          <CardBody>
            {stats.recentContacts.length === 0 ? (
              <p className="text-gray-500">No contact submissions yet</p>
            ) : (
              <div className="space-y-3">
                {stats.recentContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex justify-between items-center border-b border-gray-200 pb-2"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{contact.name}</p>
                      <p className="text-sm text-gray-500">{contact.subject}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={clsx(
                          'inline-block px-2 py-1 text-xs font-medium rounded',
                          contact.status === 'new' &&
                            'bg-blue-100 text-blue-800',
                          contact.status === 'in progress' &&
                            'bg-yellow-100 text-yellow-800',
                          contact.status === 'resolved' &&
                            'bg-green-100 text-green-800'
                        )}
                      >
                        {contact.status}
                      </span>
                      <p className="text-sm text-gray-500 mt-1">
                        {format(new Date(contact.created_at), DATE_FORMAT, {
                          locale: es,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
