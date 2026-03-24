import os

EXCLUDE_DIRS = {"venv", ".git", "__pycache__", ".idea", ".vscode", "node_modules"}

def print_tree(start_path, prefix=""):
    try:
        items = sorted(os.listdir(start_path))
    except PermissionError:
        return

    total = len(items)

    for index, item in enumerate(items):
        path = os.path.join(start_path, item)
        connector = "└── " if index == total - 1 else "├── "

        print(prefix + connector + item)

        # If it's a directory AND not excluded → recurse
        if os.path.isdir(path) and item not in EXCLUDE_DIRS:
            extension = "    " if index == total - 1 else "│   "
            print_tree(path, prefix + extension)

if __name__ == "__main__":
    root_dir = os.getcwd()
    print(os.path.basename(root_dir) or root_dir)
    print_tree(root_dir)