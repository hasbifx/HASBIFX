import React, { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import {
  Home, BookOpen, TrendingUp, MessageCircle, ClipboardList,
  User, Settings as SettingsIcon, LogOut, Shield, Menu, X, TrendingUp as Logo,
  Map, Award, Bookmark, NotebookPen, BarChart3, CandlestickChart,
} from "lucide-react";
import { initials, colorForUser } from "@/lib/learning";

const NAV_GROUPS = [
  { items: [
    { to: "/dashboard", label: "Dashboard", icon: Home },
  ]},
  { label: "Belajar", items: [
    { to: "/roadmap", label: "Roadmap", icon: Map },
    { to: "/classes", label: "Kelas", icon: BookOpen },
    { to: "/progress", label: "Progress", icon: TrendingUp },
    { to: "/quizzes", label: "Quiz", icon: ClipboardList },
    { to: "/bookmarks", label: "Bookmarks", icon: Bookmark },
    { to: "/achievements", label: "Achievement", icon: Award },
    { to: "/certificate", label: "Sertifikat", icon: Award },
  ]},
  { label: "Trading Tools", items: [
    { to: "/journal", label: "Journal", icon: NotebookPen },
    { to: "/journal-analytics", label: "Analytics", icon: BarChart3 },
    { to: "/practice", label: "Practice", icon: CandlestickChart },
  ]},
  { label: "Komunitas", items: [
    { to: "/community", label: "Community", icon: MessageCircle },
  ]},
  { label: "Akun", items: [
    { to: "/profile", label: "Profile", icon: User },
    { to: "/settings", label: "Settings", icon: SettingsIcon },
  ]},
];

function NavList({ onNavigate }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";

  const handleLogout = () => {
    logout(false);
    navigate("/login");
  };

  return (
    <div className="flex flex-col h-full">
      <Link to="/dashboard" onClick={onNavigate} className="flex items-center gap-2.5 px-5 h-16 border-b border-border shrink-0">
        <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
          <Logo className="text-primary" width={18} height={18} />
        </div>
        <span className="text-xl font-bold tracking-tight">HASB<span className="text-primary">IFX</span></span>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi}>
            {group.label && <p className="px-3.5 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">{group.label}</p>}
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = location.pathname === item.to || location.pathname.startsWith(item.to + "/");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={onNavigate}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                    }`}
                  >
                    <Icon className="w-[18px] h-[18px] shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
        {isAdmin && (
          <Link
            to="/admin"
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              location.pathname.startsWith("/admin")
                ? "bg-primary/15 text-primary border border-primary/30"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            }`}
          >
            <Shield className="w-[18px] h-[18px] shrink-0" />
            Admin Panel
          </Link>
        )}
      </nav>

      <div className="p-3 border-t border-border shrink-0">
        <Link to="/profile" onClick={onNavigate} className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-secondary/60 transition-colors mb-1">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white shrink-0"
            style={{ backgroundColor: colorForUser(user?.id) }}
          >
            {initials(user?.full_name || user?.email)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{user?.full_name || "Member"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-[18px] h-[18px]" />
          Logout
        </button>
      </div>
    </div>
  );
}

export default function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-sidebar border-r border-border flex-col z-30">
        <NavList />
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 h-14 bg-sidebar/95 backdrop-blur border-b border-border flex items-center justify-between px-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
            <Logo className="w-4 h-4 text-primary" />
          </div>
          <span className="text-lg font-bold tracking-tight">HASB<span className="text-primary">IFX</span></span>
        </Link>
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-2 rounded-lg hover:bg-secondary text-foreground"
          aria-label="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-sidebar border-r border-border">
            <button
              onClick={() => setDrawerOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-secondary text-muted-foreground z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <NavList onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="lg:pl-64">
        <div className="min-h-screen">
          <Outlet />
        </div>
      </main>
    </div>
  );
}