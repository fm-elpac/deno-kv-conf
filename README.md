# deno-kv-conf

<https://github.com/fm-elpac/deno-kv-conf>

![CI](https://github.com/fm-elpac/deno-kv-conf/actions/workflows/ci.yml/badge.svg)
[![JSR](https://jsr.io/badges/@fm-elpac/deno-kv-conf)](https://jsr.io/@fm-elpac/deno-kv-conf)
[![Built with the Deno Standard Library](https://raw.githubusercontent.com/denoland/deno_std/main/badge.svg)](https://jsr.io/@std)

使用 deno-kv 存储简单的配置数据.

Save simple config data in deno-kv.

## 示例 (example)

server:

TODO

client (CLI):

```ts
import { main } from "@fm-elpac/deno-kv-conf";

if (import.meta.main) {
  await main(Deno.args, "/pmim/server_token", "/pmim/port", "/pmims_api");
}
```

## LICENSE

`MIT License`
