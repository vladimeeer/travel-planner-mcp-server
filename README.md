# Travel Planner MCP Server

An MCP server implementation for travel planning and itinerary management. This server provides tools for creating and managing travel plans, including itinerary creation, attraction search, and transportation/accommodation recommendations.

## Features

### Itinerary Management
- Create personalized travel itineraries
- Optimize existing itineraries based on various criteria
- Support for multi-day trips with detailed daily schedules

### Location Services
- Search for attractions and points of interest
- Get detailed information about places
- Integration with Google Maps for location data

### Travel Services
- Find transportation options between locations
- Search for accommodation options
- Budget management and optimization

## Tools

### create_itinerary
Creates a personalized travel itinerary based on user preferences.
```json
{
  "origin": "New York",
  "destination": "Paris",
  "startDate": "2024-03-01",
  "endDate": "2024-03-07",
  "budget": 5000,
  "preferences": ["museums", "food", "architecture"]
}
```

### optimize_itinerary
Optimizes an existing itinerary based on specified criteria.
```json
{
  "itineraryId": "trip-123",
  "optimizationCriteria": ["time", "cost", "distance"]
}
```

### search_attractions
Searches for attractions and points of interest in a specified location.
```json
{
  "location": "Paris, France",
  "radius": 5000,
  "categories": ["museum", "restaurant", "landmark"]
}
```

### get_transport_options
Retrieves available transportation options between two points.
```json
{
  "origin": "Charles de Gaulle Airport",
  "destination": "Eiffel Tower",
  "date": "2024-03-01"
}
```

### get_accommodations
Searches for accommodation options in a specified location.
```json
{
  "location": "Paris, France",
  "checkIn": "2024-03-01",
  "checkOut": "2024-03-07",
  "budget": 200
}
```

## Configuration

### Environment Variables
- `GOOGLE_MAPS_API_KEY`: Required for location services
- `TRANSPORT_API_KEY`: Optional for transportation services
- `ACCOMMODATION_API_KEY`: Optional for accommodation services

### Usage with Claude Desktop

Add to your `claude_desktop_config.json`:

#### Docker
```json
{
  "mcpServers": {
    "travel-planner": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "GOOGLE_MAPS_API_KEY",
        "mcp/travel-planner"
      ],
      "env": {
        "GOOGLE_MAPS_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

#### NPX
```json
{
  "mcpServers": {
    "travel-planner": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-travel-planner"
      ],
      "env": {
        "GOOGLE_MAPS_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Building

```bash
# Build with Docker
docker build -t mcp/travel-planner -f src/travel-planner/Dockerfile .

# Build with npm
npm install
npm run build
```

## License

This MCP server is licensed under the MIT License. See the LICENSE file for details. 