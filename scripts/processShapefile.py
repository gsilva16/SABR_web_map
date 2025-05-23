from zipfile import ZipFile
import pandas as pd
import numpy as np 
import matplotlib.pyplot as plt
# import arcpy
import glob
import geopandas as gpd
import os
import shutil
# import zipfile
import sys

imported_shapefile_name = sys.argv[1]
imported_shapefile_path = sys.argv[2]


file_name_no_ext = sys.argv[3]
# print(sys.argv)
if not os.path.exists(rf'C:\Users\guilh\OneDrive\Desktop\sabr_web\unzippedFiles\{file_name_no_ext}'):
    os.mkdir(rf'C:\Users\guilh\OneDrive\Desktop\sabr_web\unzippedFiles\{file_name_no_ext}')
    with ZipFile(imported_shapefile_path,'r') as zippedShapeFile:
        zippedShapeFile.extractall(path = rf'C:\Users\guilh\OneDrive\Desktop\sabr_web\unzippedFiles\{file_name_no_ext}')
    os.remove(imported_shapefile_path)

# shape_file = glob.glob(rf'C:\Users\guilh\OneDrive\Desktop\sabr_web\unzippedFiles\\{file_name_no_ext}\*.shp')

# uploaded_data = gpd.read_file(shape_file[0])
# test_clip_extent = gpd.read_file(r"C:\Users\guilh\OneDrive\Desktop\sabr_web\test_shapefile\sabr.shp")
# # test_clip_extent.plot()
# # plt.show()
# upload_valid = uploaded_data.is_valid.to_numpy()
# test_valid = test_clip_extent.is_valid.to_numpy()
# # not_valids = []
# # for i in range(len(upload_valid)):
# #     if not upload_valid[i]:
# #         print(uploaded_data.iloc[[i]]['geometry'])
# #         not_valids.append(i)


# fix_test = test_clip_extent['geometry'].make_valid()
# test_clip_extent['geometry'] = fix_test
# fix_upload = uploaded_data['geometry'].make_valid()
# uploaded_data['geometry']= fix_upload

# try:
#     clipped_data = gpd.clip(test_clip_extent,uploaded_data)
# except:
#     print("clipping data did not work")


# # clipped_data.plot()
# # plt.show()
# try:
# #to do: create a unique directory for each file so that if multiple accessing at once they have unique id and no crossups in data
#     os.mkdir(rf'C:\Users\guilh\OneDrive\Desktop\sabr_web\processed_files\{file_name_no_ext}_processed')
#     clipped_data.to_file(rf'C:\Users\guilh\OneDrive\Desktop\sabr_web\processed_files\{file_name_no_ext}_processed\{file_name_no_ext}_processed.shp')
#     shutil.make_archive(rf'C:\Users\guilh\OneDrive\Desktop\sabr_web\processed_files\{file_name_no_ext}_processed','zip',rf'C:\Users\guilh\OneDrive\Desktop\sabr_web\processed_files\{file_name_no_ext}_processed')
#     shutil.rmtree(rf'C:\Users\guilh\OneDrive\Desktop\sabr_web\processed_files\{file_name_no_ext}_processed', ignore_errors=True)
# except:
#     print("could not save file")

# shutil.rmtree(rf'C:\Users\guilh\OneDrive\Desktop\sabr_web\unzippedFiles\{file_name_no_ext}', ignore_errors=True)
# # os.rmdir(rf'.\unzippedFiles\{file_name_no_ext}')
# print(rf'{file_name_no_ext}_processed.zip')