import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
  text,
  primaryKey,
  foreignKey,
  boolean,
  integer,
  decimal,
} from 'drizzle-orm/pg-core';

export const user = pgTable('User', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  email: varchar('email', { length: 64 }).notNull(),
  password: varchar('password', { length: 64 }),
});

export type User = InferSelectModel<typeof user>;

export const chat = pgTable('Chat', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  createdAt: timestamp('createdAt').notNull(),
  title: text('title').notNull(),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id),
  visibility: varchar('visibility', { enum: ['public', 'private'] })
    .notNull()
    .default('private'),
});

export type Chat = InferSelectModel<typeof chat>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://chat-sdk.dev/docs/migration-guides/message-parts
export const messageDeprecated = pgTable('Message_v2', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId')
    .notNull()
    .references(() => chat.id),
  role: varchar('role').notNull(),
  content: json('content').notNull(),
  createdAt: timestamp('createdAt').notNull(),
});

export type MessageDeprecated = InferSelectModel<typeof messageDeprecated>;

export const message = pgTable('Message', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId')
    .notNull()
    .references(() => chat.id),
  role: varchar('role').notNull(),
  parts: json('parts').notNull(),
  attachments: json('attachments').notNull(),
  createdAt: timestamp('createdAt').notNull(),
});

export type DBMessage = InferSelectModel<typeof message>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://chat-sdk.dev/docs/migration-guides/message-parts
export const voteDeprecated = pgTable(
  'Vote_v2',
  {
    chatId: uuid('chatId')
      .notNull()
      .references(() => chat.id),
    messageId: uuid('messageId')
      .notNull()
      .references(() => messageDeprecated.id),
    isUpvoted: boolean('isUpvoted').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  },
);

export type VoteDeprecated = InferSelectModel<typeof voteDeprecated>;

export const vote = pgTable(
  'Vote',
  {
    chatId: uuid('chatId')
      .notNull()
      .references(() => chat.id),
    messageId: uuid('messageId')
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean('isUpvoted').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  },
);

export type Vote = InferSelectModel<typeof vote>;

export const document = pgTable(
  'Document',
  {
    id: uuid('id').notNull().defaultRandom(),
    createdAt: timestamp('createdAt').notNull(),
    title: text('title').notNull(),
    content: text('content'),
    kind: varchar('text', { enum: ['text', 'code', 'image', 'sheet', 'report'] })
      .notNull()
      .default('text'),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.id, table.createdAt] }),
    };
  },
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable(
  'Suggestion',
  {
    id: uuid('id').notNull().defaultRandom(),
    documentId: uuid('documentId').notNull(),
    documentCreatedAt: timestamp('documentCreatedAt').notNull(),
    originalText: text('originalText').notNull(),
    suggestedText: text('suggestedText').notNull(),
    description: text('description'),
    isResolved: boolean('isResolved').notNull().default(false),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
    createdAt: timestamp('createdAt').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  }),
);

export type Suggestion = InferSelectModel<typeof suggestion>;

export const stream = pgTable(
  'Stream',
  {
    id: uuid('id').notNull().defaultRandom(),
    chatId: uuid('chatId').notNull(),
    createdAt: timestamp('createdAt').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    chatRef: foreignKey({
      columns: [table.chatId],
      foreignColumns: [chat.id],
    }),
  }),
);

export type Stream = InferSelectModel<typeof stream>;

export const disasterAlert = pgTable('DisasterAlert', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  eventId: varchar('eventId', { length: 50 }).notNull().unique(),
  eventType: varchar('eventType', { length: 10 }).notNull(), // EQ, FL, WF, DR, etc.
  alertLevel: varchar('alertLevel', { length: 20 }).notNull(), // Green, Orange, Red
  title: text('title').notNull(),
  description: text('description'),

  // Location data
  country: varchar('country', { length: 100 }),
  latitude: decimal('latitude', { precision: 10, scale: 6 }),
  longitude: decimal('longitude', { precision: 10, scale: 6 }),
  minLatitude: decimal('minLatitude', { precision: 10, scale: 6 }),
  maxLatitude: decimal('maxLatitude', { precision: 10, scale: 6 }),
  minLongitude: decimal('minLongitude', { precision: 10, scale: 6 }),
  maxLongitude: decimal('maxLongitude', { precision: 10, scale: 6 }),

  // Event details
  magnitude: decimal('magnitude', { precision: 5, scale: 2 }),
  depth: decimal('depth', { precision: 8, scale: 3 }),
  affectedPopulation: integer('affectedPopulation'),
  affectedArea: integer('affectedArea'), // in km2
  deaths: integer('deaths'),
  displaced: integer('displaced'),

  // Timestamps
  eventTime: timestamp('eventTime'),
  startTime: timestamp('startTime'),
  endTime: timestamp('endTime'),
  publishedAt: timestamp('publishedAt').notNull(),
  lastUpdated: timestamp('lastUpdated').notNull(),

  // URLs and resources
  reportUrl: text('reportUrl'),
  capUrl: text('capUrl'),
  iconUrl: text('iconUrl'),

  // Additional metadata
  severity: integer('severity'), // 0-3 scale
  version: integer('version'),
  isActive: boolean('isActive').notNull().default(true),

  // Raw data for flexibility
  rawData: json('rawData'),

  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export type DisasterAlert = InferSelectModel<typeof disasterAlert>;
export type NewDisasterAlert = InferInsertModel<typeof disasterAlert>;

// Product Categories for disaster aid
export const productCategory = pgTable('ProductCategory', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  icon: varchar('icon', { length: 50 }), // Icon identifier
  color: varchar('color', { length: 7 }), // Hex color code
  isActive: boolean('isActive').notNull().default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export type ProductCategory = InferSelectModel<typeof productCategory>;
export type NewProductCategory = InferInsertModel<typeof productCategory>;

// Products for disaster aid
export const product = pgTable('Product', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  categoryId: uuid('categoryId')
    .notNull()
    .references(() => productCategory.id),

  // Product specifications
  specification: text('specification'), // Detailed product specifications
  quantity: integer('quantity').notNull().default(1), // Quantity per unit/bag/kit
  unit: varchar('unit', { length: 50 }).notNull().default('piece'), // e.g., "piece", "set", "pair", "liters"

  // Physical properties
  size: varchar('size', { length: 100 }), // e.g., "210*220", "L,XL", "Age between 8-12"
  weight: decimal('weight', { precision: 8, scale: 3 }), // in kg
  volume: decimal('volume', { precision: 8, scale: 3 }), // in liters
  dimensions: varchar('dimensions', { length: 100 }), // e.g., "55*25*25 cm"

  // Product type and packaging
  productType: varchar('productType', { length: 50 }), // e.g., "kit", "individual", "bundle"
  isKit: boolean('isKit').notNull().default(false), // Whether this is a kit containing multiple items
  kitContents: json('kitContents'), // Array of items in the kit with quantities

  // Storage and shelf life
  shelfLife: integer('shelfLife'), // in days
  storageConditions: varchar('storageConditions', { length: 100 }),

  // Cultural considerations
  isHalal: boolean('isHalal').default(false),
  isKosher: boolean('isKosher').default(false),
  isVegetarian: boolean('isVegetarian').default(false),
  isVegan: boolean('isVegan').default(false),

  // Status
  isActive: boolean('isActive').notNull().default(true),
  isAvailable: boolean('isAvailable').notNull().default(true),

  // Reference information
  referencePicture: varchar('referencePicture', { length: 200 }), // URL or path to reference picture
  itemCode: varchar('itemCode', { length: 50 }), // Internal item code

  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export type Product = InferSelectModel<typeof product>;
export type NewProduct = InferInsertModel<typeof product>;

// Regional Product Preferences
export const regionalProductPreference = pgTable('RegionalProductPreference', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  region: varchar('region', { length: 100 }).notNull(), // Country or region name
  productId: uuid('productId')
    .notNull()
    .references(() => product.id),

  // Preference settings
  preferenceLevel: integer('preferenceLevel').notNull().default(3), // 1-5 scale
  isPreferred: boolean('isPreferred').notNull().default(true),
  isAvoided: boolean('isAvoided').notNull().default(false),

  // Cultural/religious considerations
  culturalNotes: text('culturalNotes'),
  dietaryRestrictions: json('dietaryRestrictions'), // Array of restrictions

  // Seasonal considerations
  seasonalAvailability: json('seasonalAvailability'), // Months when preferred/avoided

  isActive: boolean('isActive').notNull().default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export type RegionalProductPreference = InferSelectModel<
  typeof regionalProductPreference
>;
export type NewRegionalProductPreference = InferInsertModel<
  typeof regionalProductPreference
>;

// Product Inventory/Stock
export const productInventory = pgTable('ProductInventory', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  productId: uuid('productId')
    .notNull()
    .references(() => product.id),

  // Stock information
  currentStock: integer('currentStock').notNull().default(0),
  reservedStock: integer('reservedStock').notNull().default(0),
  minimumStock: integer('minimumStock').notNull().default(0),
  maximumStock: integer('maximumStock'),

  // Location
  warehouseLocation: varchar('warehouseLocation', { length: 200 }),
  storageZone: varchar('storageZone', { length: 50 }),

  // Expiry tracking
  expiryDate: timestamp('expiryDate'),
  batchNumber: varchar('batchNumber', { length: 100 }),

  // Cost information
  unitCost: decimal('unitCost', { precision: 10, scale: 2 }),
  currency: varchar('currency', { length: 3 }).default('USD'),

  isActive: boolean('isActive').notNull().default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export type ProductInventory = InferSelectModel<typeof productInventory>;
export type NewProductInventory = InferInsertModel<typeof productInventory>;
