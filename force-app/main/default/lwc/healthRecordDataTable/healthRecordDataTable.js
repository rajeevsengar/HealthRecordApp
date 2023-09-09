import { LightningElement, track, wire, api } from 'lwc';
import getHealthRecords from '@salesforce/apex/HealthRecordController.getHealthRecords';
import { refreshApex } from '@salesforce/apex';
import { deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class HealthRecordTable extends LightningElement {
    @api selectedUser; // For filtering by user
    @track groupedHealthRecords = []; // To store grouped records
    @track wiredHelthRecords;

    // Fetch health records from Salesforce
    @wire(getHealthRecords, { selectedUser: '$selectedUser'})
    wireHealthRecords(result) {
        this.wiredHelthRecords = result;
        if (result.data) {
            // Process data to group records by date
            this.groupedHealthRecords = this.groupRecordsByDate(result.data);
        } else if (result.error) {
            // Handle error
        }
    }

    // Group records by date
    groupRecordsByDate(records) {
        const grouped = {};
        let countPerDate = 0;
        records.forEach((record) => {
            const dateKey = record.Date_and_Time__c.substring(0, 10); // Extract date part
            let newDate = '';
            countPerDate = countPerDate + 1;

            if (!grouped[dateKey]) {
                countPerDate = 1;
                newDate = dateKey;
                grouped[dateKey] = {
                    date: dateKey,
                    healthRecords: [],
                    countPerDate : countPerDate,
                    AlternateDateCSSClass : 'slds-theme_shade'
                };
            }else{
                grouped[dateKey].countPerDate = countPerDate;
            }

            const phase = record.Phase__c;
            const time = record.Date_and_Time__c.substring(11, 19);
            const morningUPBP = record['Morning_BP_Reading_Up__c'] != 0 ? record['Morning_BP_Reading_Up__c'] : '';
            const morningDownBP = record['Morning_BP_Reading_Down__c'] != 0 ? record['Morning_BP_Reading_Down__c'] : '';
            const morningBPReading = morningUPBP && morningDownBP ? morningUPBP.toString() + '/' + morningDownBP.toString() : '';
            const morningTime = phase == 'Morning' ? time : '';
            const eveningUpgBP = record['Evening_BP_Reading_Up__c'] != 0 ? record['Evening_BP_Reading_Up__c'] : '';
            const eveningDownBP = record['Evening_BP_Reading_Down__c'] != 0 ? record['Evening_BP_Reading_Down__c'] : '';
            const eveningBPReading = eveningUpgBP && eveningDownBP ? eveningUpgBP.toString() + '/' + eveningDownBP.toString() : '';
            const eveningTime = phase == 'Evening' ? time : '';
            let morningBPIndicator = '';
            let eveningBPIndicator = '';
            if(morningUPBP && morningDownBP){
                if(morningUPBP > 120 || morningDownBP > 80){
                    morningBPIndicator = 'slds-text-color_error';
                }else{
                    morningBPIndicator = 'slds-text-color_success';
                }
            }
            
            if(eveningUpgBP && eveningDownBP){
                if(eveningUpgBP > 120 || eveningDownBP > 80){
                    eveningBPIndicator = 'slds-text-color_error';
                }else{
                    eveningBPIndicator = 'slds-text-color_success';
                }
            }

            grouped[dateKey].healthRecords.push({
                Date: newDate ? newDate : '',
                DisplayDate : newDate ? true : false,
                Id: record.Id,
                Morning_Time: morningTime,
                Morning_BP_Reading: morningBPReading,
                Morning_BP_Reading_Down: morningDownBP,
                Morning_Medicine: record['Morning_Medicine__c'],
                Morning_BPIndicator: morningBPIndicator,
                Evening_Time: eveningTime,
                Evening_BP_Reading: eveningBPReading,
                Evening_BP_Reading_Down: eveningDownBP,
                Evening_Medicine: record['Evening_Medicine__c'],
                Evening_BPIndicator: eveningBPIndicator,
            });
        });


        return Object.values(grouped);
    }


    // Implement edit record logic
    handleEditRecord(event) {
        const recordId = event.target.value;
        const selectEvent = new CustomEvent('edit', {
            detail: recordId
        });
       this.dispatchEvent(selectEvent);
    }

    // Implement delete record logic
    handleDeleteRecord(event) {
        const recordId = event.target.value;
        this.deleteRecord(recordId);
    }

    @api
    handleRefreshData(){
        refreshApex(this.wiredHelthRecords);
    }

    deleteRecord(recordId) {
        if(recordId) {
            deleteRecord(recordId)
                .then(() => {
                    this.handleRefreshData();
                    this.showToast('Success', 'Record deleted successfully', 'success');

                    const selectEvent = new CustomEvent('delete');
                    this.dispatchEvent(selectEvent);
                })
                .catch(error => {
                    this.showToast('Error',  'An error occurred while deleting the record: ' + JSON.stringify(error), 'error');
                });
        } else {
            this.showToast('Error',  'Record ID is not provided', 'error');
        }
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({ title: title, message: message, variant: variant });
        this.dispatchEvent(event);
    }

}