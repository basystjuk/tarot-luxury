export interface Testimonial {
  id: string;
  text_uk: string;
  text_ru: string;
  /** Optional — older entries have no English text; the UK text is shown instead. */
  text_en?: string;
  name: string;
  city: string;
  rating: number;
  visible: boolean;
}

// Відгуки будуть додані пізніше
export const testimonials: Testimonial[] = [];
