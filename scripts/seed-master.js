const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index);
    const value = trimmed.slice(index + 1);
    process.env[key] = value;
  }
}

console.log("Starting seeder...");
async function main() {
  try {
    console.log("In main...");
    loadEnv();
    const uri = process.env.MONGODB_URI;
    console.log("URI found:", uri ? "Yes" : "No");
    if (!uri) throw new Error("MONGODB_URI is required");

    await mongoose.connect(uri);
    console.log("Connected to MongoDB");

  // Define minimal schemas for seeding
  const User = mongoose.models.User || mongoose.model("User", new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: String
  }, { strict: false, timestamps: true }));

  const Category = mongoose.models.Category || mongoose.model("Category", new mongoose.Schema({
    name: String,
    slug: { type: String, unique: true },
    isActive: Boolean,
    sortOrder: Number
  }, { timestamps: true }));

  const Product = mongoose.models.Product || mongoose.model("Product", new mongoose.Schema({}, { strict: false, timestamps: true }));
  const Review = mongoose.models.Review || mongoose.model("Review", new mongoose.Schema({}, { strict: false, timestamps: true }));
  const Order = mongoose.models.Order || mongoose.model("Order", new mongoose.Schema({}, { strict: false, timestamps: true }));
  const Coupon = mongoose.models.Coupon || mongoose.model("Coupon", new mongoose.Schema({}, { strict: false, timestamps: true }));
  const Blog = mongoose.models.Blog || mongoose.model("Blog", new mongoose.Schema({}, { strict: false, timestamps: true }));
  const StorefrontPage = mongoose.models.StorefrontPage || mongoose.model("StorefrontPage", new mongoose.Schema({}, { strict: false, timestamps: true }));
  const Banner = mongoose.models.Banner || mongoose.model("Banner", new mongoose.Schema({}, { strict: false, timestamps: true }));
  const CatalogAttribute = mongoose.models.CatalogAttribute || mongoose.model("CatalogAttribute", new mongoose.Schema({}, { strict: false, timestamps: true }));
  const Media = mongoose.models.Media || mongoose.model("Media", new mongoose.Schema({}, { strict: false, timestamps: true }));
  const StoreSetting = mongoose.models.StoreSetting || mongoose.model("StoreSetting", new mongoose.Schema({}, { strict: false, timestamps: true }));

  // 1. Admin User
  const adminEmail = process.env.ADMIN_EMAIL || "admin@roopshree.local";
  const hashedPassword = await bcrypt.hash("Admin@12345", 10);
  const admin = await User.findOneAndUpdate(
    { email: adminEmail },
    { name: "Roop Shree Admin", email: adminEmail, password: hashedPassword, role: "admin" },
    { upsert: true, new: true }
  );
  console.log("Admin seeded");

  // 2. Categories
  const categoriesData = [
    { name: "Lehenga", slug: "lehenga", isActive: true, sortOrder: 1 },
    { name: "Saree", slug: "saree", isActive: true, sortOrder: 2 },
    { name: "Kurta Set", slug: "kurta-set", isActive: true, sortOrder: 3 },
    { name: "Anarkali", slug: "anarkali", isActive: true, sortOrder: 4 }
  ];
  const seededCategories = [];
  for (const cat of categoriesData) {
    const category = await Category.findOneAndUpdate(
      { slug: cat.slug },
      cat,
      { upsert: true, new: true }
    );
    seededCategories.push(category);
  }
  console.log("Categories seeded");

  // 3. Attributes
  const attributesData = [
    {
      name: "Fabric",
      slug: "fabric",
      type: "multi-select",
      values: [
        { label: "Silk", value: "silk" },
        { label: "Cotton", value: "cotton" },
        { label: "Georgette", value: "georgette" }
      ],
      isActive: true
    },
    {
      name: "Color",
      slug: "color",
      type: "multi-select",
      values: [
        { label: "Red", value: "red", colorHex: "#FF0000" },
        { label: "Blue", value: "blue", colorHex: "#0000FF" },
        { label: "Green", value: "green", colorHex: "#008000" }
      ],
      isActive: true,
      isVariantOption: true
    }
  ];
  for (const attr of attributesData) {
    await CatalogAttribute.findOneAndUpdate({ slug: attr.slug }, attr, { upsert: true });
  }
  console.log("Attributes seeded");

  // 4. Products & Variants
  const images = [
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=1200&q=82"
  ];

  const seededProducts = [];
  for (let i = 1; i <= 10; i++) {
    const slug = `product-${i}`;
    const product = await Product.findOneAndUpdate(
      { slug },
      {
        name: `Product ${i}`,
        slug,
        description: `Description for product ${i}`,
        shortDescription: `Short description for product ${i}`,
        category: seededCategories[i % seededCategories.length]._id,
        basePrice: 1000 + i * 100,
        comparePrice: 1500 + i * 100,
        stock: 50,
        sku: `SKU-${i}`,
        images: [images[i % images.length]],
        media: [{ url: images[i % images.length], type: "image", position: 0 }],
        isActive: true,
        status: "active",
        hasVariants: true,
        options: [{ name: "Size", values: ["S", "M", "L"] }, { name: "Color", values: ["Red", "Blue"] }],
        variants: [
          { title: "S / Red", option1: "S", option2: "Red", price: 1000 + i * 100, stock: 10, sku: `SKU-${i}-S-R`, isActive: true },
          { title: "M / Blue", option1: "M", option2: "Blue", price: 1100 + i * 100, stock: 15, sku: `SKU-${i}-M-B`, isActive: true }
        ],
        attributes: [{ name: "Fabric", value: "Silk" }],
        publishedAt: new Date()
      },
      { upsert: true, new: true }
    );
    seededProducts.push(product);
  }
  console.log("Products seeded");

  // 5. Customers
  const customerEmail = "customer@example.com";
  const customer = await User.findOneAndUpdate(
    { email: customerEmail },
    { name: "John Doe", email: customerEmail, password: hashedPassword, role: "user" },
    { upsert: true, new: true }
  );
  console.log("Customer seeded");

  // 6. Orders
  for (let i = 1; i <= 5; i++) {
    const orderNumber = `ORD-${1000 + i}`;
    await Order.findOneAndUpdate(
      { orderNumber },
      {
        orderNumber,
        user: customer._id,
        items: [
          {
            product: seededProducts[i % seededProducts.length]._id,
            productName: seededProducts[i % seededProducts.length].name,
            variantSize: "M",
            variantColor: "Blue",
            qty: 1,
            price: 1500,
            productImage: seededProducts[i % seededProducts.length].images[0]
          }
        ],
        billing: {
          name: "John Doe",
          email: "customer@example.com",
          phone: "1234567890",
          address: "123 Test St",
          city: "Test City",
          state: "Test State",
          country: "India",
          pincode: "110001"
        },
        subtotal: 1500,
        total: 1500,
        paymentMethod: "razorpay",
        paymentStatus: "paid",
        orderStatus: i % 2 === 0 ? "delivered" : "processing",
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      },
      { upsert: true }
    );
  }
  console.log("Orders seeded");

  // 7. Coupons
  await Coupon.findOneAndUpdate(
    { code: "WELCOME10" },
    {
      code: "WELCOME10",
      title: "Welcome Offer",
      type: "percentage",
      value: 10,
      isActive: true,
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    },
    { upsert: true }
  );
  console.log("Coupons seeded");

  // 8. Reviews
  for (let i = 0; i < 5; i++) {
    await Review.findOneAndUpdate(
      { title: `Great product ${i}` },
      {
        product: seededProducts[i % seededProducts.length]._id,
        productId: String(seededProducts[i % seededProducts.length]._id),
        user: customer._id,
        rating: 5,
        title: `Great product ${i}`,
        comment: "Really liked the quality!",
        status: "approved",
        isApproved: true
      },
      { upsert: true }
    );
  }
  console.log("Reviews seeded");

  // 9. Blogs
  await Blog.findOneAndUpdate(
    { slug: "style-guide-2024" },
    {
      title: "Style Guide 2024",
      slug: "style-guide-2024",
      content: "<p>Welcome to the 2024 style guide...</p>",
      excerpt: "The ultimate style guide for 2024.",
      author: admin._id,
      isPublished: true,
      featuredImage: images[0]
    },
    { upsert: true }
  );
  console.log("Blogs seeded");

  // 10. Pages
  await StorefrontPage.findOneAndUpdate(
    { slug: "about-us" },
    {
      title: "About Us",
      slug: "about-us",
      content: "<h1>About Roop Shree</h1><p>We are a premium ethnic wear brand.</p>",
      isActive: true
    },
    { upsert: true }
  );
  console.log("Pages seeded");

  // 11. Banners
  await Banner.findOneAndUpdate(
    { title: "Main Hero Banner" },
    {
      title: "Main Hero Banner",
      image: images[1],
      link: "/shop",
      isActive: true,
      position: "homepage_hero"
    },
    { upsert: true }
  );
  console.log("Banners seeded");

  // 12. Store Settings
  await StoreSetting.findOneAndUpdate(
    { key: "default" },
    {
      key: "default",
      storeName: "Roop Shree",
      contactEmail: "info@roopshree.com",
      currency: "INR",
      featureToggles: {
        homepageReels: true,
        instagramGrid: true
      }
    },
    { upsert: true }
  );
  console.log("Settings seeded");

    await mongoose.disconnect();
    console.log("All data seeded successfully!");
  } catch (err) {
    console.error("FATAL ERROR:", err);
    process.exit(1);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
