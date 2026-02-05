import React from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { MessageCircle } from 'lucide-react';
import Link from 'next/link';

const faqData = [
    {
        question: "How much are your air balangs?",
        answer: "Our pricing varies based on the number of pax. Please refer to our Packages tab and Wedding & Corp tab to find the option that best suits your needs."
    },
    {
        question: "Do you provide just 1 balang?",
        answer: "Yes, we do. We offer a 17L balang that’s ideal for small groups of about 15 to 25 pax, and the balang is yours to keep. To place an order, simply head over to our Packages tab."
    },
    {
        question: "Does your package include a table?",
        answer: "Our packages do not include a table, but no worries - if you require one, you can simply add it on under Add-Ons (Equipment) when placing your order. Table rental is available at $20."
    },
    {
        question: "Does your package include a drink server (Bal-tender)?",
        answer: "For Option 1 and Option 2, a Bal-tender is not included, but all other packages come with one. If you’d like a Bal-tender for Option 1 or 2, you can easily add Bal-tender (4 hours) under Add-Ons (Services). For events longer than 4 hours, you can add extra Bal-tender (1 hour) increments as needed."
    },
    {
        question: "Are cups and straws provided?",
        answer: "Yes! Either 200ml or 360ml cups are included in all our packages. Straws will be provided when bobba is added under our Add-Ons."
    },
    {
        question: "What if my event is more than 4 hours?",
        answer: "Our drinks are best enjoyed within 4 hours, but they can still be okay for up to 6 hours. For events longer than 6 hours, we generally don’t recommend it, as the drinks may become diluted over time and we want you to enjoy them at their best."
    },
    {
        question: "How to check if you can take my order on a certain date?",
        answer: "You can check our live availability directly when placing an order on our website. If a date is blocked, it means we are fully booked. For urgent inquiries or specific date checks, feel free to WhatsApp us at 9881 4898."
    },
    {
        question: "How long in advance should I inform you to order?",
        answer: "We’d love to have at least 2 weeks’ notice so we can prepare everything perfectly for you. If your event is sooner, don’t worry - just drop us a message on WhatsApp at 9881 4898, and we’ll do our best to make it happen!"
    },
    {
        question: "How do I infaq?",
        answer: "You can head over to our Infaq Orders tab, where you’ll find all the information you need and can place your infaq order directly from there."
    },
    {
        question: "What are your payment terms?",
        answer: "We accept payments via PayNow to our UEN. If you require an invoice, our standard payment term is 14 days. Should you need a longer payment period, feel free to reach out to us directly on WhatsApp at 9881 4898, and we’ll be happy to discuss your needs."
    },
    {
        question: "Is Balang Kepalang open to sponsorships?",
        answer: "We are happy to consider sponsorships, though we do not offer full sponsorships. Typically, a $45 delivery and collection fee will need to be covered, as this goes directly to our delivery partners. For more details or to discuss further, feel free to reach out to us on WhatsApp at 9881 4898 - we’d be happy to chat!"
    },
    {
        question: "Do you provide hot drinks?",
        answer: "Not just yet, but we’re brewing up some hot drink options for you! Keep a lookout - they’ll be ready real soon."
    }
];

export default function FAQPage() {
    return (
        <div className="min-h-screen pt-32 pb-20 relative overflow-hidden">
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#0df2df]/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#0bc9b9]/5 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 relative z-10 max-w-4xl">
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0df2df]/10 border border-[#0df2df]/20 text-[#041F1C] font-black uppercase text-xs tracking-widest mb-4">
                        <MessageCircle size={14} />
                        <span>Support Center</span>
                    </div>
                    <h1 className="font-black text-5xl md:text-7xl lg:text-8xl uppercase text-[#041F1C] tracking-tighter leading-tight">
                        Common <br />
                        <span className="breezy-text-gradient italic pr-6 pb-2">Queries</span>
                    </h1>
                    <p className="text-xl text-[#041F1C]/60 font-medium max-w-2xl mx-auto">
                        Everything you need to know about our balangs, packages, and services. Can't find what you're looking for? Reach out!
                    </p>
                </div>

                <div className="breezy-glass-static p-8 md:p-12 rounded-[2.5rem] shadow-2xl space-y-2">
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {faqData.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`} className="border-b border-[#041F1C]/5 last:border-0 px-4">
                                <AccordionTrigger className="text-left font-black text-lg md:text-xl text-[#041F1C] hover:text-[#09a093] hover:no-underline py-6 transition-colors uppercase tracking-tight">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-[#041F1C]/70 font-medium text-lg leading-relaxed pb-6">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>

                <div className="mt-16 text-center">
                    <div className="inline-block p-8 rounded-[2rem] bg-white/40 border border-white/60 backdrop-blur-md shadow-lg">
                        <h3 className="font-black text-2xl text-[#041F1C] uppercase tracking-tighter mb-2">Still have questions?</h3>
                        <p className="text-[#041F1C]/60 font-bold mb-6">We're just a message away.</p>
                        <Link href="https://wa.me/6598814898" target="_blank" className="inline-flex items-center gap-2 bg-[#25D366] text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#128C7E] transition-all shadow-xl hover:-translate-y-1">
                            WhatsApp Us
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
