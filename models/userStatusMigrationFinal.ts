import admin from "firebase-admin";
import firestore from "../utils/firestore";

const oldUserStatusCollection = firestore.collection("usersStatus");
const newUserStatusCollection = firestore.collection("userStatus");
const newUserFutureStatusCollection = firestore.collection("userFutureStatus");

const BATCH_SIZE = 500;

interface OldUserStatus {
  userId: string;
  currentStatus?: {
    from: number;
    until?: number;
    state: string;
    message?: string;
  };
  futureStatus?: {
    from: number;
    until?: number;
    state: string;
    message?: string;
  };
}

interface NewUserStatus {
  userId: string;
  appliedOn: Date;
  status: string;
  state: "CURRENT" | "PAST";
  endedOn?: Date;
  message?: string;
}

interface NewUserFutureStatus {
  userId: string;
  from: Date;
  status: string;
  state: "UPCOMING" | "APPLIED" | "NOT_APPLIED";
  endsOn?: Date;
  message?: string;
}

interface MigrationResult {
  totalProcessed: number;
  totalMigrated: number;
  totalSkipped: number;
  batches: {
    processedCount: number;
    migratedCount: number;
    skippedCount: number;
  }[];
}

async function fetchBatch(lastDoc?: admin.firestore.QueryDocumentSnapshot): Promise<admin.firestore.QuerySnapshot> {
  let query = oldUserStatusCollection.orderBy("userId").limit(BATCH_SIZE);
  if (lastDoc) {
    query = query.startAfter(lastDoc);
  }
  return await query.get();
}

async function userExistsInNewCollections(userId: string): Promise<boolean> {
  const existingStatus = await newUserStatusCollection.where("userId", "==", userId).limit(1).get();
  const existingFutureStatus = await newUserFutureStatusCollection.where("userId", "==", userId).limit(1).get();
  return !existingStatus.empty || !existingFutureStatus.empty;
}

function prepareStatus(data: OldUserStatus): NewUserStatus | null {
  if (!data.currentStatus) return null;

  return {
    userId: data.userId,
    appliedOn: new Date(data.currentStatus.from),
    status: data.currentStatus.state,
    state: "CURRENT",
    endedOn: data.currentStatus.until ? new Date(data.currentStatus.until) : undefined,
    message: data.currentStatus.message,
  };
}

function prepareFutureStatus(data: OldUserStatus): NewUserFutureStatus | null {
  if (!data.futureStatus) return null;

  return {
    userId: data.userId,
    from: new Date(data.futureStatus.from),
    status: data.futureStatus.state,
    state: "UPCOMING",
    endsOn: data.futureStatus.until ? new Date(data.futureStatus.until) : undefined,
    message: data.futureStatus.message,
  };
}

async function migrateBatch(
  snapshot: admin.firestore.QuerySnapshot
): Promise<{ migratedCount: number; skippedCount: number }> {
  const batch = firestore.batch();
  let migratedCount = 0;
  let skippedCount = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data() as OldUserStatus;
    const userId = data.userId;

    if (await userExistsInNewCollections(userId)) {
      skippedCount++;
      continue;
    }

    const status = prepareStatus(data);
    if (status) {
      batch.set(newUserStatusCollection.doc(), status);
    }

    const futureStatus = prepareFutureStatus(data);
    if (futureStatus) {
      batch.set(newUserFutureStatusCollection.doc(), futureStatus);
    }

    migratedCount++;
  }

  await batch.commit();
  return { migratedCount, skippedCount };
}

async function migrateUserStatus(): Promise<MigrationResult> {
  let lastDoc: admin.firestore.QueryDocumentSnapshot | undefined = undefined;
  let totalMigrated = 0;
  let totalSkipped = 0;
  let totalProcessed = 0;
  const batches: MigrationResult["batches"] = [];

  while (true) {
    const snapshot = await fetchBatch(lastDoc);
    if (snapshot.empty) {
      break;
    }

    const { migratedCount, skippedCount } = await migrateBatch(snapshot);
    totalMigrated += migratedCount;
    totalSkipped += skippedCount;
    totalProcessed += snapshot.size;

    batches.push({
      processedCount: snapshot.size,
      migratedCount,
      skippedCount,
    });

    lastDoc = snapshot.docs[snapshot.docs.length - 1];
  }

  return {
    totalProcessed,
    totalMigrated,
    totalSkipped,
    batches,
  };
}

export { migrateUserStatus };
