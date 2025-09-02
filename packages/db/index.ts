export { PrismaClient } from '@prisma/client'
export * from '@prisma/client'

// Re-export commonly used types
export type {
  User,
  Page,
  NavItem,
  Case,
  Tag,
  Service,
  Post,
  Author,
  Testimonial,
  FaqItem,
  MediaAsset,
  HeroBlock,
  FeatureBlock,
  Banner,
  Promo,
  LeadFormConfig,
  Lead,
  SiteSettings,
  BotContent,
  AuditLog,
  ContentVersion
} from '@prisma/client'

export type {
  Status,
  UserRole,
  BgType,
  LeadStatus
} from '@prisma/client'

// Create and export Prisma client instance
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma









