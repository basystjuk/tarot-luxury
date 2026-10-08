import type { ReactNode } from "react";
import { Notice } from "./ui";

/** Banner for sections whose content the public site doesn't show right now. */
export default function InactiveNotice({ children }: { children: ReactNode }) {
  return (
    <Notice tone="warning" className="mb-6" title="Зараз не відображається на сайті">
      {children} Дані тут зберігаються, але відвідувачі їх не бачать, доки розділ не підключено або не прибрано з адмінки
      (рішення власника).
    </Notice>
  );
}
