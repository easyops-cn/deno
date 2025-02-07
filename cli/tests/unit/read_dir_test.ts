// Copyright 2018-2021 the Deno authors. All rights reserved. MIT license.
import {
  assert,
  assertEquals,
  assertThrows,
  assertThrowsAsync,
  pathToAbsoluteFileUrl,
  unitTest,
} from "./test_util.ts";

function assertSameContent(files: Deno.DirEntry[]) {
  let counter = 0;

  for (const entry of files) {
    if (entry.name === "subdir") {
      assert(entry.isDirectory);
      counter++;
    }
  }

  assertEquals(counter, 1);
}

unitTest({ perms: { read: true } }, function readDirSyncSuccess() {
  const files = [...Deno.readDirSync("cli/tests/")];
  assertSameContent(files);
});

unitTest({ perms: { read: true } }, function readDirSyncWithUrl() {
  const files = [...Deno.readDirSync(pathToAbsoluteFileUrl("cli/tests"))];
  assertSameContent(files);
});

unitTest({ perms: { read: false } }, function readDirSyncPerm() {
  assertThrows(() => {
    Deno.readDirSync("tests/");
  }, Deno.errors.PermissionDenied);
});

unitTest({ perms: { read: true } }, function readDirSyncNotDir() {
  assertThrows(() => {
    Deno.readDirSync("cli/tests/fixture.json");
  }, Error);
});

unitTest({ perms: { read: true } }, function readDirSyncNotFound() {
  assertThrows(() => {
    Deno.readDirSync("bad_dir_name");
  }, Deno.errors.NotFound);
});

unitTest({ perms: { read: true } }, async function readDirSuccess() {
  const files = [];
  for await (const dirEntry of Deno.readDir("cli/tests/")) {
    files.push(dirEntry);
  }
  assertSameContent(files);
});

unitTest({ perms: { read: true } }, async function readDirWithUrl() {
  const files = [];
  for await (
    const dirEntry of Deno.readDir(pathToAbsoluteFileUrl("cli/tests"))
  ) {
    files.push(dirEntry);
  }
  assertSameContent(files);
});

unitTest({ perms: { read: false } }, async function readDirPerm() {
  await assertThrowsAsync(async () => {
    await Deno.readDir("tests/")[Symbol.asyncIterator]().next();
  }, Deno.errors.PermissionDenied);
});

unitTest(
  { perms: { read: true }, ignore: Deno.build.os == "windows" },
  async function readDirDevFd(): Promise<
    void
  > {
    for await (const _ of Deno.readDir("/dev/fd")) {
      // We don't actually care whats in here; just that we don't panic on non regular entries
    }
  },
);

unitTest(
  { perms: { read: true }, ignore: Deno.build.os == "windows" },
  function readDirDevFdSync() {
    for (const _ of Deno.readDirSync("/dev/fd")) {
      // We don't actually care whats in here; just that we don't panic on non regular file entries
    }
  },
);
