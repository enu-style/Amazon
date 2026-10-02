import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  {
    name: "Electronics",
    slug: "electronics",
    description: "Latest gadgets and devices",
  },
  {
    name: "Home & Kitchen",
    slug: "home-kitchen",
    description: "Everyday essentials for your home",
  },
  {
    name: "Fashion",
    slug: "fashion",
    description: "Modern style for every season",
  },
  {
    name: "Health & Beauty",
    slug: "health-beauty",
    description: "Wellness and personal care",
  },
  {
    name: "Groceries",
    slug: "groceries",
    description: "Fresh daily essentials",
  },
];

const productSeed = [
  {
    name: "AeroSound Pro",
    slug: "aerosound-pro",
    description:
      "Premium wireless headphones with immersive audio and all-day comfort.",
    price: 129,
    discountPrice: 99,
    stock: 42,
    sku: "AER-1001",
    brand: "AeroTech",
    category: "electronics",
    rating: 4.8,
    reviewCount: 320,
    images: [
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    name: "Nova Smart Lamp",
    slug: "nova-smart-lamp",
    description:
      "Ambient lighting with app controls and voice assistant compatibility.",
    price: 54,
    discountPrice: 39,
    stock: 80,
    sku: "NOVA-2002",
    brand: "LumaGrid",
    category: "home-kitchen",
    rating: 4.6,
    reviewCount: 220,
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    name: "Summit Travel Backpack",
    slug: "summit-travel-backpack",
    description:
      "Water-resistant everyday backpack designed for work, travel, and commute.",
    price: 72,
    discountPrice: 58,
    stock: 60,
    sku: "SUM-3003",
    brand: "Summit Co.",
    category: "fashion",
    rating: 4.7,
    reviewCount: 160,
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    name: "PureClean Water Bottle",
    slug: "pureclean-water-bottle",
    description:
      "Double-wall insulated stainless bottle that keeps drinks cold for 24 hours.",
    price: 28,
    discountPrice: 22,
    stock: 100,
    sku: "PURE-4004",
    brand: "PureLife",
    category: "groceries",
    rating: 4.9,
    reviewCount: 400,
    images: [
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    name: "ZenCharge Pro",
    slug: "zencharge-pro",
    description:
      "Compact charging dock with multi-device smart power management.",
    price: 39,
    discountPrice: 29,
    stock: 75,
    sku: "ZEN-5005",
    brand: "ZenVolt",
    category: "electronics",
    rating: 4.5,
    reviewCount: 120,
    images: [
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    name: "Velvet Bloom Serum",
    slug: "velvet-bloom-serum",
    description:
      "Hydrating facial serum with botanical ingredients for a healthy glow.",
    price: 46,
    discountPrice: 34,
    stock: 54,
    sku: "VEL-6006",
    brand: "BloomEssence",
    category: "health-beauty",
    rating: 4.8,
    reviewCount: 275,
    images: [
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1200&q=80",
    ],
  },
];

async function main() {
  await prisma.review.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash("Admin@123", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@shopsphere.com",
      passwordHash: adminPassword,
      firstName: "Shop",
      lastName: "Sphere",
      role: "ADMIN",
    },
  });

  const customerPassword = await bcrypt.hash("Customer@123", 10);

  await prisma.user.create({
    data: {
      email: "customer@shopsphere.com",
      passwordHash: customerPassword,
      firstName: "Jane",
      lastName: "Doe",
      role: "CUSTOMER",
    },
  });

  const categoryRecords = await Promise.all(
    categories.map((category) => prisma.category.create({ data: category })),
  );

  const categoryMap = new Map(
    categoryRecords.map((item) => [item.slug, item.id]),
  );

  for (const product of productSeed) {
    const categoryId = categoryMap.get(product.category);

    if (!categoryId) continue;

    const created = await prisma.product.create({
      data: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        discountPrice: product.discountPrice,
        stock: product.stock,
        sku: product.sku,
        brand: product.brand,
        categoryId,
        rating: product.rating,
        reviewCount: product.reviewCount,
        images: {
          create: product.images.map((image, index) => ({
            url: image,
            altText: product.name,
            isPrimary: index === 0,
          })),
        },
      },
    });

    await prisma.review.create({
      data: {
        userId: admin.id,
        productId: created.id,
        rating: 5,
        title: "Great quality",
        comment:
          "Very satisfied with the product quality and speed of delivery.",
      },
    });
  }

  console.log("Seed data created successfully.");
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
