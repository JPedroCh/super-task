import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import Button from "@mui/material/Button";
import DemoBanner from "../components/ui/DemoBanner";
import { usePageTiming } from "../hooks/usePageTiming";
import { analytics } from "../analytics/analytics";
import {
  computeBounceRate,
  computeAverageTimeOnPageMs,
  countEvent,
  segmentByDevice,
  segmentBySource,
} from "../analytics/metrics";

function formatPercent(value: number | null): string {
  return value === null ? "—" : `${Math.round(value * 100)}%`;
}

function formatDuration(ms: number | null): string {
  return ms === null ? "—" : `${(ms / 1000).toFixed(1)}s`;
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card sx={{ flex: "1 1 160px" }}>
      <CardContent>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h2" sx={{ mt: 0.5 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

function SegmentTable({ title, rows }: { title: string; rows: { key: string; count: number }[] }) {
  return (
    <Box sx={{ flex: "1 1 240px" }}>
      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
        {title}
      </Typography>
      {rows.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No data yet
        </Typography>
      ) : (
        <TableContainer component={Card}>
          <Table size="small">
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.key}>
                  <TableCell>{r.key}</TableCell>
                  <TableCell align="right">{r.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

const OWN_PROPERTY_KEYS = new Set(["source", "deviceType", "sessionId", "timestamp"]);

/**
 * The Mock PostHog dashboard (brief §21) — every number here is computed
 * live from events generated during this browser session, never invented.
 * Subscribes to the mock store so it updates as the user interacts with
 * other tabs/pages in the same session.
 */
export default function MockAnalyticsPage() {
  usePageTiming("mock_analytics");
  const [, forceUpdate] = useState(0);

  useEffect(() => analytics.subscribe(() => forceUpdate((n) => n + 1)), []);

  const events = analytics.getEvents();
  const bounceRate = computeBounceRate(events);
  const avgTime = computeAverageTimeOnPageMs(events);

  return (
    <Box sx={{ px: { xs: 2, sm: 0 } }}>
      <DemoBanner title="Mock PostHog">
        Demonstration analytics only. No real PostHog data is being collected — everything below
        is computed from events generated during this browser session.
      </DemoBanner>

      <Typography variant="h1" sx={{ mb: 3 }}>
        Mock PostHog dashboard
      </Typography>

      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ mb: 4 }}>
        <MetricCard label="Job detail views" value={String(countEvent(events, "job_detail_viewed"))} />
        <MetricCard label="Filters used" value={String(countEvent(events, "filter_used"))} />
        <MetricCard label="Apply clicks" value={String(countEvent(events, "apply_clicked"))} />
        <MetricCard label="Sign-up starts" value={String(countEvent(events, "signup_started"))} />
        <MetricCard label="Avg. time on page" value={formatDuration(avgTime)} />
        <MetricCard label="Bounce rate" value={formatPercent(bounceRate)} />
      </Stack>

      <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap sx={{ mb: 4 }}>
        <SegmentTable title="Job detail views by device" rows={segmentByDevice(events, "job_detail_viewed")} />
        <SegmentTable title="Job detail views by source" rows={segmentBySource(events, "job_detail_viewed")} />
      </Stack>

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="h3">Raw event log</Typography>
        <Button size="small" onClick={() => analytics.clear()}>
          Clear events
        </Button>
      </Stack>

      {events.length === 0 ? (
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          No events yet — browse the job board to generate some.
        </Typography>
      ) : (
        <TableContainer component={Card} sx={{ maxHeight: 420 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell>Event</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Device</TableCell>
                <TableCell>Properties</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[...events]
                .reverse()
                .slice(0, 200)
                .map((e, i) => (
                  <TableRow key={i}>
                    <TableCell>{new Date(e.properties.timestamp).toLocaleTimeString()}</TableCell>
                    <TableCell>{e.event}</TableCell>
                    <TableCell>{e.properties.source}</TableCell>
                    <TableCell>{e.properties.deviceType}</TableCell>
                    <TableCell sx={{ fontFamily: "monospace", fontSize: 12 }}>
                      {JSON.stringify(
                        Object.fromEntries(
                          Object.entries(e.properties).filter(([k]) => !OWN_PROPERTY_KEYS.has(k))
                        )
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
