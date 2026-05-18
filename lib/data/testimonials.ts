export interface Testimonial {
  id: string;
  text_uk: string;
  text_ru: string;
  name: string;
  city: string;
  rating: number;
  visible: boolean;
}

// Відгуки будуть додані пізніше
export const testimonials: Testimonial[] = [];
