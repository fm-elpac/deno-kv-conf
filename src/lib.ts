/** @module
 *
 * 使用 deno-kv 存储简单的配置数据.
 * Save simple config data in deno-kv.
 *
 * server (fresh)
 */

/**
 * 用于读写配置数据
 */
export class Conf {
  _kv: Deno.Kv;
  _k_conf: Deno.KvKey;

  /**
   * @param kv 数据库实例
   * @param k_conf 数据库中的键 (前缀), 用于存储配置数据
   */
  constructor(kv: Deno.Kv, k_conf: Deno.KvKey) {
    this._kv = kv;
    this._k_conf = k_conf;
  }

  /**
   * 读取
   */
  async conf_get(键列表: Array<string>): Promise<{ [k: string]: unknown }> {
    const 键 = 键列表.map((k) =>
      ([] as Array<string>).concat(this._k_conf, [k])
    );
    const 数据 = await 读取多键1(this._kv, 键);

    const 结果: { [k: string]: unknown } = {};
    for (let i = 0; i < 键列表.length; i += 1) {
      结果[键列表[i]] = 数据[i];
    }
    return 结果;
  }

  /**
   * 保存设置数据
   */
  async conf_set(数据: { [k: string]: unknown }) {
    const t = this._kv.atomic();

    for (const i of Object.keys(数据)) {
      t.set(([] as Array<string>).concat(this._k_conf, [i]), 数据[i]);
    }

    const r = await t.commit();
    if (!r.ok) {
      throw new Error(JSON.stringify(数据));
    }
  }
}

/**
 * 读取多个键, 不过滤数据
 */
export async function 读取多键1(
  kv: Deno.Kv,
  k: Array<Deno.KvKey>,
): Promise<Array<unknown>> {
  // `getMany()` 一次最多读取 10 个键
  const M = 10;
  const o: Array<unknown> = [];
  for (let i = 0; i < k.length; i += M) {
    const k1 = k.slice(i, i + M);
    const r = await kv.getMany(k1);
    for (const j of r) {
      o.push(j.value);
    }
  }
  return o;
}
