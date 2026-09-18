# ESP32

## The root `CMakeList.txt` and the component-specific one

ESP-IDF uses a **component-based build architecture**, where every piece of code(including your application) is treated as a resuable component. In ESP-IDF, a "component" is any directory containing a `CMakeList.txt` file.

- The root `CMakeList.txt` configures the entire project's build system. It doesn't compile your source code directly. Instead, it tells CMake which toolchain and rules to use to build the entire ESP-IDF project.
  A minimal root `CMakeList.txt` typically contains just three essential lines in a specific order:

  ```cmake
  cmake_minimum_required(VERSION 3.16) # 1. Sets minimum CMake version
  include($ENV{IDF_PATH}/tools/cmake/project.cmake) # 2. Loads ESP-IDF build rules
  project(my_project) # 3. Defines the project name(output binary name)
  ```

  - `include($ENV{IDF_PATH}/tools/cmake/project.cmake)` loads all the custom functions(like `idf_component_register`) and global settings that make ESP-IDF buils work, like telling the build system to search for and include the `main` component(which it expects to find in the `main` folder) along with any other components in `componnet` folders.

- The main folder `CMakeList.txt` defines the `main` component's source files and dependencies.
  The `main` component is special because it's where your application entry point(`app_main`) lives, and it's automatically built and linked by the project.

  ```cmake
  file(GLOB_RECURSE srcs "main.c" "src/*.c")
  idf_component_register(
    SRCS "${src}"
    INCLUDE_DIRS "./include"
  )
  ```

  - The `SRCS` argument tells the build system exactly which `.c` or `.cpp` files to compile.
  - **Declares dependencies**: You use `REQUIRES` or `PRIV_REQUIRES` to specify other ESP-IDF components your code uses (e.g., `driver` for GPIO, `nvs_flash` for storage). The `main` component is special: it depends on **all other components** by default, so you often don't need to specify `REQUIRES` unless you have specific needs .
  - **Specifies include paths**: The `INCLUDE_DIRS` argument tells where your header files are, list their directories in `INCLUDE_DIRS`.

### 💡 Why Two Files? The Component-Based Architecture

The reason for this two-file structure is **modularity and reusability**.

- **The root file manages the "project"**: Think of it as the "operating system" for your build. It sets the stage and discovers all available components.
- **The `main` file manages "your code"**: Think of it as the "application" running on that operating system. It defines the specific sources and dependencies for your entry-point logic.

This separation makes it easy to add more components later. If you want to add a custom sensor driver, you create a `components/my_sensor/` directory with its own `CMakeLists.txt` using `idf_component_register`. The root `CMakeLists.txt` will automatically discover and build it, and you can then list it in the `REQUIRES` section of your `main/CMakeLists.txt` to use its functions.
