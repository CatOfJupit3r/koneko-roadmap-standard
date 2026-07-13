import assert from "node:assert/strict";
import test from "node:test";
import { gitBlobSha1 } from "../src/checksum.ts";

test("gitBlobSha1 matches Git's canonical empty blob", () => {
  assert.equal(
    gitBlobSha1(Buffer.alloc(0)),
    "e69de29bb2d1d6434b8b29ae775ad8c2e48c5391",
  );
});

test("gitBlobSha1 includes Git's blob header", () => {
  assert.equal(
    gitBlobSha1(Buffer.from("hello\n", "utf8")),
    "ce013625030ba8dba906f756967f9e9ca394464a",
  );
});
