import { db } from "@/lib/db";
import { customers } from "@/lib/db/schema";
import { pickRandom } from "@/lib/utils";

const FIRST_NAMES = [
  "James", "Emma", "Liam", "Olivia", "Noah", "Ava", "William", "Sophia",
  "Benjamin", "Isabella", "Mason", "Mia", "Ethan", "Charlotte", "Alexander",
  "Amelia", "Daniel", "Harper", "Michael", "Evelyn", "Lucas", "Abigail",
  "Henry", "Emily", "Sebastian", "Luna", "Jack", "Chloe", "Owen", "Ella",
];

const LAST_NAMES = [
  "Anderson", "Chen", "Williams", "Garcia", "Martinez", "Johnson", "Lee",
  "Taylor", "Brown", "Wilson", "Davis", "Miller", "Moore", "Jackson",
  "Martin", "White", "Harris", "Thompson", "Clark", "Robinson", "Lewis",
  "Hall", "Young", "Walker", "King", "Wright", "Lopez", "Hill", "Scott", "Adams",
];

const CITIES = [
  { city: "Portland", state: "OR", zip: "97201" },
  { city: "Seattle", state: "WA", zip: "98101" },
  { city: "San Francisco", state: "CA", zip: "94102" },
  { city: "Denver", state: "CO", zip: "80202" },
  { city: "Austin", state: "TX", zip: "78701" },
  { city: "Chicago", state: "IL", zip: "60601" },
  { city: "New York", state: "NY", zip: "10001" },
  { city: "Boston", state: "MA", zip: "02101" },
  { city: "Minneapolis", state: "MN", zip: "55401" },
  { city: "Boulder", state: "CO", zip: "80302" },
  { city: "Asheville", state: "NC", zip: "28801" },
  { city: "Bend", state: "OR", zip: "97701" },
];

const STREETS = [
  "123 Main St", "456 Oak Ave", "789 Pine Blvd", "321 Elm Dr",
  "654 Maple Ln", "987 Cedar Ct", "147 Birch Rd", "258 Walnut Way",
  "369 Spruce Pl", "741 Willow St", "852 Aspen Dr", "963 Cherry Ln",
];

export async function seedCustomersData() {
  const usedEmails = new Set<string>();
  let count = 0;

  for (let i = 0; i < 60; i++) {
    const firstName = pickRandom(FIRST_NAMES);
    const lastName = pickRandom(LAST_NAMES);
    let email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;

    if (usedEmails.has(email)) {
      email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;
    }
    usedEmails.add(email);

    const location = pickRandom(CITIES);

    db.insert(customers)
      .values({
        email,
        firstName,
        lastName,
        phone: `(${Math.floor(Math.random() * 900 + 100)}) ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
        addressLine1: pickRandom(STREETS),
        city: location.city,
        state: location.state,
        zipCode: location.zip,
      })
      .run();

    count++;
  }

  return count;
}
