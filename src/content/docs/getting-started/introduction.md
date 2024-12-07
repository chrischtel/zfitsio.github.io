---
title: Introduction to zfitsio
description: A modern FITS file I/O library for the Zig programming language
---

# Zig FITS Wrapper

A modern tool for working with FITS (Flexible Image Transport System) files in Zig, providing a safe and efficient interface to the CFITSIO library.

:::caution
**Early Development Status**

This project is in early development (pre-v1.0.0) and should be considered experimental. Many features are still being implemented, and the API is not yet stable - breaking changes may occur between versions without notice.

Currently, the wrapper provides basic FITS file operations, header manipulation, and some image processing capabilities. While functional for basic use cases, many advanced CFITSIO features are not yet implemented. If you need a specific feature, please check the documentation or open an issue on GitHub.

I'm actively working on improving the library and welcome feedback, bug reports, and contributions from the community. If you're interested in helping develop this wrapper, feel free to get involved!

For production use, please:
- Pin your dependency to a specific version
- Thoroughly test the functionality you need
- Be prepared for API changes in future updates
:::

## What is it?

If you've ever worked with astronomical data, you've probably encountered FITS files. They're the standard way astronomers store their observations, from simple images to complex data tables. While the CFITSIO library is great for handling these files, working with it directly can be challenging.

That's where this wrapper comes in. I've created a Zig interface that makes working with FITS files more straightforward while keeping all the power of CFITSIO. The focus is on providing a safe, memory-efficient way to handle astronomical data using Zig's modern features.

## Key Features

- **FITS File Operations**: Managing FITS files shouldn't be complicated. The wrapper handles all the reading and writing operations while taking care of proper resource management behind the scenes.

- **Header Manipulation**: FITS headers contain crucial information about your data. You get full control over reading, writing, and validating these headers, making it easy to work with metadata.

- **Image Processing**: 
  - Work with both single and double precision floating-point data
  - Extract specific sections of your images when you don't need the whole thing
  - Handle World Coordinate System (WCS) information to maintain your astronomical coordinates

- **Type Safety**: Zig's type system helps prevent common errors when working with different data types. The wrapper includes built-in conversions to make sure your data is handled correctly.

- **Memory Management**: One of the trickiest parts of working with large scientific data is managing memory efficiently. This wrapper takes care of allocating and freeing resources properly, so you can focus on your actual work.

Whether you're an astronomer looking to process telescope data or a developer building tools for astronomical research, this wrapper provides a solid foundation for working with FITS files in Zig. It combines the reliability of CFITSIO with the safety and efficiency of modern Zig programming.

Feel free to dive into the documentation to learn more about how to use these features in your own projects. I'm actively developing this wrapper, and feedback from the astronomy and Zig communities is always welcome!