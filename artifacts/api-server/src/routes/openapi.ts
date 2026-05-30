import { Router } from "express";

const router = Router();

const openapiSpec = {
  openapi: "3.0.0",
  info: {
    title: "FarmLink API",
    version: "1.0.0",
    description: "API for connecting local farmers and consumers in East Godavari, AP"
  },
  servers: [
    {
      url: "https://farmlink-5mip.onrender.com/api"
    }
  ],
  paths: {
    "/listings": {
      get: {
        summary: "List available produce",
        description: "Retrieve all crop, fruit, and grain listings posted by farmers in East Godavari.",
        operationId: "listProduce",
        responses: {
          "200": {
            "description": "A JSON list of crop listings."
          }
        }
      },
      post: {
        summary: "Create a new produce listing",
        description: "Allows farmers to post new crops for sale.",
        operationId: "createListing",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  farmerName: { type: "string" },
                  farmerPhone: { type: "string" },
                  cropName: { type: "string" },
                  category: { type: "string", enum: ["Grains", "Vegetables", "Fruits", "Spices"] },
                  quantity: { type: "number" },
                  unit: { type: "string" },
                  pricePerUnit: { type: "number" },
                  location: { type: "string" }
                },
                required: ["farmerName", "farmerPhone", "cropName", "category", "quantity", "unit", "pricePerUnit", "location"]
              }
            }
          }
        },
        responses: {
          "201": {
            "description": "Listing successfully created."
          }
        }
      }
    },
    "/orders": {
      get: {
        summary: "List all orders",
        description: "Fetch all crop orders.",
        operationId: "listOrders",
        responses: {
          "200": {
            "description": "JSON array of orders."
          }
        }
      },
      post: {
        summary: "Create a new order",
        description: "Allows consumers to place orders for produce.",
        operationId: "createOrder",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  listingId: { type: "string" },
                  consumerName: { type: "string" },
                  consumerPhone: { type: "string" },
                  deliveryAddress: { type: "string" },
                  quantity: { type: "number" },
                  totalPrice: { type: "number" },
                  paymentMethod: { type: "string", enum: ["UPI", "COD"] }
                },
                required: ["listingId", "consumerName", "consumerPhone", "deliveryAddress", "quantity", "totalPrice", "paymentMethod"]
              }
            }
          }
        },
        responses: {
          "201": {
            "description": "Order placed successfully."
          }
        }
      }
    },
    "/orders/{id}": {
      patch: {
        summary: "Update order status",
        description: "Update the status of an order, accept delivery, or record tracking info.",
        operationId: "updateOrder",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", enum: ["pending", "accepted", "picked_up", "delivered", "cancelled"] },
                  riderName: { type: "string" },
                  riderPhone: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            "description": "Order updated successfully."
          }
        }
      }
    },
    "/crop-requests": {
      get: {
        summary: "List crop demands",
        description: "Retrieve demand crop requests posted by homes, restaurants, or businesses.",
        operationId: "listCropRequests",
        responses: {
          "200": {
            "description": "A JSON array of crop requests."
          }
        }
      },
      post: {
        summary: "Submit a new crop demand request",
        description: "Submit a request for a crop so local farmers can grow it.",
        operationId: "createCropRequest",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  buyerName: { type: "string" },
                  buyerPhone: { type: "string" },
                  cropName: { type: "string" },
                  targetQuantity: { type: "number" },
                  unit: { type: "string" },
                  targetPrice: { type: "number" },
                  urgency: { type: "string", enum: ["high", "medium", "low"] }
                },
                required: ["buyerName", "buyerPhone", "cropName", "targetQuantity", "unit", "targetPrice"]
              }
            }
          }
        },
        responses: {
          "201": {
            "description": "Crop request successfully created."
          }
        }
      }
    }
  }
};

router.get("/openapi.json", (req, res) => {
  res.json(openapiSpec);
});

export default router;
