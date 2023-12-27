import React, { useState } from 'react'
import * as Collapsible from '@radix-ui/react-collapsible';
import SanityGoneLogo from '../SanityGoneLogo';
import useMediaQuery from '../../utils/media-query';
import { clsx as cx } from 'clsx';


const Sidebar: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [open, setOpen] = useState(true);
    const isMobile = useMediaQuery('(max-width: 640px)')


    return (
        <Collapsible.Root open={isMobile ? open : true} onOpenChange={setOpen} className={cx('w-full sm:w-[228px] flex flex-none flex-col bg-neutral-700 shadow-3xl sm:relative', { 'absolute h-dvh': open })}>
            <div
                className="w-full sm:w-[228px] px-3 sm:px-0 h-16 flex items-center justify-between sm:justify-center bg-neutral-600 border-b border-r border-neutral-500 border-solid"
            >
                <SanityGoneLogo hasIcon={true} />
                <Collapsible.Trigger asChild>
                    <button>
                        <svg className="sm:hidden" width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16.5446 2.73404C16.7723 2.73404 17 2.53457 17 2.25532V0.978723C17 0.739362 16.7723 0.5 16.5446 0.5H0.455357C0.189732 0.5 0 0.739362 0 0.978723V2.25532C0 2.53457 0.189732 2.73404 0.455357 2.73404H16.5446ZM16.5446 9.11702C16.7723 9.11702 17 8.91755 17 8.6383V7.3617C17 7.12234 16.7723 6.88298 16.5446 6.88298H0.455357C0.189732 6.88298 0 7.12234 0 7.3617V8.6383C0 8.91755 0.189732 9.11702 0.455357 9.11702H16.5446ZM16.5446 15.5C16.7723 15.5 17 15.3005 17 15.0213V13.7447C17 13.5053 16.7723 13.266 16.5446 13.266H0.455357C0.189732 13.266 0 13.5053 0 13.7447V15.0213C0 15.3005 0.189732 15.5 0.455357 15.5H16.5446Z" fill="#E3E1EF" />
                        </svg>
                    </button>
                </Collapsible.Trigger>
            </div>
            <Collapsible.Content className="flex-grow">
                {children}
            </Collapsible.Content>
        </Collapsible.Root>
    )
}

export default Sidebar