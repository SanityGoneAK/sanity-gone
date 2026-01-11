import * as React from "react"
import {slugify} from "~/utils/strings.ts";
import { IconBrandYoutube, IconBrandX, IconBrandBluesky, IconBrandDiscord, IconBrandReddit } from '@tabler/icons-react';


type Author = {
    username: string
    bio: string
    social: {
        youtube?: string
        bluesky?: string
        discord?: string
        reddit?: string
        x?: string
    }
}

interface AuthorCardProps {
    author: Author
    id: string
}

export function AuthorCard({author, id}: AuthorCardProps) {
    return (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
            <div className="flex items-start gap-3">
                <img
                    className="size-8 rounded-full bg-neutral-800"
                    src={`/member-avatars/${slugify(id)}.png`}
                    alt={author.username}
                />

                <div className="min-w-0">
                    <p className="text-sm font-semibold text-neutral-100">
                        {author.username}
                    </p>

                    <p className="mt-1 text-sm leading-snug text-neutral-300">
                        {author.bio}
                    </p>
                </div>
            </div>

            {hasSocial(author.social) && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {author.social.youtube && (
                        <SocialLink
                            href={author.social.youtube}
                            label="YouTube"
                        />
                    )}
                    {author.social.bluesky && (
                        <SocialLink
                            href={author.social.bluesky}
                            label="Bluesky"
                        />
                    )}
                    {author.social.reddit && (
                        <SocialLink
                            href={author.social.reddit}
                            label="Reddit"
                        />
                    )}
                    {author.social.x && (
                        <SocialLink
                            href={author.social.x}
                            label="X"
                        />
                    )}
                    {author.social.discord && (
                        <SocialLink
                            href={author.social.discord}
                            label="Discord"
                        />
                    )}
                </div>
            )}
        </div>
    )
}

function hasSocial(social: Author["social"]) {
    return Object.values(social).some(Boolean)
}

const socialIcons = {
    youtube: IconBrandYoutube,
    x: IconBrandX,
    bluesky: IconBrandBluesky,
    discord: IconBrandDiscord,
    reddit: IconBrandReddit,

}

function SocialLink({href, label}: { href: string, label: string }) {
    return (
        <a
            href={label === 'Discord' ? '#' : href}
            target="_blank"
            rel="noopener noreferrer"
            className="
                rounded-md border border-neutral-800
                bg-neutral-900 px-2 py-1
                text-xs font-medium text-neutral-200
                hover:bg-neutral-800 hover:text-neutral-100
                transition-colors
                flex items-center gap-2
              "
        >
            {socialIcons[label.toLowerCase() as keyof typeof socialIcons] && (
                <>
                    {React.createElement(socialIcons[label.toLowerCase() as keyof typeof socialIcons], {
                        className: "inline-block mr-1",
                        size: 16
                    })}
                </>
            )}
            {label === 'Discord' && <span>{href}</span>}
        </a>
    )
}

export default AuthorCard