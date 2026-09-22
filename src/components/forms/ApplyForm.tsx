import { useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { ApplicationSchema, type ApplicationFormValues } from "../../schemas/application";
import { analytics } from "../../analytics/analytics";

const MOCK_SUBMIT_DELAY_MS = 900;

interface ApplyFormProps {
  jobId: string;
}

/** Represents the external application flow without performing one — see
 * MockApplyPage for why the job's real applicationUrl is shown as
 * read-only text rather than auto-navigated to (brief §14: no arbitrary
 * redirect based on untrusted API data). */
export default function ApplyForm({ jobId }: ApplyFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [fileName, setFileName] = useState("");
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(ApplicationSchema),
    mode: "onBlur",
  });

  const onSubmit = async () => {
    analytics.track("external_apply_submitted", { jobId });
    await new Promise((resolve) => setTimeout(resolve, MOCK_SUBMIT_DELAY_MS));
    setSubmitted(true);
  };

  const handleFirstInteraction = () => {
    if (!isDirty) analytics.track("external_apply_started", { jobId });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.files?.[0]?.name ?? "";
    setFileName(name);
    setValue("resumeFileName", name, { shouldValidate: true });
  };

  if (submitted) {
    return (
      <Alert severity="success" role="status">
        Demo application submitted. This is a mock flow — nothing was sent anywhere.
      </Alert>
    );
  }

  return (
    <Stack
      component="form"
      spacing={2.5}
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      onChangeCapture={handleFirstInteraction}
    >
      <TextField
        label="Full name"
        autoComplete="name"
        {...register("name")}
        error={!!errors.name}
        helperText={errors.name?.message}
      />
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        {...register("email")}
        error={!!errors.email}
        helperText={errors.email?.message}
      />

      <input type="hidden" {...register("resumeFileName")} />
      <Button
        component="label"
        variant="outlined"
        color={errors.resumeFileName ? "error" : "primary"}
        startIcon={<AttachFileIcon />}
        sx={{ justifyContent: "flex-start" }}
      >
        {fileName || "Attach resume"}
        <input type="file" hidden accept=".pdf,.doc,.docx" onChange={handleFileChange} />
      </Button>
      {errors.resumeFileName && (
        <Alert severity="error" role="alert" variant="outlined" sx={{ mt: -1.5 }}>
          {errors.resumeFileName.message}
        </Alert>
      )}

      <TextField
        label="Message (optional)"
        multiline
        minRows={3}
        {...register("message")}
        error={!!errors.message}
        helperText={errors.message?.message}
      />

      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={isSubmitting}
        startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : undefined}
      >
        {isSubmitting ? "Submitting…" : "Submit application"}
      </Button>
    </Stack>
  );
}
