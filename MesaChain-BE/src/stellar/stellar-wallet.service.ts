import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { EncryptionService } from "../common/services/encryption.service";

enum Network {
  PUBLIC = "PUBLIC",
  TESTNET = "TESTNET",
}

@Injectable()
export class StellarWalletService {
  private readonly logger = new Logger(StellarWalletService.name);

  constructor(
    private prisma: PrismaService,
    private encryptionService: EncryptionService
  ) {}

  async createWallet(
    userId: string,
    publicKey: string,
    secretKey: string,
    network: Network
  ) {
    try {
      // Encrypt the secret key before storing
      const encryptedSecretKey =
        await this.encryptionService.encrypt(secretKey);

      const wallet = await this.prisma.stellarWallet.create({
        data: {
          userId,
          publicKey,
          secretKey: encryptedSecretKey,
          network,
        },
      });

      this.logger.log(`Created encrypted wallet for user: ${userId}`);
      return { ...wallet, secretKey: "[ENCRYPTED]" }; // Don't return actual secret
    } catch (error) {
      this.logger.error(`Failed to create wallet: ${error.message}`);
      throw new Error("Failed to create wallet");
    }
  }

  async getDecryptedSecretKey(walletId: string): Promise<string> {
    try {
      const wallet = await this.prisma.stellarWallet.findUnique({
        where: { id: walletId },
      });

      if (!wallet) {
        throw new Error("Wallet not found");
      }

      // Decrypt the secret key when needed
      return this.encryptionService.decrypt(wallet.secretKey);
    } catch (error) {
      this.logger.error(`Failed to decrypt secret key: ${error.message}`);
      throw new Error("Failed to access wallet credentials");
    }
  }

  async getWallet(walletId: string) {
    const wallet = await this.prisma.stellarWallet.findUnique({
      where: { id: walletId },
      include: { user: true },
    });

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    // Never return the encrypted secret key
    return { ...wallet, secretKey: "[ENCRYPTED]" };
  }
}
