"use client";

import React from "react";
import { useApp } from "@/context/AppContext";

export default function Toast() {
  const { toastMsg, toastKind } = useApp();

  return (
    <div className="toast-host">
      <div className={`toast-msg${toastMsg ? " show" : ""}${toastKind ? " " + toastKind : ""}`}>
        {toastKind === "ok" && <span>✓</span>}
        {toastKind === "bad" && <span>✕</span>}
        {toastMsg}
      </div>
    </div>
  );
}
