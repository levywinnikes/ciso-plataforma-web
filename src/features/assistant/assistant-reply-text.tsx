"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { hrefForAssistantScreen } from "./screen-catalog";

const TOKEN = /\[([^\]]+)\]\((tela:[a-z0-9-]+)\)/g;

export function AssistantReplyText({ content }: { content: string }) {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const pattern = new RegExp(TOKEN.source, "g");

  while ((match = pattern.exec(content)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(content.slice(lastIndex, match.index));
    }

    const label = match[1];
    const href = hrefForAssistantScreen(match[2]);
    if (href) {
      nodes.push(
        <Link
          key={`${match.index}-${href}`}
          href={href}
          className="font-medium text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary"
        >
          {label}
        </Link>,
      );
    } else {
      nodes.push(label);
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    nodes.push(content.slice(lastIndex));
  }

  return <span className="whitespace-pre-wrap">{nodes}</span>;
}
