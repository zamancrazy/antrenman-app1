// Empty shim for expo-sqlite web
// SQLite is not available in web, full functionality available in Expo Go app
export const openDatabaseAsync = async () => ({
  execAsync: async () => {},
  getAllAsync: async () => [],
  getFirstAsync: async () => null,
  runAsync: async () => ({ lastInsertRowId: 1 })
});

export default {
  openDatabaseAsync
};
