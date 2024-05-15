/** @module
 *
 * 客户端 (命令行)
 *
 * client (cli)
 *
 * #!/usr/bin/env -S deno run -A
 * server/bin/conf.ts: 配置命令行工具
 * 使用 /conf_get, /conf_set 接口
 *
 * 用法:
 * + ./conf.ts get XXX
 * + ./conf.ts set XXX VVV
 */

import { join } from "@std/path";

/**
 * 口令 http 头的名称
 */
export const HH_TOKEN = "x-token";

// 环境变量名称
const ENV_XDG_RUNTIME_DIR = "XDG_RUNTIME_DIR";

/**
 * 对 HTTP POST 请求的封装
 */
export async function da(
  url: string,
  data: unknown,
  token: string,
): Promise<unknown> {
  const 响应 = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      [HH_TOKEN]: token,
    },
    body: JSON.stringify(data),
  });

  // 错误检查
  if (!响应.ok) {
    throw new Error("HTTP " + 响应.status);
  }
  const 结果 = await 响应.json();
  if ((结果.e != null) && (结果.e != 0)) {
    throw new Error(`e ${结果.e}: ${结果.t}`);
  }
  // 没有错误
  return 结果;
}

/**
 * 客户端: 用于调用 conf_get, conf_set 接口
 */
export class ConfClient {
  _url_base: string;
  _read_token: () => Promise<string>;

  /**
   * @param url_base 请求 HTTP 接口的 URL 前缀
   * @param read_token 用来读取口令的函数
   */
  constructor(url_base: string, read_token: () => Promise<string>) {
    this._url_base = url_base;
    this._read_token = read_token;
  }

  /**
   * 读取配置值
   */
  async conf_get(k: Array<string>): Promise<unknown> {
    return await da(this._url_base + "/conf_get", k, await this._read_token());
  }

  /**
   * 设置配置值
   */
  async conf_set(d: { [k: string]: unknown }): Promise<unknown> {
    return await da(this._url_base + "/conf_set", d, await this._read_token());
  }
}

async function 读取口令(fp_token: string): Promise<string> {
  const 文件 = join(Deno.env.get(ENV_XDG_RUNTIME_DIR)!, fp_token);
  return await Deno.readTextFile(文件);
}

// 读取接口的端口号
async function 读取端口(fp_port: string): Promise<number> {
  const 文件 = join(Deno.env.get(ENV_XDG_RUNTIME_DIR)!, fp_port);
  const 端口 = Number.parseInt(await Deno.readTextFile(文件));
  return 端口;
}

function 帮助信息() {
  console.log("Usage:");
  console.log("  ./conf.ts get XXX");
  console.log("  ./conf.ts set XXX VVV");
}

/**
 * 适用于 CLI (功能封装)
 *
 * @param a Deno.args
 * @param fp_token 存储 token 文件相对于 XDG_RUNTIME_DIR 的路径
 * @param fp_port 存储端口文件相对于 XDG_RUNTIME_DIR 的路径
 * @param api_prefix 发送 HTTP 请求对应的接口 URL 前缀
 * @param listen_addr 监听 IP 地址
 */
export async function main(
  a: Array<string>,
  fp_token: string,
  fp_port: string,
  api_prefix: string = "",
  listen_addr: string = "127.0.0.1",
) {
  const 操作 = a[0];

  function 键(): string {
    const k = a[1];

    if ((k == null) || (k.length < 1)) {
      throw new Error("bad key: " + k);
    }
    return k;
  }

  async function 初始化(): Promise<ConfClient> {
    const read_token = async () => await 读取口令(fp_token);

    const 端口 = await 读取端口(fp_port);
    const url_base = `http://${listen_addr}:${端口}${api_prefix}`;
    return new ConfClient(url_base, read_token);
  }

  if ("get" == 操作) {
    const c = await 初始化();

    const 结果 = await c.conf_get([键()]);
    console.log(结果);
  } else if ("set" == 操作) {
    const c = await 初始化();

    const 值 = Deno.args[2];
    const 结果 = await c.conf_set({
      [键()]: 值,
    });
    console.log(结果);
  } else if (操作 == "--help") {
    帮助信息();
  } else {
    throw new Error("unknown command " + 操作);
  }
}
