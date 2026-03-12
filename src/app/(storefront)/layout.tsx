import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartProvider } from "@/components/providers/cart-provider";
import { CustomerProvider } from "@/components/providers/customer-provider";
import { CountdownBanner } from "@/components/ui/countdown-banner";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <CustomerProvider>
      <CartProvider>
        <CountdownBanner />
        <Header />
        <main className="min-h-screen pt-16">{children}</main>
        <Footer />
      </CartProvider>
    </CustomerProvider>
  );
}
