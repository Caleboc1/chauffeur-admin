import { MOCK_ADMINS } from './mockData';

const MOCK_AUTH_KEY = 'chauffeur_mock_auth';

const clone = (value) => JSON.parse(JSON.stringify(value));

const tables = {
  admins: clone(MOCK_ADMINS),
  audit_logs: [],
};

function getStoredSession() {
  const stored = localStorage.getItem(MOCK_AUTH_KEY);
  if (!stored) return null;

  try {
    const sessionData = JSON.parse(stored);
    return {
      access_token: 'mock-access-token',
      user: sessionData.user,
    };
  } catch {
    return null;
  }
}

function matchesFilter(row, filter) {
  const value = row[filter.column];

  if (filter.operator === 'eq') return value === filter.value;
  if (filter.operator === 'neq') return value !== filter.value;
  if (filter.operator === 'in') return filter.value.includes(value);

  return true;
}

class MockQuery {
  constructor(tableName) {
    this.tableName = tableName;
    this.filters = [];
    this.orderBy = null;
    this.limitValue = null;
    this.singleResult = false;
    this.maybeSingleResult = false;
    this.insertPayload = null;
    this.updatePayload = null;
  }

  select() {
    return this;
  }

  eq(column, value) {
    this.filters.push({ column, operator: 'eq', value });
    return this;
  }

  neq(column, value) {
    this.filters.push({ column, operator: 'neq', value });
    return this;
  }

  in(column, value) {
    this.filters.push({ column, operator: 'in', value });
    return this;
  }

  order(column, options = {}) {
    this.orderBy = { column, ascending: options.ascending !== false };
    return this;
  }

  limit(value) {
    this.limitValue = value;
    return this;
  }

  single() {
    this.singleResult = true;
    return this;
  }

  maybeSingle() {
    this.maybeSingleResult = true;
    return this;
  }

  insert(payload) {
    this.insertPayload = Array.isArray(payload) ? payload : [payload];
    return this;
  }

  update(payload) {
    this.updatePayload = payload;
    return this;
  }

  async execute() {
    if (!tables[this.tableName]) tables[this.tableName] = [];
    let rows = tables[this.tableName];

    if (this.insertPayload) {
      const created = this.insertPayload.map((item) => ({
        id: item.id || `${this.tableName}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        created_at: item.created_at || new Date().toISOString(),
        ...item,
      }));
      tables[this.tableName] = [...created, ...tables[this.tableName]];
      rows = created;
    }

    if (this.updatePayload) {
      tables[this.tableName] = rows.map((row) => {
        if (this.filters.every((filter) => matchesFilter(row, filter))) {
          return { ...row, ...this.updatePayload, updated_at: new Date().toISOString() };
        }
        return row;
      });
      rows = tables[this.tableName];
    }

    rows = rows.filter((row) => this.filters.every((filter) => matchesFilter(row, filter)));

    if (this.orderBy) {
      const { column, ascending } = this.orderBy;
      rows = [...rows].sort((a, b) => {
        if (a[column] === b[column]) return 0;
        return (a[column] > b[column] ? 1 : -1) * (ascending ? 1 : -1);
      });
    }

    if (typeof this.limitValue === 'number') {
      rows = rows.slice(0, this.limitValue);
    }

    const data = clone(rows);

    if (this.singleResult || this.maybeSingleResult) {
      return { data: data[0] || null, error: null, count: data.length };
    }

    return { data, error: null, count: data.length };
  }

  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }
}

export const supabase = {
  from(tableName) {
    return new MockQuery(tableName);
  },

  auth: {
    async signInWithPassword({ email }) {
      const admin = MOCK_ADMINS.find((item) => item.email === email && item.status === 'active');

      if (!admin) {
        return { data: { user: null, session: null }, error: new Error('Invalid email or password') };
      }

      const sessionData = {
        user: { id: admin.auth_user_id || admin.id, email: admin.email },
        profile: admin,
        role: admin.role,
      };

      localStorage.setItem(MOCK_AUTH_KEY, JSON.stringify(sessionData));
      return { data: { user: sessionData.user, session: getStoredSession() }, error: null };
    },

    async signOut() {
      localStorage.removeItem(MOCK_AUTH_KEY);
      return { error: null };
    },

    async getSession() {
      return { data: { session: getStoredSession() }, error: null };
    },

    async getUser() {
      return { data: { user: getStoredSession()?.user || null }, error: null };
    },

    onAuthStateChange(callback) {
      queueMicrotask(() => callback('INITIAL_SESSION', getStoredSession()));
      return {
        data: {
          subscription: {
            unsubscribe() {},
          },
        },
      };
    },

    async updateUser() {
      return { data: { user: getStoredSession()?.user || null }, error: null };
    },
  },

  storage: {
    from(bucket) {
      return {
        async upload(path) {
          return { data: { path, bucket }, error: null };
        },
        getPublicUrl(path) {
          return { data: { publicUrl: URL.createObjectURL(new Blob()) || `mock://${bucket}/${path}` } };
        },
      };
    },
  },
};
