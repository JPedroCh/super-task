import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

/** The only error copy users ever see — never a raw AxiosError string. */
export default function ErrorState({ title = "Something went wrong", message, onRetry }: ErrorStateProps) {
  return (
    <Box
      role="alert"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 1.5,
        py: 6,
        px: 2,
      }}
    >
      <ErrorOutlineIcon color="error" sx={{ fontSize: 40 }} />
      <Typography variant="h3">{title}</Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 420 }}>
        {message}
      </Typography>
      {onRetry && (
        <Button variant="contained" onClick={onRetry} sx={{ mt: 1 }}>
          Retry
        </Button>
      )}
    </Box>
  );
}
