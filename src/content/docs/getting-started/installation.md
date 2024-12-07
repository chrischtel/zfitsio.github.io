---
title: Installation
description: How to add zfitsio to your Zig project
---

# Installation

## Prerequisites

- Zig 0.11.0 or later

## Adding to Your Project

1. Add zfitsio to your project using:
```bash
zig fetch --save git+https://github.com/chrischtel/zfitsio#master
```
:::tip
You can also choose to select a release or a tag:
```bash
zig fetch --save git+https://github.com/chrischtel/zfitsio#v0.1.0
```
:::

2. Update your `build.zig`:
```zig
const zfitsio_dep = b.dependency("zfitsio", .{
    .target = target,
    .optimize = optimize,
});

const zfitsio_artifact = zfitsio_dep.artifact("zfitsio");

exe.root_module.addImport("zfitsio", zfitsio_dep.module("zfitsio"));
exe.linkLibC();
exe.linkLibrary(zfitsio_artifact);
```

By default, zfitsio will build CFITSIO and its dependencies from source. This ensures compatibility and removes the need for system-wide installations.

## Using System Libraries

If you prefer to use system-installed libraries, you can enable this option during build:

```bash
zig build -Duse-system-libs=true
```
:::note
When using system libraries, ensure you have:
- CFITSIO development files installed
- zlib development files installed
:::

## Verifying Installation

Test your installation with a simple program:
```zig
const std = @import("std");
const fits = @import("zfitsio");

pub fn main() !void {
    const allocator = std.heap.page_allocator;
    var fits_file = try fits.FitsFile.createFits(allocator, "test.fits");
    defer fits_file.close() catch unreachable;
    std.debug.print("FITS file created successfully!\n", .{});
}
```

## Troubleshooting

If you encounter any issues, please open an issue on GitHub.