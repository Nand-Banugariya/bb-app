import * as React from 'react';
import Image from 'next/image';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious
} from '@components/base_shadcn/carousel';
import DataboxIcon from '@components/newIcons/DataboxIcon';
import DataboxLightIcon from '@components/newIcons/DataboxLightIcon';
import DubizzleIcon from '@components/newIcons/DubizzleIcon';
import DubizzleLightIcon from '@components/newIcons/DubizzleLightIcon';
import IntuzIcon from '@components/newIcons/IntuzIcon';
import IntuzLightIcon from '@components/newIcons/IntuzLightIcon';
import NateraIcon from '@components/newIcons/NateraIcon';
import NateraLightIcon from '@components/newIcons/NateraLightIcon';
import NevvonIcon from '@components/newIcons/NevvonIcon';
import NevvonLightIcon from '@components/newIcons/NevvonLightIcon';
import SaleshandyIcon from '@components/newIcons/SaleshandyIcon';
import SaleshandyLightIcon from '@components/newIcons/SaleshandyLightIcon';
import { cn } from '@lib/utils';

interface Testimonial {
    quote: string;
    author: string;
    position: string;
    company: string;
    photo: string;
}

const TESTIMONIALS: Testimonial[] = [
    {
        quote: "With BetterBugs, we've simplified our error detection process, eliminating the need for convoluted methods that often led to confusion. It has empowered our team to identify and resolve issues more efficiently, enhancing our overall workflow.",
        author: 'Uri Sevilla',
        position: 'CTO',
        company: 'Nevvon',
        photo: '/images/client1.png'
    },
    {
        quote: 'BetterBugs has truly helped us unlock new levels of productivity across our team. By streamlining our workflows and reducing repetitive manual tasks, we’ve been saving an incredible amount of time, energy, and effort every single week.',
        author: 'Dhruv Patel',
        position: 'Founder',
        company: 'Saleshandy',
        photo: '/images/client2.png'
    }
];

type LogoComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

// Both variants render and the `dark` class on <html> picks one, so the right logo paints first
// (no flash, no theme listeners).
const LOGOS: { name: string; Light: LogoComponent; Dark: LogoComponent; className?: string }[] = [
    { name: 'Databox', Light: DataboxLightIcon, Dark: DataboxIcon },
    { name: 'Natera', Light: NateraLightIcon, Dark: NateraIcon },
    { name: 'Saleshandy', Light: SaleshandyLightIcon, Dark: SaleshandyIcon },
    { name: 'Nevvon', Light: NevvonLightIcon, Dark: NevvonIcon },
    { name: 'Intuz', Light: IntuzLightIcon, Dark: IntuzIcon, className: 'mt-2' },
    { name: 'Dubizzle', Light: DubizzleLightIcon, Dark: DubizzleIcon }
];

/** Right pane of the sign-in screen: customer quotes, the usage line and customer logos. */
const TestimonialCarousel = () => (
    <div className="flex w-full flex-col items-center justify-center gap-12">
        <Carousel className="w-full max-w-md" opts={{ loop: true }}>
            <CarouselContent>
                {TESTIMONIALS.map((testimonial) => (
                    <CarouselItem key={testimonial.author}>
                        <figure className="flex flex-col items-center gap-6 text-center">
                            <Image
                                width={96}
                                height={96}
                                src={testimonial.photo}
                                alt=""
                                className="size-24 rounded-full bg-d100 object-cover"
                            />
                            <blockquote className="px-8 text-md leading-relaxed text-muted-foreground">
                                “{testimonial.quote}”
                            </blockquote>
                            <figcaption className="flex flex-col gap-0.5">
                                <span className="text-md font-semibold text-foreground">
                                    {testimonial.author}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    {testimonial.position}, {testimonial.company}
                                </span>
                            </figcaption>
                        </figure>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious variant="ghost" className="-left-6" />
            <CarouselNext variant="ghost" className="-right-6" />
        </Carousel>

        <p className="text-center text-xl font-medium tracking-tight text-foreground">
            <span className="font-semibold text-success">10,000+</span> developers and testers have
            used
            <br />
            BetterBugs to log detailed bug reports
        </p>

        <ul
            aria-label="Teams using BetterBugs"
            className="grid grid-cols-3 items-center gap-x-6 gap-y-6">
            {LOGOS.map(({ name, Light, Dark, className }) => (
                <li key={name} className="flex items-center justify-center">
                    <span className="sr-only">{name}</span>
                    <Light
                        aria-hidden
                        className={cn('h-5 w-auto text-foreground dark:hidden', className)}
                    />
                    <Dark
                        aria-hidden
                        className={cn('hidden h-5 w-auto text-foreground dark:block', className)}
                    />
                </li>
            ))}
        </ul>
    </div>
);

export default TestimonialCarousel;
