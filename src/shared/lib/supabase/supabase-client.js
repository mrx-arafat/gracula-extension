// Supabase Client for Gracula Extension
// A lightweight fetch-based client to avoid heavy dependencies

window.Gracula = window.Gracula || {};
window.Gracula.Supabase = window.Gracula.Supabase || {};

/**
 * Minimal Supabase Client
 */
window.Gracula.Supabase.Client = class SupabaseClient {
  constructor(url, key) {
    this.url = url ? url.replace(/\/$/, '') : '';
    this.key = key;
    this.accessToken = null;
  }

  /**
   * Sign in anonymously to get a user session
   */
  async signInAnonymously() {
    try {
      const response = await fetch(`${this.url}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'apikey': this.key,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: undefined,
          password: undefined,
          data: { is_anonymous: true }
        })
      });

      // If anonymous sign-in isn't directly supported via simple signup endpoint,
      // we might need to use the specific signInAnonymously method from the official SDK.
      // However, for a lightweight client, we can try to use a persistent guest session
      // or rely on the fact that we might not need strict auth if RLS allows anon access
      // but filters by a client-provided ID.
      
      // BUT, the best practice for "user-wise" data without login is to generate a
      // local UUID and use that as a filter, while RLS allows "public" insert but
      // restricts select/update to that ID.
      
      // Since we want to use Supabase Auth for true RLS, let's try to sign in
      // as a guest if the project supports it, or fall back to using the anon key
      // with a client-generated ID if auth is too complex for this lightweight client.
      
      // For now, let's assume we use the anon key (which is a JWT) as the base,
      // and if we have a specific user token, we use that.
      
      return null;
    } catch (error) {
      console.warn('Anonymous sign-in failed:', error);
      return null;
    }
  }

  /**
   * Set the access token for authenticated requests
   * @param {string} token
   */
  setAccessToken(token) {
    this.accessToken = token;
  }

  /**
   * Internal fetch wrapper
   */
  async _fetch(path, options = {}) {
    if (!this.url || !this.key) {
      throw new Error('Supabase URL and Key are required');
    }

    const headers = {
      'apikey': this.key,
      'Authorization': `Bearer ${this.accessToken || this.key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation', // Default to returning data
      ...options.headers
    };

    try {
      const response = await fetch(`${this.url}${path}`, {
        ...options,
        headers
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMsg = response.statusText;
        try {
          const errorJson = JSON.parse(errorText);
          errorMsg = errorJson.message || errorJson.error || errorMsg;
        } catch (e) {
          // ignore json parse error
        }
        throw new Error(`Supabase Error (${response.status}): ${errorMsg}`);
      }

      // Handle 204 No Content (e.g. from some inserts if prefer=minimal)
      if (response.status === 204) return null;

      return await response.json();
    } catch (error) {
      console.error('Supabase Request Failed:', error);
      throw error;
    }
  }

  /**
   * Select table to operate on
   * @param {string} table 
   */
  from(table) {
    return new window.Gracula.Supabase.QueryBuilder(this, table);
  }

  /**
   * Call a Postgres function (RPC)
   * @param {string} functionName
   * @param {object} params
   */
  async rpc(functionName, params = {}) {
    return this._fetch(`/rest/v1/rpc/${functionName}`, {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  /**
   * Auth namespace
   */
  get auth() {
    return {
      signInAnonymously: () => this.signInAnonymously(),
      setSession: (session) => {
        if (session?.access_token) {
          this.setAccessToken(session.access_token);
        }
      }
    };
  }
};

/**
 * Query Builder for Supabase
 */
window.Gracula.Supabase.QueryBuilder = class QueryBuilder {
  constructor(client, table) {
    this.client = client;
    this.table = table;
    this.params = new URLSearchParams();
    this.headers = {};
  }

  /**
   * Select columns
   * @param {string} columns 
   */
  select(columns = '*') {
    this.params.set('select', columns);
    return this;
  }

  /**
   * Filter: Equals
   */
  eq(column, value) {
    this.params.append(column, `eq.${value}`);
    return this;
  }

  /**
   * Filter: Not Equals
   */
  neq(column, value) {
    this.params.append(column, `neq.${value}`);
    return this;
  }

  /**
   * Filter: Greater Than
   */
  gt(column, value) {
    this.params.append(column, `gt.${value}`);
    return this;
  }

  /**
   * Filter: Less Than
   */
  lt(column, value) {
    this.params.append(column, `lt.${value}`);
    return this;
  }

  /**
   * Filter: Greater Than or Equal
   */
  gte(column, value) {
    this.params.append(column, `gte.${value}`);
    return this;
  }

  /**
   * Filter: Less Than or Equal
   */
  lte(column, value) {
    this.params.append(column, `lte.${value}`);
    return this;
  }

  /**
   * Filter: Like (pattern matching)
   */
  like(column, pattern) {
    this.params.append(column, `like.${pattern}`);
    return this;
  }

  /**
   * Filter: ILike (case-insensitive pattern matching)
   */
  ilike(column, pattern) {
    this.params.append(column, `ilike.${pattern}`);
    return this;
  }

  /**
   * Filter: Is (null checking)
   */
  is(column, value) {
    this.params.append(column, `is.${value}`);
    return this;
  }

  /**
   * Filter: In array
   */
  in(column, values) {
    const arrayStr = Array.isArray(values) ? values.join(',') : values;
    this.params.append(column, `in.(${arrayStr})`);
    return this;
  }

  /**
   * Order results
   */
  order(column, { ascending = true } = {}) {
    this.params.append('order', `${column}.${ascending ? 'asc' : 'desc'}`);
    return this;
  }

  /**
   * Limit results
   */
  limit(count) {
    this.headers['Range-Unit'] = 'items';
    this.headers['Range'] = `0-${count - 1}`;
    return this;
  }

  /**
   * Insert data
   * @param {object|array} data 
   */
  async insert(data) {
    return this.client._fetch(`/rest/v1/${this.table}`, {
      method: 'POST',
      headers: {
        ...this.headers,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(data)
    });
  }

  /**
   * Update data
   * @param {object} data 
   */
  async update(data) {
    return this.client._fetch(`/rest/v1/${this.table}?${this.params.toString()}`, {
      method: 'PATCH',
      headers: {
        ...this.headers,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(data)
    });
  }

  /**
   * Upsert data (Insert or Update)
   * @param {object|array} data 
   * @param {object} options { onConflict: 'column_name' }
   */
  async upsert(data, options = {}) {
    const headers = {
      ...this.headers,
      'Prefer': 'return=representation,resolution=merge-duplicates'
    };
    
    if (options.onConflict) {
      headers['Prefer'] += `,on_conflict=${options.onConflict}`;
    }

    return this.client._fetch(`/rest/v1/${this.table}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
  }

  /**
   * Delete data
   */
  async delete() {
    return this.client._fetch(`/rest/v1/${this.table}?${this.params.toString()}`, {
      method: 'DELETE',
      headers: {
        ...this.headers,
        'Prefer': 'return=representation'
      }
    });
  }

  /**
   * Execute the query (when awaited)
   */
  then(resolve, reject) {
    this.client._fetch(`/rest/v1/${this.table}?${this.params.toString()}`, {
      method: 'GET',
      headers: this.headers
    })
    .then(resolve)
    .catch(reject);
  }
};