import cron from "node-cron";
import prisma from "../db/db.js";

cron.schedule("* * * * *", async () => {
  console.log("Checking reward points...");

  const oneMinuteAgo = new Date(Date.now() - 60 * 1000); 
//   const oneMinuteAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const orders = await prisma.order.findMany({
    where: {
      status: "Delivered",
      rewardCredited: false,
      deliveredAt: {
        lte: oneMinuteAgo,
      },
    },
  });

  for (const order of orders) {
    const earnedPoints = Math.floor(Number(order.total) / 100);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: order.customerid,
        },
        data: {
          rewardPoints: {
            increment: earnedPoints,
          },
          lifetimePoints: {
            increment: earnedPoints,
          },
        },
      });

      await tx.rewardTransaction.create({
        data: {
          userId: order.customerid,
          orderId: order.id,
          points: earnedPoints,
          type: "EARNED",
          description: "Reward credited after delivery",
        },
      });

      await tx.order.update({
        where: {
          id: order.id,
        },
        data: {
          rewardCredited: true,
        },
      });
    });

    console.log(
      `Reward credited for order ${order.id} (${earnedPoints} points)`
    );
  }
});