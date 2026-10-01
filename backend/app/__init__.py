import sys
from pathlib import Path

_file_path = Path(__file__).resolve()
_backend_dir = _file_path.parent.parent
_project_root = _backend_dir.parent

for _p in (str(_project_root), str(_backend_dir)):
    if _p not in sys.path:
        sys.path.insert(0, _p)
