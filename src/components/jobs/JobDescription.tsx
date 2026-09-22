import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import type { Components } from "react-markdown";

interface JobDescriptionProps {
  markdown: string;
}

// Links always open in a new tab; nothing else about link handling is
// data-driven, so this can't become an open-redirect vector.
const markdownComponents: Components = {
  a: ({ href, children }) => (
    <Link href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </Link>
  ),
};

/**
 * Renders the job description, which the API returns as Markdown. No
 * `rehype-raw` plugin is used, so any HTML embedded in the source is
 * rendered as literal escaped text rather than executed — this is how the
 * "no unsafe HTML" requirement is met without `dangerouslySetInnerHTML`.
 */
export default function JobDescription({ markdown }: JobDescriptionProps) {
  return (
    <Box
      sx={{
        "& h1, & h2, & h3, & h4": { fontWeight: 700, mt: 2.5, mb: 1, fontSize: "1.05rem" },
        "& p": { mb: 1.5, lineHeight: 1.7 },
        "& ul, & ol": { pl: 3, mb: 1.5 },
        "& li": { mb: 0.5 },
        "& a": { color: "primary.main", wordBreak: "break-word" },
        "& strong": { fontWeight: 700 },
        overflowWrap: "break-word",
      }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {markdown}
      </ReactMarkdown>
    </Box>
  );
}
