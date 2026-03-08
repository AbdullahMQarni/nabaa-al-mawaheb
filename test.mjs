import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  try {
    const s = await prisma.stadium.findFirst();
    const u = await prisma.user.findFirst();
    if (!s || !u) {
      console.log('Missing user or stadium in DB');
      process.exit(1);
    }
    const date = new Date().toISOString();
    const startTime = "16:00";
    
    console.log(`Testing booking for User ${u.id} and Stadium ${s.id}`);
    
    const booking = await prisma.booking.create({
      data: {
          userId: u.id, 
          stadiumId: s.id, 
          date: new Date(date), 
          startTime,
          duration: 60, 
          sportType: "كرة قدم", 
          playersCount: 22, 
          totalPrice: 150,
          status: 'PENDING', 
          paymentStatus: 'PENDING'
      }
    });
    console.log("Success, booking ID:", booking.id);
  } catch (e) {
    console.error("Prisma error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
