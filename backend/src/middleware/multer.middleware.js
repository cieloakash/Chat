import multer from "multer";

export const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"uploads/")
    },
    filename:(req,file,cb)=>{
        const uniqueFilename = Date.now() + "-" + file.originalname;
        console.log("Multer is called - Saving file as:", uniqueFilename); 
        cb(null, uniqueFilename);
    }
   
    
}) 

export const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });