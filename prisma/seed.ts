import "dotenv/config";
import { hash } from "bcryptjs";
import type { Prisma } from "../src/generated/prisma/client";
import { prisma } from "../src/lib/prisma";

const BCRYPT_ROUNDS = 12;

const adminEmail: string = process.env.SEED_ADMIN_EMAIL || "admin@cospace.local";
const adminPassword: string = process.env.SEED_ADMIN_PASSWORD || "Admin12345!";

const spaces: Prisma.SpaceCreateInput[] = [
  {
    name: "Escritorio Abierto Norte",
    description: "Escritorio en zona abierta con luz natural, internet de fibra y enchufes.",
    type: "DESK",
    capacity: 1,
    pricePerHour: 8000,
    imageUrl: "/images/spaces/desk.jpg",
  },
  {
    name: "Escritorio Ventana",
    description: "Escritorio junto a la ventana con silla ergonómica y monitor.",
    type: "DESK",
    capacity: 1,
    pricePerHour: 10000,
    imageUrl: "/images/spaces/desk.jpg",
  },
  {
    name: "Sala Creativa",
    description: "Sala para equipos pequeños con tablero, TV y videoconferencia.",
    type: "MEETING_ROOM",
    capacity: 6,
    pricePerHour: 45000,
    imageUrl: "/images/spaces/meeting-room.jpg",
  },
  {
    name: "Sala Ejecutiva",
    description: "Sala amplia para reuniones con clientes, con proyector y mesa grande.",
    type: "MEETING_ROOM",
    capacity: 10,
    pricePerHour: 70000,
    imageUrl: "/images/spaces/meeting-room.jpg",
  },
  {
    name: "Cabina Silencio",
    description: "Cabina insonorizada individual para trabajo concentrado.",
    type: "BOOTH",
    capacity: 1,
    pricePerHour: 15000,
    imageUrl: "/images/spaces/booth.jpg",
  },
  {
    name: "Sala Histórica",
    description: "Sala en remodelación, desactivada para pruebas del catálogo.",
    type: "MEETING_ROOM",
    capacity: 8,
    pricePerHour: 50000,
    imageUrl: "/images/spaces/meeting-room.jpg",
    isActive: false,
  },
];

async function upsertUser(
  email: string,
  name: string,
  password: string,
  role: "USER" | "ADMIN",
): Promise<void> {
  const passwordHash: string = await hash(password, BCRYPT_ROUNDS);
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name, passwordHash, role },
  });
}

async function seedSpaces(): Promise<void> {
  for (const space of spaces) {
    await prisma.space.upsert({
      where: { name: space.name },
      update: {},
      create: space,
    });
  }
}

async function main(): Promise<void> {
  await upsertUser(adminEmail, "Administrador CoSpace", adminPassword, "ADMIN");
  await upsertUser("user@cospace.local", "Usuario Demo", "User12345!", "USER");
  await seedSpaces();
  console.log("Seed completed");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });