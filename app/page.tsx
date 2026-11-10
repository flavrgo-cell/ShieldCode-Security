"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Shield,
  Camera,
  Mail,
  CheckCircle,
  Lock,
  Star,
  Zap,
} from "lucide-react";
import { CheckoutModal } from "@/components/checkout-modal";

const products = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    description: "High-quality sound with active noise cancellation",
    price: 299.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
    rating: 4.8,
    reviews: 124,
    badge: "Best Seller",
  },
  {
    id: 2,
    name: "Smart Watch Pro",
    description: "Track your fitness and stay connected",
    price: 449.99,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
    rating: 4.9,
    reviews: 89,
    badge: "New",
  },
  {
    id: 3,
    name: "Portable Power Bank",
    description: "20000mAh fast charging for all devices",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=300&fit=crop",
    rating: 4.7,
    reviews: 256,
  },
  {
    id: 4,
    name: "Wireless Earbuds",
    description: "Crystal clear audio with 24h battery life",
    price: 149.99,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=300&fit=crop",
    rating: 4.6,
    reviews: 198,
  },
];

const securityFeatures = [
  {
    icon: Camera,
    title: "Selfie Verification",
    description: "Every payment requires a real-time photo to verify identity",
  },
  {
    icon: Mail,
    title: "Email Confirmation",
    description: "Account owner receives instant notification with your anti-phishing code",
  },
  {
    icon: Shield,
    title: "Anti-Phishing Code",
    description: "Your personal secret code confirms the email is legitimate",
  },
  {
    icon: CheckCircle,
    title: "Owner Approval",
    description: "Transactions only complete after account owner approval",
  },
];

export default function StorePage() {
  const [checkoutProduct, setCheckoutProduct] = useState<typeof products[0] | null>(null);
  const [cart, setCart] = useState<typeof products>([]);

  const addToCart = (product: typeof products[0]) => {
    setCart([...cart, product]);
  };

  const buyNow = (product: typeof products[0]) => {
    setCheckoutProduct(product);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">TechStore</h1>
              <p className="text-xs text-muted-foreground">Protected by SecurePay</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="gap-1">
              <Shield className="w-3 h-3" />
              Secure Checkout
            </Badge>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <ShoppingCart className="w-4 h-4" />
              {cart.length > 0 && (
                <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-background py-16">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4" variant="secondary">
            <Lock className="w-3 h-3 mr-1" />
            Anti-Phishing Protection Active
          </Badge>
          <h2 className="text-4xl font-bold mb-4 text-balance">
            Shop with Confidence
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Every payment is protected by our advanced verification system. 
            Only the registered account owner can approve transactions.
          </p>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-12 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {securityFeatures.map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center p-4"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden group">
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.badge && (
                    <Badge className="absolute top-3 left-3">
                      {product.badge}
                    </Badge>
                  )}
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {product.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium">{product.rating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({product.reviews} reviews)
                    </span>
                  </div>
                  <p className="text-2xl font-bold">${product.price.toFixed(2)}</p>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => addToCart(product)}
                  >
                    Add to Cart
                  </Button>
                  <Button
                    className="flex-1 gap-1"
                    onClick={() => buyNow(product)}
                  >
                    <Lock className="w-3 h-3" />
                    Buy Now
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">
            How SecurePay Protects You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { step: 1, title: "Select Payment", desc: "Choose your payment provider and enter account ID" },
              { step: 2, title: "Take Selfie", desc: "Capture a real-time photo for verification" },
              { step: 3, title: "Owner Notified", desc: "Account owner receives email with your photo and anti-phishing code" },
              { step: 4, title: "Approval", desc: "Transaction completes only after owner approval" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center mx-auto mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Test Accounts Info */}
      <section className="py-8 border-t">
        <div className="container mx-auto px-4">
          <div className="bg-muted/50 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="font-semibold mb-3 text-center">Test Accounts</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 bg-card rounded-lg">
                <p className="font-mono font-bold">BARI-12345</p>
                <p className="text-muted-foreground text-xs">BaridiMob</p>
              </div>
              <div className="text-center p-3 bg-card rounded-lg">
                <p className="font-mono font-bold">RDPAY-67890</p>
                <p className="text-muted-foreground text-xs">RedotPay</p>
              </div>
              <div className="text-center p-3 bg-card rounded-lg">
                <p className="font-mono font-bold">ECCP-11111</p>
                <p className="text-muted-foreground text-xs">ECCP</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-primary" />
            <span>Protected by SecurePay Gateway</span>
          </div>
          <p>All transactions require account owner verification</p>
        </div>
      </footer>

      {/* Checkout Modal */}
      {checkoutProduct && (
        <CheckoutModal
          product={checkoutProduct}
          onClose={() => setCheckoutProduct(null)}
        />
      )}
    </div>
  );
}
