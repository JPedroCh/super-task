import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import type { ReactNode } from "react";

interface DemoBannerProps {
  title: string;
  children: ReactNode;
}

/** Makes it unmissable that a page is a demonstration flow with no real
 * backend behind it (brief §2: "make it obvious they are demos"). */
export default function DemoBanner({ title, children }: DemoBannerProps) {
  return (
    <Alert severity="info" variant="outlined" sx={{ mb: 3 }} role="status">
      <AlertTitle sx={{ fontWeight: 700 }}>{title}</AlertTitle>
      {children}
    </Alert>
  );
}
