# file(GLOB_RECURSE srcs "src/*.c")

# idf_component_register(
#     SRCS "main.c" "main.bk.c" "${srcs}" 
#     INCLUDE_DIRS "./include"
# )

idf_component_register(
    SRCS "main.c" 
)