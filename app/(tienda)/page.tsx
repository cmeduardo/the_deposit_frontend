import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Truck, Shield, Clock, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FeaturedProducts } from '@/components/store/featured-products'
import { CategoryGrid } from '@/components/store/category-grid'

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary py-20 text-primary-foreground md:py-32">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full border-[40px] border-primary-foreground" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full border-[60px] border-primary-foreground" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2 text-sm">
                <Store className="h-4 w-4" />
                <span>La Antigua Guatemala</span>
              </div>
              <h1 className="text-pretty font-mono text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                THE DEPOSIT
              </h1>
              <p className="max-w-md text-lg text-primary-foreground/80 md:text-xl">
                Tu tienda de confianza con variedad de productos. Compra fácil, rápido y seguro desde la comodidad de tu hogar.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" variant="secondary">
                  <Link href="/productos">
                    Ver Productos
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground bg-transparent">
                  <Link href="/iniciar-sesion">
                    Crear Cuenta
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative hidden justify-center lg:flex">
              <div className="relative h-80 w-80">
                <div className="absolute inset-0 rounded-full bg-primary-foreground/5" />
                <Image
                  src="/logo.png"
                  alt="The Deposit"
                  fill
                  className="rounded-full object-contain p-8"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-border bg-background py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Envío a Domicilio</h3>
                <p className="text-sm text-muted-foreground">
                  Entregamos en La Antigua y alrededores
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Compra Segura</h3>
                <p className="text-sm text-muted-foreground">
                  Productos de calidad garantizada
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Pedido Rápido</h3>
                <p className="text-sm text-muted-foreground">
                  Proceso de compra sencillo y ágil
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Store className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Recoge en Tienda</h3>
                <p className="text-sm text-muted-foreground">
                  También puedes recoger tu pedido
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-background py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="font-mono text-2xl font-bold tracking-tight md:text-3xl">
                Categorías
              </h2>
              <p className="mt-1 text-muted-foreground">
                Explora nuestra variedad de productos
              </p>
            </div>
            <Button asChild variant="ghost">
              <Link href="/productos">
                Ver todo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <CategoryGrid />
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-secondary/30 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="font-mono text-2xl font-bold tracking-tight md:text-3xl">
                Productos Destacados
              </h2>
              <p className="mt-1 text-muted-foreground">
                Los favoritos de nuestros clientes
              </p>
            </div>
            <Button asChild variant="ghost">
              <Link href="/productos">
                Ver todo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <FeaturedProducts />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="font-mono text-2xl font-bold tracking-tight md:text-3xl">
            ¿Listo para comprar?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-primary-foreground/80">
            Crea tu cuenta y empieza a disfrutar de nuestros productos con entrega a domicilio.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" variant="secondary">
              <Link href="/productos">
                Explorar Productos
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground bg-transparent">
              <a href="https://wa.me/50254204805" target="_blank" rel="noopener noreferrer">
                Contactar por WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
