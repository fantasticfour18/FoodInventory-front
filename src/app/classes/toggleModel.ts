export class toggleModel{
    popupStatus: boolean = true;
    togglePopup(){
        this.popupStatus = (this.popupStatus == true ? false : true);
        return this.popupStatus;
    }
}