import { Module } from "@nestjs/common";
import { CouponsController } from "./coupons.controller";
import { PrismaModule } from "src/prisma/prisma.module";
import { CouponsService } from "./coupons.service";

@Module({
  controllers: [CouponsController],
  providers: [CouponsService],
  imports: [PrismaModule],
  exports: [CouponsService] 
})
export class CouponsModule {}