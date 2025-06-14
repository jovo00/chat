import { MemoizedReactMarkdown } from "@/components/ui/markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "./code";

export default function MessageContent({ markdown, isUser }: { markdown: string; isUser?: boolean }) {
  return (
    <MemoizedReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          if (!match) {
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
          return (
            <CodeBlock
              language={(match && match[1]) || ""}
              value={String(children).replace(/\n$/, "")}
              isUser={isUser}
              {...props}
            />
          );
        },
        a: ({ node, ...props }) => <a {...props} target="_blank" />,
      }}
    >
      {markdown}
    </MemoizedReactMarkdown>
  );
}
