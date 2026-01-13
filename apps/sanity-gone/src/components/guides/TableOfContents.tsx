import * as React from "react"
import {Collapsible} from "@base-ui/react/collapsible"
import ChevronIcon from "~/components/icons/ChevronIcon.tsx";

type Heading = {
    depth: number
    slug: string
    text: string
}

interface TableOfContentsProps {
    headings: Heading[]
    defaultOpen?: boolean
}

export function TableOfContents({headings, defaultOpen = true}: TableOfContentsProps) {
    if (!headings.length) return null

    const baseDepth = Math.min(...headings.map(h => h.depth))

    return (
        <Collapsible.Root
            defaultOpen={defaultOpen}
            className="rounded-xl border border-neutral-800 bg-neutral-900 mt-2"
        >
            <Collapsible.Trigger
                className="
                  group flex w-full items-center gap-2
                  rounded-xl px-4 py-3
                  text-sm font-semibold uppercase tracking-wide
                  text-neutral-200
                  hover:bg-neutral-700
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-neutral-600
                "
            >
                <ChevronIcon className="size-3 transition-transform group-data-[panel-open]:rotate-90"/>
                On this page
            </Collapsible.Trigger>

            <Collapsible.Panel
                className="
                  overflow-hidden
                  transition-all duration-150 ease-out
                  data-[starting-style]:h-0
                  data-[ending-style]:h-0
                "
            >
                <ul className="space-y-1 px-4 pb-4">
                    {headings.map((heading) => {
                        const level = heading.depth - baseDepth

                        return (
                            <li
                                key={heading.slug}
                                className={[
                                    "leading-snug",
                                    level === 1 && "pl-4",
                                    level === 2 && "pl-8",
                                    level >= 3 && "pl-12",
                                ]
                                    .filter(Boolean)
                                    .join(" ")}
                            >
                                <a
                                    href={`#${heading.slug}`}
                                    className="
                                        block rounded-md px-2 py-1
                                        text-neutral-100
                                        hover:bg-neutral-600
                                        hover:text-neutral-50
                                        transition-colors
                                      "
                                >
                                    {heading.text}
                                </a>
                            </li>
                        )
                    })}
                </ul>
            </Collapsible.Panel>
        </Collapsible.Root>
    )
}

export default TableOfContents
