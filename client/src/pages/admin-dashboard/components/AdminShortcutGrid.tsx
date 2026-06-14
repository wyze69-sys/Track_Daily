import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Tag, FileCode2, Trophy, Megaphone, MessageSquare } from 'lucide-react';
import { AdminDashboardData } from '../../../services/api';

interface AdminShortcutGridProps {
  data: AdminDashboardData;
}

export const AdminShortcutGrid: React.FC<AdminShortcutGridProps> = ({ data }) => {
  const shortcuts = [
    { name: 'Users',         path: '/admin/users',         icon: Users,         desc: 'Update student roles and states',      count: data.totalUsersCount },
    { name: 'Categories',    path: '/admin/categories',    icon: Tag,           desc: 'Manage workout taxonomies',            count: data.totalCategoriesCount },
    { name: 'Templates',     path: '/admin/templates',     icon: FileCode2,     desc: 'Configure default schedules' },
    { name: 'Challenges',    path: '/admin/challenges',    icon: Trophy,        desc: 'Design student challenges' },
    { name: 'Announcements', path: '/admin/announcements', icon: Megaphone,     desc: 'Publish notifications' },
    { name: 'Feedback',      path: '/admin/feedback',      icon: MessageSquare, desc: 'Examine complete reports',             count: data.totalFeedbackCount }
  ];

  return (
    <div
      className="rounded-xl border border-border p-5 space-y-4"
      style={{ background: 'var(--card)' }}
    >
      <div>
        <h3 className="text-sm font-black text-foreground">Console Shortcuts</h3>
        <p className="text-[10px] text-muted-foreground mt-0.5">Quick routes to specialized management lists.</p>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {shortcuts.map((shortcut) => {
          const Icon = shortcut.icon;
          return (
            <Link
              key={shortcut.name}
              to={shortcut.path}
              className="group rounded-xl border border-border p-3 flex items-start justify-between bg-muted/10 transition-all hover:border-primary/40 hover:bg-white/[0.01]"
            >
              <div className="flex gap-2.5 min-w-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0">
                  <Icon size={14} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{shortcut.name}</span>
                    {shortcut.count !== undefined && (
                      <span className="rounded-full bg-muted px-1.5 py-0.2 text-[9px] font-bold text-muted-foreground">
                        {shortcut.count}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{shortcut.desc}</p>
                </div>
              </div>
              <ArrowRight size={12} className="text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all mt-1 flex-shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
};
