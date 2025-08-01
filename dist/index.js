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
import { Client as GoogleMapsClient, TravelMode, } from "@googlemaps/google-maps-services-js";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
// Schemas
const CreateItinerarySchema = z.object({
    origin: z.string().describe("Starting location (text address or lat,lng)"),
    destination: z.string().describe("Destination location (text address or lat,lng)"),
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
    location: z.string().describe("Location to search attractions (lat,lng)"),
    radius: z.number().optional().describe("Search radius in meters"),
    categories: z.array(z.string()).optional().describe("Categories of attractions (Google Place types)"),
});
const GetTransportOptionsSchema = z.object({
    origin: z.string().describe("Starting point (text address or lat,lng)"),
    destination: z.string().describe("Destination point (text address or lat,lng)"),
    date: z.string().describe("Travel date (YYYY-MM-DD)"),
});
const GetAccommodationsSchema = z.object({
    location: z.string().describe("Location to search (text address or lat,lng)"),
    checkIn: z.string().describe("Check-in date (YYYY-MM-DD)"),
    checkOut: z.string().describe("Check-out date (YYYY-MM-DD)"),
    budget: z.number().optional().describe("Maximum price per night"),
});
const GetPlaceDetailsSchema = z.object({
    placeId: z.string().describe("Google Place ID to retrieve details for"),
});
const GetTimeZoneSchema = z.object({
    location: z.string().describe("Latitude,Longitude"),
    timestamp: z.number().optional().describe("Timestamp for time zone calculation (seconds since epoch)"),
});
// Server
const server = new Server({
    name: "travel-planner",
    version: "0.1.0",
}, {
    capabilities: {
        tools: {},
    },
});
const googleMapsClient = new GoogleMapsClient();
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
            {
                name: "get_place_details",
                description: "Gets detailed information about a specific place using Google Place ID",
                inputSchema: zodToJsonSchema(GetPlaceDetailsSchema),
            },
            {
                name: "get_time_zone",
                description: "Gets timezone information for a location",
                inputSchema: zodToJsonSchema(GetTimeZoneSchema),
            },
        ],
    });
}));
server.setRequestHandler(CallToolRequestSchema, (request) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    const { name, arguments: args } = request.params;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        return {
            content: [
                {
                    type: "text",
                    text: "Error: GOOGLE_MAPS_API_KEY environment variable is not set.",
                },
            ],
            isError: true,
        };
    }
    try {
        switch (name) {
            case "create_itinerary": {
                const validatedArgs = CreateItinerarySchema.parse(args);
                const directionsResp = yield googleMapsClient.directions({
                    params: {
                        key: apiKey,
                        origin: validatedArgs.origin,
                        destination: validatedArgs.destination,
                        mode: TravelMode.DRIVING,
                    },
                });
                const route = directionsResp.data.routes[0];
                return {
                    content: [
                        {
                            type: "text",
                            text: `Created itinerary from ${validatedArgs.origin} to ${validatedArgs.destination}\n` +
                                `Dates: ${validatedArgs.startDate} to ${validatedArgs.endDate}\n` +
                                `Distance: ${((_c = (_b = (_a = route === null || route === void 0 ? void 0 : route.legs) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.distance) === null || _c === void 0 ? void 0 : _c.text) || "N/A"}\n` +
                                `Duration: ${((_f = (_e = (_d = route === null || route === void 0 ? void 0 : route.legs) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.duration) === null || _f === void 0 ? void 0 : _f.text) || "N/A"}\n` +
                                `Budget: ${validatedArgs.budget || "Not specified"}\n` +
                                `Preferences: ${((_g = validatedArgs.preferences) === null || _g === void 0 ? void 0 : _g.join(", ")) || "None specified"}`,
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
                const [lat, lng] = validatedArgs.location.split(",").map(Number);
                if (isNaN(lat) || isNaN(lng))
                    throw new Error("Invalid location format, must be 'lat,lng'");
                const placesResp = yield googleMapsClient.placesNearby({
                    params: {
                        key: apiKey,
                        location: { lat, lng },
                        radius: validatedArgs.radius || 5000,
                        type: (_h = validatedArgs.categories) === null || _h === void 0 ? void 0 : _h[0], // Only one type at a time
                    },
                });
                const results = placesResp.data.results;
                const names = results.slice(0, 5).map(place => place.name).join(", ");
                return {
                    content: [
                        {
                            type: "text",
                            text: results.length
                                ? `Found attractions near ${validatedArgs.location}: ${names}`
                                : `No attractions found near ${validatedArgs.location}.`,
                        },
                    ],
                };
            }
            case "get_transport_options": {
                const validatedArgs = GetTransportOptionsSchema.parse(args);
                const modes = [
                    TravelMode.DRIVING,
                    TravelMode.WALKING,
                    TravelMode.BICYCLING,
                    TravelMode.TRANSIT,
                ];
                let resultsText = "";
                for (const mode of modes) {
                    const dirResp = yield googleMapsClient.directions({
                        params: {
                            key: apiKey,
                            origin: validatedArgs.origin,
                            destination: validatedArgs.destination,
                            mode,
                            departure_time: "now"
                        },
                    });
                    const route = dirResp.data.routes[0];
                    if (route) {
                        resultsText +=
                            `Mode: ${mode}\n` +
                                `Duration: ${route.legs[0].duration.text}, Distance: ${route.legs[0].distance.text}\n`;
                    }
                }
                return {
                    content: [
                        {
                            type: "text",
                            text: resultsText || "No transport options found.",
                        },
                    ],
                };
            }
            case "get_accommodations": {
                const validatedArgs = GetAccommodationsSchema.parse(args);
                const geocodeResp = yield googleMapsClient.geocode({
                    params: {
                        key: apiKey,
                        address: validatedArgs.location,
                    },
                });
                const geo = (_k = (_j = geocodeResp.data.results[0]) === null || _j === void 0 ? void 0 : _j.geometry) === null || _k === void 0 ? void 0 : _k.location;
                if (!geo)
                    throw new Error("Could not geocode accommodations location.");
                const placesResp = yield googleMapsClient.placesNearby({
                    params: {
                        key: apiKey,
                        location: geo,
                        radius: 5000,
                        type: "lodging",
                    },
                });
                const places = placesResp.data.results.slice(0, 5).map(hotel => `${hotel.name}${hotel.vicinity ? " (" + hotel.vicinity + ")" : ""}`).join(", ");
                return {
                    content: [
                        {
                            type: "text",
                            text: places
                                ? `Accommodation options in ${validatedArgs.location}: ${places}`
                                : `No accommodations found in ${validatedArgs.location}.`,
                        },
                    ],
                };
            }
            case "get_place_details": {
                const validatedArgs = GetPlaceDetailsSchema.parse(args);
                const detailsResp = yield googleMapsClient.placeDetails({
                    params: {
                        key: apiKey,
                        place_id: validatedArgs.placeId,
                        fields: [
                            "name",
                            "formatted_address",
                            "rating",
                            "user_ratings_total",
                            "website",
                            "geometry",
                            "formatted_phone_number"
                        ],
                    },
                });
                const place = detailsResp.data.result;
                return {
                    content: [
                        {
                            type: "text",
                            text: place
                                ? `Details for ${place.name}:\nAddress: ${place.formatted_address}\nRating: ${place.rating} (${place.user_ratings_total} reviews)\nPhone: ${place.formatted_phone_number || "N/A"}\nWebsite: ${place.website || "N/A"}`
                                : "No details found.",
                        },
                    ],
                };
            }
            case "get_time_zone": {
                const validatedArgs = GetTimeZoneSchema.parse(args);
                const [lat, lng] = validatedArgs.location.split(",").map(Number);
                if (isNaN(lat) || isNaN(lng))
                    throw new Error("Invalid location format, must be 'lat,lng'");
                const timestamp = validatedArgs.timestamp || Math.floor(Date.now() / 1000);
                const tzResp = yield googleMapsClient.timezone({
                    params: {
                        key: apiKey,
                        location: { lat, lng },
                        timestamp,
                    },
                });
                const tz = tzResp.data;
                return {
                    content: [
                        {
                            type: "text",
                            text: `Time zone for ${validatedArgs.location}: ${tz.timeZoneName} (ID: ${tz.timeZoneId}, Raw offset: ${tz.rawOffset}s, DST offset: ${tz.dstOffset}s)`,
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
