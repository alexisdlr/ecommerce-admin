"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useStoreModal } from "@/hooks/useStoreModal";

const formSchema = z.object({
  name: z.string().min(1),
});

export default function SetupPage() {
  const onOpen = useStoreModal((state) => state.onOpen);
  const isOpen = useStoreModal((state) => state.isOpen);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (!isOpen) {
      onOpen();
    }
  }, [onOpen, isOpen]);

  return <div className="p-4">root page</div>;
}
