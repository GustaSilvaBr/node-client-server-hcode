class Utils{
    static dateBrFormat(date){

        const dateFormatted = new Date(date);
        
        return dateFormatted.getDate()+'/'+(dateFormatted.getMonth()+1)+'/'+dateFormatted.getFullYear();
    }
}





