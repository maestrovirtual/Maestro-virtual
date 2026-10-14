"use client";

import { Link, usePathname } from '@/i18n/navigation';
import Image from 'next/image';
import { BookOpen, CalendarDays, MessageSquare, LogOut, LayoutDashboard } from 'lucide-react';
import clsx from 'clsx';
export default function AdminSidebar() {
    const currentPath = usePathname();

    const navLinks = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Cursos', href: '/admin/cursos', icon: BookOpen },
        { name: 'Eventos', href: '/admin/eventos', icon: CalendarDays },
        { name: 'Mensajes', href: '/admin/mensajes', icon: MessageSquare },
    ];

    return (
        <aside className="flex h-screen w-64 flex-col border-r border-border bg-surface dark:bg-slate-900">
            {/* HEADER DEL SIDEBAR */}
            <div className="flex h-20 items-center justify-center border-b border-border px-4 bg-white">
                {/* Aquí va el Logo real de Maestro Virtual */}
                <Image
                    src="/images/logo/maestrovirtual.webp"
                    alt="Maestro Virtual Logo"
                    width={144}
                    height={44}
                    priority
                    className="object-contain"
                />
                <span className="ml-2 rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">ADMIN</span>
            </div>

            {/* ENLACES DE NAVEGACIÓN */}
            <nav className="flex-1 space-y-1 p-4">
                {navLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = link.href === '/admin' ? currentPath === link.href : currentPath.startsWith(link.href);

                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            aria-current={isActive ? "page" : undefined}
                            className={clsx(
                                'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                            )}
                        >
                            <Icon size={18} />
                            {link.name}
                        </Link>
                    );
                })}
            </nav>

            {/* FOOTER DEL SIDEBAR (Cerrar Sesión) */}
            <form action="/api/auth/logout" method="post" className="border-t border-border p-4">
                <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/40 dark:hover:text-red-300">
                    <LogOut size={18} />
                    Cerrar Sesión
                </button>
            </form>
        </aside>
    );
}