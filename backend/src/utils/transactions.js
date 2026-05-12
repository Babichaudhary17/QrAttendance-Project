import mongoose from "mongoose";

export const runInTransaction = async (operation) => {
  const session = await mongoose.startSession();

  try {
    let result;
    await session.withTransaction(async () => {
      result = await operation(session);
    });
    return result;
  } catch (error) {
    const transactionUnsupported =
      error.codeName === "IllegalOperation" ||
      error.message?.includes("Transaction numbers are only allowed") ||
      error.message?.includes("replica set member or mongos");

    if (!transactionUnsupported) {
      throw error;
    }

    return operation(null);
  } finally {
    await session.endSession();
  }
};
