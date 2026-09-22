import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { SignUpSchema, type SignUpFormValues } from "../../schemas/signup";
import { analytics } from "../../analytics/analytics";

const MOCK_SUBMIT_DELAY_MS = 900;

/** A realistic-feeling sign-up flow that creates nothing: no account, no
 * token, no password is ever stored anywhere (brief §13 — "no need to
 * actually submit data to a backend", but validation, errors and states
 * should behave for real). */
export default function SignUpForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(SignUpSchema),
    mode: "onBlur",
  });

  const onSubmit = async () => {
    analytics.track("signup_submitted", {});
    await new Promise((resolve) => setTimeout(resolve, MOCK_SUBMIT_DELAY_MS));
    analytics.track("signup_completed", {});
    setSubmitted(true);
  };

  const handleFirstInteraction = () => {
    if (!isDirty) analytics.track("signup_started", {});
  };

  if (submitted) {
    return (
      <Alert severity="success" role="status">
        Demo account created. Nothing was actually saved — this is a mock flow.
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
        slotProps={{ formHelperText: { role: errors.name ? "alert" : undefined } }}
      />
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        {...register("email")}
        error={!!errors.email}
        helperText={errors.email?.message}
        slotProps={{ formHelperText: { role: errors.email ? "alert" : undefined } }}
      />
      <TextField
        label="Password"
        type="password"
        autoComplete="new-password"
        {...register("password")}
        error={!!errors.password}
        helperText={errors.password?.message ?? "At least 8 characters, with a mix of cases and a number"}
        slotProps={{ formHelperText: { role: errors.password ? "alert" : undefined } }}
      />
      <TextField
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        {...register("confirmPassword")}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
        slotProps={{ formHelperText: { role: errors.confirmPassword ? "alert" : undefined } }}
      />
      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={isSubmitting}
        startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : undefined}
      >
        {isSubmitting ? "Creating demo account…" : "Create account"}
      </Button>
    </Stack>
  );
}
