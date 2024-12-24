#!/usr/bin/env node
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
// Schema definitions
const CreateItinerarySchema = z.object({
    origin: z.string().describe("Starting location"),
    destination: z.string().describe("Destination location"),
    startDate: z.string().describe("Start date (YYYY-MM-DD)"),
    endDate: z.string().describe("End date (YYYY-MM-DD)"),
    budget: z.number().optional().describe("Budget in USD"),
    preferences: z.array(z.string()).optional().describe("Travel preferences"),
});
const OptimizeItinerarySchema = z.object({
    itineraryId: z.string().describe("ID of the itinerary to optimize"),
    optimizationCriteria: z.array(z.string()).describe("Criteria for optimization (time, cost, etc.)"),
});
const SearchAttractionsSchema = z.object({
    location: z.string().describe("Location to search attractions"),
    radius: z.number().optional().describe("Search radius in meters"),
    categories: z.array(z.string()).optional().describe("Categories of attractions"),
});
const GetTransportOptionsSchema = z.object({
    origin: z.string().describe("Starting point"),
    destination: z.string().describe("Destination point"),
    date: z.string().describe("Travel date (YYYY-MM-DD)"),
});
const GetAccommodationsSchema = z.object({
    location: z.string().describe("Location to search"),
    checkIn: z.string().describe("Check-in date (YYYY-MM-DD)"),
    checkOut: z.string().describe("Check-out date (YYYY-MM-DD)"),
    budget: z.number().optional().describe("Maximum price per night"),
});
// Server implementation
const server = new Server({
    name: "travel-planner",
    version: "0.1.0",
}, {
    capabilities: {
        tools: {},
    },
});
// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, () => __awaiter(void 0, void 0, void 0, function* () {
    return ({
        tools: [
            {
                name: "create_itinerary",
                description: "Creates a personalized travel itinerary based on user preferences",
                inputSchema: zodToJsonSchema(CreateItinerarySchema),
            },
            {
                name: "optimize_itinerary",
                description: "Optimizes an existing itinerary based on specified criteria",
                inputSchema: zodToJsonSchema(OptimizeItinerarySchema),
            },
            {
                name: "search_attractions",
                description: "Searches for attractions and points of interest in a specified location",
                inputSchema: zodToJsonSchema(SearchAttractionsSchema),
            },
            {
                name: "get_transport_options",
                description: "Retrieves available transportation options between two points",
                inputSchema: zodToJsonSchema(GetTransportOptionsSchema),
            },
            {
                name: "get_accommodations",
                description: "Searches for accommodation options in a specified location",
                inputSchema: zodToJsonSchema(GetAccommodationsSchema),
            },
        ],
    });
}));
server.setRequestHandler(CallToolRequestSchema, (request) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            case "create_itinerary": {
                const validatedArgs = CreateItinerarySchema.parse(args);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Created itinerary from ${validatedArgs.origin} to ${validatedArgs.destination}\n` +
                                `Dates: ${validatedArgs.startDate} to ${validatedArgs.endDate}\n` +
                                `Budget: ${validatedArgs.budget || "Not specified"}\n` +
                                `Preferences: ${((_a = validatedArgs.preferences) === null || _a === void 0 ? void 0 : _a.join(", ")) || "None specified"}`,
                        },
                    ],
                };
            }
            case "optimize_itinerary": {
                const validatedArgs = OptimizeItinerarySchema.parse(args);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Optimized itinerary ${validatedArgs.itineraryId} based on: ${validatedArgs.optimizationCriteria.join(", ")}`,
                        },
                    ],
                };
            }
            case "search_attractions": {
                const validatedArgs = SearchAttractionsSchema.parse(args);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Found attractions near ${validatedArgs.location}\n` +
                                `Radius: ${validatedArgs.radius || "5000"} meters\n` +
                                `Categories: ${((_b = validatedArgs.categories) === null || _b === void 0 ? void 0 : _b.join(", ")) || "All"}`,
                        },
                    ],
                };
            }
            case "get_transport_options": {
                const validatedArgs = GetTransportOptionsSchema.parse(args);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Transport options from ${validatedArgs.origin} to ${validatedArgs.destination}\n` +
                                `Date: ${validatedArgs.date}`,
                        },
                    ],
                };
            }
            case "get_accommodations": {
                const validatedArgs = GetAccommodationsSchema.parse(args);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Accommodation options in ${validatedArgs.location}\n` +
                                `Dates: ${validatedArgs.checkIn} to ${validatedArgs.checkOut}\n` +
                                `Budget: ${validatedArgs.budget || "Not specified"} per night`,
                        },
                    ],
                };
            }
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
            isError: true,
        };
    }
}));
// Start server
function runServer() {
    return __awaiter(this, void 0, void 0, function* () {
        const transport = new StdioServerTransport();
        yield server.connect(transport);
        console.error("Travel Planner MCP Server running on stdio");
    });
}
runServer().catch((error) => {
    console.error("Fatal error running server:", error);
    process.exit(1);
});
