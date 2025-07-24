import { Module } from "@nestjs/common";
import { CacheModule } from "@nestjs/cache-manager";
import { EncryptionService } from "./services/encryption.service";

@Module({
  imports: [
    CacheModule.register({
      ttl: 300, // Default TTL of 5 minutes
      max: 100, // Maximum number of items in cache
    }),
  ],
  providers: [EncryptionService],
  exports: [EncryptionService, CacheModule],
})
export class CommonModule {}
