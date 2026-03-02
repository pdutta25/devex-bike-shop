import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartProvider } from "@/components/providers/cart-provider";
import { CustomerProvider } from "@/components/providers/customer-provider";
import AnnouncementBar from "@/components/ui/announcement-bar";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <CustomerProvider>
      <CartProvider>
        <AnnouncementBar />
        <Header />
        <main className="min-h-screen pt-16">{children}</main>
        <Footer />
      </CartProvider>
    </CustomerProvider>
  );
}
