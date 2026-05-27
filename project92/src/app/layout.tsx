"use client";

import React from "react";
import "./globals.css";
import { AppProvider } from "@/lib/AppContext";
import { ToastProvider } from "@/lib/ToastContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-slate-50">
        <ToastProvider>
          <AppProvider>
            <div className="max-w-7xl mx-auto px-4 py-6">{children}</div>
          </AppProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
