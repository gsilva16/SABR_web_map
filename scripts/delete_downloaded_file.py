import os
import shutil
import zipfile
import sys

file_to_delete = sys.argv[1]
os.remove(file_to_delete)
print('done')