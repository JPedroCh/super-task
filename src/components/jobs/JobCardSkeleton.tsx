import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";

export default function JobCardSkeleton() {
  return (
    <Card component="li" sx={{ listStyle: "none", p: 2 }} aria-hidden="true">
      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Skeleton variant="rounded" width={44} height={44} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="70%" height={28} />
            <Skeleton variant="text" width="40%" height={20} />
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
          <Skeleton variant="rounded" width={90} height={24} />
          <Skeleton variant="rounded" width={70} height={24} />
          <Skeleton variant="rounded" width={80} height={24} />
        </Stack>
        <Skeleton variant="text" width="50%" height={24} sx={{ mt: 1.5 }} />
      </CardContent>
    </Card>
  );
}
