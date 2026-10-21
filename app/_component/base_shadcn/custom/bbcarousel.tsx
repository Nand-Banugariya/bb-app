import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi
} from '../carousel';

/** Carousel (Embla). Prev/next use the secondary icon button; compose with the re-exported parts. */
const BbCarousel = (props: React.ComponentProps<typeof Carousel>) => <Carousel {...props} />;

export default BbCarousel;
export {
    BbCarousel,
    CarouselContent as BbCarouselContent,
    CarouselItem as BbCarouselItem,
    CarouselNext as BbCarouselNext,
    CarouselPrevious as BbCarouselPrevious
};
export type { CarouselApi as BbCarouselApi };
