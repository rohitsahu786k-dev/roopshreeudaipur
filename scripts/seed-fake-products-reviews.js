const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  const Product = mongoose.models.Product || mongoose.model("Product", new mongoose.Schema({}, { strict: false, timestamps: true }));
  const Category = mongoose.models.Category || mongoose.model("Category", new mongoose.Schema({
    name: String,
    slug: { type: String, unique: true },
    isActive: Boolean,
    sortOrder: Number
  }, { timestamps: true }));
  const Review = mongoose.models.Review || mongoose.model("Review", new mongoose.Schema({}, { strict: false, timestamps: true }));
  const User = mongoose.models.User || mongoose.model("User", new mongoose.Schema({}, { strict: false, timestamps: true }));
  const Media = mongoose.models.Media || mongoose.model("Media", new mongoose.Schema({}, { strict: false, timestamps: true }));
  const StoreSetting = mongoose.models.StoreSetting || mongoose.model("StoreSetting", new mongoose.Schema({}, { strict: false, timestamps: true }));

  const category = await Category.findOneAndUpdate(
    { slug: "seeded-ethnic-wear" },
    { name: "Seeded Ethnic Wear", slug: "seeded-ethnic-wear", isActive: true, sortOrder: 999 },
    { upsert: true, new: true }
  );
  const user = await User.findOneAndUpdate(
    { email: "reviewer@example.com" },
    { name: "Verified Reviewer", email: "reviewer@example.com", password: "seeded", role: "user" },
    { upsert: true, new: true }
  );

  const images = [
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1610189017773-29214c0f9e40?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1200&q=82"
  ];
  const videos = [
    "https://www.youtube.com/watch?v=ysz5S6PUM-U",
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://www.youtube.com/watch?v=jNQXAC9IVRw"
  ];
  const sizes = ["S", "M", "L", "XL"];
  const colors = ["Rose", "Wine", "Emerald", "Ivory"];
  const productTypes = ["Lehenga", "Saree", "Kurta Set", "Sharara", "Anarkali"];
  const fabrics = ["Silk blend", "Georgette", "Cotton silk", "Chinnon", "Organza"];
  const occasions = ["Wedding", "Festival", "Party", "Reception", "Mehendi"];

  const uploadedMedia = [];
  for (let index = 0; index < videos.length; index += 1) {
    const media = await Media.findOneAndUpdate(
      { filename: `seed-video-${index + 1}.mp4` },
      {
        filename: `seed-video-${index + 1}.mp4`,
        originalName: `Seed Video ${index + 1}`,
        url: videos[index],
        thumbnailUrl: images[index % images.length],
        type: "reel",
        mimeType: "video/youtube",
        alt: `Seed product reel ${index + 1}`,
        tags: ["seed", "product-video", "reel"],
        folder: "seed-videos",
        uploadedBy: user._id
      },
      { upsert: true, new: true }
    );
    uploadedMedia.push(media);
  }

  for (let i = 1; i <= 20; i += 1) {
    const slug = `seeded-designer-style-${i}`;
    const productType = productTypes[(i - 1) % productTypes.length];
    const fabric = fabrics[(i - 1) % fabrics.length];
    const occasion = occasions[(i - 1) % occasions.length];
    const videoUrl = videos[(i - 1) % videos.length];
    const productImages = [
      images[(i - 1) % images.length],
      images[i % images.length],
      images[(i + 1) % images.length]
    ];
    const variants = sizes.flatMap((size) => colors.slice(0, 2).map((color) => ({
      title: `${size} / ${color}`,
      option1: size,
      option2: color,
      price: 2500 + i * 120 + (size === "XL" ? 150 : 0),
      comparePrice: 3300 + i * 150 + (size === "XL" ? 150 : 0),
      sku: `RS-SEED-${i}-${size}-${color}`.toUpperCase(),
      stock: Math.floor(Math.random() * 30),
      image: productImages[colors.indexOf(color) % productImages.length],
      isActive: true
    })));
    const product = await Product.findOneAndUpdate(
      { slug },
      {
        name: `Seeded ${productType} Style ${i}`,
        slug,
        status: "active",
        isActive: true,
        description: `<p>Seed product for QA covering filters, variants, SKU, inventory, PDP, cart and reviews.</p><p>${productType} in ${fabric} for ${occasion} styling and backend testing.</p>`,
        shortDescription: `Seeded ${productType.toLowerCase()} with variants, SEO, video and review data.`,
        category: category._id,
        basePrice: 2500 + i * 120,
        comparePrice: 3300 + i * 150,
        stock: 25,
        sku: `RS-SEED-${i}`,
        lowStockThreshold: 5,
        media: [
          ...productImages.map((url, index) => ({ url, type: "image", position: index, alt: `Seeded ${productType} Style ${i} image ${index + 1}` })),
          { url: videoUrl, type: "video", position: 10, thumbnailUrl: productImages[0], alt: `Seeded ${productType} Style ${i} video` },
          { url: videoUrl, type: "reel", position: 11, thumbnailUrl: productImages[1], alt: `Seeded ${productType} Style ${i} reel` }
        ],
        images: productImages,
        hasVariants: true,
        options: [{ name: "Size", values: sizes }, { name: "Color", values: colors.slice(0, 2) }],
        variants,
        attributes: [
          { name: "Fabric", value: fabric },
          { name: "Occasion", value: occasion },
          { name: "Pattern", value: i % 3 ? "Embroidered" : "Printed" }
        ],
        occasion: [occasion, i % 2 ? "Party" : "Casual"],
        fabric,
        workType: i % 3 ? "Embroidery" : "Print",
        washCare: "Dry clean preferred",
        features: ["Seeded for QA", "Variant-ready", "SEO-enabled", "Review-ready"],
        specifications: {
          Fabric: fabric,
          Occasion: occasion,
          Pattern: i % 3 ? "Embroidered" : "Printed",
          Brand: "Roop Shree QA"
        },
        seo: {
          title: `Seeded ${productType} Style ${i} | Roop Shree QA`,
          description: `Test ${productType.toLowerCase()} product with ${fabric}, variants, SKU, stock, video and reviews for QA.`,
          keywords: [`seeded ${productType.toLowerCase()}`, fabric, occasion, "Roop Shree QA", "variant test"],
          ogImage: productImages[0],
          canonicalUrl: `/product/${slug}`,
          schemaType: "Product",
          focusKeyword: `seeded ${productType.toLowerCase()}`
        },
        seoTitle: `Seeded ${productType} Style ${i} | Roop Shree QA`,
        seoDescription: `QA product with dynamic filters, variants, SKU, inventory, media, reviews and PDP testing data.`,
        productVideoUrl: videoUrl,
        publishedAt: new Date()
      },
      { upsert: true, new: true }
    );

    for (let r = 1; r <= 3; r += 1) {
      await Review.findOneAndUpdate(
        { productId: String(product._id), user: user._id, title: `Seed review ${r} for ${slug}` },
        {
          product: product._id,
          productId: String(product._id),
          user: user._id,
          rating: 3 + ((i + r) % 3),
          title: `Seed review ${r} for ${slug}`,
          comment: "Good fabric, accurate fit, and useful seeded review media for testing filters.",
          images: [productImages[r % productImages.length]],
          videos: r === 1 ? [videoUrl] : [],
          verifiedPurchase: true,
          status: "approved",
          isApproved: true,
          helpfulCount: r * 2
        },
        { upsert: true }
      );
    }
  }

  await StoreSetting.findOneAndUpdate(
    { key: "default" },
    {
      key: "default",
      instagramUrl: "https://www.instagram.com/roopshreeudaipur/",
      reels: uploadedMedia.map((media, index) => ({
        title: `Seed QA Reel ${index + 1}`,
        url: media.url,
        isActive: true,
        sortOrder: index
      })),
      instagramPosts: images.slice(0, 6).map((image, index) => ({
        url: "https://www.instagram.com/roopshreeudaipur/",
        image,
        caption: `Seed Instagram post ${index + 1}`,
        sortOrder: index
      })),
      featureToggles: {
        homepageReels: true,
        instagramGrid: true,
        pdpFloatingReel: true,
        mobileBottomNav: true,
        backendFilters: true
      }
    },
    { upsert: true, new: true }
  );

  console.log("Seeded 20 products with variants, SKU, stock, SEO, videos, media records and reviews.");
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
