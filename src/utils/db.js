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
        const existingStore = e.target.transaction.objectStore(STORE_NAME);
        if (!existingStore.indexNames.contains('roomType_date')) {
          existingStore.createIndex('roomType_date', ['roomType', 'date']);
        }
      }

      // 新增数据迁移逻辑
      if (e.oldVersion < 2) {
        console.info('[DB] 开始数据迁移，旧版本:', e.oldVersion);
        // 确保从事务中获取store引用
        const transaction = e.target.transaction;
        const migrationStore = transaction.objectStore(STORE_NAME);
        
        const migrateRequest = migrationStore.getAll();
        
        migrateRequest.onsuccess = () => {
          console.info('[DB] 发现需要迁移的记录:', migrateRequest.result.length, '条');
          migrateRequest.result.forEach((reservation, index) => {
            if (reservation.date instanceof Date) {
              console.debug(`[DB] 迁移记录 #${index} ID:${reservation.id} 旧日期:`, reservation.date);
              const updated = {
                ...reservation,
                date: reservation.date.toISOString().split('T')[0]
              };
              console.debug(`[DB] 新日期格式:`, updated.date);
              migrationStore.put(updated);
            }
          });
        };
      }
    };

    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
};

export const addReservation = async (reservation) => {
  console.debug('[DB] 添加预约，原始数据:', reservation);
  const formattedReservation = {
    ...reservation,
    date: new Date(reservation.date).toISOString().split('T')[0]
  };
  console.debug('[DB] 格式化后数据:', formattedReservation);

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(formattedReservation);  // 使用格式化后的数据

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
    const index = store.index('roomType_date'); 

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
// 搜索记录
export const searchReservations = async (keyword) => {
  console.debug('[DB] 开始搜索，关键词:', keyword);
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      console.debug('[DB] 获取到原始数据:', request.result.length, '条');
      
      const results = request.result.filter(item => {
        console.debug('[DB] 处理记录:', item.id, '原始日期:', item.date, '类型:', typeof item.date);
        
        const dateStr = item.date instanceof Date ? 
          item.date.toISOString().split('T')[0] :
          String(item.date).split('T')[0];
        
        console.debug('[DB] 转换后日期:', dateStr);
        
        const match = item.roomType.includes(keyword) || 
               dateStr.includes(keyword) ||
               item.user.includes(keyword);
        
        console.debug('[DB] 匹配结果:', match ? '符合' : '不符合');
        return match;
      });

      console.info('[DB] 最终搜索结果:', results.length, '条');
      resolve(results);
    };
    
    request.onerror = (e) => {
      console.error('[DB] 搜索错误:', e.target.error);
      reject(e.target.error);
    };
  });
};

// 新增日期格式化工具方法
const formatDateField = (date) => {
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  if (typeof date === 'string') {
    return date.split('T')[0];
  }
  console.error('未知日期格式:', date);
  return '1970-01-01'; // 默认值
}; 