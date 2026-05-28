import { faker } from "@faker-js/faker";
import { createTrip } from "../services/tripsService.js";
import { broadcastNewTrips } from "../websocket/wsServer.js";

let generatorInterval = null;

function getRandomCategory() {
  return faker.helpers.arrayElement([
    "Beach",
    "Mountain",
    "City",
    "Adventure",
    "Cultural",
    "Road Trip",
    "Other",
  ]);
}

function generateValidDateRange() {
  const startDate = faker.date.soon({ days: 30 });
  const endDate = faker.date.soon({ days: 10, refDate: startDate });

  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  };
}

export async function generateFakeBatch(batchSize = 3) {
  const newTrips = [];

  for (let i = 0; i < batchSize; i += 1) {
    const { startDate, endDate } = generateValidDateRange();
    const budget = faker.number.int({ min: 500, max: 5000 });
    const spent = faker.number.int({ min: 0, max: budget });

    const trip = await createTrip({
      tripName: `${faker.location.city()} Trip`,
      destination: `${faker.location.city()}, ${faker.location.country()}`,
      startDate,
      endDate,
      category: getRandomCategory(),
      budget: budget.toString(),
      spent: spent.toString(),
      collaborators: faker.person.fullName(),
      packingList: "Automatically generated trip",
    });

    newTrips.push(trip);
  }

  return newTrips;
}

export function startFakeGenerator() {
  if (generatorInterval) {
    return {
      message: "Fake generator is already running.",
    };
  }

  generatorInterval = setInterval(async () => {
    const generatedTrips = await generateFakeBatch(3);

    console.log(
      "Generated fake trips:",
      generatedTrips.map((trip) => trip.tripName)
    );

    broadcastNewTrips(generatedTrips);
  }, 5000);

  return {
    message: "Fake generator started.",
  };
}

export function stopFakeGenerator() {
  if (!generatorInterval) {
    return {
      message: "Fake generator is not running.",
    };
  }

  clearInterval(generatorInterval);
  generatorInterval = null;

  return {
    message: "Fake generator stopped.",
  };
}

export function isFakeGeneratorRunning() {
  return generatorInterval !== null;
}