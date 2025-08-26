import { MediaDimensions } from "@/types/mediaDimensions"

export const minDimension=(dimension1:MediaDimensions, dimension2:MediaDimensions):MediaDimensions=>{
    if(dimension1.width <= dimension2.width && dimension1.height <= dimension2.height) return dimension1;
    if(dimension2.width <= dimension1.width && dimension2.height <= dimension1.height) return dimension2;
    throw new Error("Dimensions are not comparable");
}