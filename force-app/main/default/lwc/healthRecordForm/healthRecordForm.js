import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class HealthRecordForm extends LightningElement {
    // @api currentDateTime = new Date().toISOString();
    @api recordId;
    @track currentDateTime;

    connectedCallback(){
        if(!this.recordId){
            this.currentDateTime = new Date().toISOString();
        } 
    }

    closeModal() {
        this.recordId = '';
        const selectEvent = new CustomEvent('modaltoggle', {
            detail: false
        });
       this.dispatchEvent(selectEvent);
    }

    handleSuccess(event) {
        this.showToast('Success', 'Record saved successfully!', 'success');
        const selectEvent = new CustomEvent('success', {
            detail: false
        });
        this.dispatchEvent(selectEvent);

        this.closeModal();
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({ title: title, message: message, variant: variant });
        this.dispatchEvent(event);
    }

}