import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  products,
  categories,
  getProductBySlug,
  getProductsByCategory,
  getCategoryBySlug,
} from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import JsonLd from "@/components/JsonLd";

type Props = {
  params: Promise<{ producto: string }>;
};

export const dynamicParams = false;

export async function generateStaticParams() {
  const productParams = products.map((p) => ({ producto: p.slug }));
  const categoryParams = categories.map((c) => ({ producto: c.slug }));
  return [...productParams, ...categoryParams];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { producto } = await params;
  const category = getCategoryBySlug(producto);
  if (category) {
    return {
      title: category.name,
      description: `${category.description} Fabricante uruguayo, Barros Blancos, Canelones.`,
      alternates: { canonical: `https://textilcabrera.com.uy/productos/${category.slug}` },
    };
  }
  const product = getProductBySlug(producto);
  if (!product) return {};
  const url = `https://textilcabrera.com.uy/productos/${product.slug}`;
  return {
    title: product.name,
    description: `${product.shortDescription} Fabricante uruguayo, Barros Blancos, Canelones.`,
    alternates: { canonical: url },
    openGraph: {
      url,
      images: [{ url: `https://textilcabrera.com.uy${product.image}`, width: 1200, height: 630, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      images: [`https://textilcabrera.com.uy${product.image}`],
    },
  };
}

const WA_BASE =
  "https://wa.me/59898695831?text=Hola%2C%20me%20interesa%20solicitar%20una%20cotizaci%C3%B3n%20de%20";

export default async function ProductPage({ params }: Props) {
  const { producto } = await params;
  // ── Vista de categoría ──────────────────────────────────────────────
  const category = getCategoryBySlug(producto);
  if (category) {
    const categoryProducts = getProductsByCategory(category.slug);
    return (
      <>
        <JsonLd
          type="breadcrumb"
          items={[
            { name: "Inicio", url: "https://textilcabrera.com.uy" },
            { name: "Productos", url: "https://textilcabrera.com.uy/productos" },
            { name: category.name, url: `https://textilcabrera.com.uy/productos/${category.slug}` },
          ]}
        />
        <section className="bg-navy-900 text-white">
          <div className="container-xl py-20 md:py-24">
            <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
              <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
              <span>/</span>
              <Link href="/productos" className="hover:text-white transition-colors">Productos</Link>
              <span>/</span>
              <span className="text-gray-200">{category.name}</span>
            </nav>
            <span className="section-label text-brand-300">Categoría</span>
            <h1 className="heading-xl text-white mb-5">{category.name}</h1>
            <p className="text-lg text-gray-300 max-w-2xl leading-relaxed">{category.description}</p>
          </div>
          <div className="h-1.5 bg-brand-600" />
        </section>
        <section className="section-padding bg-white">
          <div className="container-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {categoryProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            <div className="mt-10">
              <Link href="/productos" className="btn-navy">
                ← Ver catálogo completo
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  // ── Vista de producto ────────────────────────────────────────────────
  const product = getProductBySlug(producto);
  if (!product) return notFound();

  const relatedProducts = getProductsByCategory(product.categorySlug).filter(
    (p) => p.slug !== product.slug
  );

  const waLink = `${WA_BASE}${encodeURIComponent(product.name)}.`;

  // ── Vista de producto ────────────────────────────────────────────────
  const productUrl = `https://textilcabrera.com.uy/productos/${product.slug}`;

  return (
    <>
      <JsonLd
        type="product"
        name={product.name}
        description={`${product.shortDescription} Fabricante uruguayo, Barros Blancos, Canelones.`}
        image={product.image}
        url={productUrl}
      />
      <JsonLd
        type="breadcrumb"
        items={[
          { name: "Inicio", url: "https://textilcabrera.com.uy" },
          { name: "Productos", url: "https://textilcabrera.com.uy/productos" },
          { name: product.name, url: productUrl },
        ]}
      />
      {/* ── HEADER ── */}
      <section className="bg-navy-900 text-white">
        <div className="container-xl py-20 md:py-24">
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
            <Link href="/" className="hover:text-white transition-colors">
              Inicio
            </Link>
            <span>/</span>
            <Link
              href="/productos"
              className="hover:text-white transition-colors"
            >
              Productos
            </Link>
            <span>/</span>
            <span className="text-gray-200">{product.name}</span>
          </nav>
          <span className="section-label text-brand-300">{product.category}</span>
          <h1 className="heading-xl text-white mb-5">{product.name}</h1>
          <p className="text-lg text-gray-300 max-w-2xl leading-relaxed">
            {product.shortDescription}
          </p>
        </div>
        <div className="h-1.5 bg-brand-600" />
      </section>

      {/* ── DETALLE DEL PRODUCTO ── */}
      <section className="section-padding bg-white">
        <div className="container-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* Imagen principal */}
            <div className="relative aspect-[4/3] border border-gray-200 overflow-hidden bg-gray-100">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
              <div className="absolute top-0 left-0 bg-brand-600 text-white text-xs font-bold px-3 py-1.5">
                {product.category}
              </div>
            </div>

            {/* Info */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {product.name}
              </h2>
              <div className="w-10 h-0.5 bg-brand-600 mb-5" />

              <p className="text-gray-600 leading-relaxed mb-8">
                {product.description}
              </p>

              <div className="mb-8 border border-gray-200 p-5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-4">
                  FORMATO DISPONIBLE
                </h3>
                {product.formatGroups ? (
                  <ul className="space-y-2.5">
                    {product.formatGroups.map((group) => (
                      <li key={group.label}>
                        <div className="flex items-start gap-2.5 text-sm text-gray-700 font-medium">
                          <span className="mt-2 w-1.5 h-1.5 bg-brand-600 flex-shrink-0" />
                          {group.label}
                        </div>
                        <ul className="mt-1.5 ml-6 space-y-1">
                          {group.items.map((item) => (
                            <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                              <span className="mt-2 w-1 h-1 bg-gray-400 rounded-full flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="space-y-2.5">
                    {product.formats.map((format) => (
                      <li
                        key={format}
                        className="flex items-start gap-2.5 text-sm text-gray-700"
                      >
                        <span className="mt-2 w-1.5 h-1.5 bg-brand-600 flex-shrink-0" />
                        {format}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white font-semibold px-5 py-3 rounded transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Consultar por WhatsApp
                </a>
                <Link href="/contacto" className="btn-outline">
                  Solicitar cotización
                </Link>
              </div>
            </div>
          </div>

          {/* Galería */}
          {product.gallery.length > 0 && (
            <div className="mt-14 border-t border-gray-200 pt-10">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-5">
                Más imágenes
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {product.gallery.map((img, i) => {
                  const label = product.galleryLabels?.[i];
                  return (
                    <div key={i} className="flex flex-col gap-1.5">
                      <div className="relative aspect-square border border-gray-200 overflow-hidden bg-white">
                        <Image
                          src={img}
                          alt={`${product.name} — imagen ${i + 1}`}
                          fill
                          sizes="(max-width: 640px) 50vw, 25vw"
                          className="object-cover hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      {label && (
                        <p className="text-[10px] sm:text-xs text-center text-gray-600 leading-tight px-1 line-clamp-2">
                          {label}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── PRODUCTOS RELACIONADOS ── */}
      {relatedProducts.length > 0 && (
        <section className="section-padding bg-gray-50 border-t border-gray-200">
          <div className="container-xl">
            <h2 className="heading-md text-gray-900 mb-2">
              Otros productos en {product.category}
            </h2>
            <div className="mt-3 w-10 h-0.5 bg-brand-600 mb-8" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            <div className="mt-8">
              <Link href="/productos" className="btn-navy">
                Ver catálogo completo
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="bg-navy-800 text-white">
        <div className="container-xl py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold mb-1">
                ¿Necesita {product.name.toLowerCase()} para su empresa?
              </h2>
              <p className="text-gray-300 text-sm">
                Contáctenos por WhatsApp o email y le respondemos a la brevedad.
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white font-semibold px-5 py-3 rounded transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </a>
              <Link href="/contacto" className="btn-outline-white">
                Contactar
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
