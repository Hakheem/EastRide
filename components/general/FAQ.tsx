import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { faqs } from '@/data/data'

export default function FAQ() {
  return (
    <div className="py-16 md:py-20 padded">
      <h2 className="text-3xl  font-bold mb-12 text-center ">
        Frequently Asked Questions
      </h2>

      <Accordion type="single" collapsible className="w-full max-w-4xl mx-auto">
        {faqs.map((faq, index) => (
          <AccordionItem 
            key={index} 
            value={`item-${index}`}
            className="border-b border-gray-200 dark:border-gray-700"
          >
            <AccordionTrigger className="cursor-pointer text-lg  font-semibold text-left text-gray-800 dark:text-gray-100 py-4 hover:text-primary dark:hover:text-primary-foreground transition-colors">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-base md:text-lg text-gray-600 dark:text-gray-300 pt-2 pb-4">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
