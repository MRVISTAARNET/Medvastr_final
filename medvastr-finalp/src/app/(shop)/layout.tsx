import React from "react";
import ClientLayout from "@/components/ClientLayout";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
