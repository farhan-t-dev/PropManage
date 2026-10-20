import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Building2,
  FileText,
  Gauge,
  LayoutGrid,
  LogOut,
  Menu,
  Search,
  Wrench,
  X,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useNotificationStore } from "../store/notificationStore";
import { initials, displayName } from "../lib/format";
import CommandPalette from "../components/CommandPalette";
import Toast from "../components/Toast";

const NAV = [
  { section: "Operations", items: [
    { to: "/", label: "Overview", icon: Gauge, end: true, roles: null },
    { to: "/discover", label: "Discover", icon: LayoutGrid, roles: null },
  ]},
  { section: "Residency", items: [
    { to: "/maintenance", label: "Maintenance", icon: Wrench, roles: null },
  ]},
  { section: "Portfolio", items: [
    { to: "/landlord-dashboard", label: "Dashboard", icon: Building2, roles: ["landlord", "admin"] },
    { to: "/landlord-dashboard/create-property", label: "New property", icon: Building2, roles: ["landlord", "admin"] },
    { to: "/documents", label: "Document vault", icon: FileText, roles: ["landlord", "admin"] },
  ]},
  { section: "Your stays", items: [
    { to: "/my-bookings", label: "My bookings", icon: LayoutGrid, roles: ["tenant", "admin"] },
  ]},
];

const TITLES = [
  ["/landlord-dashboard/create-property", "Register a property"],
  ["/landlord-dashboard", "Portfolio overview"],
  ["/my-bookings", "Resident portal"],
  ["/discover", "Discover units"],
  ["/maintenance", "Maintenance desk"],
  ["/documents", "Document vault"],
  ["/", "Operations overview"],
];

function pageTitle(pathname) {
  if (/^\/unit\//.test(pathname)) return "Unit detail";
  const match = TITLES.find(([path]) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path),
  );
  return match ? match[1] : "PropManage";
}

/** Live notification history panel behind the header bell. */
function NotificationBell() {
  const [open, setOpen] = useState(false);
  const history = useNotificationStore((s) => s.history);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const isConnected = useNotificationStore((s) => s.isConnected);
  const unread = history.filter((h) => !h.read).length;

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const toneDot = {
    success: "bg-pine-500",
    error: "bg-signal-500",
    warning: "bg-brass-500",
    info: "bg-ink-300",
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen((v) => !v);
          if (!open && unread) markAllRead();
        }}
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-[4px] border border-crete-300 bg-crete-50 text-ink-500 transition-colors hover:border-ink-300 hover:text-ink-800"
      >
        <Bell className="h-4 w-4" aria-hidden="true" />
        {unread > 0 && (
          <span className="num absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brass-500 px-1 text-[10px] font-semibold text-white">
            {unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-11 z-40 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-card border border-crete-300 bg-crete-50 shadow-lift"
            >
              <header className="flex items-center justify-between border-b border-crete-200 px-4 py-3">
                <span className="text-[13px] font-semibold text-ink-800">
                  Activity
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-ink-400">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isConnected ? "bg-pine-500" : "bg-ink-300"
                    }`}
                  />
                  {isConnected ? "live" : "offline"}
                </span>
              </header>
              <div className="max-h-80 overflow-y-auto">
                {history.length === 0 ? (
                  <p className="px-4 py-8 text-center text-[13px] text-ink-400">
                    Nothing yet. Ticket and booking events land here the moment
                    they happen.
                  </p>
                ) : (
                  history.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 border-b border-crete-200 px-4 py-3 last:border-b-0"
                    >
                      <span
                        className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                          toneDot[item.type] || toneDot.info
                        }`}
                      />
                      <div className="min-w-0">
                        <p className="text-[13px] leading-snug text-ink-700">
                          {item.message}
                        </p>
                        <p className="num mt-0.5 text-[11px] text-ink-300">
                          {new Date(item.at).toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function RailNav({ onNavigate }) {
  const { user, isAuthenticated } = useAuthStore();
  const role = user?.role;

  const visible = NAV.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) => !item.roles || (role && item.roles.includes(role)),
    ),
  })).filter((group) => group.items.length > 0);

  return (
    <nav className="flex-1 overflow-y-auto px-3 py-5">
      {visible.map((group) => (
        <div key={group.section} className="mb-6 last:mb-0">
          <h3 className="px-3 pb-2 text-[11px] font-medium tracking-wide text-ink-400">
            {group.section}
          </h3>
          <ul className="space-y-0.5">
            {group.items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-[4px] px-3 py-2 text-[13.5px] transition-colors ${
                      isActive
                        ? "bg-ink-700 font-medium text-crete-50"
                        : "text-ink-200 hover:bg-ink-700/60 hover:text-crete-100"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span
                          className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-brass-500"
                          aria-hidden="true"
                        />
                      )}
                      <item.icon
                        className={`h-4 w-4 shrink-0 ${
                          isActive ? "text-brass-400" : "text-ink-400 group-hover:text-ink-300"
                        }`}
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                      {item.label}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {!isAuthenticated && (
        <div className="mx-1 rounded-card border border-ink-600 bg-ink-700/50 p-4">
          <p className="text-[13px] leading-snug text-crete-200">
            Sign in to book units, pay invoices and file tickets.
          </p>
          <Link
            to="/login"
            onClick={onNavigate}
            className="mt-3 block rounded-[4px] bg-brass-500 px-3 py-1.5 text-center text-[13px] font-medium text-white transition-colors hover:bg-brass-600"
          >
            Sign in
          </Link>
        </div>
      )}
    </nav>
  );
}

function UserBlock({ onNavigate }) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  if (!isAuthenticated) return null;

  return (
    <div className="border-t border-ink-700 p-3">
      <div className="flex items-center gap-3 rounded-[4px] px-2 py-2">
        <span className="num flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] bg-brass-500 text-[13px] font-semibold text-white">
          {initials(user)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-crete-100">
            {displayName(user)}
          </p>
          <p className="truncate text-[11.5px] text-ink-300">{user?.role}</p>
        </div>
        <button
          onClick={async () => {
            await logout();
            onNavigate?.();
            navigate("/");
          }}
          aria-label="Sign out"
          title="Sign out"
          className="rounded-[4px] p-1.5 text-ink-400 transition-colors hover:bg-ink-700 hover:text-crete-100"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export default function ConsoleLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { pathname } = useLocation();
  const { isAuthenticated, checkAuth } = useAuthStore();
  const connect = useNotificationStore((s) => s.connect);
  const disconnect = useNotificationStore((s) => s.disconnect);

  // Close the mobile drawer on navigation. Deriving from the changed prop
  // during render avoids a setState-in-effect cascade.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    if (mobileOpen) setMobileOpen(false);
  }

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Realtime channel follows auth state.
  useEffect(() => {
    if (isAuthenticated) connect();
    else disconnect();
    return () => disconnect();
  }, [isAuthenticated, connect, disconnect]);

  // ⌘K / Ctrl-K opens the command palette.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen bg-crete-100">
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />

      {/* Console rail — desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-ink-700 bg-ink-800 lg:flex">
        <div className="plan-hatch border-b border-ink-700">
          <Link to="/" className="flex items-center gap-2.5 px-5 py-4">
            <img src="/mark.svg" alt="" className="h-7 w-7" />
            <span className="display text-[17px] font-semibold tracking-tight text-crete-50">
              PropManage
            </span>
          </Link>
        </div>
        <RailNav />
        <UserBlock />
      </aside>

      {/* Console rail — mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-ink-950/50 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-ink-700 bg-ink-800 lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="plan-hatch flex items-center justify-between border-b border-ink-700 px-5 py-4">
                <Link to="/" className="flex items-center gap-2.5">
                  <img src="/mark.svg" alt="" className="h-7 w-7" />
                  <span className="display text-[17px] font-semibold text-crete-50">
                    PropManage
                  </span>
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="rounded-[4px] p-1.5 text-ink-300 hover:bg-ink-700"
                >
                  <X className="h-4.5 w-4.5" aria-hidden="true" />
                </button>
              </div>
              <RailNav onNavigate={() => setMobileOpen(false)} />
              <UserBlock onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Workspace */}
      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 border-b border-crete-300 bg-crete-100/92 backdrop-blur">
          <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="rounded-[4px] p-2 text-ink-500 hover:bg-crete-200 lg:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>

            <h1 className="display min-w-0 flex-1 truncate text-[17px] font-semibold text-ink-900">
              {pageTitle(pathname)}
            </h1>

            <button
              onClick={() => setPaletteOpen(true)}
              className="hidden items-center gap-2 rounded-[4px] border border-crete-300 bg-crete-50 px-3 py-1.5 text-[13px] text-ink-400 transition-colors hover:border-ink-300 hover:text-ink-600 sm:flex"
            >
              <Search className="h-3.5 w-3.5" aria-hidden="true" />
              Search
              <span className="num ml-6 rounded-[3px] border border-crete-300 bg-crete-100 px-1.5 py-0.5 text-[10.5px] text-ink-400">
                ⌘K
              </span>
            </button>

            {isAuthenticated && <NotificationBell />}
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:py-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>

      <Toast />
    </div>
  );
}
