"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellOutlined, LogoutOutlined } from "@ant-design/icons";
import AuthGuard from "@/components/auth/AuthGuard";
import styles from "./dashboard.layout.module.css";

const NAV_ITEMS = [
  {
    key: "staff",
    label: "Nhân viên",
    href: "/admin/staff",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    key: "branch",
    label: "Chi nhánh",
    href: "/admin/branch",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
    ),
  },
  {
    key: "car",
    label: "Xe",
    href: "/admin/car",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="1" y="3" width="15" height="13" rx="2" />
        <path d="M16 8h4l3 3v6h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AuthGuard>
      <div className={styles.layout}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          {/* Logo */}
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#4a90e2"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" />
                <rect x="9" y="11" width="14" height="10" rx="2" />
                <circle cx="12" cy="20" r="1" />
                <circle cx="20" cy="20" r="1" />
              </svg>
            </div>
            <div className={styles.logoText}>
              <span className={styles.logoTitle}>Xe Limou Việt Trung</span>
              <span className={styles.logoSub}>Hệ thống quản trị</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className={styles.nav}>
            {NAV_ITEMS.map((item) => {
              const isActive = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  <span className={styles.navLabel}>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main content area */}
        <div className={styles.main}>
          {/* Header */}
          <header className={styles.header}>
            <div className={styles.searchBox}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9ca3af"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Tìm kiếm nhân viên..."
                className={styles.searchInput}
              />
            </div>

            <div className={styles.headerRight}>
              <button className={styles.iconBtn}>
                <BellOutlined style={{ fontSize: 18, color: "#6b7280" }} />
              </button>
              <div className={styles.userInfo}>
                <div className={styles.userText}>
                  <span className={styles.userName}>Admin Việt Trung</span>
                  <span className={styles.userRole}>QUẢN TRỊ VIÊN</span>
                </div>
                <div className={styles.avatar}>AT</div>
              </div>
              <button className={styles.iconBtn}>
                <LogoutOutlined style={{ fontSize: 18, color: "#6b7280" }} />
              </button>
            </div>
          </header>

          {/* Page content */}
          <main className={styles.content}>{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
