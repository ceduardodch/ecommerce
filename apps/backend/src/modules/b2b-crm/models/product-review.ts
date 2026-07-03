import { model } from "@medusajs/framework/utils"

const ProductReview = model
  .define("ProductReview", {
    id: model.id({ prefix: "rev" }).primaryKey(),
    product_id: model.text().searchable(),
    product_sku: model.text().searchable(),
    customer_phone: model.text().searchable(),
    customer_name: model.text(),
    rating: model.number(),
    title: model.text(),
    content: model.text(),
    photos: model.json().nullable(),
    verified_purchase: model.boolean().default(true),
    helpful_count: model.number().default(0),
    created_at: model.dateTime(),
    updated_at: model.dateTime(),
  })
  .indexes([
    {
      name: "IDX_product_review_product_id",
      on: ["product_id"],
      unique: false,
    },
    {
      name: "IDX_product_review_customer_phone",
      on: ["customer_phone"],
      unique: false,
    },
    {
      name: "IDX_product_review_rating",
      on: ["rating"],
      unique: false,
    },
    {
      name: "IDX_product_review_created_at",
      on: ["created_at"],
      unique: false,
    },
  ])

export default ProductReview
