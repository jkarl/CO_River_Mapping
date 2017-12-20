// Author: Jason Karl
// Date: 2017-12-20

//////////////////////////////////////////////////////////////////////////
// Selection of different dates of images to use in the CO River Mapping Study
// Two dates from different times in the growing season were desired.
//////////////////////////////////////////////////////////////////////////

var studyarea = ee.FeatureCollection("users/jakal14/AZ_LowerColoradoVegMapping_geodd");
var s2_collection = ee.ImageCollection("COPERNICUS/S2");

//////////////////////////////////////////////////////////////////////////
//Retrieve images from different dates and filter by cloud cover
//////////////////////////////////////////////////////////////////////////
var s2_Nov16 = s2_collection.filterDate('2016-11-20','2016-12-01')
  .filter(ee.Filter.lt('CLOUD_COVERAGE_ASSESSMENT',10))
  .filterBounds(studyarea);
var s2_May17 = s2_collection.filterDate('2017-05-15','2017-05-22')
  .filter(ee.Filter.lt('CLOUD_COVERAGE_ASSESSMENT',10))
  .filterBounds(studyarea);

//////////////////////////////////////////////////////////////////////////
// Select out just the bands we're interested in
//////////////////////////////////////////////////////////////////////////
var s2_Nov16_bands = s2_Nov16.select(['B2','B3','B4','B5','B6','B7','B8','B11','B12'],['B2_16','B3_16','B4_16','B5_16','B6_16','B7_16','B8_16','B11_16','B12_16'])
var s2_May17_bands = s2_May17.select(['B2','B3','B4','B5','B6','B7','B8','B11','B12'],['B2_17','B3_17','B4_17','B5_17','B6_17','B7_17','B8_17','B11_17','B12_17'])

//////////////////////////////////////////////////////////////////////////
//Clip each image to study area and mosaic images in the Image Collection
// to a single Image
//////////////////////////////////////////////////////////////////////////
var s2_May17_clip = s2_May17_bands.map(function(image) { return image.clip(studyarea); });
var s2_May17_mosaic = s2_May17_clip.mosaic();
var s2_Nov16_clip = s2_Nov16_bands.map(function(image) { return image.clip(studyarea); });
var s2_Nov16_mosaic = s2_Nov16_clip.mosaic();

//Merge the two image collections
var s2_images = s2_Nov16_mosaic.addBands(s2_May17_mosaic);

//////////////////////////////////////////////////////////////////////////
//Add layers to the map
//////////////////////////////////////////////////////////////////////////
var s2VisParams16 = {bands: ['B4_16','B3_16','B2_16'], max:3000};
var s2VisParams17 = {bands: ['B4_17','B3_17','B2_17'], max:3000};

Map.centerObject(studyarea);
Map.addLayer(s2_images, s2VisParams16,"22 November 2016");
Map.addLayer(s2_images, s2VisParams17,"21 May 2017");
Map.addLayer(studyarea,{color:"FF0000"},"Study Area");

//////////////////////////////////////////////////////////////////////////
// Export the image to an asset
//////////////////////////////////////////////////////////////////////////
Export.image.toAsset({
  image: s2_images,
  description: 'Sentinel-images-for-CO-River-Classification-Project',
  assetId: 'CORiverSentinel2',
  scale: 10,
  pyramidingPolicy: {'.default':'sample'},
  maxPixels: 4600000000
});