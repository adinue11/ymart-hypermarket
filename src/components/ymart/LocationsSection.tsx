import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "./ImmersiveSections";
import { AH } from "@/components/fx/Heading";


const ymartIcon = L.divIcon({
  className: "ymart-map-marker",
  html: `
    <div class="ymart-map-marker__inner">
      <span>Y</span>
    </div>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 21],
  popupAnchor: [0, -21],
});

const ymartMapLocations = [
  {
    id: "ymart-01",
    number: "01",
    name: "YMART Retail Group",
    address:
      "BKM Towers, Nayanmarmoola P.O, Vidyanagar–Uliyathadka Road, Kasaragod, Kerala 671123",
    lat: 12.51530231364163,
    lng: 75.02410599433148,
    mapsUrl: "YOUR_MAPS_LINK_01",
  },
  {
    id: "ymart-02",
    number: "02",
    name: "YMART Hypermarket LLP Y4",
    address: "XIV/362, B C, Cherkala, Kerala 671541",
    lat: 12.50959117065898,
    lng: 75.05750980560937,
    mapsUrl: "https://maps.app.goo.gl/u2EhzLqnX6oSCrsy5",
  },
  {
    id: "ymart-03",
    number: "03",
    name: "YMART",
    address:
      "G3WC+374, Cherkala–Kalladka Road, Nellikatte, Nekraje, Kerala 671543",
    lat: 12.54505,
    lng: 75.07054,
    mapsUrl: "https://maps.app.goo.gl/smd9xTZeB3cXnSaEA",
  },
  {
    id: "ymart-04",
    number: "04",
    name: "Y Mart",
    address:
      "G353+V76, Cherkala, Chengala, Kerala 671541",
    lat: 12.5098320755535,
    lng: 75.05320754232777,
    mapsUrl: "https://maps.app.goo.gl/CgbUFShFP3Y3xyQv8",
  },
];


const YmartCurvedRoute = ({
  locations,
}: {
  locations: typeof ymartMapLocations;
}) => {
  const points = locations.map(
    (location) => [location.lat, location.lng] as [number, number]
  );

  if (points.length < 2) return null;

  const curvedPoints: [number, number][] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i];
    const end = points[i + 1];

    const midLat = (start[0] + end[0]) / 2;
    const midLng = (start[1] + end[1]) / 2;

    const curveLat = midLat + 0.004;
    const curveLng = midLng - 0.003;

    for (let step = 0; step <= 30; step++) {
      const t = step / 30;
      const inverse = 1 - t;

      const lat =
        inverse * inverse * start[0] +
        2 * inverse * t * curveLat +
        t * t * end[0];

      const lng =
        inverse * inverse * start[1] +
        2 * inverse * t * curveLng +
        t * t * end[1];

      curvedPoints.push([lat, lng]);
    }
  }

  return (
    <Polyline
      positions={curvedPoints}
      pathOptions={{
        color: "#111",
        weight: 3,
        opacity: 0.8,
        dashArray: "2 10",
        lineCap: "round",
        lineJoin: "round",
      }}
    />
  );
};

export default function LocationsSection() {
  return (
    <section
      className="locations-section"
      id="locations"
    >
      {/* ---------------------------------------
          HEADER
      --------------------------------------- */}

      <div className="locations-section__header section-light">
        <div className="section-wrap locations-heading">
          <Reveal>
            <p className="eyebrow eyebrow--dark">
              <span>
                THE Ymart  DESTINATIONs
              </span>
            </p>
          </Reveal>

          <div className="locations-heading__row">
            <Reveal>
              <h2>
                Find your
                <br />
                <em>
                  nearest YMART.
                </em>
              </h2>
            </Reveal>

            <Reveal delay={0.08}>
              <p>
                Four hypermarkets across
                Kasaragod. Pick one, and
                step inside.
              </p>
            </Reveal>
          </div>
        </div>
      </div>

      {/* ---------------------------------------
          REAL LEAFLET + THREE.JS MAP
      --------------------------------------- */}

      <div className="locations-map section-light">
        <div className="section-wrap locations-map__layout">

          <div className="locations-map__art locations-map__art--real">

            <MapContainer
              center={[
                12.526,
                75.048,
              ]}
              zoom={13}
              scrollWheelZoom={false}
              dragging={true}
              zoomControl={true}
              className="ymart-map"
            >
              <TileLayer
                attribution="© OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* REAL YMART MARKERS */}

              <YmartCurvedRoute locations={ymartMapLocations} />
              
              {ymartMapLocations.map(
                (location) => (
                  <Marker
                    key={location.id}
                    position={[
                      location.lat,
                      location.lng,
                    ]}
                    icon={ymartIcon}
                  >
                    <Popup>
                      <div className="ymart-popup">
                        <strong>
                          {location.number}{" "}
                          /{" "}
                          {location.name}
                        </strong>

                        <span>
                          {location.address}
                        </span>

                        <a
                          href={
                            location.mapsUrl.startsWith("http") ? location.mapsUrl : `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Get directions →
                        </a>
                      </div>
                    </Popup>
                  </Marker>
                )
              )}
            </MapContainer>

            <span className="map-label">
              YMART / KASARAGOD
            </span>
          </div>

          {/* -----------------------------------
              RIGHT SIDE
          ----------------------------------- */}

          <div className="locations-map__copy">
            <Reveal>
              <span className="locations-map__index">
                THE WAY THERE / 01–04
              </span>

              <h3>
                One name.
                <br />
                <em>
                  Four destinations.
                </em>
              </h3>

              <p>
                Explore YMART across
                Kasaragod
              </p>

              <a
                href="#contact"
                className="text-link text-link--dark"
              >
                <span>
                  Ask about a location?
                </span>

                <ArrowUpRight
                  size={15}
                />
              </a>
            </Reveal>
          </div>

        </div>
      </div>
    </section>
  );
}

