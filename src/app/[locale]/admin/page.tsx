import AdminSidebar from '@/features/admin/components/AdminSidebar';
import { BookOpen, CalendarDays, Users, TrendingUp } from 'lucide-react';

export default function AdminDashboardPage() {
    const stats = [
        {
            label: 'Cursos Activos',
            value: '12',
            icon: BookOpen,
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-100 dark:bg-blue-900/30'
        },
        {
            label: 'Eventos Próximos',
            value: '4',
            icon: CalendarDays,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-100 dark:bg-emerald-900/30'
        },
        {
            label: 'Nuevos Alumnos',
            value: '128',
            icon: Users,
            color: 'text-purple-600 dark:text-purple-400',
            bg: 'bg-purple-100 dark:bg-purple-900/30'
        },
        {
            label: 'Visitas del Mes',
            value: '3,450',
            icon: TrendingUp,
            color: 'text-orange-600 dark:text-orange-400',
            bg: 'bg-orange-100 dark:bg-orange-900/30'
        },
    ];

    return (
        <div className="flex h-screen bg-background">
            <AdminSidebar />

            <main className="flex-1 overflow-y-auto p-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold tracking-tight text-text-primary">Resumen General</h2>
                    <p className="mt-1 text-sm text-text-secondary">
                        Métricas principales y estado actual de Maestro Virtual.
                    </p>
                </div>

                {/* Cuadrícula de Estadísticas */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={stat.label}
                                className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-6 shadow-sm"
                            >
                                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.bg} ${stat.color}`}>
                                    <Icon size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-text-secondary">{stat.label}</p>
                                    <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Espacio para futura tabla de actividad reciente */}
                <div className="mt-8 rounded-2xl border border-border bg-surface p-8 text-center text-text-secondary">
                    <p>La gráfica de actividad reciente se integrará en el próximo sprint.</p>
                </div>
            </main>
        </div>
    );
}