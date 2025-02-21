// 新增数据库工具文件
const DB_NAME = 'reservationDB';
const STORE_NAME = 'reservations';
const DB_VERSION = 2;

export const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;

      // 检查对象存储是否存在
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true
        });
        // 创建新索引
        store.createIndex('roomType_date', ['roomType', 'date']);
      } else {
        // 如果对象存储已存在，检查索引是否存在
        const store = e.target.transaction.objectStore(STORE_NAME);
        if (!store.indexNames.contains('roomType_date')) {
          store.createIndex('roomType_date', ['roomType', 'date']);
        }
      }

      // 处理旧版本数据迁移
      if (e.oldVersion < 1) {
        // 如果有旧版本需要迁移的数据可以在这里处理
      }
    };

    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
};

export const addReservation = async (reservation) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(reservation);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getAllReservations = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const deleteReservation = async (id) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getReservationsByRoomAndDate = async (roomType, date) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('roomType_date'); // 需要先创建索引

    const range = IDBKeyRange.only([roomType, date]);
    const request = index.getAll(range);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const updateReservation = async (id, newData) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const data = getRequest.result;
      const updatedReservation = { ...data, ...newData };
      const putRequest = store.put(updatedReservation);

      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    };

    getRequest.onerror = () => reject(getRequest.error);
  });
};

// 新增专用检查方法
export const checkDuplicateReservation = async (reservation) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('roomType_date'); // 使用已有索引

    const request = index.getAll(IDBKeyRange.only([reservation.roomType, reservation.date]));

    request.onsuccess = () => {
      const duplicates = request.result.filter(item =>
        item.user === reservation.user &&
        item.startTime === reservation.startTime &&
        item.endTime === reservation.endTime
      );
      resolve(duplicates.length > 0);
    };
    request.onerror = () => reject(request.error);
  });
}; 