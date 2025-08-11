import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "./models/Category.model.js";

// Load environment variables
dotenv.config();

const defaultCategories = [
  {
    categoryId: "electronics",
    name: "Electronics",
    description: "Electronic devices and gadgets"
  },
  {
    categoryId: "tools",
    name: "Tools & Equipment",
    description: "Professional tools and equipment"
  },
  {
    categoryId: "vehicles",
    name: "Vehicles",
    description: "Cars, bikes, and other vehicles"
  },
  {
    categoryId: "furniture",
    name: "Furniture",
    description: "Home and office furniture"
  },
  {
    categoryId: "sports",
    name: "Sports Equipment",
    description: "Sports and fitness equipment"
  },
  {
    categoryId: "camera",
    name: "Cameras & Photography",
    description: "Professional cameras and photography equipment"
  },
  {
    categoryId: "construction",
    name: "Construction Equipment",
    description: "Heavy machinery and construction tools"
  },
  {
    categoryId: "audio",
    name: "Audio & Video",
    description: "Audio and video equipment"
  },
  {
    categoryId: "lighting",
    name: "Lighting Equipment",
    description: "Professional lighting and stage equipment"
  }
];

async function seedCategories() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing categories
    await Category.deleteMany({});
    console.log("🗑️  Cleared existing categories");

    // Insert default categories
    const categories = await Category.insertMany(defaultCategories);
    console.log(`✅ Added ${categories.length} categories:`);
    
    categories.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.categoryId})`);
    });

    console.log("\n🎉 Categories seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
    process.exit(1);
  }
}

seedCategories();
