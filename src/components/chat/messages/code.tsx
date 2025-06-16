"use client";

import { FC, memo, useCallback, useMemo } from "react";
import { CheckCircle2, Copy } from "lucide-react";
import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard";
import { Button } from "@/components/ui/button";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/cjs/styles/prism";
import getIcon from "@/lib/file-icons/get-icon";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface Props {
  language: string;
  value: string;
  isUser?: boolean;
}

const CodeHeaderComponent = ({
  isUser,
  language,
  onCopy,
  isCopied,
}: {
  isUser: boolean;
  language: string;
  onCopy: () => void;
  isCopied: boolean;
}) => {
  const icon = useMemo(() => getIcon(language, false), [language]);

  return (
    <div
      className={cn(
        "bg-accent text-foreground relative flex w-full items-center justify-between rounded-t-2xl px-4 py-1 pr-1",
      )}
    >
      <span className="pointer-events-none flex items-center gap-2 text-xs font-semibold lowercase opacity-60 select-none">
        <img
          className="pointer-events-none size-4 brightness-200 grayscale invert select-none dark:invert-0"
          src={icon}
          alt=""
        />
        {language}
      </span>
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          className="group hover:bg-background/50 dark:hover:bg-primary/10 dark:hover:text-foreground flex h-8 items-center gap-2 rounded-full px-4 text-xs font-medium"
          onClick={onCopy}
        >
          {!isCopied && (
            <>
              <div className="opacity-60 transition-opacity duration-500 group-hover:opacity-100">
                <Copy className="size-4 shrink-0" />
              </div>
              <span className={"text-left opacity-60 transition-opacity duration-500 group-hover:opacity-100"}>
                Copy Code
              </span>
            </>
          )}

          {isCopied && (
            <>
              <div className="copy-check text-green-800 transition-opacity duration-500 group-hover:opacity-100 dark:text-green-400">
                <CheckCircle2 className="size-5 shrink-0" strokeWidth={1.5} />
              </div>
              <span className={"animate-in fade-in-5 text-left text-green-800 duration-500 dark:text-green-400"}>
                Copied!
              </span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

const Header = memo(CodeHeaderComponent);

const CodeBlock: FC<Props> = memo(({ language, value, isUser }) => {
  // const { theme } = useTheme();
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 1500 });

  const onCopy = useCallback(() => {
    if (isCopied) return;
    copyToClipboard(value);
  }, [value]);

  return (
    <div
      className={cn(
        "codeblock bg-card selection:bg-background/10 dark:bg-card relative my-3 rounded-2xl font-sans",
        isUser && "bg-background/50",
      )}
    >
      <Header isCopied={isCopied} isUser={!!isUser} language={language} onCopy={onCopy} />
      <div className="code">
        <SyntaxHighlighter
          language={language}
          style={oneDark}
          customStyle={{
            background: "transparent",
            padding: "0.25rem 1rem",
          }}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
});

CodeBlock.displayName = "CodeBlock";

export default CodeBlock;
