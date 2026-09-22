import { useEffect, useRef, useState } from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { analytics } from "../../analytics/analytics";

interface SearchBarProps {
  value: string;
  onCommit: (value: string) => void;
}

const DEBOUNCE_MS = 400;

/** Debounced free-text search. Commits (and reflects into the URL) 400ms
 * after typing stops, or immediately on blur/Enter — never on every
 * keystroke. */
export default function SearchBar({ value, onCommit }: SearchBarProps) {
  const [draft, setDraft] = useState(value);
  const debounceRef = useRef<number | null>(null);
  const lastCommittedRef = useRef(value);

  useEffect(() => {
    setDraft(value);
    lastCommittedRef.current = value;
  }, [value]);

  const commit = (next: string) => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (next === lastCommittedRef.current) return;
    lastCommittedRef.current = next;
    onCommit(next);
    if (next.trim()) analytics.track("search_performed", { query: next.trim() });
  };

  const handleChange = (next: string) => {
    setDraft(next);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => commit(next), DEBOUNCE_MS);
  };

  const handleClear = () => {
    setDraft("");
    commit("");
  };

  return (
    <TextField
      fullWidth
      placeholder="Search job titles…"
      value={draft}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={() => commit(draft)}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit(draft);
      }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: draft ? (
            <InputAdornment position="end">
              <IconButton size="small" aria-label="Clear search" onClick={handleClear}>
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : undefined,
        },
        htmlInput: { "aria-label": "Search job titles" },
      }}
    />
  );
}
