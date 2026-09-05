import { RealEstateListing, PlacedObject } from '../types';
import { SAMPLE_LISTINGS } from '../data/sampleListings';

export class ListingService {
  /**
   * Parse Redfin or Zillow listing URL and extract structured listing data.
   */
  public static async ingestListingUrl(url: string): Promise<RealEstateListing> {
    const cleanUrl = url.trim();

    // Check if it matches any pre-configured rich sample listings
    const matchedSample = SAMPLE_LISTINGS.find(
      (l) => l.sourceUrl.toLowerCase() === cleanUrl.toLowerCase() || l.id === cleanUrl
    );
    if (matchedSample) {
      return JSON.parse(JSON.stringify(matchedSample));
    }

    // Determine Source
    let source: "redfin" | "zillow" | "custom" = "custom";
    if (cleanUrl.includes("redfin.com")) source = "redfin";
    if (cleanUrl.includes("zillow.com")) source = "zillow";

    // Extract address fragments from URL slug
    let title = "Custom Real Estate Staging Twin";
    let address = "100 Innovation Way";
    let city = "San Francisco";
    let state = "CA";
    let zipCode = "94105";

    try {
      const urlObj = new URL(cleanUrl);
      const pathParts = urlObj.pathname.split("/").filter(Boolean);
      
      if (source === "redfin" && pathParts.length >= 3) {
        // Redfin URL format: /STATE/City/Address/home/ID
        state = pathParts[0].toUpperCase();
        city = decodeURIComponent(pathParts[1]).replace(/-/g, " ");
        address = decodeURIComponent(pathParts[2]).replace(/-/g, " ");
        title = `${address} Digital Twin`;
      } else if (source === "zillow" && pathParts.length >= 2) {
        // Zillow format: /homedetails/Address-City-State-Zip/ID_zpid/
        const slug = decodeURIComponent(pathParts[1]);
        const slugParts = slug.split("-");
        if (slugParts.length >= 4) {
          address = slugParts.slice(0, 3).join(" ");
          city = slugParts[slugParts.length - 3] || "San Francisco";
          state = (slugParts[slugParts.length - 2] || "CA").toUpperCase();
          zipCode = slugParts[slugParts.length - 1] || "94105";
          title = `${address} Digital Twin`;
        }
      }
    } catch (e) {
      console.warn("URL parse fallback:", e);
    }

    // Heuristic metric bounding box based on typical modern living area (~1500 sqft)
    const sqft = 1650;
    const widthMeters = 13.0;
    const depthMeters = 9.5;
    const ceilingHeightMeters = 3.2;

    const newListing: RealEstateListing = {
      id: `listing_${Date.now()}`,
      title,
      address,
      city,
      state,
      zipCode,
      price: "$1,750,000",
      bedrooms: 2,
      bathrooms: 2,
      sqft,
      yearBuilt: 2022,
      propertyType: "Condo",
      description: `Ingested ${source.toUpperCase()} listing for ${address}, ${city}, ${state}. Calibrated for physics-accurate spatial digital twin generation and robot simulation in MuJoCo & Isaac Sim.`,
      source,
      sourceUrl: cleanUrl,
      photos: [
        "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      ],
      metricBounds: {
        widthMeters,
        depthMeters,
        ceilingHeightMeters,
      },
      initialObjects: [
        {
          id: `sofa_${Date.now()}`,
          assetId: "modern_sofa",
          name: "Main Living Sectional",
          category: "living_room",
          position: { x: -2.0, y: 0.425, z: 1.2 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          dimensions: { width: 2.3, height: 0.85, depth: 1.0 },
          physics: { isStatic: true, mass: 45, friction: [0.8, 0.1, 0.1], restitution: 0.1, geomType: "box" },
          color: "#2563eb",
        },
        {
          id: `table_${Date.now()}`,
          assetId: "coffee_table",
          name: "Oak Coffee Table",
          category: "living_room",
          position: { x: -2.0, y: 0.225, z: -0.2 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          dimensions: { width: 1.2, height: 0.45, depth: 0.65 },
          physics: { isStatic: false, mass: 18, friction: [0.6, 0.1, 0.1], restitution: 0.2, geomType: "box" },
          color: "#d97706",
        },
        {
          id: `tv_${Date.now()}`,
          assetId: "tv_console",
          name: "Entertainment Credenza",
          category: "living_room",
          position: { x: -2.0, y: 0.55, z: -2.4 },
          rotation: { x: 0, y: Math.PI, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          dimensions: { width: 1.6, height: 1.1, depth: 0.45 },
          physics: { isStatic: true, mass: 35, friction: [0.7, 0.1, 0.1], restitution: 0.1, geomType: "box" },
          color: "#0f172a",
        },
        {
          id: `stretch_${Date.now()}`,
          assetId: "stretch_re1_robot",
          name: "Stretch RE1 Manipulator",
          category: "robotics_fixtures",
          position: { x: 1.5, y: 0.725, z: 2.0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          dimensions: { width: 0.45, height: 1.45, depth: 0.45 },
          physics: { isStatic: false, mass: 24.5, friction: [0.5, 0.1, 0.1], restitution: 0.2, geomType: "cylinder" },
          color: "#00f0ff",
        },
      ],
    };

    return newListing;
  }
}
