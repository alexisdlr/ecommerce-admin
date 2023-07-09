"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useStoreModal } from "@/hooks/useStoreModal";



export default function SetupPage() {
  const onOpen = useStoreModal((state) => state.onOpen);
  const isOpen = useStoreModal((state) => state.isOpen);


  useEffect(() => {
    if (!isOpen) {
      onOpen();
    }
  }, [onOpen, isOpen]);

  return null;
}
