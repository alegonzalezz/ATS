import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { DashboardStats, Candidate } from '@/types';
import { 
  Users, 
  UserPlus, 
  Briefcase, 
  TrendingUp, 
  Clock,
  FileText,
  Linkedin,
  Edit3,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { 
  getStatusColor, 
  getStatusLabel, 
  getInitials
} from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface DashboardProps {
  stats: DashboardStats;
  recentCandidates: Candidate[];
  onViewCandidate: (id: string) => void;
  onViewAllCandidates: () => void;
  onSyncLinkedIn: () => void;
  syncStatus: { status: string; message: string };
}

export function Dashboard({ 
  stats, 
  recentCandidates, 
  onViewCandidate, 
  onViewAllCandidates,
  onSyncLinkedIn,
  syncStatus 
}: DashboardProps) {
  const statusOrder = ['nuevo', 'en_revision', 'entrevista', 'oferta', 'contratado', 'rechazado', 'archivado'];
  
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">¡Bienvenido a TalentTrack!</h2>
          <p className="text-gray-600 mt-1">
            Gestiona tus candidatos y mantén sus perfiles actualizados.
          </p>
        </div>
        <Button onClick={onSyncLinkedIn} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Sincronizar LinkedIn
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Candidatos"
          value={stats.totalCandidates}
          icon={Users}
          trend={`+${stats.newThisWeek} esta semana`}
          trendUp={true}
          color="blue"
        />
        <StatCard
          title="Nuevos este mes"
          value={stats.newThisMonth}
          icon={UserPlus}
          trend="vs mes anterior"
          trendUp={true}
          color="green"
        />
        <StatCard
          title="Open to Work"
          value={stats.openToWorkCount}
          icon={Briefcase}
          trend="disponibles"
          trendUp={true}
          color="purple"
        />
        <StatCard
          title="Cambios recientes"
          value={stats.recentChanges}
          icon={TrendingUp}
          trend="esta semana"
          trendUp={true}
          color="orange"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Pipeline de Candidatos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statusOrder.map((status) => {
                const count = stats.byStatus[status as keyof typeof stats.byStatus] || 0;
                const percentage = stats.totalCandidates > 0 
                  ? (count / stats.totalCandidates) * 100 
                  : 0;
                
                return (
                  <div key={status} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getStatusColor(status)}>
                          {getStatusLabel(status)}
                        </Badge>
                        <span className="text-gray-600">{count} candidatos</span>
                      </div>
                      <span className="text-gray-500">{percentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Sources & Skills */}
        <div className="space-y-6">
          {/* Sources */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-blue-600" />
                Fuentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <SourceRow 
                  icon={FileText} 
                  label="CVs" 
                  value={stats.bySource.cv || 0} 
                  total={stats.totalCandidates}
                  color="text-blue-600"
                />
                <SourceRow 
                  icon={Linkedin} 
                  label="LinkedIn" 
                  value={stats.bySource.linkedin || 0} 
                  total={stats.totalCandidates}
                  color="text-blue-700"
                />
                <SourceRow 
                  icon={Edit3} 
                  label="Manual" 
                  value={stats.bySource.manual || 0} 
                  total={stats.totalCandidates}
                  color="text-gray-600"
                />
              </div>
            </CardContent>
          </Card>

          {/* Top Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-green-600" />
                Top Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {stats.topSkills.slice(0, 8).map((skill) => (
                  <Badge key={skill.name} variant="secondary" className="text-xs">
                    {skill.name} ({skill.count})
                  </Badge>
                ))}
                {stats.topSkills.length === 0 && (
                  <p className="text-sm text-gray-500">No hay skills registrados aún</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Candidates */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Candidatos Recientes
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onViewAllCandidates} className="gap-1">
            Ver todos
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentCandidates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No hay candidatos registrados aún</p>
                <p className="text-sm">Comienza agregando tu primer candidato</p>
              </div>
            ) : (
              recentCandidates.slice(0, 5).map((candidate) => (
                <div 
                  key={candidate.id} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => onViewCandidate(candidate.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {getInitials(candidate.fullName)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{candidate.fullName}</p>
                      <p className="text-sm text-gray-600">
                        {candidate.currentRole || 'Sin puesto'} {candidate.currentCompany && `@ ${candidate.currentCompany}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={getStatusColor(candidate.status)}>
                      {getStatusLabel(candidate.status)}
                    </Badge>
                    {candidate.openToWork && (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        Open to Work
                      </Badge>
                    )}
                    <span className="text-xs text-gray-500">
                      {format(parseISO(candidate.createdAt), 'dd MMM', { locale: es })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sync Status */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Linkedin className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Sincronización con LinkedIn</p>
                <p className="text-sm text-gray-600">{syncStatus.message}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onSyncLinkedIn}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Sincronizar ahora
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendUp,
  color 
}: { 
  title: string; 
  value: number; 
  icon: React.ElementType; 
  trend: string;
  trendUp: boolean;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
            <p className={`text-sm mt-1 ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
              {trend}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SourceRow({ 
  icon: Icon, 
  label, 
  value, 
  total,
  color 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: number; 
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  
  return (
    <div className="flex items-center gap-3">
      <Icon className={`h-4 w-4 ${color}`} />
      <div className="flex-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-700">{label}</span>
          <span className="text-gray-500">{value}</span>
        </div>
        <Progress value={percentage} className="h-1.5 mt-1" />
      </div>
    </div>
  );
}
