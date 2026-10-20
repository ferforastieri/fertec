import {rename,rm} from 'node:fs/promises'

const generatedImages=[['out/icon','out/icon.png'],['out/opengraph-image','out/opengraph-image.png']]

for(const [source,target] of generatedImages){
  await rm(target,{force:true})
  try{
    await rename(source,target)
  }catch(error){
    if(error.code!=='ENOENT')throw error
  }
}
