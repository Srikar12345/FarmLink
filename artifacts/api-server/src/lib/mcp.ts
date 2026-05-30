import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import {
  getListings,
  addListing,
  getOrders,
  addOrder,
  updateOrder,
  getCropRequests,
  addCropRequest,
  memListings,
  memCropRequests,
  getUserById,
} from "./store.js";
import { Listing, Order, CropRequest } from "@workspace/db";

export const server = new Server(
  {
    name: "farmlink-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list_produce",
        description: "List all available crops, grains, fruits, herbs, and other produce listed by farmers in East Godavari, AP.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "create_order",
        description: "Place a new order for farm produce. Same-day delivery with eco-packaging.",
        inputSchema: {
          type: "object",
          properties: {
            listingId: { type: "string", description: "The ID of the produce listing to buy" },
            consumerName: { type: "string", description: "Name of the consumer placing the order" },
            consumerAddress: { type: "string", description: "Delivery address (East Godavari, AP)" },
            consumerPhone: { type: "string", description: "10-digit phone number of the consumer" },
            quantity: { type: "number", description: "Quantity to order" },
          },
          required: ["listingId", "consumerName", "consumerAddress", "consumerPhone", "quantity"],
        },
      },
      {
        name: "get_order_status",
        description: "Check the status and details of an order by ID.",
        inputSchema: {
          type: "object",
          properties: {
            orderId: { type: "string", description: "The ID of the order to track" },
          },
          required: ["orderId"],
        },
      },
      {
        name: "list_crop_requests",
        description: "List all consumer demands / crop requests posted by homes, restaurants, or businesses.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "create_crop_request",
        description: "Submit a new crop request to signal demand so local farmers can pledge to grow it.",
        inputSchema: {
          type: "object",
          properties: {
            produceName: { type: "string", description: "Name of the crop/produce requested" },
            category: { type: "string", enum: ["vegetables", "fruits", "grains", "dairy", "herbs", "seafood", "meat", "other"], description: "Category of produce" },
            quantityNeeded: { type: "number", description: "Quantity needed" },
            quantityUnit: { type: "string", description: "Unit of quantity (e.g. kg, piece, litre, dozen)" },
            maxPricePerUnit: { type: "number", description: "Maximum price per unit willing to pay (in ₹)" },
            frequency: { type: "string", enum: ["once", "weekly", "monthly", "seasonal"], description: "How often it is needed" },
            description: { type: "string", description: "Details about quality requirements or context" },
            requesterName: { type: "string", description: "Name of the person/business requesting" },
            requesterPhone: { type: "string", description: "Phone number of the requester" },
          },
          required: ["produceName", "category", "quantityNeeded", "quantityUnit", "maxPricePerUnit", "frequency", "description", "requesterName", "requesterPhone"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "list_produce": {
      const list = await getListings();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(list, null, 2),
          },
        ],
      };
    }

    case "create_order": {
      const { listingId, consumerName, consumerAddress, consumerPhone, quantity } = args as any;
      const list = await getListings();
      const listing = list.find((l) => l.id === listingId);
      if (!listing) {
        throw new McpError(ErrorCode.InvalidParams, `Listing with ID ${listingId} not found.`);
      }

      if (listing.quantity < quantity) {
        throw new McpError(ErrorCode.InvalidParams, `Insufficient stock. Only ${listing.quantity} ${listing.quantityUnit} available.`);
      }

      const farmer = await getUserById(listing.farmerId);

      const totalPrice = listing.price * quantity;
      const deliveryFee = Math.max(20, Math.round(totalPrice * 0.1));
      const packagingDeposit = listing.packagingType === 'jute_bag' ? 25 :
                               listing.packagingType === 'glass_jar' ? 50 :
                               listing.packagingType === 'cloth_bag' ? 20 :
                               listing.packagingType === 'steel_tin' ? 80 : 0;

      const order: Order = {
        id: `order_${Date.now()}`,
        listingId,
        consumerId: `user_${Date.now()}`, // Temporary anonymous consumer ID
        riderId: null,
        status: "pending",
        produceName: listing.produceName,
        quantity,
        quantityUnit: listing.quantityUnit,
        totalPrice,
        deliveryFee,
        packagingDeposit,
        packagingType: listing.packagingType,
        consumerAddress,
        farmerName: farmer?.name ?? "Ravi Reddy",
        farmerLocation: farmer?.location ?? "East Godavari, AP",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await addOrder(order);
      return {
        content: [
          {
            type: "text",
            text: `Order placed successfully!\n\nOrder Details:\n${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    }

    case "get_order_status": {
      const { orderId } = args as any;
      const orders = await getOrders();
      const order = orders.find((o) => o.id === orderId);
      if (!order) {
        throw new McpError(ErrorCode.InvalidParams, `Order with ID ${orderId} not found.`);
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(order, null, 2),
          },
        ],
      };
    }

    case "list_crop_requests": {
      const list = await getCropRequests();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(list, null, 2),
          },
        ],
      };
    }

    case "create_crop_request": {
      const {
        produceName,
        category,
        quantityNeeded,
        quantityUnit,
        maxPricePerUnit,
        frequency,
        description,
        requesterName,
        requesterPhone,
      } = args as any;

      const req: CropRequest = {
        id: `req_${Date.now()}`,
        requesterId: `user_${Date.now()}`,
        produceName,
        category,
        quantityNeeded,
        quantityUnit,
        maxPricePerUnit,
        frequency,
        description,
        status: "open",
        pledgedFarmerId: null,
        createdAt: new Date(),
      };

      const result = await addCropRequest(req);
      return {
        content: [
          {
            type: "text",
            text: `Crop request created successfully!\n\nDetails:\n${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    }

    default:
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
  }
});
