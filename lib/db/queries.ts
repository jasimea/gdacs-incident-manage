import 'server-only';

import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  inArray,
  lt,
  lte,
  or,
  type SQL,
} from 'drizzle-orm';

import {
  user,
  chat,
  type User,
  document,
  type Suggestion,
  suggestion,
  message,
  vote,
  type DBMessage,
  type Chat,
  stream,
  disasterAlert,
  productCategory,
  product,
  regionalProductPreference,
  productInventory,
  type Product,
  type ProductCategory,
  type RegionalProductPreference,
  type ProductInventory,
  type NewProduct,
  type NewProductCategory,
  type NewRegionalProductPreference,
  type NewProductInventory,
} from './schema';
import type { ArtifactKind } from '@/components/artifact';
import { generateUUID } from '../utils';
import { generateHashedPassword } from './utils';
import type { VisibilityType } from '@/components/visibility-selector';
import { ChatSDKError } from '../errors';
import type { NewDisasterAlert } from './schema';
import { db } from './index';

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get user by email',
    );
  }
}

export async function createUser(email: string, password: string) {
  const hashedPassword = generateHashedPassword(password);

  try {
    return await db.insert(user).values({ email, password: hashedPassword });
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to create user');
  }
}

export async function createGuestUser() {
  const email = `guest-${Date.now()}`;
  const password = generateHashedPassword(generateUUID());

  try {
    return await db.insert(user).values({ email, password }).returning({
      id: user.id,
      email: user.email,
    });
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to create guest user',
    );
  }
}

export async function saveChat({
  id,
  userId,
  title,
  visibility,
}: {
  id: string;
  userId: string;
  title: string;
  visibility: VisibilityType;
}) {
  try {
    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      userId,
      title,
      visibility,
    });
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save chat');
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await db.delete(vote).where(eq(vote.chatId, id));
    await db.delete(message).where(eq(message.chatId, id));
    await db.delete(stream).where(eq(stream.chatId, id));

    const [chatsDeleted] = await db
      .delete(chat)
      .where(eq(chat.id, id))
      .returning();
    return chatsDeleted;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to delete chat by id',
    );
  }
}

export async function getChatsByUserId({
  id,
  limit,
  startingAfter,
  endingBefore,
}: {
  id: string;
  limit: number;
  startingAfter: string | null;
  endingBefore: string | null;
}) {
  try {
    const extendedLimit = limit + 1;

    const query = (whereCondition?: SQL<any>) =>
      db
        .select()
        .from(chat)
        .where(
          whereCondition
            ? and(whereCondition, eq(chat.userId, id))
            : eq(chat.userId, id),
        )
        .orderBy(desc(chat.createdAt))
        .limit(extendedLimit);

    let filteredChats: Array<Chat> = [];

    if (startingAfter) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, startingAfter))
        .limit(1);

      if (!selectedChat) {
        throw new ChatSDKError(
          'not_found:database',
          `Chat with id ${startingAfter} not found`,
        );
      }

      filteredChats = await query(gt(chat.createdAt, selectedChat.createdAt));
    } else if (endingBefore) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, endingBefore))
        .limit(1);

      if (!selectedChat) {
        throw new ChatSDKError(
          'not_found:database',
          `Chat with id ${endingBefore} not found`,
        );
      }

      filteredChats = await query(lt(chat.createdAt, selectedChat.createdAt));
    } else {
      filteredChats = await query();
    }

    const hasMore = filteredChats.length > limit;

    return {
      chats: hasMore ? filteredChats.slice(0, limit) : filteredChats,
      hasMore,
    };
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get chats by user id',
    );
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get chat by id');
  }
}

export async function saveMessages({
  messages,
}: {
  messages: Array<DBMessage>;
}) {
  try {
    return await db.insert(message).values(messages);
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save messages');
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.chatId, id))
      .orderBy(asc(message.createdAt));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get messages by chat id',
    );
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: 'up' | 'down';
}) {
  try {
    const [existingVote] = await db
      .select()
      .from(vote)
      .where(and(eq(vote.messageId, messageId)));

    if (existingVote) {
      return await db
        .update(vote)
        .set({ isUpvoted: type === 'up' })
        .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));
    }
    return await db.insert(vote).values({
      chatId,
      messageId,
      isUpvoted: type === 'up',
    });
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to vote message');
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await db.select().from(vote).where(eq(vote.chatId, id));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get votes by chat id',
    );
  }
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
}) {
  try {
    return await db
      .insert(document)
      .values({
        id,
        title,
        kind,
        content,
        userId,
        createdAt: new Date(),
      })
      .returning();
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save document');
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    const documents = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(asc(document.createdAt));

    return documents;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get documents by id',
    );
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    const [selectedDocument] = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(desc(document.createdAt));

    return selectedDocument;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get document by id',
    );
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    await db
      .delete(suggestion)
      .where(
        and(
          eq(suggestion.documentId, id),
          gt(suggestion.documentCreatedAt, timestamp),
        ),
      );

    return await db
      .delete(document)
      .where(and(eq(document.id, id), gt(document.createdAt, timestamp)))
      .returning();
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to delete documents by id after timestamp',
    );
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Array<Suggestion>;
}) {
  try {
    return await db.insert(suggestion).values(suggestions);
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to save suggestions',
    );
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await db
      .select()
      .from(suggestion)
      .where(and(eq(suggestion.documentId, documentId)));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get suggestions by document id',
    );
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(message).where(eq(message.id, id));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get message by id',
    );
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const messagesToDelete = await db
      .select({ id: message.id })
      .from(message)
      .where(
        and(eq(message.chatId, chatId), gte(message.createdAt, timestamp)),
      );

    const messageIds = messagesToDelete.map((message) => message.id);

    if (messageIds.length > 0) {
      await db
        .delete(vote)
        .where(
          and(eq(vote.chatId, chatId), inArray(vote.messageId, messageIds)),
        );

      return await db
        .delete(message)
        .where(
          and(eq(message.chatId, chatId), inArray(message.id, messageIds)),
        );
    }
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to delete messages by chat id after timestamp',
    );
  }
}

export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: 'private' | 'public';
}) {
  try {
    return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to update chat visibility by id',
    );
  }
}

export async function getMessageCountByUserId({
  id,
  differenceInHours,
}: { id: string; differenceInHours: number }) {
  try {
    const twentyFourHoursAgo = new Date(
      Date.now() - differenceInHours * 60 * 60 * 1000,
    );

    const [stats] = await db
      .select({ count: count(message.id) })
      .from(message)
      .innerJoin(chat, eq(message.chatId, chat.id))
      .where(
        and(
          eq(chat.userId, id),
          gte(message.createdAt, twentyFourHoursAgo),
          eq(message.role, 'user'),
        ),
      )
      .execute();

    return stats?.count ?? 0;
  } catch (error) {
    console.log('error', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get message count by user id',
    );
  }
}

export async function createStreamId({
  streamId,
  chatId,
}: {
  streamId: string;
  chatId: string;
}) {
  try {
    await db
      .insert(stream)
      .values({ id: streamId, chatId, createdAt: new Date() });
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to create stream id',
    );
  }
}

export async function getStreamIdsByChatId({ chatId }: { chatId: string }) {
  try {
    const streamIds = await db
      .select({ id: stream.id })
      .from(stream)
      .where(eq(stream.chatId, chatId))
      .orderBy(asc(stream.createdAt))
      .execute();

    return streamIds.map(({ id }) => id);
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get stream ids by chat id',
    );
  }
}

// Disaster Alert queries
export async function insertDisasterAlert(alert: NewDisasterAlert) {
  return await db.insert(disasterAlert).values(alert).returning();
}

export async function updateDisasterAlert(
  eventId: string,
  updates: Partial<NewDisasterAlert>,
) {
  return await db
    .update(disasterAlert)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(disasterAlert.eventId, eventId))
    .returning();
}

export async function getDisasterAlertByEventId(eventId: string) {
  const result = await db
    .select()
    .from(disasterAlert)
    .where(eq(disasterAlert.eventId, eventId))
    .limit(1);
  return result[0];
}

export async function getDisasterAlerts(
  options: {
    eventType?: string;
    alertLevel?: string;
    country?: string;
    isActive?: boolean;
    limit?: number;
    offset?: number;
  } = {},
) {
  const {
    eventType,
    alertLevel,
    country,
    isActive,
    limit = 50,
    offset = 0,
  } = options;

  const conditions = [];

  if (eventType) {
    conditions.push(eq(disasterAlert.eventType, eventType));
  }

  if (alertLevel) {
    conditions.push(eq(disasterAlert.alertLevel, alertLevel));
  }

  if (country) {
    conditions.push(eq(disasterAlert.country, country));
  }

  if (isActive !== undefined) {
    conditions.push(eq(disasterAlert.isActive, isActive));
  }

  if (conditions.length > 0) {
    return await db
      .select()
      .from(disasterAlert)
      .where(and(...conditions))
      .orderBy(desc(disasterAlert.publishedAt))
      .limit(limit)
      .offset(offset);
  }

  return await db
    .select()
    .from(disasterAlert)
    .orderBy(desc(disasterAlert.publishedAt))
    .limit(limit)
    .offset(offset);
}

export async function getRecentDisasterAlerts(hours: number = 24) {
  const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

  return await db
    .select()
    .from(disasterAlert)
    .where(gte(disasterAlert.publishedAt, cutoffTime))
    .orderBy(desc(disasterAlert.publishedAt));
}

export async function getDisasterAlertsBySeverity(minSeverity: number) {
  return await db
    .select()
    .from(disasterAlert)
    .where(gte(disasterAlert.severity, minSeverity))
    .orderBy(desc(disasterAlert.publishedAt));
}

export async function getDisasterAlertsByLocation(
  minLat: number,
  maxLat: number,
  minLng: number,
  maxLng: number,
) {
  return await db
    .select()
    .from(disasterAlert)
    .where(
      and(
        gte(disasterAlert.latitude, minLat.toString()),
        lte(disasterAlert.latitude, maxLat.toString()),
        gte(disasterAlert.longitude, minLng.toString()),
        lte(disasterAlert.longitude, maxLng.toString()),
      ),
    )
    .orderBy(desc(disasterAlert.publishedAt));
}

export async function deleteOldDisasterAlerts(daysOld: number = 30) {
  const cutoffTime = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

  return await db
    .delete(disasterAlert)
    .where(lte(disasterAlert.publishedAt, cutoffTime))
    .returning();
}

// Product Category queries
export async function createProductCategory(category: NewProductCategory) {
  return await db.insert(productCategory).values(category).returning();
}

export async function getProductCategories() {
  return await db
    .select()
    .from(productCategory)
    .where(eq(productCategory.isActive, true))
    .orderBy(asc(productCategory.name));
}

export async function getProductCategoryById(id: string) {
  const result = await db
    .select()
    .from(productCategory)
    .where(eq(productCategory.id, id))
    .limit(1);
  return result[0];
}

// Product queries
export async function createProduct(productData: NewProduct) {
  return await db.insert(product).values(productData).returning();
}

export async function getProducts(
  options: {
    categoryId?: string;
    isActive?: boolean;
    isAvailable?: boolean;
    limit?: number;
    offset?: number;
  } = {},
) {
  const { categoryId, isActive, isAvailable, limit = 50, offset = 0 } = options;

  const conditions = [];

  if (categoryId) {
    conditions.push(eq(product.categoryId, categoryId));
  }

  if (isActive !== undefined) {
    conditions.push(eq(product.isActive, isActive));
  }

  if (isAvailable !== undefined) {
    conditions.push(eq(product.isAvailable, isAvailable));
  }

  if (conditions.length > 0) {
    return await db
      .select()
      .from(product)
      .where(and(...conditions))
      .orderBy(asc(product.name))
      .limit(limit)
      .offset(offset);
  }

  return await db
    .select()
    .from(product)
    .orderBy(asc(product.name))
    .limit(limit)
    .offset(offset);
}

export async function getProductById(id: string) {
  const result = await db
    .select()
    .from(product)
    .where(eq(product.id, id))
    .limit(1);
  return result[0];
}

export async function getProductsWithCategory() {
  return await db
    .select({
      id: product.id,
      name: product.name,
      description: product.description,
      unit: product.unit,
      weight: product.weight,
      volume: product.volume,
      isHalal: product.isHalal,
      isKosher: product.isKosher,
      isVegetarian: product.isVegetarian,
      isVegan: product.isVegan,
      isActive: product.isActive,
      isAvailable: product.isAvailable,
      categoryId: product.categoryId,
      categoryName: productCategory.name,
      categoryIcon: productCategory.icon,
      categoryColor: productCategory.color,
    })
    .from(product)
    .innerJoin(productCategory, eq(product.categoryId, productCategory.id))
    .where(eq(product.isActive, true))
    .orderBy(asc(product.name));
}

// Regional Product Preference queries
export async function createRegionalProductPreference(
  preference: NewRegionalProductPreference,
) {
  return await db
    .insert(regionalProductPreference)
    .values(preference)
    .returning();
}

export async function getRegionalProductPreferences(region: string) {
  return await db
    .select({
      id: product.id,
      name: product.name,
      description: product.description,
      unit: product.unit,
      preferenceLevel: regionalProductPreference.preferenceLevel,
      isPreferred: regionalProductPreference.isPreferred,
      isAvoided: regionalProductPreference.isAvoided,
      culturalNotes: regionalProductPreference.culturalNotes,
      dietaryRestrictions: regionalProductPreference.dietaryRestrictions,
      seasonalAvailability: regionalProductPreference.seasonalAvailability,
      categoryId: product.categoryId,
      categoryName: productCategory.name,
    })
    .from(regionalProductPreference)
    .innerJoin(product, eq(regionalProductPreference.productId, product.id))
    .innerJoin(productCategory, eq(product.categoryId, productCategory.id))
    .where(
      and(
        eq(regionalProductPreference.region, region),
        eq(regionalProductPreference.isActive, true),
        eq(product.isActive, true),
      ),
    )
    .orderBy(
      desc(regionalProductPreference.preferenceLevel),
      asc(product.name),
    );
}

// Product Inventory queries
export async function createProductInventory(inventory: NewProductInventory) {
  return await db.insert(productInventory).values(inventory).returning();
}

export async function getProductInventory(productId?: string) {
  if (productId) {
    return await db
      .select()
      .from(productInventory)
      .where(eq(productInventory.productId, productId))
      .orderBy(asc(productInventory.createdAt));
  }

  return await db
    .select()
    .from(productInventory)
    .orderBy(asc(productInventory.createdAt));
}

export async function updateProductInventory(
  id: string,
  updates: Partial<NewProductInventory>,
) {
  return await db
    .update(productInventory)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(productInventory.id, id))
    .returning();
}

export async function getLowStockProducts(threshold: number = 10) {
  return await db
    .select({
      id: product.id,
      name: product.name,
      unit: product.unit,
      currentStock: productInventory.currentStock,
      reservedStock: productInventory.reservedStock,
      minimumStock: productInventory.minimumStock,
      categoryName: productCategory.name,
    })
    .from(productInventory)
    .innerJoin(product, eq(productInventory.productId, product.id))
    .innerJoin(productCategory, eq(product.categoryId, productCategory.id))
    .where(
      and(
        lte(productInventory.currentStock, threshold),
        eq(product.isActive, true),
      ),
    )
    .orderBy(asc(productInventory.currentStock));
}

// Get products by category
export async function getProductsByCategory(categoryId: string) {
  return await db
    .select({
      id: product.id,
      name: product.name,
      description: product.description,
      specification: product.specification,
      quantity: product.quantity,
      unit: product.unit,
      size: product.size,
      weight: product.weight,
      volume: product.volume,
      dimensions: product.dimensions,
      productType: product.productType,
      isKit: product.isKit,
      kitContents: product.kitContents,
      isHalal: product.isHalal,
      isKosher: product.isKosher,
      isVegetarian: product.isVegetarian,
      isVegan: product.isVegan,
      referencePicture: product.referencePicture,
      itemCode: product.itemCode,
      categoryName: productCategory.name,
      categoryIcon: productCategory.icon,
      categoryColor: productCategory.color,
    })
    .from(product)
    .innerJoin(productCategory, eq(product.categoryId, productCategory.id))
    .where(
      and(
        eq(product.categoryId, categoryId),
        eq(product.isActive, true),
        eq(product.isAvailable, true),
      ),
    )
    .orderBy(asc(product.name));
}

// Get all available products with category information
export async function getAllAvailableProducts() {
  return await db
    .select({
      id: product.id,
      name: product.name,
      description: product.description,
      specification: product.specification,
      quantity: product.quantity,
      unit: product.unit,
      size: product.size,
      weight: product.weight,
      volume: product.volume,
      dimensions: product.dimensions,
      productType: product.productType,
      isKit: product.isKit,
      kitContents: product.kitContents,
      isHalal: product.isHalal,
      isKosher: product.isKosher,
      isVegetarian: product.isVegetarian,
      isVegan: product.isVegan,
      referencePicture: product.referencePicture,
      itemCode: product.itemCode,
      categoryId: product.categoryId,
      categoryName: productCategory.name,
      categoryIcon: productCategory.icon,
      categoryColor: productCategory.color,
    })
    .from(product)
    .innerJoin(productCategory, eq(product.categoryId, productCategory.id))
    .where(and(eq(product.isActive, true), eq(product.isAvailable, true)))
    .orderBy(asc(productCategory.name), asc(product.name));
}
