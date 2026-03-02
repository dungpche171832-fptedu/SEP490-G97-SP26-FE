"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./AuthCard.module.css";

type AuthCardProps = {
  title: string;
  subtitle?: string;
  footerText?: string;
  footerHref?: string;
  footerLinkText?: string;
  children: ReactNode;
};

export default function AuthCard({
  title,
  subtitle,
  footerText,
  footerHref,
  footerLinkText,
  children,
}: AuthCardProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.icon} aria-hidden="true">
          DV
        </div>
        <h1 className={styles.title}>{title}</h1>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      </div>

      <div className={styles.content}>{children}</div>

      <p className={styles.demoText}>Demo: admin@demo.com • 123456</p>

      {footerText && footerHref && footerLinkText ? (
        <p className={styles.footer}>
          {footerText} <Link href={footerHref}>{footerLinkText}</Link>
        </p>
      ) : null}
    </div>
  );
}
